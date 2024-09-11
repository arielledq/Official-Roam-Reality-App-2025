from django.contrib import admin

# Register your models here.
from notifications.models import NotificationError, Notification
from onesignal_client.models import UserDevice


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


@admin.register(UserDevice)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'device_id', 'active')
    ordering = ("id",)
    search_fields = ["id", "user", "device_id", 'active']


