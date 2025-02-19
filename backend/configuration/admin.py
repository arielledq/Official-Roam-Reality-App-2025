
from django.contrib import admin
from django.contrib.postgres.fields import JSONField
from django.utils.safestring import mark_safe
from django_json_widget.widgets import JSONEditorWidget
from .models import Configuration


@admin.register(Configuration)
class ConfigAdmin(admin.ModelAdmin):
    search_fields = ['value', 'key']
    list_display = ['description', 'value']
    readonly_fields = ['description']
    exclude = ['key']
    formfield_overrides = {
        JSONField: {'widget': JSONEditorWidget},
    }

    def has_add_permission(self, request):
        return False

    # DELETE will restore factory (code) value
    # def has_delete_permission(self, request, obj=None):
    #     return False

    def _image(self, obj):
        if obj.image_value:
            return mark_safe(f'<img style="width:100px " src="{obj.image_value.url}"/>')
        return ''
