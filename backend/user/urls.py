from django.urls import path
from django.contrib.auth import views as auth_views
from .views import (
    RegistrationView,
    LoginView,
    LogoutView,
    TwoFactorVerifyView,
    SetupTwoFactorView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    ProfileView,
)

urlpatterns = [
    # Basic Auth endpoints
    path('signup/', RegistrationView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # 2FA
    path('two-factor/verify/', TwoFactorVerifyView.as_view(), name='two_factor_verify'),
    path('two-factor/setup/', SetupTwoFactorView.as_view(), name='two_factor_setup'),
    
    # New Password
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset-confirm/<str:uidb64>/<str:token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # User Profile
    path('profile/', ProfileView.as_view(), name='profile'),
    
    # Validation pages
    path('password-reset-done/', auth_views.TemplateView.as_view(template_name='account/password_reset_done.html'), name='password_reset_done'),
    path('password-reset-complete/', auth_views.TemplateView.as_view(template_name='account/password_reset_complete.html'), name='password_reset_complete'),
]