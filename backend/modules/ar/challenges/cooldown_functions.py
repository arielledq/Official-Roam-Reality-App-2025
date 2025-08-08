from modules.ar.challenges.models import ARSitePinCheckIn, ARMemories
from django.utils import timezone
from datetime import timedelta
from collections import Counter


def geo_cooldown_by_user(user, site, geo_challenge_id):

    now = timezone.now()
    window_start = now - timedelta(hours=site.cooldown_hours)
    qs = ARSitePinCheckIn.objects.filter(
        user=user,
        geo_challenge=geo_challenge_id,
        geo_site=site,
        created_at__gte=window_start
    ).order_by('created_at')

    if not qs.exists():
        return 0

    first_attempt = qs.filter(user_first_attempt=True).last()

    if not first_attempt:
        first_attempt = qs.last()
        first_attempt.user_first_attempt = True
        first_attempt.save()

    used = qs.filter(created_at__gte=first_attempt.created_at).count()
    if used < site.challenge_attempt:
        return 0

    cooldown_end = first_attempt.created_at + timedelta(hours=site.cooldown_hours)
    remaining = cooldown_end - now
    return str(remaining)


def hunt_cooldown_by_user(user, ar_star):
    now = timezone.now()
    window_start = now - timedelta(hours=ar_star.cooldown_hours)
    star_points = list(ar_star.stars.values_list('id', flat=True))  # all related star_point ids

    # Memories in window
    memories = ARMemories.objects.filter(
        user=user,
        star_point__in=star_points,
        created_at__gte=window_start,
        memory_type__in=['STAR', ],
    ).order_by('created_at')

    if not memories.exists():
        return 0

    first_attempt = memories.filter(user_first_attempt=True).last()

    if not first_attempt:
        # Set the first memory as the last attempt
        first_attempt = memories.last()
        first_attempt.user_first_attempt = True
        first_attempt.save()

    # Only count attempts from the first attempt forward
    relevant_memories = (memories.filter(created_at__gte=first_attempt.created_at)
                         .values_list('star_point_id', flat=True))
    star_point_count = Counter(relevant_memories)

    # Count how many full set are (min number of times that each star_point appeared)
    complete_sets = min([star_point_count.get(sp_id, 0) for sp_id in star_points])

    if complete_sets < ar_star.attempts:
        return 0
    cooldown_end = first_attempt.created_at + timedelta(hours=ar_star.cooldown_hours)
    if now < cooldown_end:
        remaining = cooldown_end - now
        return str(remaining)
    else:
        return 0


def scan_cooldown_by_user(user, scan):

    now = timezone.now()
    window_start = now - timedelta(hours=scan.cooldown_hours)
    qs = ARMemories.objects.filter(
        user=user,
        scan_picture=scan,
        created_at__gte=window_start,
        memory_type__in=['SCAN_PHOTO'],
    ).order_by('created_at')

    if not qs.exists():
        return 0

    first_attempt = qs.filter(user_first_attempt=True).last()

    if not first_attempt:
        first_attempt = qs.last()
        first_attempt.user_first_attempt = True
        first_attempt.save()

    used = qs.filter(created_at__gte=first_attempt.created_at).count()

    if used < scan.challenge_attempt:
        return 0
    cooldown_end = first_attempt.created_at + timedelta(hours=scan.cooldown_hours)
    remaining = cooldown_end - now
    return str(remaining)
