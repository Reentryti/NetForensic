from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.utils import timezone
from .models import NetworkInterface, CaptureSession, ZeekLog
from .utils.zeek_controller import ZeekController
from .serializers import CaptureSessionSerializer, ZeekLogSerializer, NetworkInterfaceSerializer
import threading
import random

# Dictionnaire pour stocker les contrôleurs actifs
active_controllers = {}

class CaptureAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        #Récupération des interfaces
        interface_id = request.data.get('interface')
        capture_filter = request.data.get('filter', '')

        try:
            interface = NetworkInterface.objects.get(id=interface_id)
        except NetworkInterface.DoesNotExist:
            return Response(
                {'error': 'Interface réseau non trouvée'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        #Session
        session = CaptureSession.objects.create(
            user=request.user,
            interface=interface,
            start_time=timezone.now(),
            status='running',
            filter=capture_filter,
            log_dir=f"zeek_logs/{timezone.now().strftime('%Y%m%d_%H%M%S')}"
        )

        # Lancement capture
        controller = ZeekController(session.id)
        active_controllers[session.id] = controller

        # Thread de capture
        thread = threading.Thread(
            target=controller.start_capture,
            args=(interface.name, capture_filter),
            daemon=True
        )
        thread.start()

        return Response(
            CaptureSessionSerializer(session).data,
            status=status.HTTP_201_CREATED
        )

class StopCaptureAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, session_id):
        try:
            session = CaptureSession.objects.get(id=session_id, user=request.user)
        except CaptureSession.DoesNotExist:
            return Response(
                {'error': 'Session non trouvée'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        if session_id in active_controllers:
            controller = active_controllers[session_id]
            controller.stop_capture()
            
            # Mise à jour session
            session.end_time = timezone.now()
            session.status = 'stopped'
            session.save()
            
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
        sessions = CaptureSession.objects.filter(user=request.user).order_by('-start_time')
        serializer = CaptureSessionSerializer(sessions, many=True)
        return Response(serializer.data)

class InterfaceListAPIView(APIView):
    def get(self, request):
        interfaces = NetworkInterface.objects.all()
        serializer = NetworkInterfaceSerializer(interfaces, many=True)
        return Response(serializer.data)
    

class LiveStatsAPIView(APIView):
    def get(self, request):
        active_session = CaptureSession.objects.filter(status='running').first()
        
        return Response({
            'packet_count': active_session.packet_count if active_session else 0,
            'throughput_mbps': active_session.throughput if active_session else 0,
            'active_connections': active_session.connection_count if active_session else 0,
            'packets_last_second': get_random_packet_count() 
        })
    
    
# Random simulation for tests
def get_random_packet_count():
    return random.randint(50, 200)