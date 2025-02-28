
from django.contrib import admin
from .models import SlidePicture


@admin.register(SlidePicture)
class SlidePictureAdmin(admin.ModelAdmin):
    search_fields = ['name',]
    list_display = ['name', 'order']
