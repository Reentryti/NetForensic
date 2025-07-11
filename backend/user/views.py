from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.views import View
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.core.mail import send_mail
from django.conf import settings
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp.util import random_hex
import qrcode
import qrcode.image.svg
from io import BytesIO
import base64



from .models import User
from .forms import (
    UserRegistrationForm,
    UserLoginForm,
    TwoFactorVerificationForm,
    SetupTwoFactorForm,
    PasswordResetRequestForm,
    SetNewPasswordForm
)

# Create your views here.

class RegistrationView(View):
    template_name = 'account/signup.html'
    form_class = UserRegistrationForm
    success_url = reverse_lazy('email_verification_sent')

    def get(self, request):
        form = self.form_class()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = self.form_class(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            user.save()

            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            return redirect(self.success_url)
        
        return render(request, self.template_name, {'form': form})



class LoginView(View):
    template_name = 'account/login.html'
    form_class = UserLoginForm

    def get(self, request):
        if request.user.is_authenticated:
            return redirect('dashboard')
        form = self.form_class()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = self.form_class(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            user = authenticate(request, email=email, password=password)

            if user is not None:
                if not user.email_verified:
                    messages.error(request, 'Veuillez vérifier votre email avant de vous connecter.')
                    return render(request, self.template_name, {'form': form})
                
                if TOTPDevice.objects.filter(user=user, confirmed=True).exists():
                    request.session['auth_user_id'] = user.id
                    request.session['auth_user_backend'] = user.backend
                    return redirect('two_factor_verify')
                
                login(request, user)
                messages.success(request, 'Connexion réussie!')
                return redirect('dashboard')
            else:
                messages.error(request, 'Email ou mot de passe incorrect.')
        else:
            messages.error(request, 'Veuillez corriger les erreurs ci-dessous.')
        
        return render(request, self.template_name, {'form': form})


class TwoFactorVerifyView(View):
    template_name = 'account/two_factor.html'
    form_class = TwoFactorVerificationForm

    def get(self, request):
        if 'auth_user_id' not in request.session:
            return redirect('login')
        
        form = self.form_class()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = self.form_class(request.POST)
        if form.is_valid():
            user_id = request.session.get('auth_user_id')
            user = User.objects.get(pk=user_id)
            device = TOTPDevice.objects.get(user=user)
            
            if device.verify_token(form.cleaned_data['code']):
                del request.session['auth_user_id']
                del request.session['auth_user_backend']
                login(request, user)
                messages.success(request, 'Connexion réussie avec 2FA!')
                return redirect('dashboard')
            else:
                messages.error(request, 'Code de vérification incorrect.')
        else:
            messages.error(request, 'Veuillez entrer un code valide.')
        
        return render(request, self.template_name, {'form': form})


class SetupTwoFactorView(View):
    template_name = 'account/two_factor_setup.html'
    form_class = SetupTwoFactorForm

    @method_decorator(login_required)
    def get(self, request):
       
        secret_key = random_hex(20)
        request.session['totp_secret'] = secret_key
        uri = f"otpauth://totp/{settings.APP_NAME}:{request.user.email}?secret={secret_key}&issuer={settings.APP_NAME}"
        img = qrcode.make(uri, image_factory=qrcode.image.svg.SvgImage)
        buffer = BytesIO()
        img.save(buffer)
        qr_code = base64.b64encode(buffer.getvalue()).decode()

        form = self.form_class()
        return render(request, self.template_name, {
            'form': form,
            'qr_code': qr_code,
            'secret_key': secret_key
        })

    @method_decorator(login_required)
    def post(self, request):
        form = self.form_class(request.POST)
        if form.is_valid():
            secret_key = request.session.get('totp_secret')
            if secret_key and form.cleaned_data['code']:
                device = TOTPDevice(
                    user=request.user,
                    name='default',
                    confirmed=True,
                    key=secret_key,
                )
                device.save()
                del request.session['totp_secret']
                messages.success(request, 'Authentification à deux facteurs activée avec succès!')
                return redirect('profile')
            else:
                messages.error(request, 'Erreur lors de la configuration du 2FA.')
        
        return render(request, self.template_name, {'form': form})


class PasswordResetRequestView(View):
    template_name = 'account/password_reset.html'
    form_class = PasswordResetRequestForm

    def get(self, request):
        form = self.form_class()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = self.form_class(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            user = User.objects.filter(email=email).first()
            
            if user:
               
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                
               
                reset_link = f"{settings.BASE_URL}/accounts/password-reset-confirm/{uid}/{token}/"
                send_mail(
                    'Réinitialisation de votre mot de passe',
                    f'Cliquez sur ce lien pour réinitialiser votre mot de passe : {reset_link}',
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
          
            messages.success(request, 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.')
            return redirect('password_reset_done')
        
        return render(request, self.template_name, {'form': form})


class PasswordResetConfirmView(View):
    template_name = 'account/password_reset_confirm.html'
    form_class = SetNewPasswordForm

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            
            if default_token_generator.check_token(user, token):
                form = self.form_class()
                return render(request, self.template_name, {'form': form})
            else:
                messages.error(request, 'Lien de réinitialisation invalide ou expiré.')
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            messages.error(request, 'Lien de réinitialisation invalide.')
        
        return redirect('password_reset')

    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            
            if default_token_generator.check_token(user, token):
                form = self.form_class(request.POST)
                if form.is_valid():
                    user.set_password(form.cleaned_data['new_password1'])
                    user.save()
                    messages.success(request, 'Votre mot de passe a été réinitialisé avec succès!')
                    return redirect('password_reset_complete')
                else:
                    return render(request, self.template_name, {'form': form})
            else:
                messages.error(request, 'Lien de réinitialisation invalide ou expiré.')
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            messages.error(request, 'Lien de réinitialisation invalide.')
        
        return redirect('password_reset')


class LogoutView(View):
    def get(self, request):
        logout(request)
        messages.success(request, 'Vous avez été déconnecté avec succès.')
        return redirect('login')


class ProfileView(View):
    template_name = 'account/profile.html'

    @method_decorator(login_required)
    def get(self, request):
        has_2fa = TOTPDevice.objects.filter(user=request.user, confirmed=True).exists()
        return render(request, self.template_name, {'has_2fa': has_2fa})

