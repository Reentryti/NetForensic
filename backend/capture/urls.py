from django.urls import path
from .views import (CaptureAPIView, StopCaptureAPIView, SessionDetailAPIView, SessionListAPIView, InterfaceListAPIView,LiveStatsAPIView, LogStreamView)
from .views import predict

app_name = 'forensic_app'

urlpatterns = [
    # API Endpoints
    path('capture/', CaptureAPIView.as_view(), name='capture'),
    path('capture/<int:session_id>/stop/', StopCaptureAPIView.as_view(), name='stop_capture'),
    path('sessions/', SessionListAPIView.as_view(), name='session_list'),
    path('sessions/<int:pk>/', SessionDetailAPIView.as_view(), name='session_detail'),
    path('interfaces/', InterfaceListAPIView.as_view(), name='interface_list'),
    path('stats/live/', LiveStatsAPIView.as_view(), name='live_stats'),
    path('logs/stream/', LogStreamView.as_view(), name='log-stream'),
    path('predict/', predict, name='predict')
]