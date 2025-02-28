from django_filters import rest_framework as filters
from modules.ar.challenges.models import ARMemories, ARSitePinCheckIn, GeoArSiteCategory


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
