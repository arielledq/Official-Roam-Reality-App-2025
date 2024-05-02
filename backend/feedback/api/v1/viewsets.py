from rest_framework import viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from feedback.models import ContactUs, ReportedContent

from feedback.serializers import ContactUsSerializer, ReportedContentSerializer

class ContactUsViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for viewing and editing the contact us form.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = ContactUs.objects.all()
    serializer_class = ContactUsSerializer
    http_method_names = ["post"]


class ReportedContentViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = ReportedContent.objects.all()
    serializer_class = ReportedContentSerializer
    http_method_names = ["post"]
    