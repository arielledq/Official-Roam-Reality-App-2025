from django.db.models.functions import Coalesce
from django_filters import rest_framework as filters
from django.db.models import Q, Sum, Value, F, OuterRef, Subquery, IntegerField, ExpressionWrapper, Case, When
from modules.ar.challenges.models import ARMemories, ARSitePinCheckIn
from users.models import User


class ScoreFilterSet(filters.FilterSet):

    destination = filters.NumberFilter(method='filter_by_destination')
    sponsor = filters.NumberFilter(method='filter_by_sponsor')

    class Meta:
        model = User
        fields = ['destination', 'sponsor']

    def filter_by_destination(self, queryset, name, value):
        qs = queryset.filter(
            Q(ar_memories_user__geo_location=value) |
            Q(ar_site_pin_checkin_user__geo_location=value)
        ).distinct()

        memories_sq = (
            ARMemories.objects
            .filter(
                user=OuterRef('pk'),
                geo_location=value,
                challenge_approval__in=["UNAPPROVED", "APPROVED"],
            )
            .values('user')
            .annotate(total=Sum(
                Case(
                    When(memory_type__in=['PHOTO', 'VIDEO', 'BONUS', 'SCAN_PHOTO', 'STAR',], then=F('points')),
                    When(memory_type='DEDUCTED', then=F('points') * Value(-1)),
                    default=Value(0),
                    output_field=IntegerField()
                )
            ))
            .values('total')
        )

        checkins_sq = (
            ARSitePinCheckIn.objects
            .filter(
                user=OuterRef('pk'),
                geo_location=value,
                challenge_approval__in=["UNAPPROVED", "APPROVED"],
            )
            .values('user')
            .annotate(total=Sum('points'))
            .values('total')
        )

        qs = qs.annotate(
            memories_points=Coalesce(Subquery(memories_sq,   output_field=IntegerField()), Value(0)),
            checkin_points=Coalesce(Subquery(checkins_sq,   output_field=IntegerField()), Value(0)),
        ).annotate(
            calculated_points=F('memories_points') + F('checkin_points')
        )

        return qs.order_by('-calculated_points', '-ar_user_profile_user__updated_at')

    def filter_by_sponsor(self, queryset, name, value):
        qs = queryset.filter(
            Q(ar_memories_user__sponsor=value) |
            Q(ar_site_pin_checkin_user__geo_challenge__sponsor=value)
        ).distinct()

        memories_sq = (
            ARMemories.objects
            .filter(
                user=OuterRef('pk'),
                sponsor=value,
                challenge_approval__in=["UNAPPROVED", "APPROVED"],
            )
            .values('user')
            .annotate(total=Sum(
                Case(
                    When(memory_type__in=['PHOTO', 'VIDEO', 'BONUS', 'SCAN_PHOTO', 'STAR',], then=F('points')),
                    When(memory_type='DEDUCTED', then=F('points') * Value(-1)),
                    default=Value(0),
                    output_field=IntegerField()
                )
            ))
            .values('total')
        )

        checkins_sq = (
            ARSitePinCheckIn.objects
            .filter(
                user=OuterRef('pk'),
                geo_challenge__sponsor=value,
                challenge_approval__in=["UNAPPROVED", "APPROVED"],
            )
            .values('user')
            .annotate(total=Sum('points'))
            .values('total')
        )

        qs = qs.annotate(
            memories_points=Coalesce(Subquery(memories_sq, output_field=IntegerField()), Value(0)),
            checkin_points=Coalesce(Subquery(checkins_sq, output_field=IntegerField()), Value(0)),
        ).annotate(
            calculated_points=F('memories_points') + F('checkin_points')
        )

        return qs.order_by('-calculated_points', '-ar_user_profile_user__updated_at')
