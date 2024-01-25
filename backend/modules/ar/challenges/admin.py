from django.contrib import admin
from .models import Challenges, Sponsor, ARUserProfile

class ARChallengeAdmin(admin.ModelAdmin):
    pass

admin.site.register(Sponsor, ARChallengeAdmin)
admin.site.register(Challenges, ARChallengeAdmin)
admin.site.register(ARUserProfile, ARChallengeAdmin)