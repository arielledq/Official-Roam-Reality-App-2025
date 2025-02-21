from django.db.models.functions import Coalesce
from django_filters import rest_framework as filters
from django.db.models import Q, Sum, Value, F, OuterRef, Subquery
from modules.ar.challenges.models import ARMemories, ARSitePinCheckIn
from users.models import User


class ScoreFilterSet(filters.FilterSet):
    """
    Specific filters for FriendsViewSet.
    """
    destination = filters.NumberFilter(method='filter_by_destination')

    class Meta:
        model = User
        fields = ['destination', ]

    def filter_by_destination(self, queryset, name, value):
        queryset = queryset.filter(
            Q(user_ar_memories__geo_location=value)
            | Q(user_ar_site_checkin__geo_location=value)
        ).distinct()

        memories_subquery = (
            ARMemories.objects.filter(
                user=OuterRef('pk'),
                geo_location=value
            )
            .values('user')
            .annotate(total=Sum('points'))
            .values('total')
        )

        checkin_subquery = (
            ARSitePinCheckIn.objects.filter(
                user=OuterRef('pk'),
                geo_location=value
            )
            .values('user')
            .annotate(total=Sum('points'))
            .values('total')
        )

        queryset = queryset.annotate(
            memories_points=Coalesce(Subquery(memories_subquery), Value(0)),
            checkin_points=Coalesce(Subquery(checkin_subquery), Value(0))
        ).annotate(
            destination_points=F('memories_points') + F('checkin_points')
        )
        return queryset.order_by('destination_points')
