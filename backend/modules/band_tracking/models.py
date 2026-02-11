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


class VehicleWhitelist(models.Model):
    """
    Whitelist of vehicle IDs that are allowed to send GPS updates.
    Admin-configurable to avoid hardcoding vehicle IDs in code.
    """
    vehicle_id = models.CharField(
        _("Vehicle ID"),
        max_length=50,
        unique=True,
        help_text="Unique identifier from third-party GPS provider (e.g., LT01)"
    )
    band = models.ForeignKey(
        GeoArSite,
        on_delete=models.CASCADE,
        related_name='vehicles',
        help_text="The band this vehicle is tracking"
    )
    is_active = models.BooleanField(
        _("Active"),
        default=True,
        help_text="Enable/disable this vehicle without deleting"
    )
    description = models.CharField(
        _("Description"),
        max_length=200,
        blank=True,
        help_text="Optional description (e.g., 'Lost Tribe Truck 1 - Main Stage')"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['vehicle_id']
        verbose_name = _("Vehicle Whitelist")
        verbose_name_plural = _("Vehicle Whitelists")
        indexes = [
            models.Index(fields=['vehicle_id', 'is_active']),
            models.Index(fields=['band']),
        ]

    def __str__(self):
        status = "✓" if self.is_active else "✗"
        return f"{status} {self.vehicle_id} → {self.band.name}"

    def save(self, *args, **kwargs):
        """Validate before saving"""
        # Trim whitespace and convert to uppercase for consistency
        if self.vehicle_id:
            self.vehicle_id = self.vehicle_id.strip().upper()

        # Validate vehicle_id is not empty
        if not self.vehicle_id:
            raise ValueError("Vehicle ID cannot be empty")

        super().save(*args, **kwargs)


class BandTrackingSettings(models.Model):
    """
    Singleton model for band tracking configuration.
    Only one instance exists - settings for the entire system.

    Allows admin to configure:
    - Auto-notification on/off
    - Distance threshold for notifications
    - Cooldown period between notifications
    """
    auto_notify_enabled = models.BooleanField(
        _("Enable Auto-Notifications"),
        default=False,
        help_text="Master switch: automatically send SILENT location updates to all users when bands move significantly. "
                  "Silent updates = no popup, just real-time map updates. Does NOT create broadcast messages."
    )
    distance_threshold_meters = models.IntegerField(
        _("Distance Threshold (meters)"),
        default=111,
        validators=[MinValueValidator(1), MaxValueValidator(10000)],
        help_text="Minimum distance (in meters) band must move to trigger notification. Default: 111m"
    )
    cooldown_minutes = models.IntegerField(
        _("Cooldown Period (minutes)"),
        default=15,
        validators=[MinValueValidator(0), MaxValueValidator(1440)],
        help_text="Minimum time (in minutes) between notifications for the same band. Default: 15 min"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Band Tracking Settings")
        verbose_name_plural = _("Band Tracking Settings")

    def __str__(self):
        status = "ON" if self.auto_notify_enabled else "OFF"
        return f"Band Tracking Settings (Auto-notify: {status}, Threshold: {self.distance_threshold_meters}m)"

    def save(self, *args, **kwargs):
        """Ensure singleton pattern - only one settings instance"""
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """Prevent deletion of settings"""
        pass

    @classmethod
    def get_settings(cls):
        """Get or create the singleton settings instance"""
        obj, created = cls.objects.get_or_create(
            pk=1,
            defaults={
                'auto_notify_enabled': True,
                'distance_threshold_meters': 111,
                'cooldown_minutes': 15
            }
        )
        return obj


class BandNotificationCooldown(models.Model):
    """
    Track last notification time for each band to implement cooldown.
    Prevents notification spam when band moves frequently.
    """
    band = models.OneToOneField(
        GeoArSite,
        on_delete=models.CASCADE,
        related_name='notification_cooldown',
        primary_key=True,
        help_text="The band this cooldown record belongs to"
    )
    last_notification_at = models.DateTimeField(
        _("Last Notification At"),
        help_text="When the last auto-notification was sent for this band"
    )
    last_notification_message = models.ForeignKey(
        BroadcastMessage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cooldown_records',
        help_text="Reference to the last notification message sent"
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Band Notification Cooldown")
        verbose_name_plural = _("Band Notification Cooldowns")

    def __str__(self):
        return f"{self.band.name} - Last notified: {self.last_notification_at.strftime('%Y-%m-%d %H:%M')}"

    def is_in_cooldown(self, cooldown_minutes: int) -> bool:
        """
        Check if band is still in cooldown period.

        Args:
            cooldown_minutes: Cooldown duration in minutes

        Returns:
            True if still in cooldown, False if can send notification
        """
        from django.utils import timezone
        from datetime import timedelta

        if not self.last_notification_at:
            return False

        cooldown_until = self.last_notification_at + timedelta(minutes=cooldown_minutes)
        return timezone.now() < cooldown_until
