from .models import Challenges, Sponsor
from rest_framework import serializers


class SponsorSerializer(serializers.ModelSerializer):
  
    class Meta:
        model = Sponsor
        fields = (
            "__all__"
        )
  
class ChallengesSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    sponsored = SponsorSerializer(source='sponsor', read_only=True)

    def get_image(self, obj):
        return obj.image.url

    class Meta:
        model = Challenges
        fields = (
            "id",
            "image",
            "model_file",
            "name",
            "description",
            "points",
            "challenge_choice",
            "challenge_requirement",
            "created_at",
            "expiry_date",
            "sponsored"
        )


class ChallengesUploadSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()
    model_file = serializers.FileField()

    class Meta:
        model = Challenges
        fields = ("image","model_file")
