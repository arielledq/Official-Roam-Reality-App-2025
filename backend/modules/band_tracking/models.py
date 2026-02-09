"""
Simplified Band Tracking Models.

Edge cases handled:
- Nullable created_by for system-generated messages
- Soft delete via is_deleted flag
- Unique constraint on (message, user) for notification history
- Indexes for performance
- Proper CASCADE behavior
"""
from django.db import models
from django.contrib.gis.db import models as gis_models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User
from modules.ar.challenges.models import GeoArSite


class BroadcastMessage(models.Model):
    """
    Simple broadcast message sent to ALL users.
    No targeting, no scheduling, no priority - just broadcast.
    """
    title = models.CharField(
        _("Title"),
        max_length=255,
        help_text="Message title shown in push notification"
    )
    content = models.TextField(
        _("Content"),
        help_text="Message body"
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='broadcast_messages',
        help_text="Admin who created the message. Null for system-generated messages."
    )
    sent_at = models.DateTimeField(
        _("Sent At"),
        null=True,
        blank=True,
        help_text="When the message was broadcast. Null if not sent yet."
    )
    recipients_count = models.IntegerField(
        _("Recipients Count"),
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Number of users who received this message"
    )
    is_deleted = models.BooleanField(
        _("Deleted"),
        default=False,
        help_text="Soft delete flag"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _("Broadcast Message")
        verbose_name_plural = _("Broadcast Messages")
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['sent_at']),
            models.Index(fields=['is_deleted', '-created_at']),
        ]

    def __str__(self):
        return self.title

    @property
    def is_sent(self):
        """Check if message has been sent"""
        return self.sent_at is not None

    def save(self, *args, **kwargs):
        """Validate before saving"""
        # Ensure title and content are not empty
        if not self.title or not self.title.strip():
            raise ValueError("Title cannot be empty")
        if not self.content or not self.content.strip():
            raise ValueError("Content cannot be empty")

        # Trim whitespace
        self.title = self.title.strip()
        self.content = self.content.strip()

        super().save(*args, **kwargs)


class NotificationHistory(models.Model):
    """
    Track delivery and read status for each user.
    One record per (message, user) pair.
    """
    message = models.ForeignKey(
        BroadcastMessage,
        on_delete=models.CASCADE,  # Delete history when message is deleted
        related_name='notification_histories'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,  # Delete history when user is deleted
        related_name='notification_histories'
    )
    delivered = models.BooleanField(
        _("Delivered"),
        default=False,
        help_text="Whether push notification was successfully delivered"
    )
    read = models.BooleanField(
        _("Read"),
        default=False,
        help_text="Whether user has read the message"
    )
    delivered_at = models.DateTimeField(
        _("Delivered At"),
        null=True,
        blank=True
    )
    read_at = models.DateTimeField(
        _("Read At"),
        null=True,
        blank=True
    )
    notification_id = models.CharField(
        _("Notification ID"),
        max_length=255,
        null=True,
        blank=True,
        help_text="OneSignal notification ID for tracking"
    )
    error_message = models.TextField(
        _("Error Message"),
        null=True,
        blank=True,
        help_text="Error message if delivery failed"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('message', 'user')
        ordering = ['-created_at']
        verbose_name = _("Notification History")
        verbose_name_plural = _("Notification Histories")
        indexes = [
            models.Index(fields=['message', 'user']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['delivered', 'read']),
        ]

    def __str__(self):
        return f"{self.message.title} - {self.user.email}"

    def mark_as_delivered(self, notification_id=None):
        """Mark notification as delivered"""
        from django.utils import timezone
        self.delivered = True
        self.delivered_at = timezone.now()
        if notification_id:
            self.notification_id = notification_id
        self.save(update_fields=['delivered', 'delivered_at', 'notification_id', 'updated_at'])

    def mark_as_read(self):
        """Mark notification as read"""
        from django.utils import timezone
        self.read = True
        self.read_at = timezone.now()
        self.save(update_fields=['read', 'read_at', 'updated_at'])

    def mark_as_failed(self, error_message):
        """Mark delivery as failed"""
        self.delivered = False
        self.error_message = error_message
        self.save(update_fields=['delivered', 'error_message', 'updated_at'])


class BandLocation(models.Model):
    """
    Track GPS location updates from bands.
    Stores both parsed location and raw GPS string.
    """
    band = models.ForeignKey(
        GeoArSite,
        on_delete=models.CASCADE,
        related_name='location_history',
        help_text="The band/site whose location is being tracked"
    )
    location = gis_models.PointField(
        _("Location"),
        help_text="Parsed GPS coordinates (Point with lat/lng)"
    )
    gps_string = models.TextField(
        _("GPS String"),
        help_text="Raw GPS string received from third party"
    )
    accuracy = models.FloatField(
        _("Accuracy"),
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="GPS accuracy in meters (if available)"
    )
    altitude = models.FloatField(
        _("Altitude"),
        null=True,
        blank=True,
        help_text="Altitude in meters (if available)"
    )
    speed = models.FloatField(
        _("Speed"),
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Speed in km/h (if available)"
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        help_text="When this location update was received"
    )

    class Meta:
        ordering = ['-timestamp']
        verbose_name = _("Band Location")
        verbose_name_plural = _("Band Locations")
        indexes = [
            models.Index(fields=['band', '-timestamp']),
            models.Index(fields=['-timestamp']),
        ]

    def __str__(self):
        return f"{self.band.name} - {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"

    @property
    def latitude(self):
        """Get latitude from point"""
        return self.location.y if self.location else None

    @property
    def longitude(self):
        """Get longitude from point"""
        return self.location.x if self.location else None

    def get_distance_from(self, other_location):
        """
        Calculate distance from another location in meters.
        Uses geodesic distance calculation.
        """
        if not self.location or not other_location:
            return None

        # Use GeoDjango's distance calculation
        from django.contrib.gis.measure import Distance
        return self.location.distance(other_location) * Distance(km=111.0).m
