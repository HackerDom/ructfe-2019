import aiohttp
import os

from typing import Tuple, Dict
from networking.masking_connector import get_agent
from aiohttp.client import ClientTimeout

PORT = os.getenv('RADIO_PORT', 80)


class BaseApi:
    base_url = None
    session = None

    def make_url(self, url):
        return f'{self.base_url}{url}'

    async def create_user(self, username: str, password: str) -> Tuple[int, Dict]:
        data = {
            'username': username,
            'password': password,
            'repeated_password': password
        }
        async with self.session.post(self.make_url('/register/'), json=data) as resp:
            return resp.status, await resp.json()

    async def login_user(self, username: str, password: str) -> Tuple[int, Dict]:
        data = {
            'username': username,
            'password': password
        }
        async with self.session.post(self.make_url('/login/'), json=data) as resp:
            return resp.status, await resp.json()

    async def get_token(self) -> Tuple[int, Dict]:
        async with self.session.get(self.make_url('/token/')) as resp:
            return resp.status, await resp.json()

    async def our_users(self):
        async with self.session.get(self.make_url('/our-users/')) as resp:
            return resp.status, await resp.json()

    async def create_playlist(self, name: str, description: str, is_private: bool) -> Tuple[int, Dict]:
        data = {
            'name': name,
            'description': description,
            'is_private': is_private
        }
        async with self.session.post(self.make_url('/playlist/'), json=data) as resp:
            return resp.status, await resp.json()

    async def delete_playlist(self, playlist_id):
        async with self.session.delete(self.make_url(f'/playlist/{playlist_id}/')) as resp:
            return resp.status, await resp.json()

    async def list_playlists(self):
        async with self.session.get(self.make_url('/playlist/')) as resp:
            return resp.status, await resp.json()

    async def get_playlist(self, playlist_id):
        async with self.session.get(self.make_url(f'/playlist/{playlist_id}/')) as resp:
            return resp.status, await resp.json()

    async def get_shared_playlist(self, public_playlist, user):
        async with self.session.get(self.make_url(f'/share/playlist/{public_playlist["sharehash"]}/')) as resp:
            return resp.status, await resp.json()

    async def create_track(self, playlist_id):
        data = {
            'playlist_id': playlist_id
        }
        async with self.session.post(self.make_url('/track/'), json=data) as resp:
            return resp.status, await resp.json()

    async def delete_track(self, track_id):
        async with self.session.delete(self.make_url(f'/track/{track_id}/')) as resp:
            return resp.status, await resp.json()

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.session.close()


class FrontendApi(BaseApi):
    def __init__(self, hostname: str, custom_headers=None):
        self.hostname = hostname
        self.base_url = f'http://{self.hostname}:{PORT}'
        custom_headers = custom_headers or {}
        headers = {"User-Agent": get_agent()}
        headers.update(custom_headers)
        self.session = aiohttp.ClientSession(timeout=ClientTimeout(total=10), headers=headers)

    def make_url(self, url):
        return f'{self.base_url}/frontend-api{url}'


class Api(BaseApi):
    def __init__(self, hostname: str, custom_headers=None):
        self.hostname = hostname
        self.base_url = f'http://{self.hostname}:{PORT}'
        custom_headers = custom_headers or {}
        headers = {"User-Agent": get_agent()}
        headers.update(custom_headers)
        self.session = aiohttp.ClientSession(timeout=ClientTimeout(total=10), headers=headers)

    def make_url(self, url):
        return f'{self.base_url}/api/v1{url}'

    async def login_user(self, username: str, password: str) -> Tuple[int, Dict]:
        data = {
            'username': username,
            'password': password
        }
        async with self.session.post(f'{self.base_url}/frontend-api/login/', json=data) as resp:
            return resp.status, await resp.json()
