import aiohttp
import os
from typing import Tuple, Dict
from networking.masking_connector import get_agent
from aiohttp.client import ClientTimeout
from random import randint

PORT = os.getenv('RADIO_PORT', 80)


class Api:
    def __init__(self, hostname: str, api_path):
        self.hostname = hostname
        self.base_url = f'http://{self.hostname}:{PORT}/{api_path}'
        self.session = aiohttp.ClientSession(timeout=ClientTimeout(total=10), headers={"User-Agent": get_agent()})

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

    async def create_playlist(self, name: str, description: str, is_private: str) -> Tuple[int, Dict]:
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
