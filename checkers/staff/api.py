import aiohttp
from aiohttp.client import ClientTimeout

from utils.parser_helpers import parse_response
from networking.masking_connector import get_agent


class Api:
    def __init__(self, service_url: str) -> dict:
        self.service_url = service_url
        self.session = aiohttp.ClientSession(
            timeout=ClientTimeout(total=10),
            headers={"User-Agent": get_agent()}
        )

    async def create(self, chat_name: str) -> dict:
        async with self.session.post(
                f'{self.service_url}/createChat',
                json={
                    'chatName': chat_name,
                }) as response:
            return parse_response(await response.json(), response.status)

    async def join(self, chat_id: str, invite_link: str) -> dict:
        async with self.session.post(
                f'{self.service_url}/joinChat',
                json={
                    'chatId': chat_id,
                    'inviteLink': invite_link
                }) as response:
            return parse_response(await response.json(), response.status)

    async def send_message(self, chat_id: str, message_text: str) -> dict:
        async with self.session.post(
                f'{self.service_url}/sendMessage',
                json={
                    'chatId': chat_id,
                    'messageText': message_text
                }) as response:
            return parse_response(await response.json(), response.status)

    async def delete_message(self, message_id: str) -> dict:
        async with self.session.post(
                f'{self.service_url}/deleteMessage',
                json={
                    'messageId': message_id
                }) as response:
            return parse_response(await response.json(), response.status)

    async def read_messages(self, chat_id: str) -> dict:
        async with self.session.get(
                f'{self.service_url}/messages',
                params={
                    'chatId': chat_id
                }) as response:
            return parse_response(await response.json(), response.status)

    async def get_invite_link(self, chat_id: str) -> dict:
        async with self.session.get(
                f'{self.service_url}/inviteLink',
                params={
                    'chatId': chat_id
                }) as response:
            return parse_response(await response.json(), response.status)

    async def register(self, user: str) -> dict:
        async with self.session.post(f'{self.service_url}/register', json=user) as response:
            return parse_response(await response.json(), response.status)

    async def login(self, username: str, password: str) -> dict:
        async with self.session.post(
                f'{self.service_url}/login',
                json={
                    'username': username,
                    'password': password
                }) as response:
            return parse_response(await response.json(), response.status)

    async def get_user(self, user_id: str) -> dict:
        async with self.session.get(
                f'{self.service_url}/user',
                params={'userId': user_id}
        ) as response:
            return parse_response(await response.json(), response.status)

    async def get_chats(self) -> dict:
        async with self.session.get(
                f'{self.service_url}/chats'
        ) as response:
            return parse_response(await response.json(), response.status)

    async def search(self, first_name: str, last_name: str) -> dict:
        async with self.session.post(
                f'{self.service_url}/searchUser',
                json={
                    'query': {
                        'firstName': first_name,
                        'lastName': last_name
                    }
                }) as response:
            return parse_response(await response.json(), response.status)

    async def edit_user(self, fields: dict) -> dict:
        async with self.session.post(
                f'{self.service_url}/editUser',
                json={
                    'fields': fields
                }) as response:
            return parse_response(await response.json(), response.status)

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.session.close()