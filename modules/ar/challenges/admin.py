from django.contrib import admin
from .models import Challenges

class ChallengesAdmin(admin.ModelAdmin):
    pass

admin.site.register(Challenges, ChallengesAdmin)