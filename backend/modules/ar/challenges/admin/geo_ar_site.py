from functools import update_wrapper
from django.conf import settings
from django.contrib import admin
from django.template.response import TemplateResponse
from .custom import GeoArChallengeAdmin, PointFieldForm
from ..models import GeoArSite, GeoARStar
from django import forms
from django.contrib import admin
from django.urls import reverse
from django.utils.http import urlencode
from django.utils.html import format_html
from ..views import get_map_points_data, save_point_editor_changes


class GeoArSiteForm(PointFieldForm, forms.ModelForm):
    point_field_name = 'lat_long'

    class Meta:
        model = GeoArSite
        fields = '__all__'

    class Media:
        js = (
            'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js',
            'geoarstarpoint/geoarstarpoint_elevation.js',
        )

@admin.register(GeoArSite)
class GeoArSiteAdmin(GeoArChallengeAdmin):
    form = GeoArSiteForm
    change_form_template = 'admin/geoarstarpoint/change_form.html'
    list_display = ("id",'name',"check_ins","geo_location","view_ar_stars","add_ar_stars",)
    ordering = ("name","check_ins",)
    search_fields = ["name","geo_location__name"]
    list_select_related = ['geo_location']  # To avoid extra queries

    def change_view(self, request, object_id, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['MAPBOX_TOKEN'] = settings.MAPBOX_TOKEN
        return super().change_view(request, object_id, form_url, extra_context)

    def add_view(self, request, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['MAPBOX_TOKEN'] = settings.MAPBOX_TOKEN
        return super().add_view(request, form_url, extra_context)

    def add_ar_stars(self, obj):
        info = (GeoARStar._meta.app_label, GeoARStar._meta.model_name)
        url = (
            reverse('admin:{}_{}_add'.format(*info))
            + "?"
            + urlencode({"geo_site": f"{obj.id}"})
        )
        return format_html('<a href="{}"> ADD Stars Site</a>', url)

    def view_ar_stars(self, obj):
        count = obj.geo_arstar_ar_site.count()
        info = (GeoARStar._meta.app_label, GeoARStar._meta.model_name)
        url = (
            reverse('admin:{}_{}_changelist'.format(*info))
            + "?"
            + urlencode({"geo_site": f"{obj.id}"})
        )
        return format_html('<a href="{}">{} Stars Site</a>', url, count)

    add_ar_stars.short_description = "Add AR Stars"
    add_ar_stars.short_description = "AR Stars"

    def get_urls(self):
        from django.urls import path

        def wrap(view):
            def wrapper(*args, **kwargs):
                return self.admin_site.admin_view(view)(*args, **kwargs)
            wrapper.model_admin = self
            return update_wrapper(wrapper, view)

        info = self.model._meta.app_label, self.model._meta.model_name

        urls = super().get_urls()
        my_urls = [
            path('dashboard/', wrap(self.point_editor_view), name='%s_%s_dashboard' % info),
            path('point_editor_data/', get_map_points_data),
            path('save_point_editor_changes/', save_point_editor_changes),
        ]
        return my_urls + urls

    def point_editor_view(self, request, extra_context=None):
        context = dict(
            # Include common variables for rendering the admin template.
            self.admin_site.each_context(request),
            # Anything else you want in the context...
            MAPBOX_TOKEN=settings.MAPBOX_TOKEN,
        )
        return TemplateResponse(request, "admin/pin_editor/point_editor.html", context)