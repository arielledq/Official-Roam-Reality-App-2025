from .models import Challenges, Sponsor, Resource3dModel, ARUserProfile, ARMemories
from .serializers import ChallengesSerializer, ChallengesUploadSerializer, SponsorSerializer, Resource3dModelSerializer, ARUserProfileSerializer, ARMemoriesSerializer
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

class Resource3dModelViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for viewing and editing accounts.
    """
    queryset = Resource3dModel.objects.all()
    serializer_class = Resource3dModelSerializer
    http_method_names = ["get"]


class SponsorViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for viewing and editing accounts.
    """
    queryset = Sponsor.objects.all()
    serializer_class = SponsorSerializer
    http_method_names = ["get"]

class ARMemoriesViewSet(ViewSet):

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = ARMemories.objects.all()
    serializer_class = ARMemoriesSerializer
        
    parser_class = (FileUploadParser,)

    def partial_update(self, request, *args, **kwargs):
      instance = self.queryset.get(pk=kwargs.get('pk'))
      serializer = self.serializer_class(instance, data=request.data, partial=True)
      serializer.is_valid(raise_exception=True)
      serializer.save()
      return Response(serializer.data)
        
    def create(self, request, *args, **kwargs):
      request.data['user'] = self.request.user.id
      serializer = ARMemoriesSerializer(data=request.data, partial=True)
      if serializer.is_valid(raise_exception=True):
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
      else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
      

class ARProfileViewSet(ViewSet):
    """Based on rest_framework.authtoken.views.ObtainAuthToken"""

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = ARUserProfile.objects.all()
    serializer_class = ARUserProfileSerializer

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
    A simple ViewSet for viewing and editing accounts.
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
