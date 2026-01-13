from django.db import models
from django.core.validators import FileExtensionValidator
from django.conf import settings
from django.core.exceptions import ValidationError
from core.utils import get_file_path
import json


def validate_file_size(value):
    """Validate file size - 10MB for images, 50MB for audio"""
    max_size = 10 * 1024 * 1024  # 10MB default

    # Check file extension to determine max size
    if hasattr(value, 'name'):
        file_name = value.name.lower()
        if file_name.endswith(('.mp3', '.wav', '.m4a', '.aac', '.ogg')):
            max_size = 50 * 1024 * 1024  # 50MB for audio files

    if value.size > max_size:
        from django.core.exceptions import ValidationError
        raise ValidationError(f'File size must be under {max_size/(1024*1024):.0f}MB')


def validate_ranking(value):
    """Validate ranking JSON structure"""
    if value is None:
        return

    if not isinstance(value, dict):
        raise ValidationError('Ranking must be a JSON object/dictionary')

    # Validate that all values are numbers (int or float)
    for key, val in value.items():
        if not isinstance(key, str):
            raise ValidationError('Ranking keys must be strings')
        if not isinstance(val, (int, float)):
            raise ValidationError(f'Ranking value for "{key}" must be a number')
        if val < 0:
            raise ValidationError(f'Ranking value for "{key}" cannot be negative')


class RandomizerChallenge(models.Model):
    """Main Randomizer Challenge model"""
    name = models.CharField(
        max_length=255,
        help_text="Name of the randomizer challenge"
    )
    screen_title = models.JSONField(
        blank=True, null=True,
        help_text="Multiple titles to display on the screen (stored as a list)"
    )

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Randomizer Challenge'
        verbose_name_plural = 'Randomizer Challenges'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class RandomizerTrack(models.Model):
    """Individual tracks/items within a Randomizer Challenge (flexible number)"""
    challenge = models.ForeignKey(
        RandomizerChallenge,
        on_delete=models.CASCADE,
        related_name='tracks'
    )

    # Track number (sequential, unique per challenge)
    track_number = models.PositiveIntegerField(
        help_text="Track number (must be unique within challenge)"
    )

    # Content fields
    title = models.CharField(
        max_length=255,
        help_text="Title for this track"
    )
    image = models.ImageField(
        upload_to="randomizer/images/",
        validators=[
            validate_file_size,
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif', 'webp'])
        ]
    )
    audio = models.FileField(
        upload_to="randomizer/audio/",
        validators=[
            validate_file_size,
            FileExtensionValidator(allowed_extensions=['mp3', 'wav', 'm4a', 'aac', 'ogg'])
        ]
    )

    # Ranking for individual tracks
    ranking = models.JSONField(
        default=dict,
        blank=True,
        validators=[validate_ranking],
        help_text="Dynamic ranking object for this track (e.g., {'quality': 8, 'engagement': 6})"
    )

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Randomizer Track'
        verbose_name_plural = 'Randomizer Tracks'
        ordering = ['challenge', 'track_number']
        unique_together = ['challenge', 'track_number']

    def __str__(self):
        return f"{self.challenge.name} - Track {self.track_number}: {self.title or 'Untitled'}"

    @property
    def primary_ranking_score(self):
        """Get the primary ranking score (sum of all ranking values or default to 0)"""
        if not self.ranking:
            return 0
        try:
            return sum(float(v) for v in self.ranking.values() if isinstance(v, (int, float)))
        except (TypeError, ValueError):
            return 0

    @property
    def image_url(self):
        """Return the image URL"""
        if self.image and hasattr(self.image, 'url'):
            return self.image.url
        return None

    @property
    def audio_url(self):
        """Return the audio URL"""
        if self.audio and hasattr(self.audio, 'url'):
            return self.audio.url
        return None

    def save(self, *args, **kwargs):
        # Validate track number is positive
        if self.track_number < 1:
            raise ValidationError('Track number must be positive')

        # Validate maximum 8 tracks per challenge
        if not self.pk:  # New track
            current_track_count = RandomizerTrack.objects.filter(challenge=self.challenge).count()
            if current_track_count >= 8:
                raise ValidationError("A challenge can have a maximum of 8 tracks.")

        # Validate track number uniqueness within challenge
        if self.pk:  # Existing track
            if RandomizerTrack.objects.filter(
                challenge=self.challenge,
                track_number=self.track_number
            ).exclude(pk=self.pk).exists():
                raise ValidationError(f"Track number {self.track_number} already exists for this challenge.")
        else:  # New track
            if RandomizerTrack.objects.filter(
                challenge=self.challenge,
                track_number=self.track_number
            ).exists():
                raise ValidationError(f"Track number {self.track_number} already exists for this challenge.")

        super().save(*args, **kwargs)