from .models import Challenges, Sponsor, Resource3dModel, ARUserProfile, ARMemories, ARSettings, ARExample, GeoLocation, GeoArSite, ARChallengeParameterSettings
from rest_framework import serializers


class ARUserProfileSerializer(serializers.ModelSerializer):
  
    class Meta:
        model = ARUserProfile
        fields = (
            "__all__"
        )
        
class Resource3dModelSerializer(serializers.ModelSerializer):
  
    class Meta:
        model = Resource3dModel
        fields = (
            "__all__"
        )
        
class SponsorSerializer(serializers.ModelSerializer):
  
    class Meta:
        model = Sponsor
        fields = (
            "__all__"
        )

class SettingsSerializer(serializers.ModelSerializer):
  
    class Meta:
        model = ARSettings
        fields = (
            "__all__"
        )

class ExamplesSerializer(serializers.ModelSerializer):
  
    class Meta:
        model = ARExample
        fields = (
            "__all__"
        )

class ARChallengeParameterSettingsSerializer(serializers.ModelSerializer):
  
    class Meta:
        model = ARChallengeParameterSettings
        fields = (
            "__all__"
        )

class ChallengesSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    sponsored = SponsorSerializer(source='sponsor', read_only=True)
    parameters = ARChallengeParameterSettingsSerializer(source='parameter_settings', read_only=True)

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
            "sponsored",
            "parameters"
        )


class ChallengesUploadSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()
    model_file = serializers.FileField()

    class Meta:
        model = Challenges
        fields = ("image","model_file")

class ARMemoriesSerializerGet(serializers.ModelSerializer):
    memory_file = serializers.FileField()
    challenge_details = ChallengesSerializer(source='challenges', read_only=True)

    class Meta:
        model = ARMemories
        fields = (
            "id",
            "challenge_details",
            "memory_file",
            "description",
            "declined_reason",
            "challenge_approval",
            "challenges",
            "thumbnail_memory_video_file",
            "memory_type"
        )

class ARMemoriesSerializer(serializers.ModelSerializer):
    memory_file = serializers.FileField()

    class Meta:
        model = ARMemories
        fields = (
            "__all__"
        )

class GeoLocationSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()

    class Meta:
        model = GeoLocation
        fields = (
            "__all__"
        )

class GeoArSiteSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()

    class Meta:
        model = GeoArSite
        fields = (
            "__all__"
        )