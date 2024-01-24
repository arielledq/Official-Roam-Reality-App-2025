from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.viewsets import ModelViewSet, ViewSet
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.utils.encoding import force_bytes
from django.contrib.auth import get_user_model
from users.models import UserProfile
from home.utils import EmailOTP
from django.utils.translation import ugettext_lazy as _
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator as token_generator
from home.api.v1.serializers import (
    AccountSetupSerializer,
    SignupSerializer,
    UserProfileSerializer,
    UserSerializer,
)

User = get_user_model()


class SignupViewSet(ModelViewSet):
    serializer_class = SignupSerializer
    http_method_names = ["post"]

    def create(self, request):
        try:
            serializer = self.serializer_class(
                data=request.data, context={"request": request}
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            user = User.objects.get(email=serializer.validated_data.get('email'))
            token, created = Token.objects.get_or_create(user=user)
            user_serializer = UserSerializer(user)
            return Response({"token": token.key, "user": user_serializer.data})
        except User.DoesNotExist:
            return Response({"message": "User does not exist."}, status=status.HTTP_400_BAD_REQUEST)


class LoginViewSet(ViewSet):
    """Based on rest_framework.authtoken.views.ObtainAuthToken"""

    serializer_class = AuthTokenSerializer

    def create(self, request):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, created = Token.objects.get_or_create(user=user)
        user_serializer = UserSerializer(user)
        return Response({"token": token.key, "user": user_serializer.data})


class SendEmailOtpViewset(ViewSet):
    """
    An endpoint for generating otp.
    """
    authentication_classes = []
    permission_classes = []

    def create(self, request):
        try:
            EmailOTP.send(self.request)
            return Response({
                    "message": _("Verification OTP has been sent to email."),
                    "data": {}
                }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'status':"fail", 'message':str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ConfirmEmailOtpViewset(ViewSet):
    """
    An endpoint for generating otp.
    """
    authentication_classes = []
    permission_classes = []
    input_token = "Email OTP"

    def create(self, request):
        try:
            verify_otp = EmailOTP.confirm(self.request)
            if verify_otp.get('status'):
                UserProfile.objects.filter(user__email=request.data.get("email")).update(is_verified=True)
                return Response(
                    {
                        "message": verify_otp.get('response'),
                        "status": "success",
                        "email": request.data.get("email"),
                    },
                    status=status.HTTP_200_OK
                )
            return Response(
                    {
                        "message": verify_otp.get('response'),
                        "status": "fail"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response({'status':"fail", 'message':str(e)}, status=status.HTTP_400_BAD_REQUEST)


    @action(methods=['post'], detail=False, url_path=r'token')
    def token(self, request,  *args, **kwargs):
        """
        An endpoint for generating otp.
        """
        try:
            verify_otp = EmailOTP.confirm(self.request)
            user = User.objects.get(email=request.data.get('email'))
            if verify_otp.get('status'):
                return Response(
                    {
                        "message": verify_otp.get('response'),
                        "status": "success",
                        "uid": urlsafe_base64_encode(force_bytes(user.pk)),
                        "token": token_generator.make_token(user),
                    },
                    status=status.HTTP_200_OK
                )
            return Response(
                    {
                        "message": verify_otp.get('response'),
                        "status": "fail",
                        "uid": None,
                        "token": None,
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response({'status':"success", 'message':str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AccountSetupViewset(ModelViewSet):
    """
        API for Account Setup
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = AccountSetupSerializer
    http_method_names = ["get", "patch"]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)
    