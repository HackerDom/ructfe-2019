import requests

from utils.parse_response import parse_response


class ChatsApi:
    def __init__(self, service_url):
        self.service_url = service_url

    def create(self, session: requests.Session, chat_name):
        response = session.post(
            f'{self.service_url}/createChat',
            json={
                'chatName': chat_name,
            })

        return parse_response(response.content, response.status_code)

    def join(self, session: requests.Session, chat_id, invite_link):
        response = session.post(
            f'{self.service_url}/joinChat',
            json={
                'chatId': chat_id,
                'inviteLink': invite_link
            })

        return parse_response(response.content, response.status_code)

    def send_message(self, session: requests.Session, chat_id, message_text):
        response = session.post(
            f'{self.service_url}/sendMessage',
            json={
                'chatId': chat_id,
                'messageText': message_text
            })

        return parse_response(response.content, response.status_code)

    def delete_message(self, session: requests.Session, message_id):
        response = session.post(
            f'{self.service_url}/deleteMessage',
            json={
                'messageId': message_id
            })

        return parse_response(response.content, response.status_code)

    def read_messages(self, session: requests.Session, chat_id):
        response = session.get(
            f'{self.service_url}/messages',
            params={
                'chatId': chat_id
            })

        return parse_response(response.content, response.status_code)

    def get_invite_link(self, session: requests.Session, chat_id):
        response = session.get(
            f'{self.service_url}/inviteLink',
            params={
                'chatId': chat_id
            })

        return parse_response(response.content, response.status_code)
