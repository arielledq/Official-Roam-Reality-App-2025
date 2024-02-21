from rest_framework import viewsets
from feedback.models import ContactUs

from feedback.serializers import ContactUsSerializer

class ContactUsViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for viewing and editing the contact us form.
    """
    queryset = ContactUs.objects.all()
    serializer_class = ContactUsSerializer
    http_method_names = ["post"]
