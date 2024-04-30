from django.contrib import admin
from .models import Challenges, Sponsor, ARUserProfile, ARMemories, ARSettings, ARExample, GeoArSite, GeoLocation, GeoARStar,GeoARSpecificSiteRoute
from .widgets import GoogleMapsOpenLayersWidget
from django.contrib.gis.db.models import MultiPolygonField, PointField

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

class GeoArChallengeAdmin(admin.ModelAdmin):
    formfield_overrides = {
        MultiPolygonField: {"widget": GoogleMapsOpenLayersWidget},
        PointField: {"widget": GoogleMapsOpenLayersWidget},
    }
   
@admin.register(GeoLocation)
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

