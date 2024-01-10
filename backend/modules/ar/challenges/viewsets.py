from .models import Challenges
from .serializers import ChallengesSerializer, ChallengesUploadSerializer
from rest_framework import viewsets
from rest_framework.parsers import FileUploadParser
from rest_framework.views import APIView
from rest_framework import permissions, status
from rest_framework.response import Response

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
