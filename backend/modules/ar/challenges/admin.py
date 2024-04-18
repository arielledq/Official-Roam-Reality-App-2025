from django.contrib import admin
from .models import Challenges, Sponsor, ARUserProfile, ARMemories, ARSettings, ARExample

class ARMemoriesAdmin(admin.ModelAdmin):
    
    search_fields = (
        "user__name",
        "challenges__name",
    )
    list_display = ('user', 'challenges', 'challenge_approval')

    pass

class ARChallengeAdmin(admin.ModelAdmin):
    pass


admin.site.register(Sponsor, ARChallengeAdmin)
admin.site.register(Challenges, ARChallengeAdmin)
admin.site.register(ARUserProfile, ARChallengeAdmin)
admin.site.register(ARMemories, ARMemoriesAdmin)
admin.site.register(ARSettings, ARChallengeAdmin)
admin.site.register(ARExample, ARChallengeAdmin)