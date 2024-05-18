from .models import Challenges, Sponsor, ARUserProfile, ARMemories, ARSettings, ARExample, \
GeoArSite, GeoLocation
from .serializers import ARMemoriesSerializerGet, \
ChallengesSerializer, ChallengesUploadSerializer, SponsorSerializer, \
ARUserProfileSerializer, ARMemoriesSerializer, SettingsSerializer, ExamplesSerializer, \
GeoLocationSerializer, GeoArSiteSerializer
from rest_framework import viewsets
from rest_framework.viewsets import ViewSet
from rest_framework.parsers import FileUploadParser
from rest_framework.views import APIView
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework import authentication,permissions
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import F
from django.db.models import Q

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


class ARMemoriesViewSet(ViewSet):

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = ARMemories.objects.all()
    serializer_class = ARMemoriesSerializer
        
    parser_class = (FileUploadParser,)

    def get(self, request, *args, **kwargs):
        objs = self.queryset.filter(user = request.user.id)
        serializer = ARMemoriesSerializerGet(objs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'],url_path='check-challenge-done', name='Check Challenge')
    def check_challenge_done(self, request):
      user_id = self.request.user.id
      challenges_id = request.data.get("challenges")
      criterion1 = Q(user=user_id)
      criterion2 = Q(challenges=challenges_id)
      results = ARMemories.objects.filter(criterion1 & criterion2)
      challengeObj = Challenges.objects.get(pk=challenges_id)
      if len(results) < challengeObj.challenge_attempt:
        return Response({'message': "Challenge submission can be added more."}, status=status.HTTP_200_OK)
      else:
        return Response({'message': "Challenge experience already submitted and can't submitted more."}, status=status.HTTP_403_FORBIDDEN)
         
    def partial_update(self, request, *args, **kwargs):
      instance = self.queryset.get(pk=kwargs.get('pk'))
      serializer = self.serializer_class(instance, data=request.data, partial=True)
      serializer.is_valid(raise_exception=True)
      serializer.save()
      return Response(serializer.data)
        
    def create(self, request, *args, **kwargs):
      user_id = self.request.user.id
      request.data['user'] = user_id
      challenges_id = request.data.get("challenges")
      criterion1 = Q(user=user_id)
      criterion2 = Q(challenges=challenges_id)
      results = ARMemories.objects.filter(criterion1 & criterion2)
      challengeObj = Challenges.objects.get(pk=challenges_id)
      if len(results) < challengeObj.challenge_attempt:
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

    @action(detail=False, methods=['post'],url_path='update-ar-social-points', name='AR SOCIAL POINT UPDATE')
    def update_points_for_social(self, request):
        social_network = request.data.get("social_network","")
        profileObj, created = ARUserProfile.objects.get_or_create(user=self.request.user)
        profileObj.points =F('points')+SOCIAL_POINTS
        profileObj.save()
        return Response({'message': "Points are updated!"}, status=status.HTTP_200_OK)

    def list(self, request):
        obj, created = ARUserProfile.objects.get_or_create(user=self.request.user)
        serializer = ARUserProfileSerializer(obj)
        return Response(serializer.data)
		
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