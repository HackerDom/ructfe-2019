import json

import aiohttp
from aiohttp.client import ClientTimeout

from networking.masking_connector import get_agent

PORT = 23179


class Api:
    def __init__(self, hostname: str):
        self.hostname = hostname
        self.session = aiohttp.ClientSession(timeout=ClientTimeout(total=100), headers={"User-Agent": get_agent()})

    async def send_and_get(self, _json: str) -> dict:
        async with self.session.post(f"http://{self.hostname}:{PORT}/", data=_json) as resp:
            data = await resp.read()
            return json.loads(data)

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.session.close()
