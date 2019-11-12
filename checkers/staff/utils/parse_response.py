import json


class InvalidResponseException(Exception):
    def __init__(self, message):
        super(f'Request was not success: {message}')


def parse_response(response_str: bytes, status_code):
    response_str = response_str.decode()
    response_data = json.loads(response_str)
    if status_code >= 300:
        raise InvalidResponseException(f'Invalid status code: {status_code}. Error message: {response_str}.')
    if not response_data['success']:
        raise InvalidResponseException(response_data['error'])

    return response_data['data']
