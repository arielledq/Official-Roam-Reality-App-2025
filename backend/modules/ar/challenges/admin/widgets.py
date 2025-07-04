from django.contrib.gis.forms.widgets import OpenLayersWidget

class GoogleMapsOpenLayersWidget(OpenLayersWidget):
    """Google Maps OpenLayer widget."""

    template_name = 'gis_addons/openlayers_googlemaps.html'


class GoogleMapsOpenLayersWidgetZoom(OpenLayersWidget):
    """Google Maps OpenLayer widget."""

    template_name = 'gis_addons/openlayers_googlemapszoom.html'