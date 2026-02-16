"""
Web fallback views for deep links when app is not installed.
These views detect the user's platform and redirect to the appropriate app store.
"""
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from django.conf import settings
from django.views import View
from .models import RandomizerChallenge, RandomizerSubmission
from users.models import User


class DeepLinkFallbackView(View):
    """
    Base view for handling deep link fallbacks.
    Detects platform and redirects to app store or shows web fallback.
    """

    # These should be in settings.py
    IOS_APP_STORE_URL = getattr(settings, 'IOS_APP_STORE_URL', 'https://apps.apple.com/us/app/roam-reality/id6477857812')
    ANDROID_PLAY_STORE_URL = getattr(settings, 'ANDROID_PLAY_STORE_URL', 'https://play.google.com/store/apps/details?id=com.roam_reality')
    APP_SCHEME = getattr(settings, 'APP_SCHEME', 'roamreality')

    def detect_platform(self, request):
        """
        Detect user's platform from User-Agent header.

        Returns:
            'ios', 'android', or 'web'
        """
        user_agent = request.META.get('HTTP_USER_AGENT', '').lower()

        if 'iphone' in user_agent or 'ipad' in user_agent or 'ipod' in user_agent:
            return 'ios'
        elif 'android' in user_agent:
            return 'android'
        else:
            return 'web'

    def get_app_store_url(self, platform):
        """Get the appropriate app store URL for the platform."""
        if platform == 'ios':
            return self.IOS_APP_STORE_URL
        elif platform == 'android':
            return self.ANDROID_PLAY_STORE_URL
        return None

    def get_deep_link_url(self, path, query_params=None):
        """Generate app scheme deep link URL."""
        url = f"{self.APP_SCHEME}://{path}"
        if query_params:
            from urllib.parse import urlencode
            url = f"{url}?{urlencode(query_params)}"
        return url

    def render_smart_banner(self, request, context):
        """
        Render HTML page with smart app banner and auto-redirect.
        This page attempts to open the app, and if it fails, redirects to app store.
        """
        platform = self.detect_platform(request)

        context.update({
            'platform': platform,
            'app_store_url': self.get_app_store_url(platform),
            'ios_app_store_url': self.IOS_APP_STORE_URL,
            'android_play_store_url': self.ANDROID_PLAY_STORE_URL,
        })

        return render(request, 'randomizer_challenge/deep_link_fallback.html', context)


class ChallengeDeepLinkView(DeepLinkFallbackView):
    """
    Handle deep links to challenges: /randomizer/challenge/<id>/
    """

    def get(self, request, challenge_id):
        try:
            challenge = get_object_or_404(RandomizerChallenge, pk=challenge_id, is_active=True)

            # Build deep link path
            deep_link_path = f"randomizer/challenge/{challenge_id}"
            query_params = dict(request.GET)

            context = {
                'deep_link_url': self.get_deep_link_url(deep_link_path, query_params),
                'title': f"Open {challenge.name}",
                'description': f"Join the {challenge.name} challenge on Roam Reality",
                'challenge': challenge,
                'type': 'challenge',
            }

            return self.render_smart_banner(request, context)

        except RandomizerChallenge.DoesNotExist:
            return HttpResponse("Challenge not found", status=404)


class SubmissionDeepLinkView(DeepLinkFallbackView):
    """
    Handle deep links to submissions: /randomizer/submission/<id>/
    """

    def get(self, request, submission_id):
        try:
            submission = get_object_or_404(
                RandomizerSubmission,
                pk=submission_id,
                privacy='public'  # Only public submissions can be viewed via deep link
            )

            deep_link_path = f"randomizer/submission/{submission_id}"
            query_params = dict(request.GET)

            context = {
                'deep_link_url': self.get_deep_link_url(deep_link_path, query_params),
                'title': f"View Submission",
                'description': f"Check out this {submission.challenge.name} submission on Roam Reality",
                'submission': submission,
                'type': 'submission',
            }

            return self.render_smart_banner(request, context)

        except RandomizerSubmission.DoesNotExist:
            return HttpResponse("Submission not found or is private", status=404)


class ProfileDeepLinkView(DeepLinkFallbackView):
    """
    Handle deep links to profiles: /randomizer/profile/<user_id>/
    """

    def get(self, request, user_id):
        try:
            user = get_object_or_404(User, pk=user_id)

            deep_link_path = f"randomizer/profile/{user_id}"
            query_params = dict(request.GET)

            context = {
                'deep_link_url': self.get_deep_link_url(deep_link_path, query_params),
                'title': f"View {user.name}'s Profile",
                'description': f"Check out {user.name}'s profile on Roam Reality",
                'user': user,
                'type': 'profile',
            }

            return self.render_smart_banner(request, context)

        except User.DoesNotExist:
            return HttpResponse("User not found", status=404)


class LeaderboardDeepLinkView(DeepLinkFallbackView):
    """
    Handle deep links to leaderboard: /randomizer/leaderboard/
    """

    def get(self, request):
        deep_link_path = "randomizer/leaderboard"
        query_params = dict(request.GET)

        context = {
            'deep_link_url': self.get_deep_link_url(deep_link_path, query_params),
            'title': "View Leaderboard",
            'description': "Check out the Roam Reality leaderboard",
            'type': 'leaderboard',
        }

        return self.render_smart_banner(request, context)


class InviteDeepLinkView(DeepLinkFallbackView):
    """
    Handle deep links to invites: /randomizer/invite/<challenge_id>/?inviter=<user_id>
    """

    def get(self, request, challenge_id):
        try:
            challenge = get_object_or_404(RandomizerChallenge, pk=challenge_id, is_active=True)
            inviter_id = request.GET.get('inviter')

            deep_link_path = f"randomizer/invite/{challenge_id}"
            query_params = dict(request.GET)

            context = {
                'deep_link_url': self.get_deep_link_url(deep_link_path, query_params),
                'title': f"Join {challenge.name}",
                'description': f"You've been invited to join the {challenge.name} challenge",
                'challenge': challenge,
                'inviter_id': inviter_id,
                'type': 'invite',
            }

            return self.render_smart_banner(request, context)

        except RandomizerChallenge.DoesNotExist:
            return HttpResponse("Challenge not found", status=404)
