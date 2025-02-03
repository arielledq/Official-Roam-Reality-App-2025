from .models import Challenges, Sponsor, ARUserProfile, ARMemories, \
    ARSettings, ARExample, GeoLocation, GeoArSite, ARChallengeParameterSettings, \
    ARChallengeFilters, UniqueChallengeSite, GeoRegion, GeoARChallenges, GeoARStar, ARSitePinCheckIn, \
    StarCollection, GeoARGoldStar, DestinationFacts, PanicMessage, ARExampleImage, ARExampleVideo, GeoARStarPoint, \
    ARExperience, GeoArSiteCategory
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
            "id",
            "points",
            "check_ins",
            "challenge_completed",
            "user",
            "current_location",
            "created_at",
        )


class SponsorSerializer(serializers.ModelSerializer):
  
    class Meta:
        model = Sponsor
        fields = (
            "id",
            "name",
            "image",
            "created_at",
        )


class SettingsSerializer(serializers.ModelSerializer):
  
    class Meta:
        model = ARSettings
        fields = (
            "id",
            "waiver_details",
        )


class ExampleImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ARExampleImage
        fields = ["id", 'ar_example', 'image',]


class ExampleVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ARExampleVideo
        fields = ["id", "ar_example", "video_file",]


class ExamplesSerializer(serializers.ModelSerializer):
    images = ExampleImageSerializer(many=True)
    videos = ExampleVideoSerializer(many=True)

    class Meta:
        model = ARExample
        fields = ["id", "name", "description", "any_where_challenges", "geo_challenges", "images", "videos",]


class ARChallengeParameterSettingsSerializer(serializers.ModelSerializer):
  
    class Meta:
        model = ARChallengeParameterSettings
        fields = (
            "id",
            "name",
            "bloom_threshold",
            "bloom_intensity",
            "positionX",
            "positionY",
            "positionZ",
            "scale_object",
            "emission_value",
            "rotation_speed",
            "scale_speed",
            "min_pinch_scale",
            "max_pinch_scale",
            "isRotationEnabled",
            "loop_animations",
            "loop_delay",
            "diffuse_text_color",
            "diffuse_intensity",
            "sound_play_and_pause",
            "image_opacity",
            "image_opacity_value",
            "tracking_and_anchors",
            "ar_portals",
            "image_recognition",
            "image_recognition_file",
        )


class ARChallengeFiltersSerializer(TaggitSerializer, serializers.ModelSerializer):
    gradient_colors = TagListSerializerField()

    class Meta:
        model = ARChallengeFilters
        fields = (
            "id",
            "name",
            "image",
            "text_form_image",
            "gradient_colors",
            "gradient_direction",
            "filter_text",
            "filter_text_color",
            "filter_text_size",
            "location_option",
            "location_text_size",
            "location_text_color",
            "app_name_text",
            "app_name_text_size",
            "app_name_text_color",
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
    user_attempts = serializers.SerializerMethodField()

    def get_image(self, obj):
        return obj.image.url

    def get_user_attempts(self, obj):
        user = self.context['request'].user
        return ARMemories.objects.filter(user=user, challenges=obj).count()

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
            "challenge_attempt",
            "created_at",
            "expiry_date",
            "sponsored",
            "parameters",
            "ar_filters",
            "info",
            "user_attempts",
        )


class ChallengesUploadSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()
    model_file = serializers.FileField()

    class Meta:
        model = Challenges
        fields = ("id", "image", "model_file")


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
            "id",
            "memory_file",
            "thumbnail_memory_video_file",
            "description",
            "user",
            "memory_type",
            "challenges",
            "geo_challenge",
            "declined_reason",
            "challenge_approval",
            "created_at",
            "points",
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
            "ar_filters",
            "info",
        )


class GeoArSiteCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = GeoArSiteCategory
        fields = (
            "id",
            "name",
            "color",
        )


class ARExperienceSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()
    challenges = ChallengesSerializer(read_only=True, many=True)
    geo_challenges = GeoARChallengesSerializer(read_only=True, many=True)

    class Meta:
        model = ARExperience
        geo_field = ('lat_long', 'geo_site_area',)
        fields = (
            "id",
            "title_1",
            "title_2",
            "subtitle",
            "image",
            "order",
            "challenges",
            "geo_challenges",
            "experience_type",
            "geo_location",
        )

    def get_image(self, obj):
        return obj.image.url


class UniqueChallengeSiteSerializer(GeoModelSerializer):
    
    challenge = GeoARChallengesSerializer(read_only=True, many=True)

    class Meta:
        model = UniqueChallengeSite
        geo_field = 'latitude_longitude'
        fields = (
            "id",
            "name",
            "geo_location",
            "challenge",
            "latitude_longitude",
            "visibility_radius",
        )


class GeoArSiteSerializer(GeoModelSerializer):
    image = serializers.ImageField()
    pin_challenge = GeoARChallengesSerializer(read_only=True)
    category = GeoArSiteCategorySerializer(read_only=True)
    check_ins = serializers.SerializerMethodField()
    user_attempts = serializers.SerializerMethodField()

    class Meta:
        model = GeoArSite
        geo_field = ('lat_long', 'geo_site_area',)
        fields = (
            "id",
            "name",
            "image",
            "created_at",
            "updated_at",
            "geo_location",#
            "pin_challenge",
            "address_text",
            "lat_long",#
            "geo_site_border",
            "description",
            "info",
            "pro_tips",
            "check_ins",
            "check_in_site_radius",
            "category",
            "user_attempts",
        )

        def get_check_ins(self, obj):
            return ARSitePinCheckIn.objects.filter(geo_site=obj).count()

        def get_user_attempts(self, obj):
            user = self.context['request'].user
            return ARSitePinCheckIn.objects.filter(user=user, geo_site=obj, geo_challenge=obj.pin_challenge).count()


class GeoRegionSerializer(GeoModelSerializer):

    class Meta:
        model = GeoRegion
        geo_field = ('latitude_longitude',)
        fields = (
            "id",
            "created_at",
            "updated_at",
            "name",
            "geo_region",
        )


class GeoLocationSerializer(GeoModelSerializer):
    image = serializers.ImageField()
    unique_ar_sites = UniqueChallengeSiteSerializer(source='geo_location_ar_unique_site',read_only=True, many=True)
    # star_ar_sites = GeoArSiteSerializer(source='geo_location_ar_site', read_only=True, many=True)
    star_ar_sites = serializers.SerializerMethodField()
    ar_event_sites = serializers.SerializerMethodField()
    regions = GeoRegionSerializer(read_only=True, many=True)
    ar_experiences = ARExperienceSerializer(read_only=True, many=True)

    class Meta:
        model = GeoLocation
        geo_field = 'geo_location'
        fields = (
            "id",
            "created_at",
            "updated_at",
            "name",
            "image",
            "flag_image",
            "geo_location",#
            "border",
            "regions",
            "sequence_number",
            "map_longitude_delta",
            "map_latitude_delta",
            "unique_ar_sites",
            "star_ar_sites",
            "ar_event_sites",
            "ar_experiences",
        )

    def get_star_ar_sites(self, instance):
        star_ar_sites_queryset = instance.geo_location_ar_site.exclude(
            category__isnull=False
        )
        serializer = GeoArSiteSerializer(star_ar_sites_queryset, many=True)
        return serializer.data

    def get_ar_event_sites(self, instance):
        star_ar_sites_queryset = instance.geo_location_ar_site.exclude(
            category__isnull=True
        )
        serializer = GeoArSiteSerializer(star_ar_sites_queryset, many=True)
        return serializer.data


class GeoStarSerializer(GeoModelSerializer):
    geo_site = GeoArSiteSerializer(read_only=True)
    challenges = GeoARChallengesSerializer(read_only=True)
    sponsors = SponsorSerializer(read_only=True, many=True)

    class Meta:
        model = GeoARStar
        # geo_field = 'star_location'
        fields = (
            "id",
            "name",
            "fun_facts",
            "info",
            "visibility_radius",
            "geo_site",
            "challenges",
            "sponsors",
            "following_mode",
        )


class GeoStarPointSerializer(GeoModelSerializer):
    geo_ar_star = GeoStarSerializer()
    remaining_stars = serializers.SerializerMethodField()
    captured_stars = serializers.SerializerMethodField()
    total_stars = serializers.SerializerMethodField()

    class Meta:
        model = GeoARStarPoint
        geo_field = 'location'
        fields = (
            "id",
            "geo_ar_star",
            "location",
            "order",
            "remaining_stars",
            "captured_stars",
            "total_stars",
        )

    def get_remaining_stars(self, instance):
        ar_star = instance.geo_ar_star
        visited_points = StarCollection.objects.filter(user=self.context.get('request').user).values_list(
            'geo_ar_star_point_id', flat=True)
        remaining = ar_star.stars.exclude(id__in=visited_points).count()
        return remaining

    def get_captured_stars(self, instance):
        ar_star = instance.geo_ar_star
        visited_points = StarCollection.objects.filter(user=self.context.get('request').user).values_list(
            'geo_ar_star_point_id', flat=True)
        remaining = ar_star.stars.filter(id__in=visited_points).count()
        return remaining

    def get_total_stars(self, instance):
        ar_star = instance.geo_ar_star
        return ar_star.stars.count()


class StarCollectionSerializer(serializers.ModelSerializer):

    class Meta:
        model = StarCollection
        fields = (
            "id",
            "name",
            "geo_site",
            "geo_ar_star",
            "geo_ar_star_point",
            "user",
            "point",
        )


class ARSitePinCheckInSerializer(serializers.ModelSerializer):
    memory_file = serializers.FileField()
    # challenge_details = ChallengesSerializer(source='challenges', read_only=True)

    class Meta:
        model = ARSitePinCheckIn
        fields = (
            "id",
            "geo_site",
            "user",
            "memory_file",
            "challenge_approval",
            "declined_reason",
            "created_at",
            "updated_at",
            "geo_challenge",
            "points",
        )


class GoldStarCollectionSerializer(serializers.ModelSerializer):

    class Meta:
        model = GeoARGoldStar
        fields = (
            "id",
            "name",
            "image",
            "star_location",
            "fun_facts",
            "visibility_radius",
            "geo_location",
            "geo_site",
            "sponsors",
            "price",
        )


class DestinationFactsSerializer(serializers.ModelSerializer):
    sponsors = SponsorSerializer(read_only=True,many=True)

    class Meta:
        model = DestinationFacts
        fields = (
            "id",
            "name",
            "image",
            "facts",
            "sponsors",
            "geo_location",
            "border",
            "points",
        )


class PanicMessageSerializer(GeoModelSerializer):

    class Meta:
        model = PanicMessage
        geo_field = 'location'
        fields = (
            "id",
            "user",
            "message",
            "created_at",
            "updated_at",
            "location",
        )


class ARAllMemories(serializers.Serializer):
    def to_representation(self, instance):
        if isinstance(instance, ARMemories):
            return ARMemoriesSerializerGet(instance).data
        elif isinstance(instance, ARSitePinCheckIn):
            return ARMemoriesSerializerGet(instance).data
        return {}
