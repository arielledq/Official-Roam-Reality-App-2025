import json

from .models import Challenges, Sponsor, ARUserProfile, ARMemories, ARSettings, ARExample, \
    GeoArSite, GeoLocation, GeoARStar, ARSitePinCheckIn, GeoARChallenges, StarCollection, GeoARGoldStar, \
    DestinationFacts, PanicMessage
from .serializers import ARMemoriesSerializerGet, \
    ChallengesSerializer, ChallengesUploadSerializer, SponsorSerializer, \
    ARUserProfileSerializer, ARMemoriesSerializer, SettingsSerializer, ExamplesSerializer, GeoStarSerializer, \
    GeoLocationSerializer, GeoArSiteSerializer, ARSitePinCheckInSerializer, StarCollectionSerializer, \
    GoldStarCollectionSerializer, DestinationFactsSerializer, PanicMessageSerializer, ARAllMemories, \
    GeoStarPointSerializer
from rest_framework import viewsets
from rest_framework.viewsets import ViewSet
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
import datetime



SOCIAL_POINTS = 1


class SponsorViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for viewing and editing sponsors.
    """
    queryset = Sponsor.objects.all()
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
    queryset = ARMemories.objects.all()
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
        user_id = self.request.user.id
        challenges_id = request.data.get("challenges")
        # criterion1 = Q(user=user_id)
        # criterion2 = Q(challenges=challenges_id)
        # results = ARMemories.objects.filter(criterion1 & criterion2)
        # challengeObj = Challenges.objects.get(pk=challenges_id)
        # if len(results) < challengeObj.challenge_attempt:
        #     return Response({'message': "Challenge submission can be added more."}, status=status.HTTP_200_OK)
        # else:
        #     return Response({'message': "Challenge experience already submitted and can't submitted more."},
        #                     status=status.HTTP_403_FORBIDDEN)

        try:
            challenge_obj = Challenges.objects.get(pk=challenges_id)
        except Challenges.DoesNotExist:
            return Response(
                {'message': f'El challenge {challenges_id} no existe.'},
                status=status.HTTP_404_NOT_FOUND
            )

        results = ARMemories.objects.filter(user=user_id, challenges=challenges_id)

        if len(results) >= challenge_obj.challenge_attempt:
            return Response(
                {'message': "Challenge experience already submitted the maximum times."},
                status=status.HTTP_403_FORBIDDEN
            )
        last_memory = results.order_by('-created_at').first()
        if last_memory:
            cooldown_hours = getattr(challenge_obj, 'cooldown_hours', 24)
            cooldown_limit = last_memory.created_at + datetime.timedelta(hours=cooldown_hours)

            if timezone.now() < cooldown_limit:
                time_remaining = cooldown_limit - timezone.now()
                return Response(
                    {
                        'message': "You are still in cooldown period.",
                        'remaining': str(time_remaining)
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

        return Response(
            {'message': "Challenge can be submitted now."},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], url_path='check-geo-challenge-done', name='Check Geo Challenge')
    def check_geo_challenge_done(self, request):
        user_id = self.request.user.id
        geo_challenge_id = request.data.get("geo_challenge")
        # criterion1 = Q(user=user_id)
        # criterion2 = Q(geo_challenge=geo_challenge_id)
        # results = ARMemories.objects.filter(criterion1 & criterion2)
        # challengeObj = GeoARChallenges.objects.get(pk=geo_challenge_id)
        # if len(results) < challengeObj.challenge_attempt:
        #     return Response({'message': "Geo Challenge submission can be added more."}, status=status.HTTP_200_OK)
        # else:
        #     return Response({'message': "Geo Challenge experience already submitted and can't submitted more."},
        #                     status=status.HTTP_403_FORBIDDEN)

        try:
            challenge_obj = GeoARChallenges.objects.get(pk=geo_challenge_id)
        except Challenges.DoesNotExist:
            return Response(
                {'message': f'El challenge {geo_challenge_id} no existe.'},
                status=status.HTTP_404_NOT_FOUND
            )

        results = ARSitePinCheckIn.objects.filter(user=user_id, challenges=geo_challenge_id)

        if len(results) >= challenge_obj.challenge_attempt:
            return Response(
                {'message': "Challenge experience already submitted the maximum times."},
                status=status.HTTP_403_FORBIDDEN
            )
        last_check_in = results.order_by('-created_at').first()
        if last_check_in:
            cooldown_hours = getattr(challenge_obj, 'cooldown_hours', 24)
            cooldown_limit = last_check_in.created_at + datetime.timedelta(hours=cooldown_hours)

            if timezone.now() < cooldown_limit:
                time_remaining = cooldown_limit - timezone.now()
                return Response(
                    {
                        'message': "You are still in cooldown period.",
                        'remaining': str(time_remaining)
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

        return Response(
            {'message': "Challenge can be submitted now."},
            status=status.HTTP_200_OK
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
        if len(results) < challengeObj.challenge_attempt:
            serializer = ARMemoriesSerializer(data=request.data, partial=True)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'message': "Geo Challenge experience already submitted and can't submitted more."},
                            status=403)

    def create(self, request, *args, **kwargs):
        user_id = self.request.user.id
        request.data['user'] = user_id
        challenges_id = request.data.get("challenges")
        criterion1 = Q(user=user_id)
        criterion2 = Q(challenges=challenges_id)
        results = ARMemories.objects.filter(criterion1 & criterion2)
        challengeObj = Challenges.objects.get(pk=challenges_id)
        if len(results) < challengeObj.challenge_attempt:
            request.data['points'] = challengeObj.points
            serializer = ARMemoriesSerializer(data=request.data, partial=True)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'message': "Challenge experience already submitted and can't submitted more."}, status=403)


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
        social_network = request.data.get("social_network", "")
        profileObj, created = ARUserProfile.objects.get_or_create(user=self.request.user)
        profileObj.points = F('points') + SOCIAL_POINTS
        profileObj.save()
        return Response({'message': "Points are updated!"}, status=status.HTTP_200_OK)

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
    queryset = Challenges.objects.all()
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
    queryset = GeoLocation.objects.all().order_by('sequence_number')
    serializer_class = GeoLocationSerializer
    http_method_names = ["get"]


class GeoArSiteViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for viewing and editing GeoArSite.
    """
    queryset = GeoArSite.objects.all()
    serializer_class = GeoArSiteSerializer
    http_method_names = ["get"]


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
        objs = self.queryset.filter(geo_site=id)
        serializer = GeoStarSerializer(objs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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
        ar_star = self.queryset.filter(geo_site=geo_site_id).first()

        if not ar_star:
            return Response({"detail": "Ar Star not found"}, status=status.HTTP_400_BAD_REQUEST)

        user_location = Point(float(lon), float(lat), srid=4326)
        visited_points = StarCollection.objects.filter(user=request.user).values_list('geo_ar_star_point_id', flat=True)
        remaining_stars = ar_star.stars.exclude(id__in=visited_points)

        if ar_star.following_mode == 'PROXIMITY':
            remaining_stars = remaining_stars.annotate(distance=Distance('location', user_location)).order_by('distance')
        elif ar_star.following_mode == 'SPECIFIC':
            remaining_stars = remaining_stars.order_by('order')

        if remaining_stars.exists():
            selected_start = remaining_stars.first()
            return Response(GeoStarPointSerializer(selected_start, context={'request': request}).data, status=status.HTTP_200_OK)

        return Response({"detail": "No more stars available"}, status=status.HTTP_200_OK)


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
        print(user_id)
        criterion1 = Q(user=user_id)
        qs = ARSitePinCheckIn.objects.filter(criterion1)
        print(qs)
        countryArray = {}
        count = 0
        for item in qs:
            if item.geo_site.geo_location not in countryArray:
                countryArray[item.geo_site.geo_location] = True
                count += 1

        print(countryArray)
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
        if len(results) < challengeObj.challenge_attempt:
            request.data['points'] = challengeObj.points
            serializer = ARSitePinCheckInSerializer(data=request.data, partial=True)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                geosite.check_ins = F('check_ins') + 1
                geosite.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'message': "Challenge experience already submitted and can't submitted more."}, status=403)


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
        from django.contrib.gis.geos import Point
        pnt = Point(longitude, latitude)
        request.data['point'] = pnt
        serializer = StarCollectionSerializer(data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
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


class MemoryCheckinViewSet(ViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request):
        try:
            all_user_check_in = ARSitePinCheckIn.objects.filter(user=request.user.id)
            all_user_memories = ARMemories.objects.filter(user=request.user.id)
            serializer = ARAllMemories([*all_user_check_in, *all_user_memories], many=True)

            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
