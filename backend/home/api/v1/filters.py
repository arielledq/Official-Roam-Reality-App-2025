from django.db.models.functions import Coalesce
from django_filters import rest_framework as filters
from django.db.models import Q, Sum, Value, F, OuterRef, Subquery, IntegerField, ExpressionWrapper, Case, When
from modules.ar.challenges.models import ARMemories, ARSitePinCheckIn
from users.models import User


class ScoreFilterSet(filters.FilterSet):
    """
    Specific filters for FriendsViewSet.
    """
    destination = filters.NumberFilter(method='filter_by_destination')
    sponsor = filters.NumberFilter(method='filter_by_sponsor')

    class Meta:
        model = User
        fields = ['destination', 'sponsor']

    def filter_by_destination(self, queryset, name, value):
        queryset = queryset.filter(
            Q(user_ar_memories__geo_location=value)
            | Q(user_ar_site_checkin__geo_location=value)
        ).distinct()

        memories_subquery = (
            ARMemories.objects.filter(
                user=OuterRef('pk'),
                geo_location=value,
                challenge_approval__in=["UNAPPROVED", "APPROVED"],
            )
            .values('user')
            .annotate(total=Sum(
                Case(
                    When(
                        memory_type__in=['PHOTO', 'VIDEO', 'BONUS'],
                        then=F('points')
                    ),
                    When(
                        memory_type='DEDUCTED',
                        then=ExpressionWrapper(
                            F('points') * Value(-1),
                            output_field=IntegerField()
                        )
                    ),
                    default=Value(0),
                    output_field=IntegerField(),
                )
            ))
            .values('total')
        )

        checkin_subquery = (
            ARSitePinCheckIn.objects.filter(
                user=OuterRef('pk'),
                geo_location=value,
                challenge_approval__in=["UNAPPROVED", "APPROVED"],
            )
            .values('user')
            .annotate(total=Sum('points'))
            .values('total')
        )

        queryset = queryset.annotate(
            memories_points=Coalesce(Subquery(memories_subquery, output_field=IntegerField()), Value(0, output_field=IntegerField())),
            checkin_points=Coalesce(Subquery(checkin_subquery, output_field=IntegerField()), Value(0, output_field=IntegerField()))
        ).annotate(
            destination_points=ExpressionWrapper(
                F('memories_points') + F('checkin_points'),
                output_field=IntegerField()
            )
        )

        return queryset.order_by('-destination_points', '-user_ar_profile__updated_at')

    def filter_by_sponsor(self, queryset, name, value):
        queryset = queryset.filter(
            Q(user_ar_memories__sponsor=value)
            | Q(user_ar_site_checkin__geo_challenge__sponsor=value)
        ).distinct()

        memories_subquery = (
            ARMemories.objects.filter(
                user=OuterRef('pk'),
                sponsor=value,
                challenge_approval__in=["UNAPPROVED", "APPROVED"],
            )
            .values('user')
            .annotate(total=Sum(
                Case(
                    When(
                        memory_type__in=['PHOTO', 'VIDEO', 'BONUS'],
                        then=F('points')
                    ),
                    When(
                        memory_type='DEDUCTED',
                        then=ExpressionWrapper(
                            F('points') * Value(-1),
                            output_field=IntegerField()
                        )
                    ),
                    default=Value(0),
                    output_field=IntegerField(),
                )
            ))
            .values('total')
        )

        checkin_subquery = (
            ARSitePinCheckIn.objects.filter(
                user=OuterRef('pk'),
                geo_challenge__sponsor=value,
                challenge_approval__in=["UNAPPROVED", "APPROVED"],
            )
            .values('user')
            .annotate(total=Sum('points'))
            .values('total')
        )

        queryset = queryset.annotate(
            memories_points=Coalesce(Subquery(memories_subquery, output_field=IntegerField()), Value(0, output_field=IntegerField())),
            checkin_points=Coalesce(Subquery(checkin_subquery, output_field=IntegerField()), Value(0, output_field=IntegerField()))
        ).annotate(
            sponsor_points=ExpressionWrapper(
                F('memories_points') + F('checkin_points'),
                output_field=IntegerField()
            )
        )

        return queryset.order_by('-sponsor_points', '-user_ar_profile__updated_at')
