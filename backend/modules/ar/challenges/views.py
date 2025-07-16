import json
import traceback

from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point, Polygon
from django.db import transaction, models
from django.db.models import Q, Count, Case, When, Value
from django.http import JsonResponse, HttpResponse

from modules.ar.challenges.models import GeoArSite, GeoARStarPoint
from modules.ar.challenges.serializers import GeoARSiteMarkerSerializer, \
    GeoARSiteMarkerSaveSerializer, GeoARStarPointMarkerSerializer, GeoARStarMarkerSaveSerializer

EDITOR_PAGESIZE = 100

def bound2poly(bound):
    ne, sw = bound[1], bound[0]
    bbox = (sw[0], sw[1], ne[0], ne[1])
    return Polygon.from_bbox(bbox)

def save_point_editor_changes(request):
    result = dict(sites=[])
    data = dict(result=result, message='Not authenticated or doesn\'t have permission')
    if request.user.is_staff:
        if request.method == 'POST':
            req = json.loads(request.body.decode('UTF-8'))

            try:
                sites_data, stars_data = req.get('sites', []), req.get('stars', [])
                with transaction.atomic():
                    sites = {s.id: s for s in GeoArSite.objects.filter(id__in=[r['id'] for r in sites_data]).all()}
                    for r in sites_data:
                        serializer = GeoARSiteMarkerSaveSerializer(data=r, instance=sites[int(r['id'])])
                        serializer.is_valid(raise_exception=True)
                        serializer.save()

                    stars = {s.id: s for s in GeoARStarPoint.objects.filter(id__in=[r['id'] for r in stars_data]).all()}
                    for r in stars_data:
                        serializer = GeoARStarMarkerSaveSerializer(data=r, instance=stars[int(r['id'])])
                        serializer.is_valid(raise_exception=True)
                        serializer.save()

                return JsonResponse(dict(success=True), safe=True)
            except (ValueError, KeyError, GeoArSite.DoesNotExist):
                data = dict(result=result, message='Wrong data sent, not saving!')

            except:
                traceback.print_exc()
                data = dict(result=result, message='Error saving, please try again')
        else:
            data = dict(result=result, message='Wrong method')
    return JsonResponse(data, safe=True)


def get_map_points_data(request):
    result = dict(sites=[])
    data = dict(result=result, message='Not authenticated or doesn\'t have permission')
    if request.user.is_staff:
        if request.method == 'POST':
            req = json.loads(request.body.decode('UTF-8'))
            try:
                ref_location = Point(-76.3077640167808, 36.907543889552024, srid=4326)
                poly = bound2poly(req['bounds']) if 'bounds' in req else None
                if poly:
                    ref_location = poly.centroid
                    ref_location.srid = 4326
                # center = Point(-76.3077640167808, 36.907543889552024, srid=4326)
                # PAGESIZE = 100
                marinas_flt = GeoArSite.objects
                marinas_flt = marinas_flt if poly is None else marinas_flt.filter(lat_long__contained=poly)
                if 'filter' in req:
                    fltr = req['filter'].strip()
                    if fltr != '':
                        marinas_flt = marinas_flt.filter(
                            Q(name__icontains=fltr) |
                            Q(description__icontains=fltr) |
                            Q(address_text__icontains=fltr) |
                            Q(band_user__name__icontains=fltr)
                        )
                # TODO text filter
                # TODO center
                # TODO page
                page = int(req['page'])
                start = EDITOR_PAGESIZE * (page - 1)

                marinas_flt = marinas_flt.annotate(distance=Distance("lat_long", ref_location))
                marinas_flt = marinas_flt.annotate(star_count=Count('geo_arstar_ar_site'))
                marinas_flt = marinas_flt.annotate(
                    type=Case(
                        When(
                            Q(band_user__isnull=True, star_count=0),
                            then=Value('simple')
                        ),
                        When(
                            Q(band_user__isnull=True, star_count__gt=0),
                            then=Value('stars')
                        ),
                        When(
                            Q(band_user__isnull=False, category__isnull=False, star_count=0),
                            then=Value('band')
                        ),
                        default=Value(None),  # Optional: sets a default value if no condition is met
                        output_field=models.CharField(),
                    )
                )
                if 'types' in req:
                    types = req['types']
                    marinas_flt = marinas_flt.filter(type__in=types)

                sites = marinas_flt.order_by("distance")
                sites = sites[start:start + EDITOR_PAGESIZE]
                star_q = GeoARStarPoint.objects.filter(geo_ar_star__geo_site__in=sites).select_related('geo_ar_star__geo_site').all()

                sites = GeoARSiteMarkerSerializer(instance=sites, many=True, context={'request': request}).data
                stars = GeoARStarPointMarkerSerializer(instance=star_q, many=True, context={'request': request}).data
                count = marinas_flt.count()
                data = dict(result=dict(sites=sites, stars=stars, total=count, page=page, pages=count // EDITOR_PAGESIZE + 1))
            except (ValueError, KeyError, GeoArSite.DoesNotExist):
                data = dict(result=result, message='Wrong data sent, not listing!')

            except:
                traceback.print_exc()
                data = dict(result=result, message='Error listing, please try again')
        else:
            data = dict(result=result, message='Wrong method')
    return JsonResponse(data, safe=True)



