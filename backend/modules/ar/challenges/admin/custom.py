import io
import os
import zipfile
from django.contrib.gis.geos import Point
from django.contrib import admin
from django.core.exceptions import ValidationError
from django.db import transaction
from django.http import HttpResponse

from notifications.models import Notification, NotificationTypes
from onesignal_client.utils import send_notification
from travel_ar_app_42706 import settings
from ..models import Challenges, Sponsor, ARUserProfile, ARMemories, ARSettings, ARExample, GeoArSite, GeoLocation, \
    GeoARStar, DestinationFacts, \
    ARChallengeParameterSettings, ARChallengeFilters, UniqueChallengeSite, GeoARChallenges, GeoRegion, \
    GeoARSiteActivity, StarCollection, \
    ARSitePinCheckIn, GeoARGoldStar, PanicMessage, ARExampleImage, ARExampleVideo, GeoARStarPoint, ARExperience, \
    GeoArSiteCategory, ScanPicture
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
                new_filename = f"{obj.user.name} {challenge_name} {obj.created_at} {extension}"

                obj.memory_file.open('rb')
                image_data = obj.memory_file.read()
                obj.memory_file.close()

                zf.writestr(new_filename, image_data)
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/zip')
    response['Content-Disposition'] = 'attachment; filename=images.zip'
    return response


def reject_and_notify(self, request, queryset):
    with transaction.atomic():
        for memory_checkin in queryset:
            user = memory_checkin.user
            if memory_checkin.challenge_approval != "DECLINED":
                memory_checkin.challenge_approval = "DECLINED"
                memory_checkin.save()

                user.ar_user_profile_user.points -= memory_checkin.points
                user.ar_user_profile_user.save()
            notification = Notification.objects.create(
                title="Your submission was declined",
                description=memory_checkin.declined_reason if memory_checkin.declined_reason else 'Your submission '
                                                                                                  'was rejected',
                type=NotificationTypes.POINTS_REVOKED,
                channel=Notification.NotificationChannel.PUSH,
                extra_data={
                    "image": memory_checkin.memory_file.url if memory_checkin.memory_file else None,
                },
            )
            notification.targets.set([user])
            notification.send()


class ARMemoriesAdmin(admin.ModelAdmin):
    search_fields = (
        "user__name",
        "challenges__name",
    )
    list_display = ('user_name', 'challenges', 'challenge_approval', 'memory_file')
    list_select_related = ['user']  # To avoid extra queries

    exclude = ('geo_challenge', 'description',)
    actions = [download_images, reject_and_notify]

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


class PointFieldForm(forms.ModelForm):
    latitude = forms.FloatField(required=False, label="Latitude")
    longitude = forms.FloatField(required=False, label="Longitude")
    point_field_name = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        field_name = self.point_field_name
        if not field_name:
            raise ValueError("'point_field_name' must be specified in the form.")

        if field_name not in self.fields or not isinstance(self._meta.model._meta.get_field(field_name), PointField):
            raise ValueError(f"'{field_name}' is not a valid PointField.")

        # Hide map widget
        self.fields[field_name].widget = forms.HiddenInput()

        # Additional fields lat y lon
        self.fields[f'latitude'] = forms.FloatField(
            label=f'Latitude',
            required=False
        )
        self.fields[f'longitude'] = forms.FloatField(
            label=f'Longitude',
            required=False
        )

        # Initial values
        point = getattr(self.instance, field_name)
        if point:
            self.fields[f'latitude'].initial = point.y
            self.fields[f'longitude'].initial = point.x

    def clean(self):
        cleaned_data = super().clean()

        field_name = self.point_field_name
        lat = cleaned_data.pop(f"latitude", None)
        lon = cleaned_data.pop(f"longitude", None)

        if lat is not None and lon is not None:
            cleaned_data[field_name] = Point(lon, lat)
        else:
            cleaned_data[field_name] = None

        return cleaned_data


class ScanPictureForm(PointFieldForm, forms.ModelForm):
    point_field_name = 'coordinates'

    class Meta:
        model = ScanPicture
        fields = '__all__'

    class Media:
        js = (
            'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js',
            'geoarstarpoint/geoarstarpoint_elevation.js',
        )


@admin.register(ScanPicture)
class ScanPictureAdmin(admin.ModelAdmin):
    form = ScanPictureForm
    change_form_template = 'admin/geoarstarpoint/change_form.html'
    list_display = ('name',)

    def change_view(self, request, object_id, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['MAPBOX_TOKEN'] = settings.MAPBOX_TOKEN
        return super().change_view(request, object_id, form_url, extra_context)

    def add_view(self, request, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['MAPBOX_TOKEN'] = settings.MAPBOX_TOKEN
        return super().add_view(request, form_url, extra_context)


class GeoARStarPointForm(PointFieldForm, forms.ModelForm):
    point_field_name = 'location'

    def clean_sponsors(self):
        sponsors = self.cleaned_data.get('sponsors')
        if sponsors and sponsors.count() > 3:
            raise ValidationError("No more than 3 sponsor per star.")
        return sponsors

    class Meta:
        model = GeoARStarPoint
        fields = '__all__'

    class Media:
        js = (
            'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js',
            'geoarstarpoint/geoarstarpoint_elevation.js',
        )


@admin.register(GeoARStarPoint)
class GeoARStarPointAdmin(GeoArChallengeAdmin):
    form = GeoARStarPointForm
    change_form_template = 'admin/geoarstarpoint/change_form.html'

    def change_view(self, request, object_id, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['MAPBOX_TOKEN'] = settings.MAPBOX_TOKEN
        return super().change_view(request, object_id, form_url, extra_context)

    def add_view(self, request, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['MAPBOX_TOKEN'] = settings.MAPBOX_TOKEN
        return super().add_view(request, form_url, extra_context)


@admin.register(GeoLocation)
class GeoLocationAdmin(GeoArChallengeAdmin):
    list_display = ('name', 'sequence_number', 'view_ar_sites', 'add_ar_sites', 'view_u_ar_sites', 'add_u_ar_sites',)
    ordering = ('sequence_number',)
    search_fields = ["name", 'sequence_number']

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
    actions = [download_images, reject_and_notify]

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


@admin.register(ARUserProfile)
class ARUserProfileAdmin(GeoArChallengeAdmin):
    search_fields = ["user__id", "user__name", "user__email"]

    def user_name(self, obj):
        return obj.user.name

    def user_email(self, obj):
        return obj.user.email

class PanicMessageAdmin(GeoArChallengeAdmin):

    search_fields = (
        "user__name",
    )
    list_display = ('user_name' ,"message",)
    list_select_related = ['user']  # To avoid extra queries

    def user_name(self, obj):
        return obj.user.name

    pass



admin.site.register(Sponsor, ARChallengeAdmin)
admin.site.register(ARMemories, ARMemoriesAdmin)
admin.site.register(ARSettings, ARChallengeAdmin)
# admin.site.register(ARExample, ARChallengeAdmin)
admin.site.register(ARExample, ARExampleAdmin)
# admin.site.register(GeoARStarPoint, GeoArChallengeAdmin)
# admin.site.register(GeoARStar, GeoArChallengeAdmin)
admin.site.register(GeoARGoldStar, GeoArChallengeAdmin)
admin.site.register(ARChallengeParameterSettings, ARChallengeAdmin)
# admin.site.register(StarCollection, GeoArChallengeAdmin)
admin.site.register(GeoARSiteActivity, ARChallengeAdmin)
admin.site.register(DestinationFacts, GeoArChallengeAdmin)
# admin.site.register(ARUserProfile, GeoArChallengeAdmin)
admin.site.register(PanicMessage, PanicMessageAdmin)
