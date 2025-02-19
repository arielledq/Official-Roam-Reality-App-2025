#################### No tocar! #########################
################ Magia de configs ######################
# TODO validadores de set ( ejemplo set_HORA_ASD que valide config.HORA_ASD = 5 )

import json
import sys
import threading
import time
from django.apps import apps
from django.db import OperationalError, ProgrammingError

module_name = 'configuration.configs'


class ConfigKey:
    def __init__(self, value, verbose_name, is_public=False, only_admin=True, nullable=True, validation_function=None):
        self.value = value
        self.verbose_name = verbose_name
        self.is_public = is_public
        self.only_admin = only_admin
        self.nullable = nullable

        self.validation_function = validation_function


class ConfigsClass:
    __defaults__ = None
    __config_orm_class__ = None

    def __init__(self, original):
        self.__defaults__ = original
        # self.__original_module__ = original
        from .models import Configuration
        self.__config_orm_class__ = Configuration


        def autocreate():  # create all by default
            while True:
                if apps.ready:
                    for attr in self.__defaults__.__dict__:
                        if attr not in self.__dict__ and hasattr(self.__defaults__, attr):
                            try:
                                self.__create_key__(attr)
                            except OperationalError:
                                pass


                    return
                else:
                    time.sleep(0.1)

        th = threading.Thread(target=autocreate)
        th.daemon = True
        th.start()

    def __create_key__(self, item):
        try:
            if hasattr(self.__defaults__, item) and \
                    not self.__config_orm_class__.objects.filter(key=item).exists() and \
                    not (item.startswith('__') and item.endswith('__')):
                try:
                    aux = getattr(self.__defaults__, item)
                    if isinstance(aux, ConfigKey):
                        ret = self.__config_orm_class__.objects.create(
                            key=item,
                            value=aux.value,
                            description=aux.verbose_name,
                            is_public=aux.is_public,
                            only_admin=aux.only_admin,
                            nullable=aux.nullable,
                        )
                    else:
                        ret = self.__config_orm_class__.objects.create(
                            key=item,
                            value=aux,
                            description=item.lower().replace("_", " ").title(),
                            is_public=False,  # default if plain object
                            only_admin=True,  # default if plain object
                            nullable=True,  # default if plain object
                        )
                    print('creating key ', item)
                    return ret
                except TypeError:
                    pass
        except ProgrammingError:
            print('run migrate on configuration app')
            aux = getattr(self.__defaults__, item)
            return aux.value if isinstance(aux, ConfigKey) else aux

    def __getattr__(self, item):
        if not apps.ready:
            raise Exception('apps not ready, you should not access to apps yet!')
        if item in self.__dict__ or hasattr(self.__class__, item):
            return self.__dict__[item]

        try:
            # default = getattr(self.__defaults__, item)
            from .models import Configuration
            try:
                fromdb = self.__config_orm_class__.objects.get(key=item)
            except Configuration.DoesNotExist:
                fromdb = self.__create_key__(item)
            try:
                if fromdb.image_value:
                    value = fromdb.value
                    image_url = fromdb.image_value.url
                    return dict(value=value, image_url=image_url)
                return fromdb.value
            except:
                return fromdb.value
        except:
            pass

        return None

    def __setattr__(self, key, value):
        if hasattr(self, key) and not hasattr(self.__class__, key):
            try:
                self.__getattr__(key)  # forzar creacion
                fromdb = self.__config_orm_class__.objects.get(key=key)
                fromdb.value = value
                fromdb.save()
            except:
                print(f'key {key} is not in configs!')
        else:
            super().__setattr__(key, value)


def setup_configs_hooks():
    sys.modules[module_name] = ConfigsClass(sys.modules[module_name])
