from django.contrib import admin
from .models import Challenges, Sponsor, ARUserProfile, ARMemories, ARSettings, ARExample, GeoArChallenge, GeoArSite
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


admin.site.register(Sponsor, ARChallengeAdmin)
admin.site.register(Challenges, ARChallengeAdmin)
admin.site.register(ARUserProfile, ARChallengeAdmin)
admin.site.register(ARMemories, ARMemoriesAdmin)
admin.site.register(ARSettings, ARChallengeAdmin)
admin.site.register(ARExample, ARChallengeAdmin)

class GeoArChallengeAdmin(admin.ModelAdmin):
    formfield_overrides = {
        MultiPolygonField: {"widget": GoogleMapsOpenLayersWidget},
        PointField: {"widget": GoogleMapsOpenLayersWidget},
    }


admin.site.register(GeoArChallenge, GeoArChallengeAdmin)
admin.site.register(GeoArSite, GeoArChallengeAdmin)
admin.site.register(ARSettings, ARChallengeAdmin)
admin.site.register(ARExample, ARChallengeAdmin)
