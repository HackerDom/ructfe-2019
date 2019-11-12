import requests

from utils.parse_response import parse_response


class ChatsApi:
    def __init__(self, service_url):
        self.service_url = service_url

    def create(self, session: requests.Session, chat_name):
        response = session.post(
            f'{self.service_url}/createChat',
            json={
                "chatName": chat_name,
            })
        return parse_response(response.content, response.status_code)
