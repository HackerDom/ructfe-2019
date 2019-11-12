import requests
import json


class ChatsApi:
    def __init__(self, service_url):
        self.service_url = service_url

    def create(self, session: requests.Session, chat_name):
        response = session.post(
            f'{self.service_url}/createChat',
            json={
                "chatName": chat_name,
            })
        response_json = response.content
        if response.status_code >= 300:
            raise Exception('Request was not success')
        response_data = json.loads(response_json.decode())
        if not response_data["success"]:
            raise Exception('Request was not success')

        return response_data
