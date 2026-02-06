"""travel_ar_app_42706 URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic.base import TemplateView
from allauth.account.views import confirm_email
from rest_framework import permissions
from drf_spectacular.views import SpectacularJSONAPIView, SpectacularSwaggerView
from home.deep_link_views import AppleAppSiteAssociationView, AssetLinksView

urlpatterns = [
    
    path("accounts/", include("allauth.urls")),
    path("modules/", include("modules.urls")),
    path("api/v1/", include("home.api.v1.urls")),
    path("api/v1/", include("feedback.api.v1.urls")),
    path("api/v1/", include("notifications.urls")),
    path("api/v1/", include("slide_pictures.urls")),
    path("api/v1/band/", include("modules.band_tracking.urls")),
    path("admin/", admin.site.urls),
    path("users/", include("users.urls", namespace="users")),
    path("rest-auth/", include("rest_auth.urls")),
    # Override email confirm to use allauth's HTML view instead of rest_auth's API view
    path("rest-auth/registration/account-confirm-email/<str:key>/", confirm_email),
    path("rest-auth/registration/", include("rest_auth.registration.urls")),
    # path("rest-auth/login/", CustomLoginView.as_view()),
    path('adminx/webshell/', include('webshell.urls')),
    path("configuration/", include("configuration.urls")),
]

admin.site.site_header = "Travel AR App"
admin.site.site_title = "Travel AR App Admin Portal"
admin.site.index_title = "Travel AR App Admin"

# swagger
urlpatterns += [
    path("api-docs/schema/", SpectacularJSONAPIView.as_view(), name="schema"),
    path("api-docs/", SpectacularSwaggerView.as_view(url_name='schema'), name="api_docs")
]

# Deep linking - Apple App Site Association and Android Asset Links
# These must be served before the catch-all pattern
urlpatterns += [
    path('.well-known/apple-app-site-association', AppleAppSiteAssociationView.as_view(), name='apple-app-site-association'),
    path('.well-known/assetlinks.json', AssetLinksView.as_view(), name='assetlinks'),
]

# Randomizer web fallback routes (for when app is NOT installed)
# These handle deep links like https://roamtt.com/randomizer/challenge/123
# MUST be before the catch-all pattern to avoid 404 errors
from randomizer_challenge.web_fallback_views import (
    ChallengeDeepLinkView,
    SubmissionDeepLinkView,
    ProfileDeepLinkView,
    LeaderboardDeepLinkView,
    InviteDeepLinkView,
)

urlpatterns += [
    path('randomizer/challenge/<int:challenge_id>/', ChallengeDeepLinkView.as_view(), name='randomizer-challenge-fallback'),
    path('randomizer/submission/<int:submission_id>/', SubmissionDeepLinkView.as_view(), name='randomizer-submission-fallback'),
    path('randomizer/profile/<int:user_id>/', ProfileDeepLinkView.as_view(), name='randomizer-profile-fallback'),
    path('randomizer/leaderboard/', LeaderboardDeepLinkView.as_view(), name='randomizer-leaderboard-fallback'),
    path('randomizer/invite/<int:challenge_id>/', InviteDeepLinkView.as_view(), name='randomizer-invite-fallback'),
]

# Catch-all pattern for React app - MUST be last
urlpatterns += [re_path(r".*",TemplateView.as_view(template_name='index.html'))]
