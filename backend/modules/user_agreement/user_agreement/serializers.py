from rest_framework import serializers
from .models import UserAgreement


class UserAgreementSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserAgreement
        fields = [
            "id",
            "body",
            "author",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id"]
