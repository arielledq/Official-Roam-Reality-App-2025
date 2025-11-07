from typing import Any
from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.conf import settings
from django.http import HttpRequest
from django.utils.module_loading import import_string


class AccountAdapter(DefaultAccountAdapter):
    def is_open_for_signup(self, request: HttpRequest):
        return getattr(settings, "ACCOUNT_ALLOW_REGISTRATION", True)
    
    def get_email_confirmation_url(self, request, emailconfirmation):
        domain = getattr(settings, "DOMAIN", None)
        if domain:
            domain = domain.rstrip('/')
            from django.urls import reverse
            url_path = reverse("account_confirm_email", args=[emailconfirmation.key])
            return f"{domain}{url_path}"
        return super().get_email_confirmation_url(request, emailconfirmation)
    
    def send_mail(self, template_prefix, email, context):
        domain = getattr(settings, "DOMAIN", None)
        if domain:
            domain = domain.rstrip('/').replace('http://', '').replace('https://', '')
            context['domain'] = domain

            protocol = 'https' if getattr(settings, "SECURE_SSL_REDIRECT", False) else 'http'
            context['protocol'] = protocol

        backend_class = import_string(settings.EMAIL_BACKEND)
        connection = backend_class(
            host=settings.EMAIL_HOST,
            port=settings.EMAIL_PORT,
            username=settings.EMAIL_HOST_USER,
            password=settings.EMAIL_HOST_PASSWORD,
            use_tls=settings.EMAIL_USE_TLS,
            fail_silently=False,
            use_ssl=settings.EMAIL_USE_SSL if hasattr(settings, 'EMAIL_USE_SSL') else False,
            timeout=getattr(settings, 'EMAIL_TIMEOUT', None),
        )

        msg = self.render_mail(template_prefix, email, context)

        msg.connection = connection
        msg.send()
        return msg

class SocialAccountAdapter(DefaultSocialAccountAdapter):
    def is_open_for_signup(self, request: HttpRequest, sociallogin: Any):
        return getattr(settings, "SOCIALACCOUNT_ALLOW_REGISTRATION", True)
