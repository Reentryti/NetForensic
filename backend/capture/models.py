from django.db import models
from django.contrib.auth import get_user_model


# Create your models here.

User = get_user_model()

#Modele des interfaces
class NetworkInterface(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

#Modele des captures
class CaptureSession(models.Model):
    STATUS_CHOICES = [
        ('running', 'En cours'),
        ('completed', 'Terminé'),
        ('failed', 'Échec'),
        ('stopped', 'Arrêté'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    interface_name = models.CharField(max_length=100)    
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    filter = models.CharField(max_length=200, blank=True)
    log_dir = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Session {self.id} - {self.interface.name}"

#Modele des logs zeek
class ZeekLog(models.Model):
    session = models.ForeignKey(CaptureSession, on_delete=models.CASCADE)
    log_type = models.CharField(max_length=50)
    timestamp = models.DateTimeField()
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['log_type']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        return f"{self.log_type} - {self.timestamp}"
    
#Modele des donnnées de prediction
class Prediction(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    src_port = models.PositiveIntegerField()
    dst_port = models.PositiveIntegerField()
    is_attack = models.BooleanField()
    confidence = models.FloatField()