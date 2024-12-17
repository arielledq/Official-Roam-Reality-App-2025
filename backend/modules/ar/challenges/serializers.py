from .models import Challenges, Sponsor, ARUserProfile, ARMemories, \
    ARSettings, ARExample, GeoLocation, GeoArSite, ARChallengeParameterSettings, \
    ARChallengeFilters, UniqueChallengeSite, GeoRegion, GeoARChallenges, GeoARStar, ARSitePinCheckIn, \
    StarCollection, GeoARGoldStar, DestinationFacts, PanicMessage, ARExampleImage, ARExampleVideo
from .models import Challenges, Sponsor, ARUserProfile, ARMemories, \
    ARSettings, ARExample, GeoLocation, GeoArSite, ARChallengeParameterSettings, \
    ARChallengeFilters, UniqueChallengeSite, GeoRegion, GeoARChallenges, GeoARStar, ARSitePinCheckIn, \
    StarCollection, GeoARGoldStar, DestinationFacts, PanicMessage, ARExampleImage, ARExampleVideo
from rest_framework import serializers
from taggit.serializers import (TagListSerializerField,
                                TaggitSerializer)
from django.contrib.gis.db.models import GeometryField
from rest_framework_gis.serializers import GeoModelSerializer

class ARUserProfileSerializer(serializers.ModelSerializer):
  
    class Meta:
        model = ARUserProfile
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


class ExampleImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ARExampleImage
        fields = "__all__"


class ExampleVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ARExampleVideo
        fields = "__all__"


class ExamplesSerializer(serializers.ModelSerializer):
    images = ExampleImageSerializer(many=True)
    videos = ExampleVideoSerializer(many=True)

    class Meta:
        model = ARExample
        # fields = (
        #     "__all__"
        # )
        fields = ["name", "description", "any_where_challenges", "geo_challenges", "images", "videos",]


class ARChallengeParameterSettingsSerializer(serializers.ModelSerializer):
  
    class Meta:
        model = ARChallengeParameterSettings
        fields = (
            "__all__"
        )

class ARChallengeFiltersSerializer(TaggitSerializer, serializers.ModelSerializer):
    gradient_colors = TagListSerializerField()

    class Meta:
        model = ARChallengeFilters
        fields = (
            "__all__"
        )

class ChallengesSerializer(serializers.ModelSerializer):
    
    @staticmethod
    def get_ar_filters_sorted(instance):
        ar_filters = instance.ar_filters.order_by('name')
        return ARChallengeFiltersSerializer(ar_filters, many=True).data
    
    image = serializers.ImageField()
    sponsored = SponsorSerializer(source='sponsor', read_only=True)
    parameters = ARChallengeParameterSettingsSerializer(source='parameter_settings', read_only=True)
    ar_filters = serializers.SerializerMethodField(method_name='get_ar_filters_sorted')
from taggit.serializers import (TagListSerializerField,
                                TaggitSerializer)
from django.contrib.gis.db.models import GeometryField
from rest_framework_gis.serializers import GeoModelSerializer

class ARUserProfileSerializer(serializers.ModelSerializer):
  
    class Meta:
        model = ARUserProfile
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


class ExampleImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ARExampleImage
        fields = "__all__"


class ExampleVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ARExampleVideo
        fields = "__all__"


class ExamplesSerializer(serializers.ModelSerializer):
    images = ExampleImageSerializer(many=True)
    videos = ExampleVideoSerializer(many=True)

    class Meta:
        model = ARExample
        # fields = (
        #     "__all__"
        # )
        fields = ["name", "description", "any_where_challenges", "geo_challenges", "images", "videos",]


class ARChallengeParameterSettingsSerializer(serializers.ModelSerializer):
  
    class Meta:
        model = ARChallengeParameterSettings
        fields = (
            "__all__"
        )

class ARChallengeFiltersSerializer(TaggitSerializer, serializers.ModelSerializer):
    gradient_colors = TagListSerializerField()

    class Meta:
        model = ARChallengeFilters
        fields = (
            "__all__"
        )

class ChallengesSerializer(serializers.ModelSerializer):
    
    @staticmethod
    def get_ar_filters_sorted(instance):
        ar_filters = instance.ar_filters.order_by('name')
        return ARChallengeFiltersSerializer(ar_filters, many=True).data
    
    image = serializers.ImageField()
    sponsored = SponsorSerializer(source='sponsor', read_only=True)
    parameters = ARChallengeParameterSettingsSerializer(source='parameter_settings', read_only=True)
    ar_filters = serializers.SerializerMethodField(method_name='get_ar_filters_sorted')

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
            "parameters",
            "ar_filters",
            "description",
            "points",
            "challenge_choice",
            "challenge_requirement",
            "created_at",
            "expiry_date",
            "sponsored",
            "parameters",
            "ar_filters"
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
            "memory_type",
            "created_at",
        )

class ARMemoriesSerializer(serializers.ModelSerializer):
    memory_file = serializers.FileField()

    class Meta:
        model = ARMemories
        fields = (
            "__all__"
        )

class GeoARChallengesSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()
    sponsored = SponsorSerializer(source='sponsor', read_only=True)
    parameters = ARChallengeParameterSettingsSerializer(source='parameter_settings', read_only=True)
    ar_filters = ARChallengeFiltersSerializer(read_only=True, many=True)

    def get_image(self, obj):
        return obj.image.url

    class Meta:
        model = GeoARChallenges
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
            "parameters",
            "ar_filters"
        )

class UniqueChallengeSiteSerializer(GeoModelSerializer):
    
    challenge = GeoARChallengesSerializer(read_only=True, many=True)

    class Meta:
        model = UniqueChallengeSite
        geo_field = 'latitude_longitude'
        fields = (
            "__all__"
        )

class GeoArSiteSerializer(GeoModelSerializer):
    image = serializers.ImageField()
    pin_challenge = GeoARChallengesSerializer(read_only=True)

    class Meta:
        model = GeoArSite
        geo_field = ('lat_long','geo_site_area',)
        fields = (
            "__all__"
        )

class GeoRegionSerializer(GeoModelSerializer):

    class Meta:
        model = GeoRegion
        geo_field = ('latitude_longitude',)
        fields = (
            "__all__"
        )

class GeoLocationSerializer(GeoModelSerializer):
    image = serializers.ImageField()
    unique_ar_sites = UniqueChallengeSiteSerializer(source='geo_location_ar_unique_site',read_only=True, many=True)
    star_ar_sites = GeoArSiteSerializer(source='geo_location_ar_site',read_only=True, many=True)
    regions = GeoRegionSerializer(read_only=True, many=True)

    class Meta:
        model = GeoLocation
        geo_field = 'geo_location'
        fields = (
            "__all__"
        )

class GeoStarSerializer(GeoModelSerializer):
    geo_site = GeoArSiteSerializer(read_only=True)
    challenges = GeoARChallengesSerializer(read_only=True)
    sponsors = SponsorSerializer(read_only=True,many=True)

    class Meta:
        model = GeoARStar
        geo_field = 'star_location'
        fields = (
            "__all__"
        )

class StarCollectionSerializer(serializers.ModelSerializer):

    class Meta:
        model = StarCollection
        fields = (
            "__all__"
        )

class ARSitePinCheckInSerializer(serializers.ModelSerializer):
    check_in_image = serializers.FileField()
    # challenge_details = ChallengesSerializer(source='challenges', read_only=True)

    class Meta:
        model = ARSitePinCheckIn
        fields = (
            "__all__"
        )

class GoldStarCollectionSerializer(serializers.ModelSerializer):

    class Meta:
        model = GeoARGoldStar
        fields = (
            "__all__"
        )

class DestinationFactsSerializer(serializers.ModelSerializer):
    sponsors = SponsorSerializer(read_only=True,many=True)

    class Meta:
        model = DestinationFacts
        fields = (
            "__all__"
        )

class PanicMessageSerializer(GeoModelSerializer):

    class Meta:
        model = PanicMessage
        geo_field = 'location'
        fields = (
            "__all__"
        )


class ARAllMemories(serializers.Serializer):
    def to_representation(self, instance):
        if isinstance(instance, ARMemories):
            return ARMemoriesSerializerGet(instance).data
        elif isinstance(instance, ARSitePinCheckIn):
            return ARMemoriesSerializerGet(instance).data
        return {}
