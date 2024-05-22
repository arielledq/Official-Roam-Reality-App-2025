from django.contrib import admin
from .models import Challenges, Sponsor, ARUserProfile, ARMemories, ARSettings, ARExample, GeoArSite, GeoLocation, GeoARStar,GeoARSpecificSiteRoute, \
  ARChallengeParameterSettings, ARChallengeFilters, UniqueChallengeSite, GeoARChallenges, GeoRegion
from .widgets import GoogleMapsOpenLayersWidget
from django.contrib.gis.db.models import MultiPolygonField, PointField
from django.contrib.gis.admin import OSMGeoAdmin

class ARMemoriesAdmin(admin.ModelAdmin):
    
    search_fields = (
        "user__name",
        "challenges__name",
    )
    list_display = ('user_name', 'challenges', 'challenge_approval','memory_file')
    list_select_related = ['user']  # To avoid extra queries

    def user_name(self, memory):
        return memory.user.name

    pass

class ARChallengeAdmin(admin.ModelAdmin):
    pass

@admin.register(Challenges)
class ARChallengeUpdatedAdmin(admin.ModelAdmin):
    list_display = ('name', 'sponsor', 'expiry_date')
    list_select_related = ['sponsor']
    ordering = ("sponsor__name",)
    search_fields = ["name", "sponsor__name"]

    def sponsor_name(self, obj):
        return obj.sponsor.name

@admin.register(GeoARChallenges)
class GeoARChallengesUpdatedAdmin(admin.ModelAdmin):
    list_display = ('name', 'sponsor', 'expiry_date')
    list_select_related = ['sponsor']
    ordering = ("sponsor__name",)
    search_fields = ["name", "sponsor__name"]

    def sponsor_name(self, obj):
        return obj.sponsor.name

class GeoArChallengeAdmin(OSMGeoAdmin):
    formfield_overrides = {
        MultiPolygonField: {"widget": GoogleMapsOpenLayersWidget},
        PointField: {"widget": GoogleMapsOpenLayersWidget},
    }
    default_lon = -80.41984442094248
    default_lat =  21.758821200665473
    default_zoom = 3
   
@admin.register(GeoLocation)
class GeoLocationAdmin(GeoArChallengeAdmin):
    list_display = ('name','sequence_number',)
    ordering = ('sequence_number',)
    search_fields = ["name",'sequence_number']

@admin.register(GeoRegion)
class GeoRegionAdmin(GeoArChallengeAdmin):
    list_display = ('name',)
    ordering = ('name',)
    search_fields = ["name"]
    
@admin.register(UniqueChallengeSite)
class GeoLocationAdmin(GeoArChallengeAdmin):
    list_display = ('name',)
    ordering = ("name",)
    search_fields = ["name"]

admin.site.register(Sponsor, ARChallengeAdmin)
admin.site.register(ARUserProfile, ARChallengeAdmin)
admin.site.register(ARMemories, ARMemoriesAdmin)
admin.site.register(ARSettings, ARChallengeAdmin)
admin.site.register(ARExample, ARChallengeAdmin)
admin.site.register(GeoArSite, GeoArChallengeAdmin)
admin.site.register(GeoARStar, GeoArChallengeAdmin)
admin.site.register(GeoARSpecificSiteRoute, GeoArChallengeAdmin)
admin.site.register(ARChallengeParameterSettings, ARChallengeAdmin)
admin.site.register(ARChallengeFilters, ARChallengeAdmin)



