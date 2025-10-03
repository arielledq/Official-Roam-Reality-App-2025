import logging
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework.mixins import ListModelMixin
from feedback.models import ReportedContent
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.viewsets import ModelViewSet, ViewSet, GenericViewSet
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
from home.api.v1.filters import ScoreFilterSet
from modules.ar.challenges.models import ARUserProfile, ARMemories, Sponsor, GeoLocation, ARSitePinCheckIn
from notifications.models import NotificationTypes
from onesignal_client.utils import send_notification
from users.models import FriendshipRequest, Notification, UserProfile
from home.utils import EmailOTP
from django.utils.translation import gettext_lazy as _
from django.db.models import (
    OuterRef, Subquery, Sum, Case, When, Value, F, IntegerField, Q, Window
)
from django.db.models.functions import RowNumber
from django.db.models.functions import Coalesce
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
from configuration import configs
from utils.pagination import GenericPagination

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
            profileObj, created = ARUserProfile.objects.get_or_create(user=user)
            if configs.NUMBER_USER_POINT_GIFT < configs.LIMIT_USER_POINT_GIFT:
                profileObj.points += configs.POINTS_GIFT
                profileObj.save()
                sponsor = Sponsor.objects.get(name='BONUS')
                geo_location = GeoLocation.objects.get(name='BONUS')
                ARMemories.objects.create(
                    points=configs.POINTS_GIFT,
                    sponsor=sponsor,
                    geo_location=geo_location,
                    memory_type='BONUS',
                    user=user,
                )
                configs.NUMBER_USER_POINT_GIFT += 1

                send_notification(
                    NotificationTypes.DEFAULT,
                    user,
                    title="\U0001F381 Surprise!",
                    description=f'We’ve added {configs.POINTS_GIFT} bonus points to your Roam Reality account—just for '
                                f'being one of the first {configs.LIMIT_USER_POINT_GIFT} roamers to download the app!',
                )
            return Response({"token": token.key, "user": user_serializer.data})
        except User.DoesNotExist:
            return Response({"message": "User does not exist."}, status=status.HTTP_400_BAD_REQUEST)


class LoginViewSet(ViewSet):
    """Based on rest_framework.authtoken.views.ObtainAuthToken"""

    serializer_class = AuthTokenSerializer

    def create(self, request):
        username = request.data.get('username')

        user = User.objects.filter(email=username).first()
        if user is not None and not user.is_active:
            return Response(
                {"message": "Your account is inactive. Please contact support."},
                status=status.HTTP_400_BAD_REQUEST
            )

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


class ScoreViewSet(GenericViewSet, ListModelMixin):
    """
    Users for listing, searching and filtering.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    http_method_names = ["get",]
    queryset = User.objects.filter(is_superuser=False, is_active=True, ar_user_profile_user__isnull=False)
    pagination_class = GenericPagination
    filter_backends = [SearchFilter, DjangoFilterBackend]
    filterset_class = ScoreFilterSet
    search_fields = ['name', ]

    def get_queryset(self):
        qs = super().get_queryset().exclude(
            id__in=configs.SCOREBOARD_EXCLUDED_USER_IDS
        )

        # Subquery ARMemories
        memories_sq = (
            ARMemories.objects
            .filter(
                user=OuterRef('pk'),
                challenge_approval__in=["UNAPPROVED", "APPROVED"],
            )
            .values('user')
            .annotate(total=Sum(
                Case(
                    When(memory_type__in=['PHOTO', 'VIDEO', 'BONUS', 'SCAN_PHOTO', 'STAR', 'SOCIAL_POINTS'], then=F('points')),
                    When(memory_type='DEDUCTED', then=F('points') * Value(-1)),
                    default=Value(0),
                    output_field=IntegerField()
                )
            ))
            .values('total')
        )

        # Subquery ARSitePinCheckIn
        checkins_sq = (
            ARSitePinCheckIn.objects
            .filter(
                user=OuterRef('pk'),
                challenge_approval__in=["UNAPPROVED", "APPROVED"],
            )
            .values('user')
            .annotate(total=Sum('points'))
            .values('total')
        )

        # Sum
        qs = qs.annotate(
            memories_points=Coalesce(
                Subquery(memories_sq, output_field=IntegerField()),
                Value(0)
            ),
            checkin_points=Coalesce(
                Subquery(checkins_sq, output_field=IntegerField()),
                Value(0)
            ),
        ).annotate(
            calculated_points=F('memories_points') + F('checkin_points')
        )

        return qs.order_by('-calculated_points', '-ar_user_profile_user__updated_at', 'id')  #, 'id'

    @action(detail=False, methods=['get'], url_path='my-rank')
    def my_rank(self, request):
        qs = self.filter_queryset(self.get_queryset()).values_list('pk', 'calculated_points')
        user = request.user

        rank = None
        points = 0
        for idx, user_data in enumerate(qs, start=1):
            if user_data[0] == user.id:
                rank = idx
                points = user_data[1]
                break

        return Response({
            'my_rank': rank,
            'my_points': points
        })


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
            EmailOTP.send_email(email, user.first_name, "Invitation from " + user.email)
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
            serializer = UserSerializer(users[:100], many=True)
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
