import json
import math
from itertools import chain
from operator import attrgetter
import requests
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiParameter, OpenApiExample, extend_schema
from rest_framework.pagination import PageNumberPagination

from configuration import configs
from travel_ar_app_42706 import settings
from .cooldown_functions import geo_cooldown_by_user, scan_cooldown_by_user, hunt_cooldown_by_user
from .filters import CategoryFilterSet, ArSiteFilterSet
from .models import Challenges, Sponsor, ARUserProfile, ARMemories, ARSettings, ARExample, \
    GeoArSite, GeoLocation, GeoARStar, ARSitePinCheckIn, GeoARChallenges, StarCollection, GeoARGoldStar, \
    DestinationFacts, PanicMessage, GeoArSiteCategory, ScanPicture, GeoARStarPoint
from .serializers import ARMemoriesSerializerGet, \
    ChallengesSerializer, ChallengesUploadSerializer, SponsorSerializer, \
    ARUserProfileSerializer, ARMemoriesSerializer, SettingsSerializer, ExamplesSerializer, GeoStarSerializer, \
    GeoLocationSerializer, GeoArSiteSerializer, ARSitePinCheckInSerializer, StarCollectionSerializer, \
    GoldStarCollectionSerializer, DestinationFactsSerializer, PanicMessageSerializer, \
    GeoStarPointSerializer, GeoArSiteCategorySerializer, ARAllMemoriesSerializer, GeoLocationMiniSerializer, \
    ElevationRequestSerializer, ARScanSerializer
from rest_framework import viewsets, exceptions
from rest_framework.viewsets import ViewSet, GenericViewSet
from rest_framework.parsers import FileUploadParser, FormParser
from rest_framework.views import APIView
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework import authentication, permissions
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import F
from django.db.models import Q
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point
from django.utils import timezone
from datetime import timedelta
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.gis.geos import Point
from collections import Counter


SOCIAL_POINTS = 1


class SponsorViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for viewing and editing sponsors.
    """
    queryset = Sponsor.objects.filter(is_active=True)
    serializer_class = SponsorSerializer
    http_method_names = ["get"]


class ARSettingsViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for viewing and editing settings.
    """
    queryset = ARSettings.objects.all()
    serializer_class = SettingsSerializer
    http_method_names = ["get"]


class ARExamplesViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for viewing and editing settings.
    """
    queryset = ARExample.objects.all()
    serializer_class = ExamplesSerializer
    http_method_names = ["get"]

    @action(detail=False, methods=['get'], url_path='get-by-geo-ar-id', name='AR Geo')
    def get_by_geoar(self, request):
        id = request.GET.get("id")
        objs = self.queryset.filter(geo_challenges=id)
        serializer = ExamplesSerializer(objs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='get-by-any-ar-id', name='AR AnyWhere')
    def get_by_anywhere(self, request):
        id = request.GET.get("id")
        objs = self.queryset.filter(any_where_challenges=id)
        serializer = ExamplesSerializer(objs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PanicMessageViewSet(ViewSet):
    """
    A simple ViewSet for viewing and editing settings.
    """
    queryset = PanicMessage.objects.all()
    serializer_class = PanicMessageSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user_id = self.request.user.id
        request.data['user'] = user_id
        latitude = request.data.get("latitude")
        longitude = request.data.get("longitude")
        if latitude and longitude:
            from django.contrib.gis.geos import Point
            pnt = Point(longitude, latitude)
            request.data['location'] = pnt
        serializer = PanicMessageSerializer(data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ARMemoriesViewSet(ViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = ARMemories.objects.filter(memory_type__in=['PHOTO', 'VIDEO', 'SCAN_PHOTO'])
    serializer_class = ARMemoriesSerializer
    parser_class = (FileUploadParser,)

    @action(detail=False, methods=['get'], url_path='public', name='public Memories')
    def public(self, request, *args, **kwargs):
        objs = self.queryset.filter(user=request.GET.get("user_id"))
        serializer = ARMemoriesSerializerGet(objs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def get(self, request, *args, **kwargs):
        objs = self.queryset.filter(user=request.user.id)
        serializer = ARMemoriesSerializerGet(objs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='check-challenge-done', name='Check Challenge')
    def check_challenge_done(self, request):
        user = request.user
        challenge_id = request.data.get("challenges")

        try:
            challenge = Challenges.objects.get(pk=challenge_id)
        except Challenges.DoesNotExist:
            return Response(
                {'message': f'Challenge {challenge_id} does not exist.'},
                status=status.HTTP_404_NOT_FOUND
            )
        now = timezone.now()
        window_start = now - timedelta(hours=challenge.cooldown_hours)
        qs = ARMemories.objects.filter(
            user=user,
            challenges=challenge,
            created_at__gte=window_start,
            memory_type__in=['PHOTO', 'VIDEO'],
        ).order_by('created_at')

        if not qs.exists():
            return Response(
                {"message": "Challenge can be submitted now."},
                status=status.HTTP_200_OK
            )

        first_attempt = qs.filter(user_first_attempt=True).last()

        if not first_attempt:
            first_attempt = qs.last()
            first_attempt.user_first_attempt = True
            first_attempt.save()

        used = qs.filter(created_at__gte=first_attempt.created_at).count()
        if used < challenge.challenge_attempt:
            return Response(
                {"message": "Challenge can be submitted now."},
                status=status.HTTP_200_OK
            )

        cooldown_end = first_attempt.created_at + timedelta(hours=challenge.cooldown_hours)
        remaining = cooldown_end - now
        return Response(
            {
                "message": "You are still in cooldown period.",
                "remaining": str(remaining)
            },
            status=status.HTTP_403_FORBIDDEN
        )

    @action(detail=False, methods=['post'], url_path='check-geo-challenge-done', name='Check Geo Challenge')
    def check_geo_challenge_done(self, request):
        user = request.user
        geo_challenge_id = request.data.get("geo_challenge")
        geo_site_id = request.data.get("geo_site")

        try:
            GeoARChallenges.objects.get(pk=geo_challenge_id)
            site_obj = GeoArSite.objects.get(pk=geo_site_id)
        except GeoARChallenges.DoesNotExist:
            return Response(
                {'message': f'GeoChallenge or site does not exist.'},
                status=status.HTTP_404_NOT_FOUND
            )

        cooldown = geo_cooldown_by_user(user, site_obj, geo_challenge_id)

        if cooldown == 0:
            return Response(
                {"message": "GeoChallenge can be submitted now."},
                status=status.HTTP_200_OK
            )

        return Response(
            {
                "message": "You are still in cooldown period.",
                "remaining": cooldown
            },
            status=status.HTTP_403_FORBIDDEN
        )

    @action(detail=False, methods=['post'], url_path='check-scan-done', name='Check Scan')
    def check_scan_done(self, request):
        user = request.user
        scan_id = request.data.get("scans")

        try:
            scan = ScanPicture.objects.get(pk=scan_id)
        except ScanPicture.DoesNotExist:
            return Response(
                {'message': f'ScanPicture {scan_id} does not exist.'},
                status=status.HTTP_404_NOT_FOUND
            )

        cooldown = scan_cooldown_by_user(user, scan)
        if cooldown == 0:
            return Response(
                {"message": "Scans can be submitted now."},
                status=status.HTTP_200_OK
            )

        return Response(
            {
                "message": "You are still in cooldown period.",
                "remaining": cooldown
            },
            status=status.HTTP_403_FORBIDDEN
        )

    @action(detail=False, methods=['post'], url_path='check-star-done', name='Check Star Cooldown')
    def check_star_done(self, request):
        user = request.user
        ar_star_id = request.data.get("ar_star")

        try:
            ar_star = GeoARStar.objects.get(pk=ar_star_id)
        except GeoARStar.DoesNotExist:
            return Response(
                {'message': f'GeoARStar {ar_star_id} does not exist.'},
                status=status.HTTP_404_NOT_FOUND
            )

        cooldown = hunt_cooldown_by_user(user, ar_star)
        if cooldown == 0:
            return Response(
                {"message": "Hunt can be submitted now."},
                status=status.HTTP_200_OK
            )

        return Response(
            {
                "message": "You are still in cooldown period.",
                "remaining": cooldown
            },
            status=status.HTTP_403_FORBIDDEN
        )

    def partial_update(self, request, *args, **kwargs):
        instance = self.queryset.get(pk=kwargs.get('pk'))
        serializer = self.serializer_class(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='check-geo-challenge-create', name='Create Geo Challenge')
    def create_geo(self, request, *args, **kwargs):
        user_id = self.request.user.id
        request.data['user'] = user_id
        geo_challenge_id = request.data.get("geo_challenge")
        criterion1 = Q(user=user_id)
        criterion2 = Q(geo_challenge=geo_challenge_id)
        results = ARMemories.objects.filter(criterion1 & criterion2)
        challengeObj = GeoARChallenges.objects.get(pk=geo_challenge_id)
        request.data['geo_location'] = challengeObj.ar_experience.geo_location.id
        serializer = ARMemoriesSerializer(data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request, *args, **kwargs):
        user_id = self.request.user.id
        request.data['user'] = user_id
        memory_type = request.data.get("memory_type", None)
        if memory_type in ['PHOTO', 'VIDEO',]:
            challenges_id = request.data.get("challenges")
            criterion1 = Q(user=user_id)
            criterion2 = Q(challenges=challenges_id)
            results = ARMemories.objects.filter(criterion1 & criterion2)
            challengeObj = Challenges.objects.get(pk=challenges_id)
            # if len(results) < challengeObj.challenge_attempt:
            request.data['points'] = challengeObj.points
            request.data['geo_location'] = challengeObj.ar_experience.geo_location.id
        elif memory_type == 'SCAN_PHOTO':
            scan_id = request.data.get("scan_id")
            scan = ScanPicture.objects.get(pk=scan_id)
            request.data['points'] = scan.points
            request.data['scan_picture'] = scan_id
        serializer = ARMemoriesSerializer(data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        # else:
        #     return Response({'message': "Challenge experience already submitted and can't submitted more."}, status=403)


class ARProfileViewSet(ViewSet):
    """Based on rest_framework.authtoken.views.ObtainAuthToken"""

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = ARUserProfile.objects.all()
    serializer_class = ARUserProfileSerializer

    @action(detail=False, methods=['post'], url_path='update-user-point', name='AR POINT UPDATE')
    def update_user_points(self, request):
        points = request.data.get("points", 0)
        profileObj, created = ARUserProfile.objects.get_or_create(user=self.request.user)
        profileObj.points = F('points') + points
        profileObj.save()
        return Response({'message': "Points are updated!"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='update-ar-social-points', name='AR SOCIAL POINT UPDATE')
    def update_points_for_social(self, request):
        data = request.data
        challenge_id = data.get("challenges")
        geo_location_id = data.get("geo_location")
        geo_challenge_id = data.get("geo_challenge")
        scan_id = data.get("scan_id")
        sponsor_id = data.get("sponsor")

        if not (challenge_id or geo_challenge_id or scan_id):
            return Response({'error': "At least challenge_id, geo_challenge_id or scan_id must "
                                      "be provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            challenge = get_object_or_404(Challenges, pk=challenge_id) if challenge_id else None
            geo_location = get_object_or_404(GeoLocation, pk=geo_location_id) if geo_location_id else None
            sponsor = get_object_or_404(Sponsor, pk=sponsor_id) if sponsor_id else None
            geo_challenge = get_object_or_404(GeoARChallenges, pk=geo_challenge_id) if geo_challenge_id else None
            scan = get_object_or_404(ScanPicture, pk=scan_id) if scan_id else None

            ARMemories.objects.create(
                user=request.user,
                memory_type='SOCIAL_POINTS',
                challenges=challenge,
                sponsor=sponsor,
                geo_challenge=geo_challenge,
                geo_location=geo_location,
                points=SOCIAL_POINTS,
                scan_picture=scan,
            )

            return Response({'message': "Points have been updated successfully!"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='update-user-location', name='Update User Location')
    def update_user_location(self, request, *args, **kwargs):
        user_id = self.request.user.id
        request.data['user'] = user_id
        profileObj, created = ARUserProfile.objects.get_or_create(user=self.request.user)
        latitude = request.data.get("latitude")
        longitude = request.data.get("longitude")
        from django.contrib.gis.geos import Point
        pnt = Point(longitude, latitude)
        profileObj.current_location = pnt
        profileObj.save()
        return Response({'message': "Location Points are updated!"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='public', name='AR Public')
    def public(self, request):
        obj, created = ARUserProfile.objects.get_or_create(user=request.GET.get("user_id"))
        serializer = ARUserProfileSerializer(obj)
        return Response(serializer.data)

    def list(self, request):
        obj, created = ARUserProfile.objects.get_or_create(user=self.request.user)
        serializer = ARUserProfileSerializer(obj)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='get-rank', name='Get User Rank')
    def get_rank(self, request, *args, **kwargs):
        from django.db.models import F, Window
        from django.db.models.functions import Rank
        user_id = request.data.get("user_id")
        qs = ARUserProfile.objects.all(
        ).annotate(
            rank=Window(
                expression=Rank(),
                order_by=F('points').desc(),
            )
        )
        for item in qs:
            print(item.rank)
            print(item.user.id)
            if item.user.id == user_id:
                return Response({"rank": item.rank}, status=status.HTTP_200_OK)

        return Response({"rank": 0}, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        instance = self.queryset.get(pk=kwargs.get('pk'))
        serializer = self.serializer_class(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ChallengesViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for viewing and editing challenges.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Challenges.objects.filter(is_active=True)
    serializer_class = ChallengesSerializer
    http_method_names = ["get"]


class ChallengesUploadView(APIView):
    parser_class = (FileUploadParser,)

    def post(self, request, *args, **kwargs):
        challenges_serializer = ChallengesUploadSerializer(data=request.data, partial=True)
        try:
            if challenges_serializer.is_valid(raise_exception=True):
                challenges_serializer.save()
                return Response(challenges_serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(challenges_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(e.args[0], status=status.HTTP_400_BAD_REQUEST)


class GeoLocationViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for viewing and editing GeoLocation.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = GeoLocation.objects.filter(is_active=True).order_by('sequence_number')
    serializer_class = GeoLocationSerializer
    http_method_names = ["get"]


class GeoLocationMiniViewSet(GeoLocationViewSet):
        """
        A simple ViewSet for viewing and editing GeoLocation.
        """
        serializer_class = GeoLocationMiniSerializer


class GeoArSiteCategoryViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for listing all categories for GeoArSite.
    """
    queryset = GeoArSiteCategory.objects.all()
    serializer_class = GeoArSiteCategorySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = CategoryFilterSet
    http_method_names = ["get"]

    def get_queryset(self):
        qs = super().get_queryset()
        if geo_site_id := self.request.query_params.get('site_id'):
            qs = qs.filter(geo_sites__in=[geo_site_id])
        return qs


class GeoArSiteViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for viewing and editing GeoArSite.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = GeoArSite.objects.all()
    serializer_class = GeoArSiteSerializer


class GeoArStarViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for viewing and editing GeoArSite.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = GeoARStar.objects.all()
    serializer_class = GeoStarSerializer
    http_method_names = ["get"]

    @action(detail=False, methods=['get'], url_path='get-by-site-id', name='AR Site Stars')
    def get_by_ar_site(self, request):
        id = request.GET.get("id")
        star_zones = self.queryset.filter(geo_site=id)
        star_count = 0
        for star_zone in star_zones:
            star_count += star_zone.stars.count()
        return Response({"stars": star_count}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='get-stars-sites', name='AR Site Stars')
    def get_ar_star_sites(self, request):
        id = request.GET.get("id")
        objs = self.queryset.filter(geo_site__geo_location=id)
        return Response({len(objs)}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='get-hidden-stars', name='AR Site Hidden Stars')
    def get_hidden_ar_star(self, request):
        id = request.GET.get("id")
        objs = self.queryset.filter(geo_site__geo_location=id)
        count = 0
        for o in objs:
            if o.stars:
                count += len(o.stars.all())
        return Response({count}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='get-hidden-stars', name='AR Site Hidden Stars')
    def get_hidden_ar_star(self, request):
        id = request.GET.get("id")
        objs = self.queryset.filter(geo_site__geo_location=id)
        count = 0
        for o in objs:
            if o.stars:
                count += len(o.stars.all())
        return Response({count}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='get-next-star', name='AR Site Stars')
    def get_next_star(self, request):
        lat = request.GET.get("lat")
        lon = request.GET.get("lon")
        geo_site_id = request.GET.get("geo_site_id")

        if not lat or not lon or not geo_site_id:
            return Response(
                {"error": "Lat, lon and geo_site_id parameters are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            geo_site_id = int(geo_site_id)
        except (ValueError, TypeError):
            return Response({"error": "geo_site_id must be an integer."}, status=status.HTTP_400_BAD_REQUEST)

        ar_star = self.queryset.filter(geo_site=geo_site_id).first()

        if not ar_star:
            return Response({"detail": "Ar Star not found"}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()
        window_start = now - timedelta(hours=ar_star.cooldown_hours)

        user_location = Point(float(lon), float(lat), srid=4326)
        total_stars = ar_star.stars.count()
        collections = StarCollection.objects.filter(
            user=request.user,
            created_at__gte=window_start,
        ).order_by('created_at')

        collected_ids = list(collections.values_list('geo_ar_star_point_id', flat=True))

        grouped = [
            collected_ids[i:i + total_stars]
            for i in range(0, len(collected_ids), total_stars)
        ]
        attempts_done = len([g for g in grouped if len(g) == total_stars])

        if attempts_done >= ar_star.attempts:
            return Response({"detail": "All attempts completed"}, status=status.HTTP_200_OK)

        stars_captured_this_attempt = collected_ids[attempts_done * total_stars:]
        remaining_stars = ar_star.stars.exclude(id__in=stars_captured_this_attempt)

        if ar_star.following_mode == 'PROXIMITY':
            remaining_stars = remaining_stars.annotate(distance=Distance('location', user_location)).order_by(
                'distance')
        elif ar_star.following_mode == 'SPECIFIC':
            remaining_stars = remaining_stars.order_by('order')

        next_star = remaining_stars.first()
        return Response({
            "attempt_number": attempts_done + 1,
            "star": GeoStarPointSerializer(next_star, context={'request': request}).data
        }, status=status.HTTP_200_OK)


class ARSitePinCheckInViewSet(ViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = ARSitePinCheckIn.objects.all()
    serializer_class = ARSitePinCheckInSerializer

    parser_class = (FileUploadParser,)

    def get(self, request, *args, **kwargs):
        objs = self.queryset.filter(user=request.user.id)
        serializer = ARSitePinCheckInSerializer(objs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='check-in-done', name='Check Check-ins')
    def check_in_done(self, request):
        user_id = self.request.user.id
        geo_site = request.data.get("geo_site")
        criterion1 = Q(user=user_id)
        criterion2 = Q(geo_site=geo_site)
        results = ARSitePinCheckIn.objects.filter(criterion1 & criterion2)
        if len(results) < 1:
            return Response({'message': "Check-ins submission can be added."}, status=status.HTTP_200_OK)
        else:
            return Response({'message': "Check-ins already submitted and can't submitted more."},
                            status=status.HTTP_403_FORBIDDEN)

    @action(detail=False, methods=['post'], url_path='check-in-count', name='Check Check-ins')
    def check_in_count(self, request):
        user_id = self.request.user.id
        geo_site = request.data.get("geo_site")
        criterion1 = Q(user=user_id)
        criterion2 = Q(geo_site=geo_site)
        count = ARSitePinCheckIn.objects.filter(criterion1 & criterion2).count()
        return Response({'count': count}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='check-in-all-count', name='Check Check-ins')
    def check_in_all_count(self, request):
        user_id = self.request.user.id
        criterion1 = Q(user=user_id)
        count = ARSitePinCheckIn.objects.filter(criterion1).count()
        return Response({'count': count}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='country-checkins-count', name='Check Country Check-ins')
    def country_checkins(self, request):
        user_id = request.data.get("user_id")
        criterion1 = Q(user=user_id)
        qs = ARSitePinCheckIn.objects.filter(criterion1)
        countryArray = {}
        count = 0
        for item in qs:
            if item.geo_site.geo_location not in countryArray:
                countryArray[item.geo_site.geo_location] = True
                count += 1

        return Response({'count': count}, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        instance = self.queryset.get(pk=kwargs.get('pk'))
        serializer = self.serializer_class(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        user_id = self.request.user.id
        request.data['user'] = user_id
        geo_site = request.data.get("geo_site")
        geo_challenge_id = request.data.get("geo_challenge")
        criterion1 = Q(user=user_id)
        criterion2 = Q(geo_site=geo_site)
        results = ARSitePinCheckIn.objects.filter(criterion1 & criterion2)
        challengeObj = GeoARChallenges.objects.get(pk=geo_challenge_id)
        geosite = GeoArSite.objects.get(pk=geo_site)
        request.data['points'] = challengeObj.points
        request.data['geo_location'] = challengeObj.ar_experience.geo_location.id
        serializer = ARSitePinCheckInSerializer(data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            geosite.check_ins = F('check_ins') + 1
            geosite.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StarCollectionViewSet(ViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = StarCollection.objects.all()
    serializer_class = StarCollectionSerializer

    @action(detail=False, methods=['post'], url_path='site-stars', name='Check site-stars')
    def site_stars(self, request):
        user_id = self.request.user.id
        geo_site = request.data.get("geo_site")
        criterion1 = Q(user=user_id)
        criterion2 = Q(geo_site=geo_site)
        objs = self.queryset.filter(criterion1 & criterion2)
        serializer = StarCollectionSerializer(objs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='star-count', name='Check star-count')
    def star_count(self, request):
        user_id = self.request.user.id
        geo_site = request.data.get("geo_site")
        criterion1 = Q(user=user_id)
        criterion2 = Q(geo_site=geo_site)
        count = StarCollection.objects.filter(criterion1 & criterion2).count()
        return Response({'count': count}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='all-count', name='Check all-count')
    def call_count(self, request):
        user_id = self.request.user.id
        criterion1 = Q(user=user_id)
        count = StarCollection.objects.filter(criterion1).count()
        return Response({'count': count}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='user-stars-count', name='Check all-count')
    def star_call_count(self, request):
        user_id = request.data.get("user_id")
        criterion1 = Q(user=user_id)
        count = StarCollection.objects.filter(criterion1).count()
        return Response({'count': count}, status=status.HTTP_200_OK)

    def get(self, request, *args, **kwargs):
        objs = self.queryset.filter(user=request.user.id)
        serializer = StarCollectionSerializer(objs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        user_id = self.request.user.id
        request.data['user'] = user_id
        geo_site = request.data.get("geo_site")
        geo_ar_star = request.data.get("geo_ar_star")
        geo_ar_star_point = request.data.get("geo_ar_star_point")
        latitude = request.data.get("latitude")
        longitude = request.data.get("longitude")
        pnt = Point(longitude, latitude)
        request.data['point'] = pnt
        serializer = StarCollectionSerializer(data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            star_point = GeoARStarPoint.objects.filter(id=geo_ar_star_point).first()
            site = GeoArSite.objects.filter(id=geo_site).first()
            ARMemories.objects.create(
                user=request.user,
                memory_type='STAR',
                geo_challenge=site.pin_challenge,
                geo_location=site.geo_location,
                points=star_point.points,
                star_point=star_point,
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GoldStarCollectionViewSet(ViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = GeoARGoldStar.objects.all()
    serializer_class = GoldStarCollectionSerializer

    @action(detail=False, methods=['post'], url_path='destination-stars', name='Check destination-stars')
    def destination_stars(self, request):
        destination = request.data.get("destination_id")
        criterion = Q(geo_location=destination)
        objs = self.queryset.filter(criterion)
        serializer = GoldStarCollectionSerializer(objs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DestinationFactsViewSet(ViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = DestinationFacts.objects.all()
    serializer_class = DestinationFactsSerializer

    @action(detail=False, methods=['post'], url_path='by-destination-id', name='Check destination-facts')
    def destination_facts(self, request):
        destination = request.data.get("destination_id")
        criterion = Q(geo_location=destination)
        objs = self.queryset.filter(criterion)
        serializer = DestinationFactsSerializer(objs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def get_all(self, request):
        objs = self.queryset.all()
        serializer = DestinationFactsSerializer(objs, many=True)
        return Response(serializer.data)

class CustomMemoryPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        total_record = self.page.paginator.count
        page_size = self.get_page_size(self.request) or self.page.paginator.per_page
        total_pages_count = math.ceil(total_record / page_size) if page_size else 1
        total_pages = list(range(1, total_pages_count + 1))
        return Response({
            'total_record': total_record,
            'page_size': page_size,
            'current_page': self.page.number,
            'total_pages': total_pages,
            'results': data
        })

class MemoryCheckinViewSet(GenericViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    pagination_class = CustomMemoryPagination
    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='page_size',
                type=int,
                location=OpenApiParameter.QUERY,
                description='Number of records to return per page',
                required=False,
                examples=[
                    OpenApiExample(
                        'page_size',
                        summary='Show 10 records per page',
                        value=10,
                    )
                ]
            ),
            OpenApiParameter(
                name='page',
                type=int,
                location=OpenApiParameter.QUERY,
                description='Page number for pagination',
                required=False,
                examples=[
                    OpenApiExample(
                        'page',
                        summary='Go to page 2',
                        value=1,
                    )
                ]
            ),
        ]
    )
    def list(self, request):
        try:
            all_user_check_in = ARSitePinCheckIn.objects.filter(user=request.user.id)
            all_user_memories = ARMemories.objects.filter(user=request.user.id)
            result_list = sorted(
                chain(all_user_check_in, all_user_memories),
                key=attrgetter('created_at'),
                reverse=True
            )
            page = self.paginate_queryset(result_list)
            if page is not None:
                serializer = ARAllMemoriesSerializer(page, many=True, context={'request': request})
                return self.get_paginated_response(serializer.data)
            serializer = ARAllMemoriesSerializer(result_list, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='public', name='AR Public')
    def public(self, request):
        try:
            user = request.GET.get("user_id")
            all_user_check_in = ARSitePinCheckIn.objects.filter(user=user)
            all_user_memories = ARMemories.objects.filter(user=user, memory_type__in=['PHOTO', 'VIDEO', 'SCAN_PHOTO'])
            result_list = sorted(
                chain(all_user_check_in, all_user_memories),
                key=attrgetter('created_at'),
                reverse=True
            )
            serializer = ARAllMemoriesSerializer(
                result_list,
                many=True,
                context={'request': request}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ArSiteViewSet(viewsets.GenericViewSet, viewsets.mixins.ListModelMixin,):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = GeoArSite.objects.filter(is_active=True)
    serializer_class = GeoArSiteSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ArSiteFilterSet


class ElevationAPIView(APIView):

    def get(self, request, format=None):
        serializer = ElevationRequestSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        lat = serializer.validated_data['lat']
        lng = serializer.validated_data['lng']

        # Tilequery URL API for Mapbox tileset
        url = f"https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/{lng},{lat}.json"
        params = {
            "layers": "contour",
            "limit": 5,
            "access_token": settings.MAPBOX_TOKEN
        }

        try:
            resp = requests.get(url, params=params)
            resp.raise_for_status()
        except requests.RequestException as e:
            return Response(
                {"error": "Error while trying to connect to Mapbox", "details": str(e)},
                status=status.HTTP_502_BAD_GATEWAY
            )

        data = resp.json()
        features = data.get("features", [])
        # Get all elevation and using the highest one
        elevations = [
            feat["properties"]["ele"]
            for feat in features
            if "properties" in feat and "ele" in feat["properties"]
        ]
        if not elevations:
            return Response({"elevation": None}, status=status.HTTP_204_NO_CONTENT)

        elevation = max(elevations)
        return Response({"elevation": elevation}, status=status.HTTP_200_OK)
