"""
Deep Link Utilities for Randomizer Challenge
"""
from django.conf import settings
from urllib.parse import urlencode, urljoin


def generate_web_url(path, query_params=None):
    """
    Generate a web URL for deep linking.

    Args:
        path: URL path (e.g., '/randomizer/challenge/123')
        query_params: Optional dictionary of query parameters

    Returns:
        Full web URL (e.g., 'https://roamtt.com/randomizer/challenge/123')
    """
    base_url = getattr(settings, 'DEEP_LINK_DOMAIN', 'https://roamtt.com')
    url = urljoin(base_url, path)

    if query_params:
        query_string = urlencode(query_params)
        url = f"{url}?{query_string}"

    return url


def generate_app_url(path, query_params=None):
    """
    Generate an app scheme URL for deep linking.

    Args:
        path: URL path (e.g., 'randomizer/challenge/123')
        query_params: Optional dictionary of query parameters

    Returns:
        App scheme URL (e.g., 'roamreality://randomizer/challenge/123')
    """
    app_scheme = getattr(settings, 'APP_SCHEME', 'roamreality')

    # Remove leading slash if present
    if path.startswith('/'):
        path = path[1:]

    url = f"{app_scheme}://{path}"

    if query_params:
        query_string = urlencode(query_params)
        url = f"{url}?{query_string}"

    return url


def generate_challenge_deep_link(challenge_id, query_params=None):
    """
    Generate deep link URLs for a specific challenge.

    Args:
        challenge_id: ID of the challenge
        query_params: Optional query parameters (e.g., {'ref': 'share'})

    Returns:
        Dictionary with 'web_url' and 'app_url'
    """
    path = f"/randomizer/challenge/{challenge_id}"

    return {
        'web_url': generate_web_url(path, query_params),
        'app_url': generate_app_url(path, query_params),
    }


def generate_submission_share_link(submission_id, query_params=None):
    """
    Generate shareable deep link for a submission.

    Args:
        submission_id: ID of the submission
        query_params: Optional query parameters

    Returns:
        Dictionary with 'web_url' and 'app_url'
    """
    path = f"/randomizer/submission/{submission_id}"

    # Add UTM parameters for tracking
    if query_params is None:
        query_params = {}

    query_params.setdefault('utm_source', 'app')
    query_params.setdefault('utm_medium', 'social_share')

    return {
        'web_url': generate_web_url(path, query_params),
        'app_url': generate_app_url(path, query_params),
    }


def generate_profile_deep_link(user_id, query_params=None):
    """
    Generate deep link URLs for a user profile.

    Args:
        user_id: ID of the user
        query_params: Optional query parameters

    Returns:
        Dictionary with 'web_url' and 'app_url'
    """
    path = f"/randomizer/profile/{user_id}"

    return {
        'web_url': generate_web_url(path, query_params),
        'app_url': generate_app_url(path, query_params),
    }


def generate_invite_link(challenge_id, inviter_id, query_params=None):
    """
    Generate invite deep link for a challenge.

    Args:
        challenge_id: ID of the challenge
        inviter_id: ID of the user sending the invite
        query_params: Optional additional query parameters

    Returns:
        Dictionary with 'web_url' and 'app_url'
    """
    path = f"/randomizer/invite/{challenge_id}"

    if query_params is None:
        query_params = {}

    query_params['inviter'] = inviter_id
    query_params.setdefault('utm_source', 'app')
    query_params.setdefault('utm_medium', 'invite')

    return {
        'web_url': generate_web_url(path, query_params),
        'app_url': generate_app_url(path, query_params),
    }


def generate_leaderboard_deep_link(query_params=None):
    """
    Generate deep link URLs for the leaderboard.

    Args:
        query_params: Optional query parameters (e.g., {'period': 'weekly'})

    Returns:
        Dictionary with 'web_url' and 'app_url'
    """
    path = "/randomizer/leaderboard"

    return {
        'web_url': generate_web_url(path, query_params),
        'app_url': generate_app_url(path, query_params),
    }


def generate_video_deep_link(video_id, query_params=None):
    """
    Generate deep link URLs for a challenge completion video.

    Args:
        video_id: ID of the video
        query_params: Optional query parameters

    Returns:
        Dictionary with 'web_url' and 'app_url'
    """
    path = f"/randomizer/video/{video_id}"

    return {
        'web_url': generate_web_url(path, query_params),
        'app_url': generate_app_url(path, query_params),
    }


def validate_deep_link_token(token, token_type='challenge'):
    """
    Validate a deep link token.

    Args:
        token: The token to validate
        token_type: Type of token ('challenge', 'submission', 'invite', etc.)

    Returns:
        Boolean indicating if the token is valid
    """
    # Implement token validation logic here
    # This could involve checking JWT tokens, database lookups, etc.
    # For now, we'll just do basic validation

    if not token:
        return False

    try:
        # Add your validation logic here
        # For example, check if it's a valid UUID or ID format
        if isinstance(token, (int, str)):
            return True
        return False
    except Exception:
        return False


def track_deep_link_click(link_type, resource_id, source=None):
    """
    Track deep link analytics.

    Args:
        link_type: Type of deep link ('challenge', 'submission', 'profile', etc.)
        resource_id: ID of the resource being linked to
        source: Source of the click (e.g., 'facebook', 'twitter', 'sms')

    Returns:
        None (logs the event for analytics)
    """
    # This can be expanded to log to your analytics service
    # For now, we'll just use Django logging
    import logging
    logger = logging.getLogger('deep_links')

    logger.info(
        f"Deep link clicked: type={link_type}, id={resource_id}, source={source}"
    )

    # You can expand this to save to a DeepLinkAnalytics model
    # or send to an external analytics service like Google Analytics, Mixpanel, etc.
