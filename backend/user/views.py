from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.views import View
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.core.mail import send_mail
from django.conf import settings
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
from django_otp.plugins.otp_totp.models import TOTPDevice
import qrcode, base64
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

# Basic Signup View
class RegistrationView(View):
    template_name = "account/signup.html"
    form_class = UserRegistrationForm

    def get(self, request):
        return render(request, self.template_name, {"form": self.form_class()})

    def post(self, request):
        form = self.form_class(request.POST)
        if not form.is_valid():
            return render(request, self.template_name, {"form": form})

        user = form.save(commit=False)
        user.is_active = True
        user.save()

        request.session['auth_user_id'] = user.id
        return redirect("two_factor_setup") 
         
#Login View
class LoginView(View):
    template_name = "account/login.html"
    form_class = UserLoginForm

    def get(self, request):
        if request.user.is_authenticated:
            return redirect(settings.FRONTEND_DASHBOARD_URL)
        return render(request, self.template_name, {"form": self.form_class()})

    def post(self, request):
        form = self.form_class(request.POST)
        if not form.is_valid():
            messages.error(request, "Veuillez corriger les erreurs.")
            return render(request, self.template_name, {"form": form})

        email = form.cleaned_data["email"]
        password = form.cleaned_data["password"]
        user = authenticate(request, email=email, password=password)

        if user is None:
            messages.error(request, "Email ou mot de passe incorrect.")
            return render(request, self.template_name, {"form": form})
        
        request.session["auth_user_id"] = user.id
        if TOTPDevice.objects.filter(user=user, confirmed=True).exists():
            return redirect("two_factor_verify")
        else:
            return redirect("two_factor_setup")

# 2FA Login Verification View
class TwoFactorVerifyView(View):
    template_name = 'account/two_factor_verify.html'
    form_class = TwoFactorVerificationForm

    def get(self, request):
        if 'auth_user_id' not in request.session:
            return redirect('login')
        
        user_id = request.session.get('auth_user_id')
        try:
            user = User.objects.get(pk=user_id)
            if not TOTPDevice.objects.filter(user=user, confirmed=True).exists():
                return redirect('two_factor_setup')
        except User.DoesNotExist:
            return redirect('login')
        
        form = self.form_class()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = self.form_class(request.POST)
        if form.is_valid():
            user_id = request.session.get('auth_user_id')
            try:
                user = User.objects.get(pk=user_id)
                device = TOTPDevice.objects.get(user=user, confirmed=True)
            
                if device.verify_token(form.cleaned_data['code']):
                    del request.session['auth_user_id']
                    login(request, user)
                    messages.success(request, 'Connexion réussie avec 2FA!')
                    return redirect(settings.FRONTEND_DASHBOARD_URL)
                else:
                    messages.error(request, 'Code de vérification incorrect.')
            except (User.DoesNotExist, TOTPDevice.DoesNotExist):
                messages.error(request, 'Erreur de vérification 2FA')
        else:
            messages.error(request, 'Veuillez entrer un code valide.')
        
        return render(request, self.template_name, {'form': form})

# 2FA Configuration View
class SetupTwoFactorView(View):
    template_name = "account/two_factor_setup.html"

    def get(self, request):
        if 'auth_user_id' not in request.session:
            return redirect('login')
        
        user_id = request.session.get('auth_user_id')
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return redirect('login')
        #Deleting non confirmed device
        TOTPDevice.objects.filter(user=user, confirmed=False).delete()
        #And create new
        device = TOTPDevice.objects.create(user=user, confirmed=False, name='default')

        # QR code configuration
        qr = qrcode.QRCode(version=1,box_size=10, border=4)
        qr.add_data(device.config_url)
        qr.make(fit=True)
        # QR code generation
        img = qr.make_image(fill_color="black", back_color="white")

        buffer = BytesIO()
        img.save(buffer, format="PNG")
        qr_b64 = base64.b64encode(buffer.getvalue()).decode()

        context = {
            "qr_code_image": qr_b64,
            "secret_key": device.key,
        }
        return render(request, self.template_name, context)

    def post(self, request):
        if 'auth_user_id' not in request.session:
            return redirect('login')
        
        user_id = request.session.get('auth_user_id')

        try:
            user = User.objects.get(pk=user_id)
            device = TOTPDevice.objects.get(user=user, confirmed=False)
        except(User.DoesNotExist, TOTPDevice.DoesNotExist):
            return redirect('login')

        token = request.POST.get("otp_code")

        if not device.verify_token(token):
            messages.error(request, "Code OTP invalide.")
            return redirect("two_factor_setup")

        device.confirmed = True
        device.save()

        if not request.user.is_authenticated:
            login(request, user)

        messages.success(request, "Authentification à deux facteurs activée avec succès.")
        return redirect(settings.FRONTEND_DASHBOARD_URL)


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

# Deconnexion View
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

