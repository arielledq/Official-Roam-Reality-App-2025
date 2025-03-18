import io
import os
import zipfile

from django.contrib import admin
from django.core.exceptions import ValidationError
from django.http import HttpResponse

from .models import Challenges, Sponsor, ARUserProfile, ARMemories, ARSettings, ARExample, GeoArSite, GeoLocation, \
    GeoARStar, DestinationFacts, \
    ARChallengeParameterSettings, ARChallengeFilters, UniqueChallengeSite, GeoARChallenges, GeoRegion, \
    GeoARSiteActivity, StarCollection, \
    ARSitePinCheckIn, GeoARGoldStar, PanicMessage, ARExampleImage, ARExampleVideo, GeoARStarPoint, ARExperience, \
    GeoArSiteCategory
from .widgets import GoogleMapsOpenLayersWidget, GoogleMapsOpenLayersWidgetZoom
from django.contrib.gis.db.models import MultiPolygonField, PointField, MultiLineStringField, MultiPointField
from django.contrib.gis.admin import OSMGeoAdmin, GeoModelAdmin
from django.urls import reverse
from django.utils.http import urlencode
from django import forms
from django.utils.html import format_html


class ARExperienceAdminForm(forms.ModelForm):
    class Meta:
        model = ARExperience
        fields = '__all__'

    def clean_geo_location(self):
        geo_location = self.cleaned_data['geo_location']
        if not geo_location:
            raise forms.ValidationError("This field is required.")
        return geo_location


@admin.register(ARExperience)
class ARExperienceAdmin(admin.ModelAdmin):
    form = ARExperienceAdminForm
    list_display = ('title_1', 'title_2', 'geo_location',)


@admin.register(GeoArSiteCategory)
class GeoArSiteCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)


def download_images(modeladmin, request, queryset):
    buffer = io.BytesIO()

    with zipfile.ZipFile(buffer, 'w') as zf:
        for obj in queryset:
            if obj.memory_file:
                extension = os.path.splitext(obj.memory_file.name)[1]
                challenge_name = obj.challenges.name if isinstance(obj, ARMemories) else obj.geo_site.name
                new_filename = f"{obj.user.name}{challenge_name}{obj.created_at}{extension}"

                obj.memory_file.open('rb')
                image_data = obj.memory_file.read()
                obj.memory_file.close()

                zf.writestr(new_filename, image_data)
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/zip')
    response['Content-Disposition'] = 'attachment; filename=images.zip'
    return response


class ARMemoriesAdmin(admin.ModelAdmin):
    
    search_fields = (
        "user__name",
        "challenges__name",
    )
    list_display = ('user_name', 'challenges', 'challenge_approval', 'memory_file')
    list_select_related = ['user']  # To avoid extra queries

    exclude = ('geo_challenge', 'description',)
    actions = [download_images]

    def user_name(self, memory):
        return memory.user.name


class ARChallengeAdmin(admin.ModelAdmin):
    pass

@admin.register(Challenges)
class ARChallengeUpdatedAdmin(admin.ModelAdmin):
    list_display = ('name', 'sponsor', 'expiry_date')
    list_select_related = ['sponsor']
    ordering = ("sponsor__name",)
    search_fields = ["name", "sponsor__name"]

    def sponsor_name(self, obj):
        return obj.sponsor.name

@admin.register(GeoARChallenges)
class GeoARChallengesUpdatedAdmin(admin.ModelAdmin):
    list_display = ('name', 'expiry_date')
    search_fields = ["name"]

class GeoArChallengeAdmin(admin.ModelAdmin):
    zoomMapWidgets = {"widget": GoogleMapsOpenLayersWidgetZoom}
    mapWidgets = {"widget": GoogleMapsOpenLayersWidget}
    zoomMapFields = {
          MultiPolygonField: zoomMapWidgets,
          PointField: zoomMapWidgets,
          MultiLineStringField: zoomMapWidgets,
          MultiPolygonField: zoomMapWidgets,
          MultiPointField: zoomMapWidgets,
    }
    mapFields = {
          MultiPolygonField: mapWidgets,
          PointField: mapWidgets,
          MultiLineStringField: mapWidgets,
          MultiPolygonField: mapWidgets,
          MultiPointField: mapWidgets,
    }
    formfield_overrides = mapFields

    def get_form(self, request, obj=None, change=False, **kwargs):
      form_class = super().get_form(request, obj, change, **kwargs)
      if obj:
        self.formfield_overrides = self.zoomMapFields
      else:
        self.formfield_overrides = self.mapFields
      return form_class
   
@admin.register(GeoLocation)
class GeoLocationAdmin(GeoArChallengeAdmin):
    list_display = ('name','sequence_number','view_ar_sites','add_ar_sites','view_u_ar_sites','add_u_ar_sites',)
    ordering = ('sequence_number',)
    search_fields = ["name",'sequence_number']

    def add_u_ar_sites(self, obj):
        count = obj.geo_location_ar_unique_site.count()
        info = (UniqueChallengeSite._meta.app_label, UniqueChallengeSite._meta.model_name)
        url = (
            reverse('admin:{}_{}_add'.format(*info))
            + "?"
            + urlencode({"geo_location": f"{obj.id}"})
        )
        return format_html('<a href="{}"> ADD Unique Sites</a>', url)


    def view_u_ar_sites(self, obj):
        count = obj.geo_location_ar_unique_site.count()
        info = (UniqueChallengeSite._meta.app_label, UniqueChallengeSite._meta.model_name)
        url = (
            reverse('admin:{}_{}_changelist'.format(*info))
            + "?"
            + urlencode({"geo_location": f"{obj.id}"})
        )
        return format_html('<a href="{}">{} Unique Sites</a>', url, count)


    def add_ar_sites(self, obj):
        count = obj.geo_location_ar_site.count()
        info = (GeoArSite._meta.app_label, GeoArSite._meta.model_name)
        url = (
            reverse('admin:{}_{}_add'.format(*info))
            + "?"
            + urlencode({"geo_location": f"{obj.id}"})
        )
        return format_html('<a href="{}"> ADD AR Sites</a>', url)


    def view_ar_sites(self, obj):
        count = obj.geo_location_ar_site.count()
        info = (GeoArSite._meta.app_label, GeoArSite._meta.model_name)
        url = (
            reverse('admin:{}_{}_changelist'.format(*info))
            + "?"
            + urlencode({"geo_location": f"{obj.id}"})
        )
        return format_html('<a href="{}">{} AR Sites</a>', url, count)

    add_u_ar_sites.short_description = "Add Unique Sites"
    view_u_ar_sites.short_description = "Unique Sites"
    add_ar_sites.short_description = "Add AR Sites"
    view_ar_sites.short_description = "AR Sites"

@admin.register(GeoRegion)
class GeoRegionAdmin(GeoArChallengeAdmin):
    list_display = ('name',)
    ordering = ('name',)
    search_fields = ["name"]
    
@admin.register(UniqueChallengeSite)
class UniqueChallengeSiteAdmin(GeoArChallengeAdmin):
    list_display = ('name',)
    ordering = ("name",)
    search_fields = ["name"]

   ###########
# class ARExampleVideoInline(admin.TabularInline):
#     model = ARExampleVideo
#     extra = 1
#     fields = ['video_file']


@admin.register(GeoArSite)
class GeoArSiteAdmin(GeoArChallengeAdmin):
    list_display = ("id",'name',"check_ins","geo_location","view_ar_stars","add_ar_stars",)
    ordering = ("name","check_ins",)
    search_fields = ["name","geo_location__name"]
    list_select_related = ['geo_location']  # To avoid extra queries

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


# class GeoARStarPontInline(admin.TabularInline):
#     model = GeoARStarPoint
#     extra = 1
#     fields = ['location', 'order',]
#     zoomMapFields = {
#         PointField: {"widget": GoogleMapsOpenLayersWidgetZoom},
#     }
#     mapFields = {
#         PointField: {"widget": GoogleMapsOpenLayersWidget},
#     }
#
#     formfield_overrides = mapFields
#     def get_form(self, request, obj=None, change=False, **kwargs):
#         form_class = super().get_form(request, obj, change, **kwargs)
#         if obj:
#             self.formfield_overrides = self.zoomMapFields
#         else:
#             self.formfield_overrides = self.mapFields
#         return form_class


@admin.register(GeoARStar)
class GeoArStarAdmin(GeoArChallengeAdmin):
    list_display = ("id", 'name', "view_ar_star_points", "add_ar_star_points",)
    # inlines = [GeoARStarPontInline]

    def add_ar_star_points(self, obj):
        info = (GeoARStarPoint._meta.app_label, GeoARStarPoint._meta.model_name)
        url = (
            reverse('admin:{}_{}_add'.format(*info))
            + "?"
            + urlencode({"geo_ar_star": f"{obj.id}"})
        )
        return format_html('<a href="{}"> ADD Stars Point</a>', url)

    def view_ar_star_points(self, obj):
        count = obj.stars.count()
        info = (GeoARStarPoint._meta.app_label, GeoARStarPoint._meta.model_name)
        url = (
            reverse('admin:{}_{}_changelist'.format(*info))
            + "?"
            + urlencode({"geo_ar_star": f"{obj.id}"})
        )
        return format_html('<a href="{}">{} Stars Point</a>', url, count)

    add_ar_star_points.short_description = "Add AR Stars"
    view_ar_star_points.short_description = "AR Stars"


@admin.register(ARSitePinCheckIn)
class ARSitePinCheckInAdmin(admin.ModelAdmin):
    search_fields = (
        "user__name",
        "geo_site__name",
    )
    list_display = ('user_name', 'geo_site', 'challenge_approval', 'memory_file')
    list_select_related = ['user']  # To avoid extra queries
    actions = [download_images]

    def user_name(self, obj):
        return obj.user.name
    pass


@admin.register(ARChallengeFilters)
class ARChallengeFiltersAdmin(admin.ModelAdmin):
    search_fields = (
        "name",
    )
    list_display = ('name',)
    ordering = ("name",)
    pass


class ARExampleImageInline(admin.TabularInline):
    model = ARExampleImage
    extra = 1  # Number of extra forms to display
    fields = ['image']


class ARExampleVideoInline(admin.TabularInline):
    model = ARExampleVideo
    extra = 1
    fields = ['video_file']


class ARExampleAdmin(admin.ModelAdmin):
    inlines = [ARExampleImageInline, ARExampleVideoInline]

@admin.register(StarCollection)
class StarCollectionAdmin(admin.ModelAdmin):
    pass


admin.site.register(Sponsor, ARChallengeAdmin)
admin.site.register(ARMemories, ARMemoriesAdmin)
admin.site.register(ARSettings, ARChallengeAdmin)
# admin.site.register(ARExample, ARChallengeAdmin)
admin.site.register(ARExample, ARExampleAdmin)
admin.site.register(GeoARStarPoint, GeoArChallengeAdmin)
# admin.site.register(GeoARStar, GeoArChallengeAdmin)
admin.site.register(GeoARGoldStar, GeoArChallengeAdmin)
admin.site.register(ARChallengeParameterSettings, ARChallengeAdmin)
# admin.site.register(StarCollection, GeoArChallengeAdmin)
admin.site.register(GeoARSiteActivity, ARChallengeAdmin)
admin.site.register(DestinationFacts, GeoArChallengeAdmin)
admin.site.register(ARUserProfile, GeoArChallengeAdmin)

class PanicMessageAdmin(GeoArChallengeAdmin):
    
    search_fields = (
        "user__name",
    )
    list_display = ('user_name',"message",)
    list_select_related = ['user']  # To avoid extra queries

    def user_name(self, obj):
        return obj.user.name

    pass
admin.site.register(PanicMessage, PanicMessageAdmin)



