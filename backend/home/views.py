from django.shortcuts import render
from rest_auth.views import LogoutView
from rest_framework.authentication import TokenAuthentication
from rest_framework import permissions


def home(request):
    packages = [
	{'name':'django-allauth', 'url': 'https://pypi.org/project/django-allauth/0.38.0/'},
	{'name':'django-bootstrap4', 'url': 'https://pypi.org/project/django-bootstrap4/0.0.7/'},
	{'name':'djangorestframework', 'url': 'https://pypi.org/project/djangorestframework/3.9.0/'},
    ]
    context = {
        'packages': packages
    }
    return render(request, 'home/index.html', context)


class AppLogoutView(LogoutView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated,)
