import json


class InvalidResponseException(Exception):
    def __init__(self, message):
        self.message = f'Request was not success: {message}'
        super()


def parse_response(response_data: dict, status_code):
    # response_data = json.loads(response_str)
    if status_code >= 300:
        raise InvalidResponseException(f'Invalid status code: {status_code}. Error message: {response_data}.')
    if not response_data['success']:
        raise InvalidResponseException(response_data['error'])

    return response_data['data']
