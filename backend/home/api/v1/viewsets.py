import logging
import math

from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from rest_framework.filters import SearchFilter
from rest_framework.mixins import ListModelMixin
from rest_framework.pagination import PageNumberPagination
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
from modules.ar.challenges.models import ARUserProfile, ARMemories, Sponsor, GeoLocation, ARSitePinCheckIn, ScanPicture, GeoARStar
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
    ModeSerializer,
    ScanMapSerializer,
    HuntMapSerializer,
)
from home.models import Mode
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
                # sponsor = Sponsor.objects.get(name='BONUS')
                # geo_location = GeoLocation.objects.get(name='BONUS')
                # ARMemories.objects.create(
                #     points=configs.POINTS_GIFT,
                #     sponsor=sponsor,
                #     geo_location=geo_location,
                #     memory_type='BONUS',
                #     user=user,
                # )
                
                # configs.NUMBER_USER_POINT_GIFT += 1

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
    http_method_names = ["get", "patch", "delete"]

    def get_queryset(self):
        user_id = self.kwargs.get('pk')
        if user_id:
            return UserProfile.objects.filter(pk=user_id)
        else:
            return UserProfile.objects.filter(user=self.request.user)

    @action(detail=False, methods=['delete'], url_path='delete-profile-image')
    def delete_profile_image(self, request):
        """
        Delete user's profile image
        """
        try:
            user_profile = UserProfile.objects.get(user=request.user)
            
            # Delete the image file if it exists
            if user_profile.image:
                # Delete the file from storage
                user_profile.image.delete(save=False)
                # Set the image field to None
                user_profile.image = None
                user_profile.save()
                
                return Response({
                    "message": "Profile image deleted successfully",
                    "status": "success"
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "message": "No profile image found to delete",
                    "status": "info"
                }, status=status.HTTP_404_NOT_FOUND)
                
        except UserProfile.DoesNotExist:
            return Response({
                "message": "User profile not found",
                "status": "error"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "message": f"Error deleting profile image: {str(e)}",
                "status": "error"
            }, status=status.HTTP_400_BAD_REQUEST)


class CustomScoreboardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        total_record = self.page.paginator.count
        page_size = self.get_page_size(self.request) or self.page.paginator.per_page
        total_pages_count = math.ceil(total_record / page_size) if page_size else 1
        total_pages = list(range(1, total_pages_count + 1))
        return Response({
            'total_record': total_record,
            'page_size': page_size,
            'current_page': self.page.number,
            'total_pages': total_pages,
            'results': data
        })

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
    pagination_class = CustomScoreboardPagination


    def get_queryset(self):
        """
        Get scoreboard queryset with combined points from:
        - AR Memories (photos, videos, scans, etc.)
        - AR Site Check-ins
        - Randomizer Challenge Submissions
        """
        from randomizer_challenge.models import RandomizerSubmission

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

        # Subquery RandomizerSubmission
        # Include approved and unapproved randomizer submissions (matching AR logic)
        randomizer_sq = (
            RandomizerSubmission.objects
            .filter(
                user=OuterRef('pk'),
                approval_status__in=["UNAPPROVED", "APPROVED"],
            )
            .values('user')
            .annotate(total=Sum('points'))
            .values('total')
        )

        # Sum all point sources
        qs = qs.annotate(
            memories_points=Coalesce(
                Subquery(memories_sq, output_field=IntegerField()),
                Value(0)
            ),
            checkin_points=Coalesce(
                Subquery(checkins_sq, output_field=IntegerField()),
                Value(0)
            ),
            randomizer_points=Coalesce(
                Subquery(randomizer_sq, output_field=IntegerField()),
                Value(0)
            ),
        ).annotate(
            # Combined total: AR memories + AR checkins + Randomizer submissions
            calculated_points=F('memories_points') + F('checkin_points') + F('randomizer_points')
        )

        return qs.order_by('-calculated_points', '-ar_user_profile_user__updated_at', 'id')  #, 'id'

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='page_size',
                type=int,
                location=OpenApiParameter.QUERY,
                description='Number of records to return per page',
                required=False,
                examples=[
                    OpenApiExample(
                        'page_size',
                        summary='Show 10 records per page',
                        value=10,
                    )
                ]
            ),
            OpenApiParameter(
                name='page',
                type=int,
                location=OpenApiParameter.QUERY,
                description='Page number for pagination',
                required=False,
                examples=[
                    OpenApiExample(
                        'page',
                        summary='Go to page 2',
                        value=1,
                    )
                ]
            ),
        ]
    )
    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        # Remove manual slicing, use DRF pagination
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='my-rank')
    def my_rank(self, request):
        """
        Get current user's rank and points (from unified ARUserProfile).
        Now uses single profile for both AR and Randomizer challenges.
        """
        user = request.user

        # Get the filtered queryset (this may exclude the current user)
        filtered_qs = self.filter_queryset(self.get_queryset())

        # Get the full queryset to ensure we can find the user
        full_qs = self.get_queryset()

        # Get user points from unified ARUserProfile (now includes both AR and Randomizer)
        try:
            user_profile = user.ar_user_profile_user
            user_points = user_profile.points if user_profile.points is not None else 0
            ar_updated_at = user_profile.updated_at
        except ARUserProfile.DoesNotExist:
            # No profile - return early
            return Response({
                'my_rank': None,
                'my_points': 0
            })

        # Note: No need to add randomizer_profile.points anymore - it's all in ar_user_profile_user.points

        # Check if user is in the filtered queryset
        user_in_filtered = filtered_qs.filter(pk=user.id).exists()

        # Get the queryset to use for ranking (filtered or full)
        qs_for_rank = filtered_qs if user_in_filtered else full_qs

        # Calculate rank based on unified points (no need for subquery anymore)
        # All points (AR + Randomizer) are now in ar_user_profile_user.points
        ranked_qs = qs_for_rank.annotate(
            combined_points=Coalesce(F('ar_user_profile_user__points'), Value(0))
        ).select_related('ar_user_profile_user').order_by(
            '-combined_points',  # Primary: Sort by combined points (descending)
            '-ar_user_profile_user__updated_at',  # Tiebreaker: Most recently updated
            'id'  # Final tiebreaker: Lower user ID wins
        )

        # Convert to list to find rank
        users_list = list(ranked_qs.values_list(
            'pk',
            'combined_points',
            'ar_user_profile_user__updated_at',
            'id'
        ))

        rank = None
        for idx, (user_pk, points, updated_at, user_id) in enumerate(users_list, start=1):
            if user_pk == user.id:
                rank = idx
                break

        # If user not found in queryset, calculate rank using count
        if rank is None:
            # Count users with more combined points, or same points but better tiebreakers
            rank = ranked_qs.filter(
                Q(combined_points__gt=user_points) |
                (
                    Q(combined_points=user_points) &
                    (
                        Q(ar_user_profile_user__updated_at__gt=ar_updated_at) |
                        (Q(ar_user_profile_user__updated_at=ar_updated_at) & Q(id__lt=user.id))
                    )
                )
            ).count() + 1

        print("rank", rank)
        return Response({
            'my_rank': rank,
            'my_points': user_points
        })


class FriendshipViewSet(ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = FriendshipRequestSerializer
    queryset = FriendshipRequest.objects.all()

    def get_queryset(self):
        """
        Filter queryset to only show friendship requests sent to the current user.
        This ensures users can only reject/accept requests that were sent to them.
        """
        return FriendshipRequest.objects.filter(to_user=self.request.user)

    def create(self, request, *args, **kwargs):
        try:
            from_user = request.user
            to_user_id = request.data.get('to_user')
            to_user = User.objects.get(id=to_user_id)

            existing_request = FriendshipRequest.objects.filter(from_user=from_user, to_user=to_user).exists()
            if existing_request:
                return Response({"message": "Friendship request already sent."}, status=status.HTTP_400_BAD_REQUEST)

            friendship_request = FriendshipRequest.objects.create(from_user=from_user, to_user=to_user)
            send_notification(
                NotificationTypes.FRIEND_REQUEST_SENT, 
                to_user, 
                {'from_user': from_user}, 
                {
                    'from_user_id': from_user.id,
                    'friendship_request_id': friendship_request.id,
                    'kind': 'friend_request',
                    'action': 'view_request'
                }
            )
            return Response({"message": "Friendship request sent.", "friendship_request_id": friendship_request.id}, status=status.HTTP_200_OK)
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
            from_user = instance.from_user
            to_user = request.user
            # Delete friend request notification when rejected
            from notifications.models import Notification
            Notification.objects.filter(
                type=NotificationTypes.FRIEND_REQUEST_SENT,
                from_user=from_user,
                targets=to_user
            ).delete()
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
            # Delete friend request notification for the user who accepted
            from notifications.models import Notification
            Notification.objects.filter(
                type=NotificationTypes.FRIEND_REQUEST_SENT,
                from_user=from_user,
                targets=to_user
            ).delete()
            send_notification(
                NotificationTypes.FRIEND_REQUEST_ACCEPTED,
                from_user,
                {},
                {'friend_name': to_user.get_full_name()}
            )
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


class ModeViewSet(ModelViewSet):
    """
    ViewSet for managing Modes (Geo-tag, Band, Hunt, Scans, Free Range)
    Provides full CRUD operations for admin management.
    """
    serializer_class = ModeSerializer
    queryset = Mode.objects.all()
    permission_classes = []
    authentication_classes = []
    http_method_names = ['get', 'post', 'put', 'patch']  # Allow full CRUD operations
    
    def get_queryset(self):
        """Return all modes, optionally filter by status"""
        queryset = Mode.objects.all()
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset


class ScanMapViewSet(GenericViewSet, ListModelMixin):
    """
    API endpoint for Scan mode - returns all scans with latitude, longitude and details.
    Used for map display in Scan mode.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = ScanMapSerializer
    http_method_names = ['get']
    queryset = ScanPicture.objects.filter(coordinates__isnull=False).select_related('sponsor', 'parameter_settings')
    
    def get_queryset(self):
        """Return all scans that have coordinates (lat/long)"""
        return self.queryset.all()
    
    @extend_schema(
        operation_id="map_scans_list",
        summary="Get all scans for map view",
        description="Returns all scans with their latitude, longitude coordinates and details for map display in Scan mode. "
                   "Only scans with valid coordinates are returned.",
        tags=["Map"],
        responses={
            200: ScanMapSerializer(many=True),
            401: {"description": "Authentication credentials were not provided."},
        },
        examples=[
            OpenApiExample(
                "Example Response",
                value=[
                    {
                        "id": 1,
                        "name": "Scan Name",
                        "screen_title": "Screen Title",
                        "latitude": 36.9075,
                        "longitude": -76.3077,
                        "points": 100,
                        "attempts": 3,
                        "cooldown_hours": 24,
                        "elevation": 10,
                        "info": "Scan information",
                        "sponsor": None,
                        "parameters": None
                    }
                ],
                response_only=True
            )
        ]
    )
    def list(self, request, *args, **kwargs):
        """List all scans with coordinates for map view"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class HuntMapViewSet(GenericViewSet, ListModelMixin):
    """
    API endpoint for Hunt mode - returns all hunts with latitude, longitude, star points and details.
    Used for map display in Hunt mode.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = HuntMapSerializer
    http_method_names = ['get']
    queryset = GeoARStar.objects.filter(
        geo_site__lat_long__isnull=False
    ).select_related('geo_site', 'parameter_settings').prefetch_related('stars', 'sponsors')
    
    def get_queryset(self):
        """Return all hunts that have a geo_site with coordinates (lat/long)"""
        return self.queryset.all()
    
    @extend_schema(
        operation_id="map_hunts_list",
        summary="Get all hunts for map view",
        description="Returns all hunts with their latitude, longitude coordinates, star points and details for map display in Hunt mode. "
                   "Each hunt includes all associated star points with their own coordinates. "
                   "Only hunts with valid geo_site coordinates are returned.",
        tags=["Map"],
        responses={
            200: HuntMapSerializer(many=True),
            401: {"description": "Authentication credentials were not provided."},
        },
        examples=[
            OpenApiExample(
                "Example Response",
                value=[
                    {
                        "id": 1,
                        "name": "Hunt Name",
                        "latitude": 36.9075,
                        "longitude": -76.3077,
                        "fun_facts": "Fun facts about the hunt",
                        "info": "Hunt information",
                        "visibility_radius": 50,
                        "following_mode": "PROXIMITY",
                        "attempts": 1,
                        "cooldown_hours": 24,
                        "sponsor": [],
                        "parameters": None,
                        "star_points": [
                            {
                                "id": 1,
                                "title": "Star Point 1",
                                "screen_title": "Screen Title",
                                "latitude": 36.9076,
                                "longitude": -76.3078,
                                "order": 1,
                                "points": 50,
                                "elevation": 10,
                                "fun_facts": "Star point fun facts"
                            }
                        ]
                    }
                ],
                response_only=True
            )
        ]
    )
    def list(self, request, *args, **kwargs):
        """List all hunts with coordinates and star points for map view"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
