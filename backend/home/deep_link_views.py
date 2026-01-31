"""
Views for serving deep link configuration files
"""
from django.http import JsonResponse, FileResponse, Http404
from django.views import View
import os
from django.conf import settings


class AppleAppSiteAssociationView(View):
    """
    Serve the Apple App Site Association file for iOS Universal Links.
    This file must be served with content-type application/json and no file extension.
    """

    def get(self, request):
        file_path = os.path.join(
            settings.BASE_DIR,
            'static',
            '.well-known',
            'apple-app-site-association'
        )

        try:
            with open(file_path, 'r') as f:
                import json
                data = json.load(f)

            response = JsonResponse(data)
            response['Content-Type'] = 'application/json'
            return response
        except FileNotFoundError:
            raise Http404("Apple App Site Association file not found")


class AssetLinksView(View):
    """
    Serve the assetlinks.json file for Android App Links.
    """

    def get(self, request):
        file_path = os.path.join(
            settings.BASE_DIR,
            'static',
            '.well-known',
            'assetlinks.json'
        )

        try:
            with open(file_path, 'r') as f:
                import json
                data = json.load(f)

            response = JsonResponse(data, safe=False)
            response['Content-Type'] = 'application/json'
            return response
        except FileNotFoundError:
            raise Http404("Asset Links file not found")
