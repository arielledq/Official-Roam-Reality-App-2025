from django.contrib.auth import get_user_model
from django.http import HttpRequest
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.hashers import check_password
from allauth.account import app_settings as allauth_settings
from allauth.account.forms import ResetPasswordForm
from allauth.utils import email_address_exists, generate_unique_username
from allauth.account.adapter import get_adapter
from allauth.account.utils import setup_user_email
from rest_framework import serializers
from rest_auth.serializers import PasswordResetSerializer
from users.models import UserProfile

from home.utils import EmailOTP


User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'password')
        extra_kwargs = {
            'password': {
                'write_only': True,
                'style': {
                    'input_type': 'password'
                }
            },
            'email': {
                'required': True,
                'allow_blank': False,
            }
        }

    def _get_request(self):
        request = self.context.get('request')
        if request and not isinstance(request, HttpRequest) and hasattr(request, '_request'):
            request = request._request
        return request

    def validate_email(self, email):
        email = get_adapter().clean_email(email)
        if allauth_settings.UNIQUE_EMAIL:
            if email and email_address_exists(email):
                raise serializers.ValidationError(
                    _("A user is already registered with this e-mail address."))
        return email

    def create(self, validated_data):
        user = User(
            email=validated_data.get('email'),
            name=validated_data.get('name'),
            username=generate_unique_username([
                validated_data.get('name'),
                validated_data.get('email'),
                'user'
            ])
        )
        user.set_password(validated_data.get('password'))
        user.save()
        request = self._get_request()
        setup_user_email(request, user, [])
        EmailOTP.send_to_new_user(validated_data.get('email'))
        return user

    def save(self, request=None):
        """rest_auth passes request so we must override to accept it"""
        return super().save()
    
class UserProfileSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = UserProfile
        fields = ('id', 'is_verified', 'image')


class UserSerializer(serializers.ModelSerializer):
    user_profile = UserProfileSerializer()

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'user_profile']


class PasswordSerializer(PasswordResetSerializer):
    """Custom serializer for rest_auth to solve reset password error"""
    password_reset_form_class = ResetPasswordForm


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField()
    confirm_password = serializers.CharField()

    def validate(self, attrs):
        old_password = attrs.get('old_password')
        new_password = attrs.get('new_password')
        confirm_password = attrs.get('confirm_password')

        currentpassword = self.context['request'].user.password
        matchcheck = check_password(old_password, currentpassword)

        if not matchcheck:
            raise serializers.ValidationError("Password didn't matched with existing password")
        if new_password != confirm_password:
            raise serializers.ValidationError("Password didn't matched !!")
        if self.context['request'].user.check_password(new_password):
            raise serializers.ValidationError("This password is not acceptable !!")
        return attrs


class AccountSetupSerializer(serializers.ModelSerializer):
    user = serializers.CharField(required=False)

    class Meta:
        model = UserProfile
        fields = "__all__"

    def create(self, validated_data):
        user_profile = dict()
        user_profile["user"] = self.context['request'].user
        user_profile.update(validated_data)
        return UserProfile.objects.create(**user_profile)