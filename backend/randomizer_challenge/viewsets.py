from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.authentication import TokenAuthentication
from rest_framework.parsers import FileUploadParser, FormParser, MultiPartParser
from rest_framework.viewsets import ViewSet
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from drf_spectacular.utils import extend_schema, OpenApiParameter
from django.db.models import F
from django.shortcuts import get_object_or_404

from .models import (
    RandomizerChallenge, RandomizerTrack, ChallengeVideo,
    RandomizerUserProfile, RandomizerSubmission
)
from .serializers import (
    RandomizerChallengeSerializer, RandomizerChallengeCreateSerializer,
    RandomizerTrackSerializer, RandomizerTrackCreateSerializer, RandomizerTrackUpdateSerializer,
    ChallengeVideoSerializer, RandomizerUserProfileSerializer,
    RandomizerSubmissionSerializer, RandomizerSubmissionGetSerializer
)
from .permissions import AdminCreateUserViewAndRank
from utils.pagination import GenericPagination
from .deep_link_utils import (
    generate_challenge_deep_link,
    generate_submission_share_link,
    generate_profile_deep_link,
    generate_invite_link,
    generate_leaderboard_deep_link,
    generate_video_deep_link,
    track_deep_link_click
)

# Social points constant - matching AR challenges
SOCIAL_POINTS = 1


@method_decorator(csrf_exempt, name='dispatch')
class RandomizerChallengeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Randomizer Challenges.

    Permissions:
    - Only admins can create challenges
    - All authenticated users can view challenges
    - Authenticated users can update challenge ranking
    - Only admins can delete challenges

    Features:
    - Create challenges with name and screen title
    - Manage unlimited tracks per challenge (flexible)
    - Dynamic ranking system for challenges and tracks
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [AdminCreateUserViewAndRank]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'sponsor']
    search_fields = ['name', 'screen_title', 'description']
    ordering_fields = ['name', 'created_at', 'points']
    ordering = ['-created_at']
    pagination_class = GenericPagination

    def get_serializer_class(self):
        if self.action == 'create':
            return RandomizerChallengeCreateSerializer
        return RandomizerChallengeSerializer

    def get_queryset(self):
        """Return all challenges (no user filtering needed for challenges)"""
        return RandomizerChallenge.objects.all()

    @extend_schema(
        summary="List randomizer challenges",
        description="Get paginated list of all randomizer challenges"
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create randomizer challenge (Admin Only)",
        description="Create a new randomizer challenge with optional tracks (Admin Only)"
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary="Get challenge details",
        description="Get details of a specific randomizer challenge including all tracks"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update challenge",
        description="Update challenge name, screen title, and ranking"
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete challenge",
        description="Delete a randomizer challenge and all its tracks"
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['get'], url_path='deep-link')
    @extend_schema(
        summary="Get challenge deep link",
        description="Get deep link URLs (web and app) for this challenge"
    )
    def get_deep_link(self, request, pk=None):
        """Get deep link URLs for sharing this challenge"""
        challenge = self.get_object()

        # Track the link generation
        source = request.query_params.get('source', 'direct')
        track_deep_link_click('challenge', challenge.id, source)

        # Generate deep links
        links = generate_challenge_deep_link(
            challenge.id,
            query_params={'ref': source}
        )

        return Response({
            'challenge_id': challenge.id,
            'challenge_name': challenge.name,
            'web_url': links['web_url'],
            'app_url': links['app_url'],
        })

    @action(detail=True, methods=['get'], url_path='invite-link')
    @extend_schema(
        summary="Generate challenge invite link",
        description="Generate an invite link for this challenge to share with friends"
    )
    def get_invite_link(self, request, pk=None):
        """Generate invite link for this challenge"""
        challenge = self.get_object()
        inviter_id = request.user.id

        # Generate invite link
        links = generate_invite_link(challenge.id, inviter_id)

        return Response({
            'challenge_id': challenge.id,
            'challenge_name': challenge.name,
            'inviter_id': inviter_id,
            'web_url': links['web_url'],
            'app_url': links['app_url'],
        })



@method_decorator(csrf_exempt, name='dispatch')
class RandomizerTrackViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing individual tracks within challenges.

    Permissions:
    - Only admins can create tracks
    - All authenticated users can view tracks
    - Authenticated users can update track ranking
    - Only admins can delete tracks

    Features:
    - Create/edit tracks with title, image, audio
    - Flexible number of tracks per challenge
    - Dynamic ranking per track
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [AdminCreateUserViewAndRank]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['challenge', 'track_number']
    search_fields = ['title']
    ordering_fields = ['track_number', 'created_at', 'primary_ranking_score']
    ordering = ['challenge', 'track_number']
    pagination_class = GenericPagination

    def get_serializer_class(self):
        if self.action == 'create':
            return RandomizerTrackCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return RandomizerTrackUpdateSerializer
        return RandomizerTrackSerializer

    def get_queryset(self):
        """Return all tracks"""
        queryset = RandomizerTrack.objects.select_related('challenge')

        # Handle ranking-based ordering
        ordering = self.request.query_params.get('ordering', 'track_number')
        if ordering in ['primary_ranking_score', '-primary_ranking_score']:
            queryset = sorted(
                queryset,
                key=lambda x: x.primary_ranking_score,
                reverse=ordering.startswith('-')
            )
        return queryset

    @extend_schema(
        summary="List tracks",
        description="Get paginated list of all tracks across all challenges"
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create track (Admin Only)",
        description="Create a new track for a specific challenge (Admin Only - flexible number of tracks)"
    )
    def create(self, request, *args, **kwargs):
        # Validation is now handled in the serializer
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary="Get track details",
        description="Get details of a specific track"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update track",
        description="Update track title, image, audio, and ranking"
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete track",
        description="Delete a specific track"
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'], url_path='by-challenge/(?P<challenge_id>[^/.]+)')
    @extend_schema(
        summary="Get tracks by challenge",
        description="Get all tracks for a specific challenge",
        parameters=[
            OpenApiParameter(
                name='challenge_id',
                type=int,
                location=OpenApiParameter.PATH,
                description='Challenge ID'
            )
        ]
    )
    def tracks_by_challenge(self, request, challenge_id=None):
        """Get all tracks for a specific challenge"""
        try:
            challenge = RandomizerChallenge.objects.get(id=challenge_id)
            tracks = self.get_queryset().filter(challenge=challenge)
            serializer = self.get_serializer(tracks, many=True)
            return Response(serializer.data)
        except RandomizerChallenge.DoesNotExist:
            return Response(
                {"error": "Challenge not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'], url_path='update-ranking')
    @extend_schema(
        summary="Update track ranking",
        description="Update the ranking object for a specific track",
        request={
            'type': 'object',
            'properties': {
                'ranking': {
                    'type': 'object',
                    'description': 'Complete ranking object (e.g., {"quality": 8, "engagement": 6})'
                },
                'ranking_key': {
                    'type': 'string',
                    'description': 'Specific ranking key to update'
                },
                'ranking_value': {
                    'type': 'number',
                    'description': 'Value for specific ranking key'
                }
            }
        }
    )
    def update_ranking(self, request, pk=None):
        """Update ranking for a track"""
        track = self.get_object()
        ranking_data = request.data.get('ranking')
        ranking_key = request.data.get('ranking_key')
        ranking_value = request.data.get('ranking_value')

        try:
            if ranking_data is not None:
                from .models import validate_ranking
                validate_ranking(ranking_data)
                track.ranking = ranking_data
            elif ranking_key and ranking_value is not None:
                if not isinstance(track.ranking, dict):
                    track.ranking = {}
                track.ranking[ranking_key] = float(ranking_value)

            track.save()
            serializer = self.get_serializer(track)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class ChallengeVideoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Challenge Videos.

    Permissions:
    - Only admins can create/update/delete videos
    - All authenticated users can view videos

    Features:
    - Upload videos that play after challenge completion
    - Get video URL for streaming
    - Optional link to specific challenges
    - Get active videos only
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [AdminCreateUserViewAndRank]
    serializer_class = ChallengeVideoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'challenge']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']
    pagination_class = GenericPagination

    def get_queryset(self):
        """Return all videos or filter by active status"""
        queryset = ChallengeVideo.objects.select_related('challenge')

        # Optionally filter by active status (default: show all)
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        return queryset

    @extend_schema(
        summary="List challenge videos",
        description="Get paginated list of all challenge videos. Use ?is_active=true to get only active videos."
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create challenge video (Admin Only)",
        description="Upload a new video for challenge completion (Admin Only)"
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary="Get video details",
        description="Get details of a specific video including the video URL"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update video (Admin Only)",
        description="Update video details or replace the video file (Admin Only)"
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete video (Admin Only)",
        description="Delete a challenge video (Admin Only)"
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'], url_path='active')
    @extend_schema(
        summary="Get active videos",
        description="Get all active challenge videos"
    )
    def active_videos(self, request):
        """Get all active videos"""
        videos = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(videos, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-challenge/(?P<challenge_id>[^/.]+)')
    @extend_schema(
        summary="Get videos by challenge",
        description="Get all videos linked to a specific challenge",
        parameters=[
            OpenApiParameter(
                name='challenge_id',
                type=int,
                location=OpenApiParameter.PATH,
                description='Challenge ID'
            )
        ]
    )
    def videos_by_challenge(self, request, challenge_id=None):
        """Get all videos for a specific challenge"""
        try:
            challenge = RandomizerChallenge.objects.get(id=challenge_id)
            videos = self.get_queryset().filter(challenge=challenge, is_active=True)
            serializer = self.get_serializer(videos, many=True)
            return Response(serializer.data)
        except RandomizerChallenge.DoesNotExist:
            return Response(
                {"error": "Challenge not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'], url_path='deep-link')
    @extend_schema(
        summary="Get video deep link",
        description="Get deep link URLs for this video"
    )
    def get_deep_link(self, request, pk=None):
        """Get deep link URLs for sharing this video"""
        video = self.get_object()

        # Generate deep links
        links = generate_video_deep_link(video.id)

        # Track the link generation
        source = request.query_params.get('source', 'direct')
        track_deep_link_click('video', video.id, source)

        return Response({
            'video_id': video.id,
            'video_name': video.name,
            'challenge_id': video.challenge.id if video.challenge else None,
            'web_url': links['web_url'],
            'app_url': links['app_url'],
        })


@method_decorator(csrf_exempt, name='dispatch')
class RandomizerSubmissionViewSet(ViewSet):
    """
    ViewSet for managing Randomizer challenge submissions.
    Similar to ARMemoriesViewSet for AR challenges.

    Endpoints:
    - POST /randomizer-submissions/ - Create submission (END button)
    - GET /randomizer-submissions/ - List user's submissions
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = RandomizerSubmission.objects.all()
    serializer_class = RandomizerSubmissionSerializer
    parser_classes = (MultiPartParser, FormParser, FileUploadParser)

    @extend_schema(
        summary="List user's randomizer submissions",
        description="Get all submissions for the authenticated user"
    )
    def list(self, request, *args, **kwargs):
        """Get all submissions for the authenticated user"""
        submissions = self.queryset.filter(user=request.user.id)
        serializer = RandomizerSubmissionGetSerializer(submissions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Get public submissions for a user",
        description="Get public submissions for any user by user_id"
    )
    @action(detail=False, methods=['get'], url_path='public', name='Public Submissions')
    def public(self, request, *args, **kwargs):
        """Get public submissions for a specific user"""
        user_id = request.GET.get("user_id")
        if not user_id:
            return Response(
                {'error': 'user_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        submissions = self.queryset.filter(
            user=user_id,
            privacy='public'
        )
        serializer = RandomizerSubmissionGetSerializer(submissions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Create randomizer submission (END button)",
        description="Submit a completed randomizer challenge. Similar to POST /modules/challenges/memories/"
    )
    def create(self, request, *args, **kwargs):
        """
        Create a new randomizer submission.
        This is called when user clicks END button.
        Awards points based on challenge.points
        """
        try:
            user_id = request.user.id
            challenge_id = request.data.get("challenge")

            if not challenge_id:
                return Response(
                    {'message': 'Challenge ID is required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get challenge
            try:
                challenge = RandomizerChallenge.objects.get(pk=challenge_id, is_active=True)
            except RandomizerChallenge.DoesNotExist:
                return Response(
                    {'message': f'Challenge with ID {challenge_id} does not exist or is inactive.'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Prepare submission data
            from django.http import QueryDict
            data = QueryDict(mutable=True)

            # Copy non-file fields
            file_keys = set()
            if hasattr(request, 'FILES'):
                file_keys = set(request.FILES.keys())

            for key in request.data:
                if key not in file_keys:
                    if isinstance(request.data, QueryDict):
                        values = request.data.getlist(key)
                        if len(values) == 1:
                            data[key] = values[0]
                        else:
                            data.setlist(key, values)
                    else:
                        data[key] = request.data[key]

            # Add files
            if hasattr(request, 'FILES') and request.FILES:
                for key in request.FILES:
                    data[key] = request.FILES[key]

            # Add computed fields
            data['user'] = user_id
            data['submission_type'] = 'COMPLETION'
            data['points'] = challenge.points
            data['challenge'] = challenge.id

            # Add sponsor if challenge has one
            if challenge.sponsor:
                data['sponsor'] = challenge.sponsor.id

            # Create submission
            serializer = RandomizerSubmissionSerializer(data=data, partial=True)
            if serializer.is_valid(raise_exception=True):
                submission = serializer.save()

                # Update user profile
                profile, created = RandomizerUserProfile.objects.get_or_create(user=request.user)
                profile.points = F('points') + challenge.points
                profile.challenges_completed = F('challenges_completed') + 1
                profile.save()

                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {'message': f'There was an error submitting your challenge: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Update submission",
        description="Update an existing submission (approval status, etc.)"
    )
    def partial_update(self, request, *args, **kwargs):
        """Update an existing submission"""
        instance = self.queryset.get(pk=kwargs.get('pk'))
        serializer = self.serializer_class(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='share-link', name='Get Share Link')
    @extend_schema(
        summary="Get submission share link",
        description="Get shareable deep link URLs for this submission"
    )
    def get_share_link(self, request, pk=None):
        """Get shareable link for this submission"""
        try:
            submission = self.queryset.get(pk=pk)

            # Check if user has permission to share this submission
            if submission.privacy == 'private' and submission.user != request.user:
                return Response(
                    {'error': 'This submission is private and cannot be shared'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Track the share
            source = request.query_params.get('source', 'app')
            track_deep_link_click('submission_share', submission.id, source)

            # Generate share links
            links = generate_submission_share_link(
                submission.id,
                query_params={'utm_campaign': f'challenge_{submission.challenge.id}'}
            )

            return Response({
                'submission_id': submission.id,
                'challenge_id': submission.challenge.id if submission.challenge else None,
                'challenge_name': submission.challenge.name if submission.challenge else None,
                'web_url': links['web_url'],
                'app_url': links['app_url'],
            })

        except RandomizerSubmission.DoesNotExist:
            return Response(
                {'error': 'Submission not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'], url_path='view-shared', name='View Shared Submission')
    @extend_schema(
        summary="View shared submission (public access)",
        description="View a submission via deep link (only if public)"
    )
    def view_shared(self, request, pk=None):
        """View a submission that was shared via deep link"""
        try:
            submission = self.queryset.get(pk=pk, privacy='public')

            # Track the view
            source = request.query_params.get('utm_source', 'unknown')
            track_deep_link_click('submission_view', submission.id, source)

            serializer = RandomizerSubmissionGetSerializer(submission)
            return Response(serializer.data)

        except RandomizerSubmission.DoesNotExist:
            return Response(
                {'error': 'Submission not found or is private'},
                status=status.HTTP_404_NOT_FOUND
            )


@method_decorator(csrf_exempt, name='dispatch')
class RandomizerProfileViewSet(ViewSet):
    """
    ViewSet for managing Randomizer user profiles and points.
    Similar to ARProfileViewSet for AR challenges.

    Endpoints:
    - GET /randomizer-profile/ - Get user's profile
    - POST /randomizer-profile/update-user-point/ - Update points
    - POST /randomizer-profile/update-social-points/ - Social sharing points (SHARE button)
    - POST /randomizer-profile/get-rank/ - Get user's ranking
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = RandomizerUserProfile.objects.all()
    serializer_class = RandomizerUserProfileSerializer

    @extend_schema(
        summary="Get user's randomizer profile",
        description="Get the authenticated user's randomizer profile"
    )
    def list(self, request):
        """Get user's profile"""
        profile, created = RandomizerUserProfile.objects.get_or_create(user=request.user)
        serializer = RandomizerUserProfileSerializer(profile)
        return Response(serializer.data)

    @extend_schema(
        summary="Get public profile",
        description="Get any user's public profile by user_id"
    )
    @action(detail=False, methods=['get'], url_path='public', name='Public Profile')
    def public(self, request):
        """Get public profile for any user"""
        user_id = request.GET.get("user_id")
        if not user_id:
            return Response(
                {'error': 'user_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile, created = RandomizerUserProfile.objects.get_or_create(user_id=user_id)
        serializer = RandomizerUserProfileSerializer(profile)
        return Response(serializer.data)

    @extend_schema(
        summary="Update user points",
        description="Manually update user's points. Similar to POST /modules/challenges/ar-profile/update-user-point/"
    )
    @action(detail=False, methods=['post'], url_path='update-user-point', name='Update Points')
    def update_user_points(self, request):
        """Update user points manually"""
        points = request.data.get("points", 0)
        profile, created = RandomizerUserProfile.objects.get_or_create(user=request.user)
        profile.points = F('points') + points
        profile.save()
        return Response({'message': "Points are updated!"}, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Update social sharing points (SHARE button)",
        description="Award points for social sharing. Similar to POST /modules/challenges/ar-profile/update-ar-social-points/"
    )
    @action(detail=False, methods=['post'], url_path='update-social-points', name='Social Points')
    def update_social_points(self, request):
        """
        Award social sharing points when user clicks SHARE button.
        Creates a submission with type='SOCIAL_POINTS' and awards 1 point.
        """
        data = request.data
        challenge_id = data.get("challenge")
        sponsor_id = data.get("sponsor")

        if not challenge_id:
            return Response(
                {'error': "challenge is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            challenge = get_object_or_404(RandomizerChallenge, pk=challenge_id)
            sponsor = get_object_or_404(Sponsor, pk=sponsor_id) if sponsor_id else None

            # Create social points submission
            RandomizerSubmission.objects.create(
                user=request.user,
                submission_type='SOCIAL_POINTS',
                challenge=challenge,
                sponsor=sponsor,
                points=SOCIAL_POINTS,
            )

            # Update user profile
            profile, created = RandomizerUserProfile.objects.get_or_create(user=request.user)
            profile.points = F('points') + SOCIAL_POINTS
            profile.save()

            return Response(
                {'message': "Social sharing points have been updated successfully!"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Get user's ranking",
        description="Get user's rank and points in the leaderboard"
    )
    @action(detail=False, methods=['post'], url_path='get-rank', name='Get Rank')
    def get_rank(self, request, *args, **kwargs):
        """Get user's ranking in leaderboard"""
        from django.db.models import Window
        from django.db.models.functions import Rank

        user_id = request.data.get("user_id")
        user = request.user

        qs = RandomizerUserProfile.objects.all().annotate(
            rank=Window(
                expression=Rank(),
                order_by=F('points').desc(),
            )
        )

        for item in qs:
            if item.user.id == user_id:
                user_profile = user.randomizer_profile
                user_points = user_profile.points if user_profile.points is not None else 0
                return Response(
                    {"rank": item.rank, "points": user_points},
                    status=status.HTTP_200_OK
                )

        return Response({"rank": 0, "points": 0}, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Update profile",
        description="Update user profile details"
    )
    def partial_update(self, request, *args, **kwargs):
        """Update user profile"""
        instance = self.queryset.get(pk=kwargs.get('pk'))
        serializer = self.serializer_class(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='my-profile-link', name='My Profile Link')
    @extend_schema(
        summary="Get my profile deep link",
        description="Get deep link URLs for sharing your profile"
    )
    def get_my_profile_link(self, request):
        """Get shareable link for user's own profile"""
        user_id = request.user.id

        # Generate profile links
        links = generate_profile_deep_link(user_id)

        # Track the link generation
        track_deep_link_click('profile_share', user_id, 'self')

        return Response({
            'user_id': user_id,
            'web_url': links['web_url'],
            'app_url': links['app_url'],
        })

    @action(detail=False, methods=['get'], url_path='leaderboard-link', name='Leaderboard Link')
    @extend_schema(
        summary="Get leaderboard deep link",
        description="Get deep link URLs for the leaderboard"
    )
    def get_leaderboard_link(self, request):
        """Get shareable link for the leaderboard"""
        # Get optional filter parameters
        period = request.query_params.get('period', 'all')

        # Generate leaderboard links
        links = generate_leaderboard_deep_link(
            query_params={'period': period} if period != 'all' else None
        )

        return Response({
            'web_url': links['web_url'],
            'app_url': links['app_url'],
            'period': period,
        })

    @action(detail=False, methods=['get'], url_path='leaderboard', name='Leaderboard')
    @extend_schema(
        summary="Get leaderboard data",
        description="Get ranked list of users for the leaderboard"
    )
    def leaderboard(self, request):
        """Get leaderboard with ranked users"""
        from django.db.models import Window
        from django.db.models.functions import Rank

        # Get top users with ranking
        limit = int(request.query_params.get('limit', 100))

        qs = RandomizerUserProfile.objects.select_related('user').annotate(
            rank=Window(
                expression=Rank(),
                order_by=F('points').desc(),
            )
        ).order_by('rank')[:limit]

        # Format the response
        leaderboard_data = []
        for profile in qs:
            leaderboard_data.append({
                'rank': profile.rank,
                'user_id': profile.user.id,
                'user_name': profile.user.name,
                'points': profile.points if profile.points else 0,
                'challenges_completed': profile.challenges_completed,
            })

        return Response({
            'leaderboard': leaderboard_data,
            'total_users': RandomizerUserProfile.objects.count(),
        })