"""
Django Admin interface for Band Tracking.

Provides easy-to-use interface for:
- Creating and sending broadcast messages
- Viewing notification history
- Tracking band locations
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from django.contrib import messages as django_messages
from .models import (
    BroadcastMessage,
    NotificationHistory,
    BandLocation,
    VehicleWhitelist,
    BandTrackingSettings,
    BandNotificationCooldown
)
from .services import BroadcastService


@admin.register(BroadcastMessage)
class BroadcastMessageAdmin(admin.ModelAdmin):
    """
    Admin interface for broadcast messages.

    Features:
    - Create messages with simple form
    - Send messages with one click
    - View delivery statistics
    - Bulk send multiple messages
    """
    list_display = [
        'title',
        'status_badge',
        'created_by',
        'recipients_count',
        'created_at',
        'sent_at',
        'action_buttons'
    ]
    list_filter = ['sent_at', 'created_at', 'is_deleted']
    search_fields = ['title', 'content', 'created_by__email']
    readonly_fields = ['sent_at', 'recipients_count', 'created_at', 'updated_at', 'delivery_stats_display']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Message Content', {
            'fields': ('title', 'content')
        }),
        ('Status & Statistics', {
            'fields': ('sent_at', 'recipients_count', 'delivery_stats_display'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'is_deleted', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['send_messages', 'duplicate_messages']

    def get_queryset(self, request):
        """Include deleted messages for admins"""
        qs = super().get_queryset(request)
        return qs.select_related('created_by')

    def save_model(self, request, obj, form, change):
        """Set created_by to current user on creation"""
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    def status_badge(self, obj):
        """Display message status with colored badge"""
        if obj.is_deleted:
            return format_html(
                '<span style="background-color: #dc3545; color: white; padding: 3px 10px; border-radius: 3px;">DELETED</span>'
            )
        elif obj.is_sent:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">SENT ✓</span>'
            )
        else:
            return format_html(
                '<span style="background-color: #ffc107; color: black; padding: 3px 10px; border-radius: 3px;">DRAFT</span>'
            )
    status_badge.short_description = 'Status'

    def action_buttons(self, obj):
        """Display action buttons for each message"""
        if obj.is_deleted:
            return '-'
        elif obj.is_sent:
            return format_html(
                '<a class="button" href="#" onclick="alert(\'Message already sent\'); return false;">Already Sent</a>'
            )
        else:
            return format_html(
                '<a class="button" style="background-color: #007bff; color: white; padding: 5px 10px; text-decoration: none; border-radius: 3px;" '
                'href="{}">Send Now</a>',
                reverse('admin:send_broadcast_message', args=[obj.pk])
            )
    action_buttons.short_description = 'Actions'

    def delivery_stats_display(self, obj):
        """Display delivery statistics"""
        if not obj.is_sent:
            return 'Not sent yet'

        total = obj.notification_histories.count()
        delivered = obj.notification_histories.filter(delivered=True).count()
        read_count = obj.notification_histories.filter(read=True).count()
        failed = obj.notification_histories.filter(delivered=False).count()

        delivery_rate = (delivered / total * 100) if total > 0 else 0
        read_rate = (read_count / total * 100) if total > 0 else 0

        return format_html(
            '''
            <div style="font-family: monospace;">
                <strong>Total Recipients:</strong> {}<br>
                <strong>Delivered:</strong> {} ({:.1f}%)<br>
                <strong>Read:</strong> {} ({:.1f}%)<br>
                <strong>Failed:</strong> {}
            </div>
            ''',
            total, delivered, delivery_rate, read_count, read_rate, failed
        )
    delivery_stats_display.short_description = 'Delivery Statistics'

    def send_messages(self, request, queryset):
        """
        Bulk action to send selected messages.

        Handles edge cases:
        - Already sent messages
        - No active users
        - Service failures
        """
        service = BroadcastService()
        sent_count = 0
        already_sent = 0
        errors = []

        for message in queryset:
            if message.is_sent:
                already_sent += 1
                continue

            result = service.send_broadcast(message)
            if result.get('success'):
                sent_count += 1
            else:
                errors.append(f"{message.title}: {result.get('error', 'Unknown error')}")

        # Show results
        if sent_count > 0:
            self.message_user(
                request,
                f'Successfully sent {sent_count} message(s)',
                level=django_messages.SUCCESS
            )

        if already_sent > 0:
            self.message_user(
                request,
                f'{already_sent} message(s) already sent',
                level=django_messages.WARNING
            )

        if errors:
            self.message_user(
                request,
                f'Errors: {"; ".join(errors)}',
                level=django_messages.ERROR
            )

    send_messages.short_description = "Send selected messages to all users"

    def duplicate_messages(self, request, queryset):
        """Duplicate selected messages as drafts"""
        count = 0
        for message in queryset:
            BroadcastMessage.objects.create(
                title=f"{message.title} (Copy)",
                content=message.content,
                created_by=request.user
            )
            count += 1

        self.message_user(
            request,
            f'Successfully duplicated {count} message(s)',
            level=django_messages.SUCCESS
        )

    duplicate_messages.short_description = "Duplicate selected messages"


@admin.register(NotificationHistory)
class NotificationHistoryAdmin(admin.ModelAdmin):
    """
    Admin interface for notification history.

    Read-only - shows delivery and read status.
    """
    list_display = [
        'message_title',
        'user_email',
        'delivered_badge',
        'read_badge',
        'delivered_at',
        'read_at'
    ]
    list_filter = ['delivered', 'read', 'delivered_at', 'created_at']
    search_fields = [
        'message__title',
        'user__email',
        'user__name',
        'notification_id'
    ]
    readonly_fields = [
        'message',
        'user',
        'delivered',
        'read',
        'delivered_at',
        'read_at',
        'notification_id',
        'error_message',
        'created_at',
        'updated_at'
    ]
    date_hierarchy = 'created_at'

    def get_queryset(self, request):
        """Optimize queries"""
        qs = super().get_queryset(request)
        return qs.select_related('message', 'user')

    def has_add_permission(self, request):
        """Disable add - history is auto-created"""
        return False

    def has_delete_permission(self, request, obj=None):
        """Disable delete - preserve history"""
        return False

    def message_title(self, obj):
        """Display message title with link"""
        return format_html(
            '<a href="{}">{}</a>',
            reverse('admin:band_tracking_broadcastmessage_change', args=[obj.message.id]),
            obj.message.title
        )
    message_title.short_description = 'Message'

    def user_email(self, obj):
        """Display user email"""
        return obj.user.email
    user_email.short_description = 'User'

    def delivered_badge(self, obj):
        """Display delivered status badge"""
        if obj.delivered:
            return format_html(
                '<span style="color: green;">✓ Delivered</span>'
            )
        else:
            error = f' ({obj.error_message})' if obj.error_message else ''
            return format_html(
                '<span style="color: red;">✗ Failed{}</span>',
                error
            )
    delivered_badge.short_description = 'Delivered'

    def read_badge(self, obj):
        """Display read status badge"""
        if obj.read:
            return format_html('<span style="color: green;">✓ Read</span>')
        else:
            return format_html('<span style="color: gray;">- Unread</span>')
    read_badge.short_description = 'Read'


@admin.register(BandLocation)
class BandLocationAdmin(admin.ModelAdmin):
    """
    Admin interface for band location history.

    Read-only - shows GPS updates from bands.
    """
    list_display = [
        'band_name',
        'latitude_display',
        'longitude_display',
        'accuracy',
        'timestamp'
    ]
    list_filter = ['band', 'timestamp']
    search_fields = ['band__name', 'gps_string']
    readonly_fields = [
        'band',
        'location',
        'latitude_display',
        'longitude_display',
        'gps_string',
        'accuracy',
        'altitude',
        'speed',
        'timestamp'
    ]
    date_hierarchy = 'timestamp'

    def get_queryset(self, request):
        """Optimize queries"""
        qs = super().get_queryset(request)
        return qs.select_related('band')

    def has_add_permission(self, request):
        """Disable add - locations come from API"""
        return False

    def has_change_permission(self, request, obj=None):
        """Disable edit - read-only history"""
        return False

    def has_delete_permission(self, request, obj=None):
        """Disable delete - preserve history"""
        return False

    def band_name(self, obj):
        """Display band name with link"""
        try:
            # Use model meta to get correct app_label
            from modules.ar.challenges.models import GeoArSite
            app_label = GeoArSite._meta.app_label
            model_name = GeoArSite._meta.model_name
            url = reverse(f'admin:{app_label}_{model_name}_change', args=[obj.band.id])
            return format_html('<a href="{}">{}</a>', url, obj.band.name)
        except Exception:
            # Fallback to just the name if URL reverse fails
            return obj.band.name
    band_name.short_description = 'Band'

    def latitude_display(self, obj):
        """Display latitude"""
        return f"{obj.latitude:.6f}°" if obj.latitude else '-'
    latitude_display.short_description = 'Latitude'

    def longitude_display(self, obj):
        """Display longitude"""
        return f"{obj.longitude:.6f}°" if obj.longitude else '-'
    longitude_display.short_description = 'Longitude'


# Custom admin URL for sending messages
from django.urls import path
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404


def send_broadcast_message_view(request, message_id):
    """Custom view to send a broadcast message"""
    message = get_object_or_404(BroadcastMessage, pk=message_id)

    if message.is_sent:
        django_messages.warning(request, 'Message already sent')
    else:
        service = BroadcastService()
        result = service.send_broadcast(message)

        if result.get('success'):
            django_messages.success(
                request,
                f'Message sent successfully to {result.get("recipients", 0)} users. '
                f'Delivered: {result.get("delivered", 0)}'
            )
        else:
            django_messages.error(
                request,
                f'Failed to send message: {result.get("error", "Unknown error")}'
            )

    return HttpResponseRedirect(reverse('admin:band_tracking_broadcastmessage_changelist'))


# Register custom URL in admin
admin.site.get_urls()
original_get_urls = admin.site.get_urls


def get_urls():
    urls = original_get_urls()
    custom_urls = [
        path(
            'band_tracking/broadcastmessage/<int:message_id>/send/',
            admin.site.admin_view(send_broadcast_message_view),
            name='send_broadcast_message'
        ),
    ]
    return custom_urls + urls


admin.site.get_urls = get_urls


@admin.register(VehicleWhitelist)
class VehicleWhitelistAdmin(admin.ModelAdmin):
    """
    Admin interface for managing vehicle whitelist.

    Allows admin to:
    - Add/remove vehicle IDs
    - Map vehicles to bands
    - Enable/disable vehicles
    - No code deployment needed!
    """
    list_display = [
        'vehicle_id',
        'band_name',
        'is_active_badge',
        'description',
        'created_at'
    ]
    list_filter = ['is_active', 'band', 'created_at']
    search_fields = ['vehicle_id', 'description', 'band__name']
    autocomplete_fields = ['band']

    fieldsets = (
        ('Vehicle Information', {
            'fields': ('vehicle_id', 'band', 'is_active')
        }),
        ('Details', {
            'fields': ('description',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ['created_at', 'updated_at']

    def get_queryset(self, request):
        """Optimize queries"""
        qs = super().get_queryset(request)
        return qs.select_related('band')

    def band_name(self, obj):
        """Display band name"""
        return obj.band.name
    band_name.short_description = 'Band'
    band_name.admin_order_field = 'band__name'

    def is_active_badge(self, obj):
        """Display active status with badge"""
        if obj.is_active:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Active</span>'
            )
        else:
            return format_html(
                '<span style="color: red; font-weight: bold;">✗ Disabled</span>'
            )
    is_active_badge.short_description = 'Status'

    def save_model(self, request, obj, form, change):
        """Show success message with instructions"""
        super().save_model(request, obj, form, change)

        if not change:
            self.message_user(
                request,
                f'Vehicle {obj.vehicle_id} added successfully! '
                f'The UDP listener will now accept updates from this vehicle.',
                level=django_messages.SUCCESS
            )
        else:
            if 'is_active' in form.changed_data:
                status = "enabled" if obj.is_active else "disabled"
                self.message_user(
                    request,
                    f'Vehicle {obj.vehicle_id} has been {status}.',
                    level=django_messages.INFO
                )


@admin.register(BandTrackingSettings)
class BandTrackingSettingsAdmin(admin.ModelAdmin):
    """
    Admin interface for band tracking settings.

    Singleton model - only one settings instance exists.
    Changes take effect immediately without restarting services!
    """
    list_display = [
        'settings_summary',
        'auto_notify_status',
        'distance_threshold_meters',
        'cooldown_minutes',
        'updated_at'
    ]

    fieldsets = (
        ('Auto-Notification Settings', {
            'fields': ('auto_notify_enabled', 'distance_threshold_meters', 'cooldown_minutes'),
            'description': 'Configure automatic notifications when bands move. Changes take effect immediately.'
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ['created_at', 'updated_at']

    def has_add_permission(self, request):
        """Only one settings instance allowed"""
        return not BandTrackingSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        """Prevent deletion of settings"""
        return False

    def settings_summary(self, obj):
        """Display settings summary"""
        return "Band Tracking Configuration"
    settings_summary.short_description = 'Settings'

    def auto_notify_status(self, obj):
        """Display auto-notify status with badge"""
        if obj.auto_notify_enabled:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">ON</span>'
            )
        else:
            return format_html(
                '<span style="background-color: #dc3545; color: white; padding: 3px 10px; border-radius: 3px;">OFF</span>'
            )
    auto_notify_status.short_description = 'Auto-Notify'

    def changelist_view(self, request, extra_context=None):
        """Auto-redirect to change view if settings exist"""
        try:
            obj = BandTrackingSettings.objects.get(pk=1)
            from django.http import HttpResponseRedirect
            return HttpResponseRedirect(
                reverse('admin:band_tracking_bandtrackingsettings_change', args=[obj.pk])
            )
        except BandTrackingSettings.DoesNotExist:
            pass
        return super().changelist_view(request, extra_context)

    def save_model(self, request, obj, form, change):
        """Show informative message after save"""
        super().save_model(request, obj, form, change)

        changes = []
        if 'auto_notify_enabled' in form.changed_data:
            status = "enabled" if obj.auto_notify_enabled else "disabled"
            changes.append(f"Auto-notifications {status}")

        if 'distance_threshold_meters' in form.changed_data:
            changes.append(f"Distance threshold set to {obj.distance_threshold_meters}m")

        if 'cooldown_minutes' in form.changed_data:
            changes.append(f"Cooldown period set to {obj.cooldown_minutes} minutes")

        if changes:
            message = "Settings updated: " + ", ".join(changes) + ". Changes are active immediately!"
            self.message_user(request, message, level=django_messages.SUCCESS)
        else:
            self.message_user(
                request,
                'Settings saved successfully.',
                level=django_messages.SUCCESS
            )


@admin.register(BandNotificationCooldown)
class BandNotificationCooldownAdmin(admin.ModelAdmin):
    """
    Admin interface for viewing band notification cooldowns.

    Read-only - shows when each band was last notified.
    Helps admin understand why notifications might not be sending.
    """
    list_display = [
        'band_name',
        'last_notification_at',
        'time_since_notification',
        'cooldown_status'
    ]
    list_filter = ['last_notification_at']
    search_fields = ['band__name']
    readonly_fields = [
        'band',
        'last_notification_at',
        'last_notification_message',
        'time_since_notification',
        'cooldown_status_display',
        'updated_at'
    ]

    fieldsets = (
        ('Band Information', {
            'fields': ('band',)
        }),
        ('Cooldown Status', {
            'fields': ('last_notification_at', 'time_since_notification', 'cooldown_status_display')
        }),
        ('Last Notification', {
            'fields': ('last_notification_message',)
        }),
        ('Metadata', {
            'fields': ('updated_at',),
            'classes': ('collapse',)
        }),
    )

    def has_add_permission(self, request):
        """Disable add - cooldowns are auto-created"""
        return False

    def has_change_permission(self, request, obj=None):
        """Disable edit - cooldowns are auto-managed"""
        return False

    def has_delete_permission(self, request, obj=None):
        """Allow delete to reset cooldown if needed"""
        return request.user.is_superuser

    def get_queryset(self, request):
        """Optimize queries"""
        qs = super().get_queryset(request)
        return qs.select_related('band', 'last_notification_message')

    def band_name(self, obj):
        """Display band name"""
        return obj.band.name
    band_name.short_description = 'Band'

    def time_since_notification(self, obj):
        """Display time since last notification"""
        from django.utils import timezone
        delta = timezone.now() - obj.last_notification_at
        hours = delta.seconds // 3600
        minutes = (delta.seconds % 3600) // 60

        if delta.days > 0:
            return f"{delta.days} days, {hours} hours ago"
        elif hours > 0:
            return f"{hours} hours, {minutes} minutes ago"
        else:
            return f"{minutes} minutes ago"
    time_since_notification.short_description = 'Time Since Last Notification'

    def cooldown_status(self, obj):
        """Display cooldown status badge"""
        settings = BandTrackingSettings.get_settings()
        if obj.is_in_cooldown(settings.cooldown_minutes):
            return format_html(
                '<span style="background-color: #ffc107; color: black; padding: 3px 10px; border-radius: 3px;">IN COOLDOWN</span>'
            )
        else:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">READY</span>'
            )
    cooldown_status.short_description = 'Status'

    def cooldown_status_display(self, obj):
        """Display detailed cooldown status"""
        from django.utils import timezone
        from datetime import timedelta

        settings = BandTrackingSettings.get_settings()
        cooldown_until = obj.last_notification_at + timedelta(minutes=settings.cooldown_minutes)

        if obj.is_in_cooldown(settings.cooldown_minutes):
            remaining = cooldown_until - timezone.now()
            minutes_left = remaining.seconds // 60
            return format_html(
                '<div style="color: orange; font-weight: bold;">⏳ In cooldown - {} minutes remaining<br>'
                '<small>Can send notification after {}</small></div>',
                minutes_left,
                cooldown_until.strftime('%Y-%m-%d %H:%M:%S')
            )
        else:
            return format_html(
                '<div style="color: green; font-weight: bold;">✓ Ready to send notifications</div>'
            )
    cooldown_status_display.short_description = 'Cooldown Status'
