import ast
from rest_framework import serializers

from notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for the Notification model.
    """
    from_user = serializers.SerializerMethodField()
    from_user_id = serializers.SerializerMethodField()
    extra_data = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'from_user', 'from_user_id', 'title', 'description', 'timestamp', 'sent', 'is_read', 'extra_data', 'type' ]

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

    def get_extra_data(self, obj):
        raw = obj.extra_data
        if not raw:
            return {}
        try:
            parsed = ast.literal_eval(raw)
            if isinstance(parsed, dict):
                return parsed
        except (ValueError, SyntaxError):
            pass
        return {}
