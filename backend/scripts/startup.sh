#!/bin/bash

python manage.py collectstatic --no-input
python manage.py migrate --noinput
#redeploy!

waitress-serve --port=$PORT travel_ar_app_42706.wsgi:application
