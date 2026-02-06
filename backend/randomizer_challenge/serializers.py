from rest_framework import serializers
from django.conf import settings

from .models import (
    RandomizerChallenge, RandomizerTrack, ChallengeVideo,
    RandomizerUserProfile, RandomizerSubmission,
    validate_ranking
)
from modules.ar.challenges.serializers import SponsorSerializer


class RandomizerTrackSerializer(serializers.ModelSerializer):
    """Serializer for RandomizerTrack model"""
    image_url = serializers.SerializerMethodField()
    audio_url = serializers.SerializerMethodField()

    class Meta:
        model = RandomizerTrack
        fields = [
            'id', 'challenge', 'track_number', 'title', 'image', 'image_url',
            'audio', 'audio_url', 'ranking', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'challenge', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        """Return the image URL with fresh presigned URL generation"""
        if not obj.image:
            return None

        # Use the file's own storage backend to generate URL
        # This ensures the correct AWS_MEDIA_LOCATION (media/) is included
        try:
            return obj.image.url
        except Exception as e:
            return None

    def get_audio_url(self, obj):
        """Return the audio URL with fresh presigned URL generation"""
        if not obj.audio:
            return None

        # Use the file's own storage backend to generate URL
        # This ensures the correct AWS_MEDIA_LOCATION (media/) is included
        try:
            return obj.audio.url
        except Exception as e:
            return None

    def validate_track_number(self, value):
        """Validate track number is positive"""
        if value < 1:
            raise serializers.ValidationError('Track number must be positive')
        return value

    def validate_challenge(self, value):
        """Validate that the challenge exists"""
        if not value:
            raise serializers.ValidationError('Challenge is required')
        if not hasattr(value, 'id'):
            raise serializers.ValidationError('Invalid challenge')
        return value

    def validate(self, data):
        """Validate track number uniqueness within challenge"""
        challenge = data.get('challenge')
        track_number = data.get('track_number')

        if challenge and track_number:
            # Check if we're updating (instance exists) or creating (no instance)
            instance = getattr(self, 'instance', None)
            if instance:
                # Updating - exclude current instance
                exists = RandomizerTrack.objects.filter(
                    challenge=challenge,
                    track_number=track_number
                ).exclude(id=instance.id).exists()
            else:
                # Creating - check all records
                exists = RandomizerTrack.objects.filter(
                    challenge=challenge,
                    track_number=track_number
                ).exists()

            if exists:
                raise serializers.ValidationError(
                    f'Track number {track_number} already exists for this challenge'
                )

        return data

    def validate_ranking(self, value):
        """Validate ranking JSON field (optional)"""
        if value is not None:
            validate_ranking(value)
        return value


class RandomizerChallengeSerializer(serializers.ModelSerializer):
    """Serializer for RandomizerChallenge model"""
    tracks = RandomizerTrackSerializer(many=True, read_only=True)
    tracks_count = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    sponsor = SponsorSerializer(read_only=True)

    class Meta:
        model = RandomizerChallenge
        fields = [
            'id', 'name', 'screen_title', 'thumbnail', 'thumbnail_url',
            'points', 'sponsor', 'is_active', 'description',
            'tracks', 'tracks_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'tracks', 'tracks_count', 'created_at', 'updated_at']

    def get_tracks_count(self, obj):
        """Return the number of tracks for this challenge"""
        return obj.tracks.count()

    def get_thumbnail_url(self, obj):
        """Return the thumbnail URL with fresh presigned URL generation"""
        if not obj.thumbnail:
            return None

        # Use the file's own storage backend to generate URL
        # This ensures the correct AWS_MEDIA_LOCATION (media/) is included
        try:
            return obj.thumbnail.url
        except Exception as e:
            return None


class RandomizerTrackCreateSerializer(RandomizerTrackSerializer):
    """Serializer for creating individual tracks"""

    class Meta(RandomizerTrackSerializer.Meta):
        fields = RandomizerTrackSerializer.Meta.fields
        read_only_fields = ['id', 'created_at', 'updated_at']  # Remove 'challenge' from read-only

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make title, image, audio required for creation
        self.fields['title'].required = True
        self.fields['image'].required = True
        self.fields['audio'].required = True


class RandomizerTrackUpdateSerializer(RandomizerTrackSerializer):
    """Serializer for updating tracks"""
    title = serializers.CharField(required=False)
    image = serializers.ImageField(required=False)
    audio = serializers.FileField(required=False)

    class Meta(RandomizerTrackSerializer.Meta):
        fields = RandomizerTrackSerializer.Meta.fields


class RandomizerChallengeCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating RandomizerChallenge with tracks"""
    tracks = RandomizerTrackCreateSerializer(many=True, required=False)

    class Meta:
        model = RandomizerChallenge
        fields = [
            'id', 'name', 'screen_title', 'thumbnail', 'points',
            'sponsor', 'is_active', 'description', 'tracks'
        ]

    def create(self, validated_data):
        tracks_data = validated_data.pop('tracks', [])
        challenge = RandomizerChallenge.objects.create(**validated_data)

        # Create tracks if provided
        for track_data in tracks_data:
            RandomizerTrack.objects.create(challenge=challenge, **track_data)

        return challenge

    def validate_tracks(self, value):
        """Validate tracks data"""
        # Maximum 8 tracks per challenge
        if len(value) > 8:
            raise serializers.ValidationError("A challenge can have a maximum of 8 tracks.")
        return value


class ChallengeVideoSerializer(serializers.ModelSerializer):
    """Serializer for ChallengeVideo model"""
    video_url = serializers.SerializerMethodField()
    challenge_name = serializers.CharField(source='challenge.name', read_only=True, allow_null=True)

    class Meta:
        model = ChallengeVideo
        fields = [
            'id', 'name', 'video', 'video_url', 'description',
            'is_active', 'challenge', 'challenge_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_video_url(self, obj):
        """Return the video URL with fresh presigned URL generation"""
        if not obj.video:
            return None

        # Use the file's own storage backend to generate URL
        # This ensures the correct AWS_MEDIA_LOCATION (media/) is included
        try:
            return obj.video.url
        except Exception as e:
            return None


class RandomizerUserProfileSerializer(serializers.Serializer):
    """
    DEPRECATED: This serializer now proxies to ARUserProfile for backward compatibility.
    RandomizerUserProfile model has been deprecated - all data is now in ARUserProfile.
    New code should use ARUserProfileSerializer directly from modules.ar.challenges.serializers.

    This serializer is kept to maintain API backward compatibility.
    """
    id = serializers.IntegerField(read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    points = serializers.IntegerField(read_only=True)
    challenges_completed = serializers.IntegerField(
        source='randomizer_challenge_completed',
        read_only=True
    )
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def to_representation(self, instance):
        """Convert ARUserProfile instance to expected RandomizerUserProfile format"""
        from modules.ar.challenges.models import ARUserProfile

        # If instance is ARUserProfile, map fields correctly
        if isinstance(instance, ARUserProfile):
            return {
                'id': instance.id,
                'user_id': instance.user.id,
                'user_name': instance.user.name,
                'points': instance.points,
                'challenges_completed': instance.randomizer_challenge_completed,
                'created_at': instance.created_at,
                'updated_at': instance.updated_at,
            }

        # Fallback for legacy RandomizerUserProfile (shouldn't happen)
        return super().to_representation(instance)


class RandomizerSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for creating RandomizerSubmission - similar to ARMemoriesSerializer"""
    result_file_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    challenge_details = RandomizerChallengeSerializer(source='challenge', read_only=True)
    sponsor_details = SponsorSerializer(source='sponsor', read_only=True)

    class Meta:
        model = RandomizerSubmission
        fields = [
            'id', 'user', 'challenge', 'challenge_details',
            'sponsor', 'sponsor_details', 'submission_type',
            'result_file', 'result_file_url', 'thumbnail', 'thumbnail_url',
            'description', 'completion_data', 'points',
            'approval_status', 'declined_reason', 'privacy',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_result_file_url(self, obj):
        """Return the result file URL with fresh presigned URL generation"""
        if not obj.result_file:
            return None
        try:
            return obj.result_file.url
        except Exception as e:
            return None

    def get_thumbnail_url(self, obj):
        """Return the thumbnail URL with fresh presigned URL generation"""
        if not obj.thumbnail:
            return None
        try:
            return obj.thumbnail.url
        except Exception as e:
            return None


class RandomizerSubmissionGetSerializer(RandomizerSubmissionSerializer):
    """Serializer for retrieving submissions with full details"""
    pass
