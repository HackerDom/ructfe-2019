import asyncio
import inspect
import sys
from traceback import format_exc

from .models.action_names import INFO, CHECK, PUT, GET, TEST
from .models.checksystem_request import CheckRequest, PutRequest, GetRequest
from .models.verdict import Verdict


class Checker:
    def __init__(self):
        self.__info_distribution = {}
        self.__multiple_actions = frozenset((PUT, GET))
        self.__actions_handlers = {
            CHECK: None,
            PUT: {},
            GET: {},
        }

    @staticmethod
    def __check_function(func: callable, func_type: type):
        func_name = func.__code__.co_name
        func_args_spec = inspect.getfullargspec(func)

        if func_args_spec.annotations.get("return") != Verdict:
            raise TypeError(f"Checker function ({func_name}) should return {Verdict} object!")

        if len(func_args_spec.args) < 1:
            raise TypeError(f"{func_name} should have 1 or more args!")

        func_arg_name = func_args_spec.args[0]
        func_arg_type = func_args_spec.annotations.get(func_arg_name)

        if func_arg_type != func_type:
            raise TypeError(f"{func_name} first arg should be typed as {func_type}")

    def __register_action(self, action_name: str, action: callable, action_period: int = None):
        if action_name in self.__multiple_actions:
            if action_period is None:
                raise ValueError("Period should not be None for multiple actions!")
            self.__actions_handlers[action_name][action_period] = action
        else:
            if action_name in self.__actions_handlers:
                if self.__actions_handlers[action_name] is not None:
                    raise ValueError("Action has been already registered!")
                self.__actions_handlers[action_name] = action
            else:
                raise ValueError("Incorrect action name!")

    def __run_tests(self, team_ip):
        ...

        # todo run info-check-put-get actions + check runnability

        # todo reality test (15 mins chk-system like test) & fast methods test

    def define_check(self, func: callable) -> callable:
        self.__check_function(func, CheckRequest)
        self.__register_action(CHECK, func)
        return func

    def define_put(self, vuln_num: int, vuln_rate: int) -> callable:
        if not isinstance(vuln_num, int) or vuln_num < 1:
            raise TypeError(f'You should provide vulnerability natural number as a decorator argument!')

        def wrapper(func: callable):
            self.__check_function(func, PutRequest)
            self.__register_action(PUT, func, vuln_num)
            self.__info_distribution[vuln_num] = vuln_rate
            return func

        return wrapper

    def __extract_info_call(self):
        return "vulns: " + ':'.join(str(self.__info_distribution[key]) for key in sorted(self.__info_distribution))

    def define_get(self, vuln_num: int) -> callable:
        if not isinstance(vuln_num, int) or vuln_num < 1:
            raise TypeError(f'You should provide vulnerability natural number as a decorator argument!')

        def wrapper(func: callable):
            self.__check_function(func, GetRequest)
            self.__register_action(GET, func, vuln_num)
            return func

        return wrapper

    def __async_wrapper(self, func_result):
        if asyncio.iscoroutine(func_result):
            return asyncio.run(func_result)
        return func_result

    # noinspection PyProtectedMember
    def run(self, *args):
        result = Verdict.CHECKER_ERROR("", "Something gone wrong")
        try:
            if not args:
                args = sys.argv[1:]
            result = self.__run(*args)

            if type(result) != Verdict:
                result = Verdict.CHECKER_ERROR("", f'Checker function returned not Verdict value, we need to fix it!')
        except Exception as e:
            result = Verdict.CHECKER_ERROR('', f"Checker caught an error: {e},\n {format_exc()}")
        finally:
            if result._public_message:
                print(result._public_message, file=sys.stdout)
            if result._private_message:
                print(result._private_message, file=sys.stderr)
            sys.exit(result._code)

    def __run(self, command=None, hostname=None, flag_id=None, flag=None, vuln_id=None) -> Verdict:
        commands = [CHECK, PUT, GET, INFO, TEST]

        if command is None:
            raise ValueError("Expected 1 or more args!")

        command = command.upper()

        if command not in commands:
            raise ValueError(f"Unknown ({command}) command! (Expected one of ({','.join(commands)})")

        if command == INFO:
            return Verdict.OK(self.__extract_info_call())

        if hostname is None:
            raise ValueError("Can't find 'hostname' arg! (Expected 2 or more args)")

        check_func = self.__actions_handlers[CHECK]
        request_content = {
            "hostname": hostname
        }

        if command == CHECK:
            # noinspection PyCallingNonCallable
            return self.__async_wrapper(check_func(CheckRequest(**request_content)))

        if command == TEST:
            self.__run_tests(hostname)
            return Verdict(0, "Tests has been finished")

        if flag_id is None:
            raise ValueError("Can't find 'flag_id' arg! (Expected 3 or more args)")

        if flag is None:
            raise ValueError("Can't find 'flag' arg (Expected 4 or more args)")

        if vuln_id is None:
            raise ValueError("Can't find 'vuln_id' arg (Expected 5 or more args)")
        try:
            vuln_id = int(vuln_id)
            assert vuln_id > 0
            assert vuln_id in self.__actions_handlers[PUT]
            assert vuln_id in self.__actions_handlers[GET]
        except (TypeError, AssertionError):
            raise ValueError("'vuln_id' should be representative as a natural number, "
                             "GET/PUT methods should be registered in checker!")

        put_func = self.__actions_handlers[PUT][vuln_id]
        get_func = self.__actions_handlers[GET][vuln_id]

        request_content.update({
            "flag_id": flag_id,
            "flag": flag,
            "vuln_id": vuln_id
        })

        if command == PUT:
            return self.__async_wrapper(put_func(PutRequest(**request_content)))

        if command == GET:
            return self.__async_wrapper(get_func(GetRequest(**request_content)))

        raise RuntimeError("Something gone wrong with checker scenario :(")
