from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.authentication import TokenAuthentication
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .models import RandomizerChallenge, RandomizerTrack
from .serializers import (
    RandomizerChallengeSerializer, RandomizerChallengeCreateSerializer,
    RandomizerTrackSerializer, RandomizerTrackCreateSerializer, RandomizerTrackUpdateSerializer
)
from .permissions import AdminCreateUserViewAndRank
from utils.pagination import GenericPagination


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