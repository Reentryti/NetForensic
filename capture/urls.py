from django.urls import path
from .views import (CaptureAPIView, StopCaptureAPIView, SessionDetailAPIView, SessionListAPIView)

app_name = 'forensic_app'

urlpatterns = [
    # API Endpoints
    path('api/v1/capture/', CaptureAPIView.as_view(), name='capture'),
    path('api/v1/capture/<int:session_id>/stop/', StopCaptureAPIView.as_view(), name='stop_capture'),
    path('api/v1/sessions/', SessionListAPIView.as_view(), name='session_list'),
    path('api/v1/sessions/<int:pk>/', SessionDetailAPIView.as_view(), name='session_detail'),
]