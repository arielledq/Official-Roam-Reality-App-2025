FROM python:3.10-slim-buster AS build

# Install pipenv
RUN pip install --no-cache-dir pipenv

# Fix Debian Buster repositories
RUN sed -i 's|http://deb.debian.org/debian|http://archive.debian.org/debian|g' /etc/apt/sources.list && \
    sed -i 's|http://security.debian.org/debian-security|http://archive.debian.org/debian-security|g' /etc/apt/sources.list && \
    sed -i '/buster-updates/d' /etc/apt/sources.list && \
    echo "Acquire::Check-Valid-Until false;" > /etc/apt/apt.conf.d/99no-check-valid-until && \
    apt update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        && rm -rf /var/lib/apt/lists/*

# Copy dependency management files and install app packages to /.venv
COPY ./Pipfile ./Pipfile.lock /
COPY ./modules/ /modules/
RUN PIPENV_VENV_IN_PROJECT=1 pipenv install --deploy

FROM python:3.10-slim-buster AS release
ARG SECRET_KEY

# Install Django and other runtime dependencies
RUN pip install --no-cache-dir django==3.2.25

# Fix Debian Buster repositories - use archive.debian.org since Buster is archived
RUN sed -i 's|http://deb.debian.org/debian|http://archive.debian.org/debian|g' /etc/apt/sources.list && \
    sed -i 's|http://security.debian.org/debian-security|http://archive.debian.org/debian-security|g' /etc/apt/sources.list && \
    sed -i '/buster-updates/d' /etc/apt/sources.list && \
    echo "Acquire::Check-Valid-Until false;" > /etc/apt/apt.conf.d/99no-check-valid-until && \
    apt update && \
    apt-get install -y --no-install-recommends \
        libpq-dev \
        gdal-bin \
        libgdal-dev \
        && rm -rf /var/lib/apt/lists/*

RUN pip install ffmpeg-downloader
RUN ffdl install -y

# Set Working directory
WORKDIR /opt/webapp

# Add runtime user with respective access permissions
RUN groupadd -r django \
  && useradd -d /opt/webapp -r -g django django \
  && chown django:django -R /opt/webapp

# Copy virtual env from build stage
COPY --chown=django:django --from=build /.venv /.venv
ENV PATH="/.venv/bin:$PATH"

# Copy app source
COPY --chown=django:django . .

USER django
# Collect static files and serve app
RUN python3 manage.py collectstatic --no-input
CMD waitress-serve --port=$PORT travel_ar_app_42706.wsgi:application
