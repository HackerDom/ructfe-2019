#!/usr/bin/python3
import json
import traceback
from base64 import b64encode
from hashlib import sha1

import requests

import api
import generators.user_data_generator as data_gen
from chklib import Checker, Verdict, CheckRequest, PutRequest, GetRequest

checker = Checker()


def get_dict_hash(data: dict):
    return b64encode(sha1(json.dumps(data, sort_keys=True).encode()).digest()).decode()


@checker.define_check
def check(request: CheckRequest) -> Verdict:
    return Verdict.OK()


@checker.define_put(vuln_num=1, vuln_rate=1)
def put(request: PutRequest) -> Verdict:
    try:
        username = data_gen.generate_username()
        password = data_gen.generate_password()
        speed = data_gen.generate_speed()
        color = data_gen.generate_color()
        size = data_gen.generate_size()
        additional_fields = dict(
            **{
                "CARD": request.flag
            },
            **data_gen.generate_additional_fields(),
        )

        api.register(request.hostname, username, password, speed, color, size, additional_fields)
        info_data = dict(
            **{
                "speed": str(speed),
                "size": str(size),
                "color": color,
            },
            **additional_fields
        )
        info_data_hash = get_dict_hash(info_data)
        flag_id = f"{username}:{password}:{info_data_hash}"
    except requests.exceptions.ConnectionError as e:
        traceback.print_exc()
        return Verdict.DOWN("Connection error", str(e))
    except requests.exceptions.HTTPError as e:
        traceback.print_exc()
        return Verdict.MUMBLE("Wrong HTTP status code", str(e))
    return Verdict.OK(flag_id)


@checker.define_get(vuln_num=1)
def get(request: GetRequest) -> Verdict:
    try:
        username, password, expected_data_info_hash = request.flag_id.split(":")
        cookies = api.login(request.hostname, username, password)
        info_data = api.info(request.hostname, cookies)

        if type(info_data) != dict:
            return Verdict.MUMBLE("Bad info format", f"info data hasn't type dict: {info_data}")
        real_data_info_hash = get_dict_hash(info_data)
        if real_data_info_hash != expected_data_info_hash:
            full_message = f"Corrupted info. Flag id: {request.flag_id}, " \
                f"expected hash: {expected_data_info_hash}, real hash: {real_data_info_hash}, " \
                f"real info data: {info_data}, expected flag: {request.flag}"
            return Verdict.CORRUPT("Corrupted info", full_message)

        flag = info_data.get("CARD", None)
        if flag != request.flag:  # Actually, it is a useless check due to hash checking
            return Verdict.CORRUPT("Info has no flag", f"{info_data} has no flag '{request.flag}'")

        return Verdict.OK()
    except requests.exceptions.ConnectionError as e:
        traceback.print_exc()
        return Verdict.DOWN("Connection error", str(e))
    except requests.exceptions.HTTPError as e:
        traceback.print_exc()
        return Verdict.MUMBLE("Wrong HTTP status code", str(e))
    except json.decoder.JSONDecodeError as e:
        traceback.print_exc()
        return Verdict.MUMBLE("Invalid JSON", str(e))
    except UnicodeDecodeError as e:
        traceback.print_exc()
        return Verdict.MUMBLE("Unicode error", str(e))


if __name__ == '__main__':
    checker.run()
