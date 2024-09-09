from django.contrib import admin

# Register your models here.
from notifications.models import NotificationError, Notification


@admin.register(NotificationError)
class NotificationErrorAdmin(admin.ModelAdmin):
    list_display = ('id', 'message')
    ordering = ("id",)
    search_fields = ["id", "message"]


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'title')
    ordering = ("id",)
    search_fields = ["id", "title"]


