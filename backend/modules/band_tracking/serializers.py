"""
Serializers for Band Tracking API with comprehensive validation.
"""
from rest_framework import serializers
from django.utils import timezone
from .models import BroadcastMessage, NotificationHistory, BandLocation
from users.models import User
from modules.ar.challenges.models import GeoArSite


class UserSimpleSerializer(serializers.ModelSerializer):
    """Simplified user info"""
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'first_name', 'last_name']
        read_only_fields = fields


class GeoArSiteSimpleSerializer(serializers.ModelSerializer):
    """Simplified band/site info"""
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()

    class Meta:
        model = GeoArSite
        fields = ['id', 'name', 'latitude', 'longitude']
        read_only_fields = fields

    def get_latitude(self, obj):
        """Extract latitude from Point field"""
        return obj.lat_long.y if obj.lat_long else None

    def get_longitude(self, obj):
        """Extract longitude from Point field"""
        return obj.lat_long.x if obj.lat_long else None


class BroadcastMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for broadcast messages.
    Handles both creation and retrieval.
    """
    created_by = UserSimpleSerializer(read_only=True)
    is_sent = serializers.BooleanField(read_only=True)
    delivery_stats = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = BroadcastMessage
        fields = [
            'id',
            'title',
            'content',
            'created_by',
            'sent_at',
            'recipients_count',
            'is_sent',
            'is_deleted',
            'delivery_stats',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'sent_at',
            'recipients_count',
            'is_sent',
            'is_deleted',
            'created_at',
            'updated_at'
        ]

    def get_delivery_stats(self, obj):
        """Calculate delivery statistics"""
        if not obj.is_sent:
            return None

        total = obj.notification_histories.count()
        delivered = obj.notification_histories.filter(delivered=True).count()
        read = obj.notification_histories.filter(read=True).count()

        return {
            'total_recipients': total,
            'delivered': delivered,
            'read': read,
            'delivery_rate': round((delivered / total * 100) if total > 0 else 0, 2),
            'read_rate': round((read / total * 100) if total > 0 else 0, 2)
        }

    def validate_title(self, value):
        """Validate title is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty")
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters")
        if len(value) > 255:
            raise serializers.ValidationError("Title cannot exceed 255 characters")
        return value.strip()

    def validate_content(self, value):
        """Validate content is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Content cannot be empty")
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Content must be at least 10 characters")
        if len(value) > 5000:
            raise serializers.ValidationError("Content cannot exceed 5000 characters")
        return value.strip()


class BroadcastMessageCreateSerializer(serializers.Serializer):
    """
    Serializer for creating and optionally sending a broadcast message.
    """
    title = serializers.CharField(
        max_length=255,
        required=True,
        help_text="Message title"
    )
    content = serializers.CharField(
        required=True,
        help_text="Message content"
    )
    send_immediately = serializers.BooleanField(
        default=False,
        help_text="Send broadcast immediately after creation"
    )

    def validate_title(self, value):
        """Validate title"""
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty")
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters")
        return value.strip()

    def validate_content(self, value):
        """Validate content"""
        if not value or not value.strip():
            raise serializers.ValidationError("Content cannot be empty")
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Content must be at least 10 characters")
        return value.strip()


class NotificationHistorySerializer(serializers.ModelSerializer):
    """
    Serializer for notification history.
    Shows delivery and read status for each user.
    """
    message_title = serializers.CharField(source='message.title', read_only=True)
    message_content = serializers.CharField(source='message.content', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)

    class Meta:
        model = NotificationHistory
        fields = [
            'id',
            'message',
            'message_title',
            'message_content',
            'user',
            'user_email',
            'user_name',
            'delivered',
            'read',
            'delivered_at',
            'read_at',
            'notification_id',
            'error_message',
            'created_at',
            'updated_at'
        ]
        read_only_fields = fields


class NotificationHistoryListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing user's notification history.
    """
    message_title = serializers.CharField(source='message.title', read_only=True)
    message_content = serializers.CharField(source='message.content', read_only=True)

    class Meta:
        model = NotificationHistory
        fields = [
            'id',
            'message_title',
            'message_content',
            'delivered',
            'read',
            'delivered_at',
            'read_at',
            'created_at'
        ]
        read_only_fields = fields


class BandLocationSerializer(serializers.ModelSerializer):
    """
    Serializer for band location history.
    """
    band = GeoArSiteSimpleSerializer(read_only=True)
    latitude = serializers.FloatField(source='location.y', read_only=True)
    longitude = serializers.FloatField(source='location.x', read_only=True)

    class Meta:
        model = BandLocation
        fields = [
            'id',
            'band',
            'latitude',
            'longitude',
            'gps_string',
            'accuracy',
            'altitude',
            'speed',
            'timestamp'
        ]
        read_only_fields = fields


class BandLocationUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating band location via API.
    Used by third-party bands to send GPS updates.
    """
    band_id = serializers.IntegerField(
        required=False,
        help_text="Band ID (optional if authenticated as band user)"
    )
    gps_string = serializers.CharField(
        required=True,
        max_length=1000,
        help_text="GPS string in format: 'lat,lng' or NMEA format"
    )
    auto_notify = serializers.BooleanField(
        default=True,
        help_text="Send push notification if band moved significantly"
    )

    def validate_band_id(self, value):
        """Validate band exists"""
        if value is not None:
            try:
                GeoArSite.objects.get(id=value)
            except GeoArSite.DoesNotExist:
                raise serializers.ValidationError(f"Band with ID {value} does not exist")
        return value

    def validate_gps_string(self, value):
        """Basic validation of GPS string"""
        if not value or not value.strip():
            raise serializers.ValidationError("GPS string cannot be empty")

        # Basic format check
        value = value.strip()

        # Check if it's simple format (lat,lng)
        if ',' in value and not value.startswith('$'):
            parts = value.split(',')
            if len(parts) < 2:
                raise serializers.ValidationError(
                    "Simple GPS format must be: 'latitude,longitude'"
                )

        # Check if it's NMEA format
        elif value.startswith('$GP'):
            if len(value) < 20:
                raise serializers.ValidationError("NMEA GPS string appears incomplete")

        else:
            raise serializers.ValidationError(
                "GPS string must be in format 'lat,lng' or NMEA format starting with '$GP'"
            )

        return value


class MessageStatsSerializer(serializers.Serializer):
    """
    Serializer for message statistics.
    """
    total_recipients = serializers.IntegerField()
    delivered = serializers.IntegerField()
    read = serializers.IntegerField()
    failed = serializers.IntegerField()
    delivery_rate = serializers.FloatField()
    read_rate = serializers.FloatField()
    sent_at = serializers.DateTimeField()


class BandLocationStatsSerializer(serializers.Serializer):
    """
    Serializer for band location statistics.
    """
    band_id = serializers.IntegerField()
    band_name = serializers.CharField()
    total_updates = serializers.IntegerField()
    last_update = serializers.DateTimeField()
    current_location = serializers.DictField()


class BandCurrentLocationSerializer(serializers.Serializer):
    """
    Serializer for current band location (for map display).

    Used by GET /api/v1/band/locations/current/ endpoint.
    """
    band_id = serializers.IntegerField()
    band_name = serializers.CharField()
    latitude = serializers.FloatField(allow_null=True)
    longitude = serializers.FloatField(allow_null=True)
    last_updated = serializers.DateTimeField(allow_null=True)
    is_tracking = serializers.BooleanField()
    staleness_minutes = serializers.IntegerField(allow_null=True, help_text="Minutes since last update")


class AllBandLocationsResponseSerializer(serializers.Serializer):
    """
    Response serializer for all band current locations.
    """
    success = serializers.BooleanField(default=True)
    timestamp = serializers.DateTimeField()
    total_bands = serializers.IntegerField()
    tracking_bands = serializers.IntegerField()
    bands = BandCurrentLocationSerializer(many=True)
