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
        "user",
        # "points",                # Ar profile points
        # "memories_points",
        # "checkin_points",
        # "destination_points",    # memories_points + checkin_points
        # "sponsor_points",    # memories_points + checkin_points
        "calculated_points",    # memories_points + checkin_points
        "updated_at",
        "add_ar_memory"
    )
    list_filter = (DestinationFilter, SponsorFilter)
    # ordering = ("-points", "-updated_at")
    readonly_fields = (
        # "memories_points",
        # "checkin_points",
        # "destination_points",
        "calculated_points",
    )

    def changelist_view(self, request, extra_context=None):
        self._cl_request = request
        return super().changelist_view(request, extra_context)

    def get_queryset(self, request):
        self._row_counter = count(start=1)
        qs = super().get_queryset(request).select_related("user")
        # Using 0 when there is no filter
        qs = qs.annotate(
            memories_points=Value(0, output_field=IntegerField()),
            checkin_points=Value(0, output_field=IntegerField()),
        )
        memories_sq = None
        checkins_sq = None
        destination = request.GET.get("destination")
        sponsor = request.GET.get("sponsor")
        if destination:
            qs = qs.filter(
                Q(user__user_ar_memories__geo_location=destination) |
                Q(user__user_ar_site_checkin__geo_location=destination)
            ).distinct()

            # Sum calculation memories
            memories_sq = (
                ARMemories.objects
                .filter(
                    user=OuterRef("user"),
                    geo_location=destination,
                    challenge_approval__in=["UNAPPROVED", "APPROVED"]
                )
                .values("user")
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
            # Sum calculation check-ins
            checkins_sq = (
                ARSitePinCheckIn.objects
                .filter(
                    user=OuterRef("user"),
                    geo_location=destination,
                    challenge_approval__in=["UNAPPROVED", "APPROVED"]
                )
                .values("user")
                .annotate(total=Sum("points"))
                .values("total")
            )
        elif sponsor:
            qs = qs.filter(
                Q(user__user_ar_memories__sponsor=sponsor) |
                Q(user__user_ar_site_checkin__geo_challenge__sponsor=sponsor)
            ).distinct()

            # Sum calculation memories
            memories_sq = (
                ARMemories.objects
                .filter(
                    user=OuterRef("user"),
                    sponsor=sponsor,
                    challenge_approval__in=["UNAPPROVED", "APPROVED"]
                )
                .values("user")
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
                .values("total")
            )
            # Sum calculation check-ins
            checkins_sq = (
                ARSitePinCheckIn.objects
                .filter(
                    user=OuterRef("user"),
                    geo_challenge__sponsor=sponsor,
                    challenge_approval__in=["UNAPPROVED", "APPROVED"]
                )
                .values("user")
                .annotate(total=Sum("points"))
                .values("total")
            )
        if memories_sq is not None and checkins_sq is not None:
            qs = qs.annotate(
                memories_points=Coalesce(
                    Subquery(memories_sq, output_field=IntegerField()),
                    Value(0),
                ),
                checkin_points=Coalesce(
                    Subquery(checkins_sq, output_field=IntegerField()),
                    Value(0),
                ),
            )

            # Sum both memories_points and checkin_points
            qs = qs.annotate(
                calculated_points=ExpressionWrapper(
                    F("memories_points") + F("checkin_points"),
                    output_field=IntegerField(),
                )
            )

        # Order by destination_points if there is a filter else use ar profile points
        if destination or sponsor:
            qs = qs.order_by("-calculated_points", "-updated_at")
        else:
            qs = qs.order_by("-points", "-updated_at")

        return qs

    def row_number(self, obj):
        return next(self._row_counter)
    row_number.short_description = "#"
    row_number.admin_order_field = None

    # def memories_points(self, obj):
    #     return getattr(obj, "memories_points", 0)
    # memories_points.short_description = "Memories Points"
    # memories_points.admin_order_field = "memories_points"
    #
    # def checkin_points(self, obj):
    #     return getattr(obj, "checkin_points", 0)
    # checkin_points.short_description = "Check-in Points"
    # checkin_points.admin_order_field = "checkin_points"

    def calculated_points(self, obj):
        return getattr(obj, "calculated_points", obj.points)
    calculated_points.short_description = "Calculated Points"
    calculated_points.admin_order_field = "calculated_points"

    # def destination_points(self, obj):
    #     return getattr(obj, "destination_points", 0)
    # destination_points.short_description = "Destination Points"
    # destination_points.admin_order_field = "destination_points"
    #
    # def sponsor_points(self, obj):
    #     return getattr(obj, "sponsor_points", 0)
    # sponsor_points.short_description = "Sponsor Points"
    # sponsor_points.admin_order_field = "sponsor_points"

    def add_ar_memory(self, obj):
        info = (ARMemories._meta.app_label, ARMemories._meta.model_name)
        base_url = reverse(f"admin:{info[0]}_{info[1]}_add")
        params = {
            "user": obj.user.id,
            # "memory_type": "ADJUSTMENT",
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


        # url = (
        #     reverse('admin:{}_{}_add'.format(*info))
        #     + "?"
        #     + urlencode({"ar_memory": f"{obj.id}"})
        # )

