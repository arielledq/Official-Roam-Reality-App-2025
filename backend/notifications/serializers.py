import ast
from rest_framework import serializers
from django.conf import settings
from django.core.files.storage import default_storage
from storages.backends.s3boto3 import S3Boto3Storage

from notifications.models import Notification


class FromUserProfileSerializer(serializers.Serializer):
    """
    Serializer for user profile image in notifications.
    """
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        """Return the image URL or placeholder if no image is set"""
        return obj.get_image_url()


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for the Notification model.
    """
    from_user = serializers.SerializerMethodField()
    from_user_id = serializers.SerializerMethodField()
    from_user_profile = serializers.SerializerMethodField()
    extra_data = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'from_user', 'from_user_id', 'from_user_profile', 'title', 'description', 'timestamp', 'sent', 'is_read', 'extra_data', 'type' ]

    def get_from_user(self, obj):
        from_user = obj.from_user
        if not from_user:
            return '-'
        return from_user.name or from_user.username

    def get_from_user_id(self, obj):
        from_user = obj.from_user
        if not from_user:
            return None
        return from_user.id

    def get_from_user_profile(self, obj):
        """
        Get user profile data if from_user exists and has a profile.
        """
        from_user = obj.from_user
        if not from_user:
            return None
        
        # Check if user has a profile
        if hasattr(from_user, 'user_profile'):
            profile = from_user.user_profile
            return FromUserProfileSerializer(profile).data
        return None

    def get_extra_data(self, obj):
        raw = obj.extra_data
        if not raw:
            return {}
        try:
            parsed = ast.literal_eval(raw)
            if isinstance(parsed, dict):
                # Handle memory_file_key: generate fresh presigned URL
                if 'memory_file_key' in parsed and parsed['memory_file_key']:
                    try:
                        if settings.USE_S3:
                            parsed['image'] = default_storage.url(parsed['memory_file_key'])
                        else:
                            # For local storage, construct URL manually
                            parsed['image'] = f"{settings.MEDIA_URL}{parsed['memory_file_key']}"
                    except Exception as e:
                        # If URL generation fails, remove the key
                        parsed.pop('memory_file_key', None)

                # Handle expired URLs: detect and regenerate
                if 'image' in parsed and parsed['image']:
                    image_url = parsed['image']
                    # Check if URL contains expiration parameters and might be expired
                    if 'X-Amz-Expires=' in image_url and ('X-Amz-Date=' in image_url or 'X-Amz-Signature=' in image_url):
                        try:
                            # Extract the file key from the URL to regenerate
                            # URL format: https://bucket.s3.region.amazonaws.com/media/ar/memories/filename.ext?params
                            if settings.USE_S3 and 'amazonaws.com' in image_url:
                                # Extract path after bucket
                                url_parts = image_url.split('amazonaws.com/')[1].split('?')[0]
                                storage = S3Boto3Storage()
                                parsed['image'] = storage.url(url_parts)
                        except Exception as e:
                            # Keep original URL if regeneration fails
                            pass

                return parsed
        except (ValueError, SyntaxError):
            pass
        return {}
