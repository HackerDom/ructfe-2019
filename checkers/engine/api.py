#!/usr/bin/env python3.7

from aiohttp import ClientSession
from aiohttp.client import ClientTimeout

from networking.masking_connector import get_agent


class API:
    PORT = 17171

    def __init__(self, hostname: str):
        self.url = f'http://{hostname}:{API.PORT}'
        self.session = ClientSession(timeout=ClientTimeout(total=120), headers={"User-Agent": get_agent()})

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.session.close()

    async def health_check(self) -> int:
        async with self.session.get(self.url + '/api/ping/') as r:
            return r.status
    
    async def list_fuel(self) -> (int, list):
        async with self.session.get(self.url + '/api/list/') as r:
            text = await r.text()
        
        return r.status, text.strip('\n').split('\n')

    async def upload_fuel(self, fuel: bytes) -> (int, str):
        async with self.session.post(self.url + '/api/upload/', data=fuel) as r:
            text = await r.text()

        return r.status, text.strip('\n')

    async def check_fuel_property(self, fuel_id: str, property: str) -> (int, str):
        async with self.session.post(self.url + '/api/check/' + f'?{fuel_id}', data=property) as r:
            text = await r.text()
        
        return r.status, text.strip('\n')
