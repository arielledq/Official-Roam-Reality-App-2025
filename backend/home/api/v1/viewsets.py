from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.viewsets import ModelViewSet, ViewSet
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth import get_user_model
from users.models import UserProfile
from home.utils import EmailOTP
from django.utils.translation import ugettext_lazy as _

from home.api.v1.serializers import (
    SignupSerializer,
    UserSerializer,
)

User = get_user_model()


class SignupViewSet(ModelViewSet):
    serializer_class = SignupSerializer
    http_method_names = ["post"]


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