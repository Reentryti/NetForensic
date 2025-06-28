from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.utils import timezone
from .models import NetworkInterface, CaptureSession, ZeekLog, Prediction
from .utils.zeek_controller import ZeekController
from .serializers import CaptureSessionSerializer, ZeekLogSerializer
import threading
from django.http import StreamingHttpResponse
import json
import time
from .utils.tools import detect_interfaces
from .modeling.prediction import PredictionIA
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .utils.log_analyser import analyze_conn_log
import os
import requests
from django.conf import settings

# Dictionnaire pour stocker les contrôleurs actifs
active_controllers = {}

# Capture Function
## Making some test by accessing the endpoint and making a request with content {"interface": "eth0", "filter": "port 80"}
class CaptureAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Récupération des paramètres
        interface_name = request.data.get('interface')
        capture_filter = request.data.get('filter', '')

        if not interface_name:
            return Response(
                {'error': "Le paramètre 'interface' est requis"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Détection des interfaces disponibles
            available_interfaces = detect_interfaces()
            
            # Vérification que l'interface demandée existe
            if not any(iface['name'] == interface_name for iface in available_interfaces):
                return Response(
                    {
                        'error': f"Interface '{interface_name}' introuvable",
                        'available_interfaces': [iface['name'] for iface in available_interfaces]
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Création de la session de capture
            session = CaptureSession.objects.create(
                user=request.user if request.user.is_authenticated else None,
                interface_name=interface_name,
                start_time=timezone.now(),
                status='running',
                filter=capture_filter,
                log_dir=f"zeek_logs/{timezone.now().strftime('%Y%m%d_%H%M%S')}"
            )

            # Lancement de la capture dans un thread séparé
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

            # Nettoyage
            del active_controllers[session_id]

        return Response(
            {'status': 'success', 'message': 'Capture arrêtée'},
            status=status.HTTP_200_OK
        )



class SessionDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, session_id):
        try:
            session = CaptureSession.objects.get(id=session_id, user=request.user)
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

# Live Capture Visual Function
class LiveStatsAPIView(APIView):
    def get(self, request):
        active_session = CaptureSession.objects.filter(status='running').first()
        
        return Response({
            'packet_count': active_session.packet_count if active_session else 0,
            'throughput_mbps': active_session.throughput if active_session else 0,
            'active_connections': active_session.connection_count if active_session else 0,
            #'packets_last_second': get_random_packet_count() 
        })
    

# Live Logging Capture Function
class LogStreamView(APIView):
     
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
        response['Connection'] = 'keep-alive'
        return response
    

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
    
# Rapport Generation with MistralAPI
class GenerateReportAPIView(APIView):
    def get(self, request, session_id):
        predictions = Prediction.objects.filter(session__id=session_id)

        if not predictions.exists():
            return Response({'error': 'Aucune donnée pour cette session'}, status=404)

        # Prompt 
        prompt = "Analyse les connexions suivantes et indique s'il y a des signes d'attaque :\n"
        for p in predictions:
            prompt += f"- {p.timestamp} | {p.proto} | {p.src_port} -> {p.dst_port} | attaque: {p.is_attack} | confiance: {p.confidence:.2f}\n"
        prompt += "\nFais un résumé clair et des recommandations."

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

        return Response({
            "prompt": prompt,
            "report": report
        })
