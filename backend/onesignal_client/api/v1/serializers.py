from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserIdPushTokenSerializer(serializers.Serializer):
    userId = serializers.CharField(source='user_id', write_only=True)
    pushToken = serializers.CharField(source='push_token', allow_null=True, allow_blank=True)
    active = serializers.BooleanField()
