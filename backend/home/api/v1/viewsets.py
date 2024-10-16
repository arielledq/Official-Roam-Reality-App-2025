import logging

from django.shortcuts import get_object_or_404
from feedback.models import ReportedContent
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
from rest_framework.views import APIView
from rest_framework import viewsets

from notifications.models import NotificationTypes
from onesignal_client.utils import send_notification
from users.models import FriendshipRequest, Notification, UserProfile
from home.utils import EmailOTP
from django.utils.translation import ugettext_lazy as _
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator as token_generator
from home.api.v1.serializers import (
    AccountSetupSerializer,
    FriendshipRequestSerializer,
    NotificationSerializer,
    SignupSerializer,
    UserProfileSerializer,
    UserSerializer,
)
from django.db.models import Q
import re
from functools import reduce
from django.db.models import F, Value
from django.db.models.functions import Replace

logger = logging.getLogger('django')

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
        if ReportedContent.objects.filter(reported_user=user, block_reported_user=True).exists():
            return Response({"message": "Your account has been blocked."}, status=status.HTTP_400_BAD_REQUEST)

        # Here send notification to friends
        # [send_notification(NotificationTypes.FRIEND_ROAMING_ONLINE, user) for user in user.user_profile.friends.all()]
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
        user_id = self.kwargs.get('pk')
        if user_id:
            return UserProfile.objects.filter(pk=user_id)
        else:
            return UserProfile.objects.filter(user=self.request.user)
    

class FriendshipViewSet(ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = FriendshipRequestSerializer
    queryset = FriendshipRequest.objects.all()

    def create(self, request, *args, **kwargs):
        try:
            from_user = request.user
            to_user_id = request.data.get('to_user')
            to_user = User.objects.get(id=to_user_id)

            existing_request = FriendshipRequest.objects.filter(from_user=from_user, to_user=to_user).exists()
            if existing_request:
                return Response({"message": "Friendship request already sent."}, status=status.HTTP_400_BAD_REQUEST)

            FriendshipRequest.objects.create(from_user=from_user, to_user=to_user)
            send_notification(NotificationTypes.FRIEND_REQUEST_SENT, to_user)
            return Response({"message": "Friendship request sent."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"message": "User does not exist."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, *args, **kwargs):
        queryset = FriendshipRequest.objects.filter(to_user=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            super().destroy(request, *args, **kwargs)
            return Response({"message": "Friendship request rejected."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def accept_friend_request(self, request, pk=None):
        try:
            friendship_request = self.get_object()
            from_user = friendship_request.from_user
            to_user = request.user
            friendship_request.delete()
            to_user.user_profile.friends.add(from_user)
            from_user.user_profile.friends.add(to_user)
            send_notification(
                NotificationTypes.FRIEND_REQUEST_ACCEPTED,
                from_user,
                {},
                {'friend_name': to_user.get_full_name()}
            )
            # Notification.objects.create(
            # sender=from_user,
            # receiver=from_user,
            # title="Friend Request",
            # message=f"{to_user.name} accpeted your friend request",
            # notification_type=Notification.FRIEND_REQUEST,
            #  )
            return Response({"message": "Friendship request accepted."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=True, methods=['post'])
    def remove_friend(self, request, pk=None):
        try:
            to_user = request.user
            from_user = User.objects.get(id=pk)
            to_user.user_profile.friends.remove(from_user)
            from_user.user_profile.friends.remove(to_user)
            return Response({"message": "Friend removed."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

class InviteFriendAPIview(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            email = request.data.get('email')
            message = request.data.get('message')
            user = request.user
            EmailOTP.send_email(email, message, "Invitation from " + user.email)
            return Response({"message": "Invitation sent."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class FindFriendsAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            search = request.query_params.get('search',"")
            friends = request.user.user_profile.friends.all()
            users_with_friend_request = FriendshipRequest.objects.filter(from_user=request.user).values_list('to_user', flat=True)
            users = User.objects.filter(
                Q(email__icontains=search) |
                Q(name__icontains=search) 
            ).exclude(id__in=friends).exclude(id__in=users_with_friend_request).exclude(id=request.user.id)
            serializer = UserSerializer(users, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)


    def post(self, request):
        try:
            contacts = request.data
            users_with_friend_request = FriendshipRequest.objects.filter(from_user=request.user).values_list('to_user', flat=True)

            phone_numbers = []
            for contact in contacts:
                if contact.get('phoneNumbers'):
                    phone_number = re.sub(r'\D', '', contact['phoneNumbers'][0]['number'])
                    phone_numbers.append(phone_number)


            if phone_numbers:
                user_profiles = UserProfile.objects.annotate(phone_number_cleaned=Replace(F('phone_number'), Value('-'), Value(''))).filter(
                    reduce(
                        lambda x, y: x | y,
                        [
                            Q(phone_number_cleaned__regex=rf'{phone_number}')
                            for phone_number in phone_numbers
                        ]
                    )
                ).exclude(user__in=request.user.user_profile.friends.all()).exclude(user_id__in=users_with_friend_request)

                users = [up.user for up in user_profiles]
                serializer = UserSerializer(users, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'No valid phone numbers found in the contacts'}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class NotificationViewset(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    http_method_names = ["get", "patch"]

    def get_queryset(self):
        return Notification.objects.filter(receiver=self.request.user).order_by('-created_at')
    
    @action(methods=['patch'], detail=False, url_path='read-all', permission_classes=[IsAuthenticated])
    def read_all(self, request, pk=None):
        queryset = self.get_queryset()
        queryset.update(is_read=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(methods=['patch'], detail=False, url_path='clear-all', permission_classes=[IsAuthenticated])
    def clear_all(self, request, pk=None):
        queryset = self.get_queryset()
        queryset.update(is_hidden=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=False, permission_classes=[IsAuthenticated])
    def send_roaming_notifications(self, request):
        user = request.user
        user_profile = getattr(user, 'user_profile', None)

        if not user_profile:
            return Response({"error": "User profile does not exist."}, status=status.HTTP_400_BAD_REQUEST)

        friends = user_profile.friends.all()
        if not friends:
            return Response({"message": "User has no friends to notify."}, status=status.HTTP_400_BAD_REQUEST)

        metadata = request.query_params.get('metadata')
        if not metadata:
            return Response({"error": "Metadata is required."}, status=status.HTTP_400_BAD_REQUEST)

        for friend in friends:
            try:
                send_notification(NotificationTypes.FRIEND_ROAMING_ONLINE, friend, extra_data=metadata)
            except Exception as e:
                logger.error(f"Could not send roaming notification to {friend.email}, original error: {e}.")
        return Response({"message": "Roaming notifications sent."}, status=status.HTTP_200_OK)

