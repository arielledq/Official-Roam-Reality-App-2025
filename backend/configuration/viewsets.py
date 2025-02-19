
from rest_framework import viewsets, mixins, serializers
from rest_framework.response import Response

from rest_framework.viewsets import GenericViewSet

from configuration.models import Configuration
from configuration.serializer import ConfigurationListSerializer, ConfigurationFileUpdateSerializer, \
    ConfigurationUpdateSerializer


class ConfigurationViewset(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, GenericViewSet):
    lookup_field = 'key'

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return ConfigurationListSerializer
        if self.request.FILES:
            return ConfigurationFileUpdateSerializer
        return ConfigurationUpdateSerializer

    def get_queryset(self):
        base = Configuration.objects.all()
        if self.action in ['list', 'retrieve']:
            if self.request.user.is_anonymous:
                return base.filter(is_public=True)
            if not self.request.user.is_superuser:
                return base.filter(only_admin=False)
        return base

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.image_value:
            return Response(request.build_absolute_uri(instance.image_value.url))
        return Response(instance.value if instance.value else None)

    def update(self, request, *args, **kwargs):
        if not self.request.user.is_superuser:  # TODO admin missing here
            return Response(status=403)
        return super().update(request, *args, **kwargs)
