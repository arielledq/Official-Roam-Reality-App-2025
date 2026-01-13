from rest_framework import serializers
from .models import RandomizerChallenge, RandomizerTrack, validate_ranking


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
        """Return the image URL"""
        return obj.image_url

    def get_audio_url(self, obj):
        """Return the audio URL"""
        return obj.audio_url

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

    class Meta:
        model = RandomizerChallenge
        fields = [
            'id', 'name', 'screen_title', 'tracks', 'tracks_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'tracks', 'tracks_count', 'created_at', 'updated_at']

    def get_tracks_count(self, obj):
        """Return the number of tracks for this challenge"""
        return obj.tracks.count()


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
        fields = ['id', 'name', 'screen_title', 'tracks']

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
