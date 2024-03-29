import aiohttp
from aiohttp.client import ClientTimeout

from networking.masking_connector import get_agent

PORT = 20561

class API:
    def __init__(self, hostname):
        self.hostname = hostname
        self.session = aiohttp.ClientSession(timeout=ClientTimeout(total=100), headers={"User-Agent": get_agent()})

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.session.close()

    async def health_check(self):
        async with self.session.get('http://{}:{}/'.format(self.hostname, PORT)) as r:
            return r.status

    async def get_pub_key(self, algo, login, note_hash):
        async with self.session.get('http://{}:{}/get_pub_key'.format(self.hostname, PORT), params={'login': login, 'algo': algo, 'h': note_hash}) as r:
            return await r.json()

    async def sign(self, algo, login, data):
        data = {
            'login': login,
            'algo': algo,
            'data': data
        }
        async with self.session.post('http://{}:{}/sign'.format(self.hostname, PORT), data=data) as r:
            return await r.json()


    async def verify(self, algo, login, signature, note_hash):
        data = {
            'login': login,
            'algo': algo,
            's': signature,
            'h': note_hash
        }
        async with self.session.post('http://{}:{}/verify'.format(self.hostname, PORT), data=data) as r:
            return await r.json()

    async def get_users(self):
        async with self.session.get('http://{}:{}/get_users'.format(self.hostname, PORT)) as r:
            return await r.json()
    
    async def get_notes(self, algo, login):
        async with self.session.get('http://{}:{}/get_notes'.format(self.hostname, PORT), params={'login': login, 'algo': algo}) as r:
            return await r.json()