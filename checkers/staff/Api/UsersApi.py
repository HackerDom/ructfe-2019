import requests
import json


class UsersApi:
    def __init__(self, service_url):
        self.service_url = service_url

    def register(self, user):
        response = requests.post(f'{self.service_url}/register', json=user)
        response_json = response.content.decode()
        response_data = json.loads(response_json)
        # if not response_data.success:
        #     raise Exception('Request was not success')

    def login(self, session: requests.Session, username, password):
        response = session.post(
            f'{self.service_url}/login',
            json={
                "username": username,
                "password": password
            })
        response_json = response.content
        if response.status_code >= 300:
            raise Exception('Request was not success')
        response_data = json.loads(response_json.decode())
        if not response_data["success"]:
            raise Exception('Request was not success')

    def get_user(self, user_id):
        response = requests.get(
            f'{self.service_url}/user',
            params={'userId': user_id})
        response_json = response.content.decode()
        response_data = json.loads(response_json)

        return response_data

    def search(self, first_name, last_name):
        response = requests.post(
            f'{self.service_url}/searchUser',
            json={
                "query": {
                    "firstName": first_name,
                    "lastName": last_name
                }
            })
        response_json = response.content
        if response.status_code >= 300:
            raise Exception('Request was not success')
        response_data = json.loads(response_json.decode())
        if not response_data["success"]:
            raise Exception('Request was not success')

        return response_data

    def edit_user(self, session, fields):
        response = session.post(
            f'{self.service_url}/editUser',
            json={
                "fields": fields
            })
        response_json = response.content
        if response.status_code >= 300:
            raise Exception('Request was not success')
        response_data = json.loads(response_json.decode())
        if not response_data["success"]:
            raise Exception('Request was not success')

        return response_data
