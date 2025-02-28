from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from slide_pictures.models import SlidePicture
from slide_pictures.serializer import SlidePictureSerializer


class SlidePictureViewSet(ModelViewSet):
    queryset = SlidePicture.objects.all()
    serializer_class = SlidePictureSerializer

    def list(self, request, *args, **kwargs):
        queryset = super().get_queryset()[:10]
        serializer = self.get_serializer(queryset, many=True)
        return Response(data=serializer.data)
