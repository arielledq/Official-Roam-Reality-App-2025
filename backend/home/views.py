import uuid
from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_auth.views import LogoutView, PasswordResetConfirmView
from rest_framework.authentication import TokenAuthentication
from rest_framework import permissions, status, generics, serializers
from rest_framework.views import APIView
from home.api.v1.serializers import ChangePasswordSerializer, UserSerializer
from home.utils import EmailOTP, handle_validation_error
from travel_ar_app_42706.settings import DOMAIN
from rest_framework.response import Response
from rest_framework.authtoken.models import Token


from users.models import PasswordReset, UserProfile

User = get_user_model()


def home(request):
    packages = [
	{'name':'django-allauth', 'url': 'https://pypi.org/project/django-allauth/0.38.0/'},
	{'name':'django-bootstrap4', 'url': 'https://pypi.org/project/django-bootstrap4/0.0.7/'},
	{'name':'djangorestframework', 'url': 'https://pypi.org/project/djangorestframework/3.9.0/'},
    ]
    context = {
        'packages': packages
    }
    return render(request, 'home/index.html', context)


class AppLogoutView(LogoutView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated,)
    http_method_names = ['post']


class SendPasswordToken(APIView):
    """ Send password reset token to the user"""
    def post(self, request):
        try:
            email = request.data['email']
            email = email.lower() if email else None
            password_reset = PasswordReset.objects.filter(user__email=email)
            mail_dict = dict()
            if password_reset.exists():
                password_reset = password_reset.first()
                mail_dict['subject'] = "Password Reset Token"
                mail_dict['message'] = 'Click on this link to reset your password: '
                mail_dict['link'] = f'{DOMAIN}/resetPassword/{password_reset.user.email}/{password_reset.token}'
                mail_dict['email'] = email
                EmailOTP.send_reset_link(mail_dict)
                return Response({"message": "Successfully Token sent."}, status=status.HTTP_201_CREATED)
            token = uuid.uuid4()
            user = User.objects.filter(email=email)
            if user.exists():
                user = user.first()
                PasswordReset.objects.create(
                    user=user,
                    token=token
                )
                password_reset = password_reset.first()
                mail_dict['subject'] = "Password Reset Token"
                mail_dict['message'] = 'Click on this link to reset your password: '
                mail_dict['link'] = f'{DOMAIN}/resetPassword/{password_reset.user.email}/{password_reset.token}'
                mail_dict['email'] = email
                EmailOTP.send(mail_dict)
                return Response({"message": "Successfully Token sent."}, status=status.HTTP_201_CREATED)
            return Response({"message": "User not found."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': e.args[0]}, status=status.HTTP_400_BAD_REQUEST)


class VerifyPasswordToken(APIView):
    def post(self, request):
        try:
            email = request.data['email']
            email = email.lower() if email else None
            token = request.data['token']
            user_verify = PasswordReset.objects.filter(user__email=email)
            if user_verify.exists():
                user_verify = user_verify.first()
                if token == user_verify.token:
                    user = user_verify.user
                    user.set_password(request.data['password'])
                    user.save()
                    user_verify.delete()
                    return Response({"message": "Successfully resetted user password."}, status=status.HTTP_201_CREATED)
            return Response({"message": "Wrong Token."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': e.args[0]}, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(generics.GenericAPIView):
    """
    An endpoint for changing password.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ChangePasswordSerializer

    def post(self, request):
        try:
            serializer = self.get_serializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            request.user.set_password(serializer.validated_data['confirm_password'])
            request.user.save()
            return Response({'success': True, 'message': 'Password successfully changed !!'}, status=status.HTTP_200_OK)
        except serializers.ValidationError as e:
            return handle_validation_error(e)
        except Exception as e:
            error_message = "Something went wrong !!"
            if e.detail.get('non_field_errors'):
                error_message = str(e.detail.get('non_field_errors')[0])
            return Response({'success': False, 'message': str(e), 'error_message': error_message},
                            status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(PasswordResetConfirmView):
    """
    Password reset e-mail token is verified, therefore
    this resets the user's password.

    Accepts the following POST parameters: token, uid,
        new_password1, new_password2
    Returns the success/fail message.
    """

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        request.data['email'] = serializer.user.email
        request.data['password'] = serializer.validated_data['new_password1']
        user = User.objects.get(email=serializer.user.email)
        token, created = Token.objects.get_or_create(user=user)
        user_serializer = UserSerializer(user)
        return Response({"token": token.key, "user": user_serializer.data},status.HTTP_201_CREATED)


class DeleteAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        try:
            user=self.request.user
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
