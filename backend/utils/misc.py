import asyncio
import functools

from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination

User = get_user_model()

flat_map = lambda f, xs: (y for ys in xs for y in f(ys))

def may_fail(cls_exc, detail='', *args_outer, wrapper_exc=ValidationError, append_exc_msg=False, **kwargs_outer):
    def decorator(func):

        if asyncio.iscoroutinefunction(func):
            @functools.wraps(func)
            async def asyncwrapper(*args, **kwargs):
                try:
                    return await func(*args, **kwargs)
                except cls_exc as exc:
                    raise wrapper_exc(detail + (getattr(exc, 'msg', str(exc)) if append_exc_msg else ''), *args_outer, **kwargs_outer)

            return asyncwrapper
        else:
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                try:
                    return func(*args, **kwargs)
                except cls_exc as exc:
                    raise wrapper_exc(detail + (getattr(exc, 'msg', str(exc)) if append_exc_msg else ''), *args_outer, **kwargs_outer)

            return wrapper

    return decorator


class DefaultPagination(PageNumberPagination):
    page_size = 10
    page_query_param = 'page'
    page_size_query_param = 'page_size'

