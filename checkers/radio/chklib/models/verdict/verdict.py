from .verdict_codes import *


# noinspection PyPep8Naming
class Verdict:
    def __init__(self, code: int, public_message: str = '', private_message: str = ''):
        self._code: int = code
        self._public_message: str = public_message
        self._private_message: str = private_message

    def __eq__(self, other):
        if isinstance(other, Verdict):
            return (self._code == other._code and self._public_message == other._public_message and
                    self._private_message == other._private_message)
        return False

    @staticmethod
    def OK(flag_id: str = ''):
        return Verdict(OK, flag_id)

    @staticmethod
    def CORRUPT(public_reason: str, private_reason: str):
        return Verdict(CORRUPT, public_reason, private_reason)

    @staticmethod
    def MUMBLE(public_reason: str, private_reason: str):
        return Verdict(MUMBLE, public_reason, private_reason)

    @staticmethod
    def DOWN(public_reason: str, private_reason: str):
        return Verdict(DOWN, public_reason, private_reason)

    @staticmethod
    def CHECKER_ERROR(public_reason: str, private_reason: str):
        return Verdict(CHECKER_ERROR, public_reason, private_reason)
