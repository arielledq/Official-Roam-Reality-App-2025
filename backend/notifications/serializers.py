from rest_framework import serializers

from notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for the Notification model.
    """
    from_user = serializers.SerializerMethodField()
    from_user_profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'from_user', 'title', 'description', 'timestamp', 'sent', 'is_read', 'from_user_profile_picture']

    def get_from_user(self, obj):
        from_user = obj.from_user
        if not from_user:
            return '-'
        return from_user.name or from_user.username

    def get_from_user_profile_picture(self, obj):
        from_user = obj.from_user
        if not from_user:
            return '-'
        return from_user.profile_picture.url if from_user.profile_picture else None

