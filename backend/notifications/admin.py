from django.contrib import admin
from django.db import transaction

# Register your models here.
from notifications.models import NotificationError, Notification
from onesignal_client.models import UserDevice
from users.models import User


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
    actions = ['send_notification',]

    # def get_form(self, request, obj=None, **kwargs):
    #     # Obtiene el formulario base
    #     form = super().get_form(request, obj, **kwargs)
    #
    #     # Si es un objeto nuevo (no existe en la base de datos), habilitar solo el campo 'title'
    #     if obj is None:
    #         # Deshabilitar todos los campos excepto 'title'
    #         for field in form.base_fields:
    #             if field not in ['title', 'description', ]:
    #                 form.base_fields[field].widget.attrs['disabled'] = 'disabled'
    #     return form

    def send_notification(self, request, queryset):
        with transaction.atomic():
            for notification in queryset:
                # users = User.objects.filter(is_admin=False)
                # notification.targets.set(users)
                notification.send()
            self.message_user(request, "Notifications sent successfully.")

    send_notification.short_description = "Send notification"


@admin.register(UserDevice)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'device_id', 'active')
    ordering = ("id",)
    search_fields = ["id", "user", "device_id", 'active']


