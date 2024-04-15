from django.contrib import admin
from .models import Challenges, Sponsor, ARUserProfile, ARMemories, ARSettings, ARExample, GeoArChallenge

class ARMemoriesAdmin(admin.ModelAdmin):
    pass

class ARChallengeAdmin(admin.ModelAdmin):
    pass

admin.site.register(Sponsor, ARChallengeAdmin)
admin.site.register(Challenges, ARChallengeAdmin)
admin.site.register(ARUserProfile, ARChallengeAdmin)
admin.site.register(ARMemories, ARMemoriesAdmin)
admin.site.register(ARSettings, ARMemoriesAdmin)
admin.site.register(ARExample, ARMemoriesAdmin)
admin.site.register(GeoArChallenge, ARChallengeAdmin)