from django_filters import rest_framework as filters
from configuration import configs
from modules.ar.challenges.models import ARMemories, ARSitePinCheckIn, GeoArSiteCategory, GeoArSite
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.contrib.gis.db.models.functions import Distance
from rest_framework.exceptions import ValidationError


class CategoryFilterSet(filters.FilterSet):
    """
    Specific filters for GeoArSiteCategory.
    """
    is_band = filters.BooleanFilter(method='category_separator')

    class Meta:
        model = GeoArSiteCategory
        fields = ['is_band', ]

    def category_separator(self, queryset, name, value):
        if value:
            queryset = queryset.filter(geo_sites__band_user__isnull=False)
        else:
            queryset = queryset.filter(geo_sites__band_user__isnull=True)

        return queryset.exclude(geo_sites__isnull=True).distinct()


class ArSiteFilterSet(filters.FilterSet):
    """
    Filters for GeoArSite.
    """

    class SiteType:
        SITE = 1
        SITE_STAR = 2

        TYPE_CHOICES = (
            (1, 'SITE'),
            (2, 'SITE_STAR'),
        )

    site_type = filters.ChoiceFilter(choices=SiteType.TYPE_CHOICES, method='filter_by_type')

    class Meta:
        model = GeoArSite
        fields = ['site_type', 'sponsor', ]

    def filter_by_type(self, queryset, name, value):
        try:
            lat = float(self.request.query_params.get("lat"))
            lng = float(self.request.query_params.get("lng"))
        except:
            raise ValidationError({
                "detail": "lat and lng are required ?lat=<float>&lng=<float>"
            })
        user_pt = Point(lng, lat, srid=4326)
        qs = queryset.annotate(distance=Distance("lat_long", user_pt)).filter(
            lat_long__distance_lte=(user_pt, D(m=configs.METER_RADIUS))
        )

        site = int(value)
        if site == self.SiteType.SITE:
            return qs.filter(geo_arstar_ar_site__isnull=True)
        else:
            return qs.filter(geo_arstar_ar_site__isnull=False).distinct()
