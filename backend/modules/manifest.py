from pathlib import Path
from django.urls import path, include

MODULES_PACKAGE_NAME = "modules"
MODULES_DIR = f"{Path.cwd()}/{MODULES_PACKAGE_NAME}/"
APPS = Path(MODULES_DIR).rglob("apps.py")


def get_modules():
    try:
        modules = []
        python_package_separator = "."
        for app in APPS:
            if "build/lib" in app.as_posix():
                continue
            app_name = app.as_posix().replace(MODULES_DIR, f"{MODULES_PACKAGE_NAME}/")
            app_name = app.parent.as_posix().replace("/".join(MODULES_DIR.split("/")[:-2]) + "/", "").replace("/", ".")
            modules.append(app_name)
        return modules
    except (ImportError, IndexError):
        pass
