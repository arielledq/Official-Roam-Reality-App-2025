from itertools import count
from django.contrib import admin
from django.db.models import (
    Sum, Value, F, OuterRef, Subquery,
    IntegerField, ExpressionWrapper, Q, Case, When
)
from django.utils.translation import gettext_lazy as _
from django.db.models.functions import Coalesce
from django.urls import reverse
from django.utils.http import urlencode
from django.utils.html import format_html

from configuration import configs
from modules.ar.challenges.models import (
    ARUserProfileScoreboard as ScoreboardModel, ARMemories,
    ARSitePinCheckIn, GeoLocation, Sponsor
)


class DestinationFilter(admin.SimpleListFilter):
    title = "Destination"
    parameter_name = "destination"

    def lookups(self, request, model_admin):
        # Destinations
        return GeoLocation.objects.values_list("id", "name")

    def queryset(self, request, queryset):
        return queryset

    def choices(self, changelist):
        """
        Rewriting choices() to make the filter mutually exclusive.
        """
        # “All”
        yield {
            "selected": self.value() is None,
            "query_string": changelist.get_query_string(
                remove=[self.parameter_name, "sponsor"]
            ),
            "display": _("All"),
        }
        # For each destination
        for lookup, title in self.lookup_choices:
            yield {
                "selected": self.value() == str(lookup),
                "query_string": changelist.get_query_string(
                    {self.parameter_name: lookup},
                    ["sponsor"],  # remove 'sponsor'
                ),
                "display": title,
            }


class SponsorFilter(admin.SimpleListFilter):
    title = "Sponsor"
    parameter_name = "sponsor"

    def lookups(self, request, model_admin):
        # Destinations
        return Sponsor.objects.values_list("id", "name")

    def queryset(self, request, queryset):
        return queryset

    def choices(self, changelist):
        """
        Rewriting choices() to make the filter mutually exclusive.
        """
        # “All”
        yield {
            "selected": self.value() is None,
            "query_string": changelist.get_query_string(
                remove=[self.parameter_name, "destination"]
            ),
            "display": _("All"),
        }
        # For each sponsor
        for lookup, title in self.lookup_choices:
            yield {
                "selected": self.value() == str(lookup),
                "query_string": changelist.get_query_string(
                    {self.parameter_name: lookup},
                    ["destination"],  # remove 'destination'
                ),
                "display": title,
            }


@admin.register(ScoreboardModel)
class ScoreboardAdmin(admin.ModelAdmin):
    list_display = (
        "row_number",
        "user_name",
        "calculated_points",    # memories_points + checkin_points
        "updated_at",
        "add_ar_memory"
    )
    list_filter = (DestinationFilter, SponsorFilter)
    readonly_fields = (
        "calculated_points",
    )

    def user_name(self, obj):
        return obj.user.name

    def changelist_view(self, request, extra_context=None):
        self._cl_request = request
        return super().changelist_view(request, extra_context)

    def get_queryset(self, request):
        self._row_counter = count(start=1)
        qs = (super().get_queryset(request).select_related("user").filter(user__is_superuser=False, user__is_active=True)
        .exclude(
            user__in=configs.SCOREBOARD_EXCLUDED_USER_IDS,
        ))
        destination = request.GET.get("destination")
        sponsor = request.GET.get("sponsor")
        # Subquerys
        memories_filter = Q(user=OuterRef("user"),
                            challenge_approval__in=["UNAPPROVED", "APPROVED"])
        checkins_filter = Q(user=OuterRef("user"),
                            challenge_approval__in=["UNAPPROVED", "APPROVED"])

        if destination:
            memories_filter &= Q(geo_location=destination)
            checkins_filter &= Q(geo_location=destination)
        elif sponsor:
            memories_filter &= Q(sponsor=sponsor)
            checkins_filter &= Q(geo_challenge__sponsor=sponsor)

        # Sum ARMemories
        memories_sq = (
            ARMemories.objects
            .filter(memories_filter)
            .values("user")
            .annotate(
                total=Sum(
                    Case(
                        When(memory_type__in=['PHOTO', 'VIDEO', 'BONUS', 'SCAN_PHOTO', 'STAR', 'SOCIAL_POINTS',],
                             then=F('points')),
                        When(memory_type='DEDUCTED',
                             then=F('points') * Value(-1)),
                        default=Value(0),
                        output_field=IntegerField(),
                    )
                )
            )
            .values("total")
        )

        # Sum ARSitePinCheckIn
        checkins_sq = (
            ARSitePinCheckIn.objects
            .filter(checkins_filter)
            .values("user")
            .annotate(total=Sum("points"))
            .values("total")
        )

        # Save totals and sum
        qs = qs.annotate(
            memories_points=Coalesce(
                Subquery(memories_sq, output_field=IntegerField()),
                Value(0),
            ),
            checkin_points=Coalesce(
                Subquery(checkins_sq, output_field=IntegerField()),
                Value(0),
            ),
        ).annotate(
            calculated_points=F("memories_points") + F("checkin_points")
        )

        qs = qs.order_by("-calculated_points", "-updated_at", "user__id")  #, "user__id"
        return qs

    def row_number(self, obj):
        return next(self._row_counter)
    row_number.short_description = "#"
    row_number.admin_order_field = None

    def calculated_points(self, obj):
        return getattr(obj, "calculated_points", obj.points)
    calculated_points.short_description = "Calculated Points"
    calculated_points.admin_order_field = "calculated_points"

    def add_ar_memory(self, obj):
        info = (ARMemories._meta.app_label, ARMemories._meta.model_name)
        base_url = reverse(f"admin:{info[0]}_{info[1]}_add")
        params = {
            "user": obj.user.id,
            "challenge_approval": "APPROVED",
        }
        # If there is a filter active
        destination = getattr(self, "_cl_request", None) and self._cl_request.GET.get("destination")
        if destination:
            params["geo_location"] = destination

        url = f"{base_url}?{urlencode(params)}"
        return format_html('<a href="{}"> ADD AR Memory</a>', url)

    add_ar_memory.short_description = "Add AR Memory"
    add_ar_memory.allow_tags = True
