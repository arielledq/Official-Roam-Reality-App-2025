from django.contrib import admin
from .models import Challenges, Sponsor, Resource3dModel

class ARChallengeAdmin(admin.ModelAdmin):
    pass

admin.site.register(Sponsor, ARChallengeAdmin)
admin.site.register(Challenges, ARChallengeAdmin)
admin.site.register(Resource3dModel, ARChallengeAdmin)