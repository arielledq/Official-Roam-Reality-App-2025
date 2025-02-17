from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import ConfigurationViewset

router = DefaultRouter()
router.register("", ConfigurationViewset, basename="configuration")

urlpatterns = [
    path("", include(router.urls)),
]

######################## TO USE ########################

# add to your main urls.py something like this:
#   path("configuration/", include("configuration.urls")),

######################## TO USE ########################
