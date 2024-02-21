from rest_framework import viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from feedback.models import ContactUs

from feedback.serializers import ContactUsSerializer

class ContactUsViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for viewing and editing the contact us form.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = ContactUs.objects.all()
    serializer_class = ContactUsSerializer
    http_method_names = ["post"]
