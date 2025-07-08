from django import forms
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError
from .models import User

class UserRegistrationForm(forms.ModelForm):
    password1 = forms.CharField(
        label="Mot de passe",
        widget=forms.PasswordInput,
        help_text=password_validation.password_validators_help_text_html(),
    )
    password2 = forms.CharField(
        label="Confirmation du mot de passe",
        widget=forms.PasswordInput,
    )

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name')

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise ValidationError("Les mots de passe ne correspondent pas.")
        return password2

    def _post_clean(self):
        super()._post_clean()
        password = self.cleaned_data.get('password2')
        if password:
            try:
                password_validation.validate_password(password, self.instance)
            except ValidationError as error:
                self.add_error('password2', error)

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user

class UserLoginForm(forms.Form):
    email = forms.EmailField(label="Email")
    password = forms.CharField(label="Mot de passe", widget=forms.PasswordInput)
    remember_me = forms.BooleanField(
        label="Se souvenir de moi",
        required=False,
        widget=forms.CheckboxInput
    )

class TwoFactorVerificationForm(forms.Form):
    code = forms.CharField(
        label="Code de vérification",
        max_length=6,
        min_length=6,
        widget=forms.TextInput(attrs={'autocomplete': 'off'})
    )

class SetupTwoFactorForm(forms.Form):
    code = forms.CharField(
        label="Code de vérification depuis votre application",
        max_length=6,
        min_length=6,
        widget=forms.TextInput(attrs={'autocomplete': 'off'})
    )

class PasswordResetRequestForm(forms.Form):
    email = forms.EmailField(label="Email")

class SetNewPasswordForm(SetPasswordForm):
    new_password1 = forms.CharField(
        label="Nouveau mot de passe",
        widget=forms.PasswordInput,
        help_text=password_validation.password_validators_help_text_html(),
    )
    new_password2 = forms.CharField(
        label="Confirmation du nouveau mot de passe",
        widget=forms.PasswordInput,
    )