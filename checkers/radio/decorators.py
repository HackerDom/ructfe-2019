import traceback
from chklib import Verdict
from functools import wraps


def check_exception(func):
    @wraps(func)
    async def inner(request, *args, **kwargs) -> Verdict:
        try:
            result = await func(request, *args, **kwargs)
        except Exception as e:
            return Verdict.DOWN('Can\'t check service', traceback.format_exc())
        return result
    return inner


def exec_with_retry_resource(func):
    @wraps(func)
    async def inner(request, *args, **kwargs) -> Verdict:
        try:
            result = await func(request, *args, **kwargs)
        except Exception as e:
            return Verdict.DOWN('Can\'t check service', traceback.format_exc())
        return result
    return inner