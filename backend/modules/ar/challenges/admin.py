from django.contrib import admin
from .models import Challenges, Sponsor, ARUserProfile, ARMemories

class ARMemoriesAdmin(admin.ModelAdmin):
    pass

class ARChallengeAdmin(admin.ModelAdmin):
    pass

admin.site.register(Sponsor, ARChallengeAdmin)
admin.site.register(Challenges, ARChallengeAdmin)
admin.site.register(ARUserProfile, ARChallengeAdmin)
admin.site.register(ARMemories, ARMemoriesAdmin)