from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.utils import timezone
from .models import NetworkInterface, CaptureSession, ZeekLog, Prediction
from .utils.zeek_controller import ZeekController
from .serializers import CaptureSessionSerializer, ZeekLogSerializer
import threading
from .utils.tools import detect_interfaces
from .modeling.prediction import PredictionIA
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .utils.log_analyser import analyze_conn_log
import os
import requests
from django.conf import settings
from django.http import StreamingHttpResponse, HttpResponse
import json
import time
from django.views import View
from django.db.models import Exists, OuterRef
from django.template.loader import render_to_string
from weasyprint import HTML

# Dictionnaire pour stocker les contrôleurs actifs
active_controllers = {}

# Stats capture file path
STATS_PATH = "stats.log"

# Capture Function
## Making some test by accessing the endpoint and making a request with content {"interface": "eth0", "filter": "port 80"}
class CaptureAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Parameters get
        interface_name = request.data.get('interface')
        capture_filter = request.data.get('filter', '')

        if not interface_name:
            return Response(
                {'error': "Le paramètre 'interface' est requis"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Availables interfaces detection
            available_interfaces = detect_interfaces()
            
            if not any(iface['name'] == interface_name for iface in available_interfaces):
                return Response(
                    {
                        'error': f"Interface '{interface_name}' introuvable",
                        'available_interfaces': [iface['name'] for iface in available_interfaces]
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Session creation
            session = CaptureSession.objects.create(
                user=request.user if request.user.is_authenticated else None,
                interface_name=interface_name,
                start_time=timezone.now(),
                status='running',
                filter=capture_filter,
                log_dir=f"zeek_logs/{timezone.now().strftime('%Y%m%d_%H%M%S')}"
            )

            # Capture Launch
            try:

                controller = ZeekController(session.id)
                

                thread = threading.Thread(
                    target=controller.start_capture,
                    args=(interface_name, capture_filter),
                    daemon=True
                )
                thread.start()
                active_controllers[session.id] = controller
            except Exception as e:
                session.status = 'failed'
                session.end_time = timezone.now()
                session.save()
                return Response({'error':f"Echec du lancement de zeek: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response(CaptureSessionSerializer(session).data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({'error':f"Erreur serveur: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Stopped Capture Function       
## Requesting a stop capture by accessing the endpoint (current capture endpoint with /numbersession/stop/)
class StopCaptureAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, session_id):
        try:
            session = CaptureSession.objects.get(id=session_id)
        except CaptureSession.DoesNotExist:
            return Response(
                {'error': 'Session non trouvée'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        if session_id in active_controllers:
            controller = active_controllers[session_id]
            controller.stop_capture()

            session.end_time = timezone.now()
            session.status = 'stopped'
            session.save()

            #Automate Log analysis //but we prefer to get it manually on test with the analysecapture view
            log_path = os.path.join(session.log_dir, "conn.log")
            if os.path.exists(log_path):
                analysis_result = analyze_conn_log(log_path)

                #Save result
                for entry in analysis_result:
                    Prediction.objects.create(
                        session=session,
                        timestamp=entry['timestamp'],
                        src_port=entry['src_port'],
                        dst_port=entry['dst_port'],
                        proto=entry['proto'],
                        is_attack=entry['is_attack'],
                        confidence=entry['confidence']
                    )

            else:
                print(f"[WARN] Fichier {log_path} introuvable.")

            del active_controllers[session_id]

        return Response(
            {'status': 'success', 'message': 'Capture arrêtée'},
            status=status.HTTP_200_OK
        )


class SessionDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, session_id):
        try:
            #session = CaptureSession.objects.get(id=session_id, user=request.user)
            session = CaptureSession.objects.get(id=session_id)
            logs = ZeekLog.objects.filter(session=session).order_by('-timestamp')[:100]
            
            session_data = CaptureSessionSerializer(session).data
            logs_data = ZeekLogSerializer(logs, many=True).data
            
            return Response({
                'session': session_data,
                'logs': logs_data
            })
        except CaptureSession.DoesNotExist:
            return Response(
                {'error': 'Session non trouvée'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class SessionListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        #sessions = CaptureSession.objects.filter(user=request.user).order_by('-start_time')
        sessions = CaptureSession.objects.all().order_by('start_time')
        serializer = CaptureSessionSerializer(sessions, many=True)
        return Response(serializer.data)


#Interfaces detection view
class InterfaceListAPIView(APIView):
    
    def get(self, request):
        try:
            return Response(detect_interfaces())
        except RuntimeError as e:
            return Response({'error': str(e)}, status=500)

# Visualisation on the dashboard part

# Live Logging Visual Function
##Really not must
class LogStreamView(View):
    def get(self, request):
        def event_stream():
            last_id = ZeekLog.objects.last().id if ZeekLog.objects.exists() else 0
            
            while True:
                new_logs = ZeekLog.objects.filter(id__gt=last_id).order_by('id')
                
                for log in new_logs:
                    yield f"data: {json.dumps({
                        'id': log.id,
                        'timestamp': log.timestamp.isoformat(),
                        'log_type': log.log_type,
                        'data': log.data
                    })}\n\n"
                    last_id = log.id
                
                time.sleep(1)

        response = StreamingHttpResponse(
            event_stream(),
            content_type="text/event-stream" 
        )
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        return response
    
# Live Stats Capture Function
## A must be nice
class LiveStatsAPIView(APIView):
    def get(self, request):
        #Select the current running stats file 
        session = CaptureSession.objects.filter(status='running').first()
        if not session :
            return Response(self._zero_stats(), status=200)
        stats_path = os.path.join(session.log_dir, "stats.log")

        if not os.path.exists(stats_path):
            return Response(self._zero_stats(), status=200)

        try: 

            with open(stats_path, "rb") as f:
                f.seek(0, os.SEEK_END)
                size = f.tell()
                f.seek(-min(4096, size), os.SEEK_END)
                lines = f.readlines()
            data = json.loads(lines[-1].decode("utf-8")) 
        except Exception as e:
            return Response(self._zero_stats(), status=200)

        return Response({
            "timestamp": data["ts"],
            "packet_count": data["capture_stats"]["packets"],
            "bytes":        data["capture_stats"]["bytes_recv"],
            "dropped":      data["capture_stats"]["dropped"],
            "throughput_mbps": round(data["capture_stats"]["bytes_recv"] * 8 / 1_000_000, 2),
            "active_conns":  data["mem"]["conn_conn_vals"],
        })

    @staticmethod
    def _zero_stats():
        return{
            "timestamp": None,
            "packet_count": 0,
            "bytes": 0,
            "dropped": 0,
            "throughput_mbps": 0,
            "active_conns": 0,
        }

## AI Prediction functions
# Initialisation globale
predictor = PredictionIA()

@csrf_exempt 
def predict(request):

    if request.method == 'POST':
        try:
            # Récupère les données du POST
            data = {
                'src_port': int(request.POST.get('src_port')),
                'dst_port': int(request.POST.get('dst_port')),
                'proto': request.POST.get('proto', 'tcp'),
                'bytes': int(request.POST.get('bytes', 0))
            }
            
            # Appel à notre IA
            result = predictor.predict(data)
            
            return JsonResponse({
                'status': 'success',
                'result': result
            })
            
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)
    
    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

# Manually capture analysing view
class AnalyzeCaptureAPIView(APIView):
    def post(self, request, session_id):
        try:
            session = CaptureSession.objects.get(id=session_id)
        except CaptureSession.DoesNotExist:
            return Response({'error': 'Session non trouvée'}, status=status.HTTP_404_NOT_FOUND)

        log_path = os.path.join(session.log_dir, "conn.log")
        if not os.path.exists(log_path):
            return Response({'error': 'Fichier conn.log introuvable'}, status=status.HTTP_400_BAD_REQUEST)

        results = analyze_conn_log(log_path)

        # Data Analisis save on database
        for entry in results:
            Prediction.objects.create(
                session=session,
                timestamp=entry.get('timestamp'),
                src_port=entry.get('src_port'),
                dst_port=entry.get('dst_port'),
                proto=entry.get('proto'),
                is_attack=entry.get('is_attack'),
                confidence=entry.get('confidence')
            )

        return Response({'status': 'success', 'message': f'{len(results)} entrées analysées'}, status=status.HTTP_200_OK)
    
class AnalyzedSessionsAPIView(APIView):
    def get(self, request):
        sessions = CaptureSession.objects.annotate(
            is_analyzed=Exists(
                Prediction.objects.filter(session=OuterRef('pk'))
            )
        ).filter(is_analyzed=True).order_by('-start_time')

        serializer = CaptureSessionSerializer(sessions, many=True)
        return Response(serializer.data)

# Rapport Generation with MistralAPI
class GenerateReportAPIView(APIView):
    def get(self, request, session_id):
        predictions = Prediction.objects.filter(session__id=session_id)

        if not predictions.exists():
            return Response({'error': 'Aucune donnée pour cette session'}, status=404)

        # Prompt 
        prompt = (
            "Tu es analyste cybersécurité senior. À partir des logs réseau ci-dessous "
            "(<timestamp> | <protocole> | <src_port> -> <dst_port> | attaque:<oui/non> | confiance:<0-1>), "
            "rédige un **rapport clair et structuré** comprenant :\n"
            "1. **Résumé exécutif** : niveau global de menace, nombre d’incidents, types d’attaque présumés.\n"
            "2. **Incidents détectés** : tableau horodatage / protocole / ports / attaque / confiance.\n"
            "3. **Gravité** : faible, moyen, élevé ou critique + justification.\n"
            "4. **Actions immédiates** : mesures techniques à appliquer sans délai.\n"
            "5. **Remédiation court terme** : procédures de récupération ou contournement.\n"
            "6. **Éléments probants** : traces exploitables juridiquement (horodatage, IP, répétitions).\n"
            "Ton professionnel, concis ; explique brièvement tout jargon technique.\n\n"
            "Logs à analyser :\n"
        )
        for p in predictions:
            prompt += (
                f"- {p.timestamp} | {p.proto} | {p.src_ip}:{p.src_port} → {p.dst_ip}:{p.dst_port} "
                f"| attaque:{p.is_attack} | confiance:{p.confidence:.2f}\n"
            )
        # Mistral API 
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
                "HTTP-Referer": "http://localhost:8000",
                "Content-Type": "application/json"
            },
            json={
                "model": "mistralai/mistral-7b-instruct",
                "messages": [
                    {"role": "system", "content": "Tu es un expert en cybersécurité."},
                    {"role": "user", "content": prompt}
                ]
            }
        )

        if response.status_code != 200:
            return Response({'error': 'Erreur appel LLM', 'details': response.text}, status=500)

        result = response.json()
        report = result['choices'][0]['message']['content']

        html_string = render_to_string('generated_report.html',{
            'report': report,
            'date': timezone.now().date()
        })

        pdf_file = HTML(string=html_string).write_pdf()

        response = HttpResponse(pdf_file, content_type='application/pdf')
        response['Content-Disposition'] = 'inline; filename="rapportSecurite.pdf"'
        return response