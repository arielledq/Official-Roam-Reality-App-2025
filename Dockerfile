FROM crowdbotics/cb-django:3.8-slim-buster AS build

# Copy dependency management files and install app packages to /.venv
COPY backend/Pipfile backend/Pipfile.lock /
COPY backend/modules/ /modules/
RUN PIPENV_VENV_IN_PROJECT=1 pipenv install --deploy

# FROM node:18.16-alpine AS rn_web_build
# WORKDIR /tmp/web_build
# COPY . .
# RUN yarn install && yarn run web:build


FROM crowdbotics/cb-django:3.8-slim-buster AS release
ARG SECRET_KEY

# Set Working directory
WORKDIR /opt/webapp

# Add runtime user with respective access permissions
RUN groupadd -r django \
  && useradd -d /opt/webapp -r -g django django \
  && chown django:django -R /opt/webapp

RUN apt update
RUN apt-get install -y software-properties-common 
RUN add-apt-repository ppa:ubuntugis/ppa
RUN apt install -y libpq-dev gdal-bin libgdal-dev

USER django

# Copy virtual env from build stage
COPY --chown=django:django --from=build /.venv /.venv
ENV PATH="/.venv/bin:$PATH"

# Copy app source
COPY --chown=django:django ./backend .

# Copy and set up the startup script
COPY --chown=django:django ./backend/scripts/startup.sh /scripts/startup.sh
RUN chmod +x /scripts/startup.sh

RUN pip install ffmpeg-downloader
RUN ffdl install -y
# Copy web build from  rn_web_build stage
# COPY --chown=django:django --from=rn_web_build /tmp/web_build/backend/web_build ./web_build

# Collect static files and serve app
RUN python3 manage.py collectstatic --no-input
CMD waitress-serve --port=$PORT travel_ar_app_42706.wsgi:application
