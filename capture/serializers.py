from rest_framework import serializers
from .models import NetworkInterface, CaptureSession, ZeekLog

class NetworkInterfaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NetworkInterface
        fields = ['id', 'name', 'description']

class CaptureSessionSerializer(serializers.ModelSerializer):
    interface = NetworkInterfaceSerializer(read_only=True)
    
    class Meta:
        model = CaptureSession
        fields = [
            'id', 'interface', 'start_time', 
            'end_time', 'status', 'filter', 'log_dir'
        ]
        read_only_fields = ['status', 'log_dir', 'start_time', 'end_time']

class ZeekLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZeekLog
        fields = ['id', 'log_type', 'timestamp', 'data']