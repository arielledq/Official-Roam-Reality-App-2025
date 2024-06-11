from django.contrib import admin
from .models import Challenges, Sponsor, ARUserProfile, ARMemories, ARSettings, ARExample, GeoArSite, GeoLocation, GeoARStar, \
  ARChallengeParameterSettings, ARChallengeFilters, UniqueChallengeSite, GeoARChallenges, GeoRegion,GeoARSiteActivity,StarCollection,ARSitePinCheckIn
from .widgets import GoogleMapsOpenLayersWidget
from django.contrib.gis.db.models import MultiPolygonField, PointField
from django.contrib.gis.admin import OSMGeoAdmin

class ARMemoriesAdmin(admin.ModelAdmin):
    
    search_fields = (
        "user__name",
        "challenges__name",
    )
    list_display = ('user_name', 'challenges','geo_challenge', 'challenge_approval','memory_file')
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
    list_display = ('name', 'expiry_date')
    search_fields = ["name"]

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

@admin.register(GeoArSite)
class GeoLocationAdmin(GeoArChallengeAdmin):
    list_display = ('name',"check_ins",)
    ordering = ("name","check_ins",)
    search_fields = ["name"]

@admin.register(ARSitePinCheckIn)
class ARSitePinCheckInAdmin(admin.ModelAdmin):
    search_fields = (
        "user__name",
        "geo_site__name",
    )
    list_display = ('user_name', 'geo_site', 'approval','check_in_image')
    list_select_related = ['user']  # To avoid extra queries

    def user_name(self, obj):
        return obj.user.name
    pass

admin.site.register(Sponsor, ARChallengeAdmin)
admin.site.register(ARUserProfile, ARChallengeAdmin)
admin.site.register(ARMemories, ARMemoriesAdmin)
admin.site.register(ARSettings, ARChallengeAdmin)
admin.site.register(ARExample, ARChallengeAdmin)
admin.site.register(GeoARStar, GeoArChallengeAdmin)
admin.site.register(ARChallengeParameterSettings, ARChallengeAdmin)
admin.site.register(ARChallengeFilters, ARChallengeAdmin)
admin.site.register(StarCollection, ARChallengeAdmin)
admin.site.register(GeoARSiteActivity, ARChallengeAdmin)



