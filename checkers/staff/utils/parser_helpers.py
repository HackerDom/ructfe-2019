from utils.invalid_response_exception import InvalidResponseException


def parse_response(response_data: dict, status_code):
    if status_code != 200:
        raise InvalidResponseException(f'Invalid status code: {status_code}. Error message: {response_data}.')
    if not response_data['success']:
        raise InvalidResponseException(response_data['error'])

    return response_data['data']
