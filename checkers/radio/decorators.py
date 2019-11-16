import traceback
from chklib import Verdict
from functools import wraps

def check_exception(func):
    @wraps(func)
    def inner(*args, **kwargs):
        try:
            result = func(*args, **kwargs)
        except Exception as e:
            return Verdict.DOWN(str(e), traceback.format_exc())
        return result
    return inner
