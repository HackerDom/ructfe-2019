import requests

from utils.parse_response import parse_response


class UsersApi:
    def __init__(self, service_url):
        self.service_url = service_url

    def register(self, user):
        response = requests.post(f'{self.service_url}/register', json=user)

        return parse_response(response.content, response.status_code)

    def login(self, session: requests.Session, username, password):
        response = session.post(
            f'{self.service_url}/login',
            json={
                "username": username,
                "password": password
            })

        return parse_response(response.content, response.status_code)

    def get_user(self, user_id):
        response = requests.get(
            f'{self.service_url}/user',
            params={'userId': user_id})

        return parse_response(response.content, response.status_code)

    def search(self, first_name, last_name):
        response = requests.post(
            f'{self.service_url}/searchUser',
            json={
                "query": {
                    "firstName": first_name,
                    "lastName": last_name
                }
            })

        return parse_response(response.content, response.status_code)

    def edit_user(self, session, fields):
        response = session.post(
            f'{self.service_url}/editUser',
            json={
                "fields": fields
            })

        return parse_response(response.content, response.status_code)
