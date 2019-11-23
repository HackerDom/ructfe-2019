import json
from base64 import b64encode

import requests

import generators.user_data_generator as data_gen
from generators.minimized_java_class_generator import make_class

REGISTER_URL = ""

PORT = 8080


def get_register_url(hostname):
    return f"http://{hostname}:{PORT}/register"


def get_login_url(hostname):
    return f"http://{hostname}:{PORT}/login"


def get_info_url(hostname):
    return f"http://{hostname}:{PORT}/info"


def get_content(data: dict):
    keys = sorted(data.keys())
    key = b64encode(make_class(data_gen.generate_class_name(), keys)).decode()
    message = ':'.join(str(len(str(data[key]))) for key in keys) + ":" + ''.join(str(data[key]) for key in keys)
    return {
        "key": key,
        "message": message
    }


def register(
        hostname: str,
        name: str,
        password: str,
        speed: float,
        color: str,
        size: int,
        additional_custom_fields: dict
):
    required_custom_fields = {
        "color": color,
        "size": size,
        "speed": speed,
    }
    url = get_register_url(hostname)
    data = dict(
        **{
            "name": name,
            "password": password,
            "content": get_content(dict(**required_custom_fields, **additional_custom_fields))
        },
        **required_custom_fields
    )

    r = requests.post(url, json=data, headers=data_gen.generate_headers())
    r.raise_for_status()


def login(hostname, username, password):
    url = get_login_url(hostname)
    data = {
        "name": username,
        "password": password,
    }
    r = requests.post(url, json=data, headers=data_gen.generate_headers())
    r.raise_for_status()
    return r.cookies


def info(hostname, cookies):
    url = get_info_url(hostname)
    r = requests.get(url, cookies=cookies, headers=data_gen.generate_headers())
    r.raise_for_status()
    return json.loads(r.content)
