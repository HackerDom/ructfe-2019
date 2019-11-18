import aiohttp
import json
from networking.masking_connector import get_agent
from aiohttp.client import ClientTimeout
from random import randint

PORT = 23179


class Api:
    def __init__(self, hostname: str):
        self.hostname = hostname
        self.session = aiohttp.ClientSession(timeout=ClientTimeout(total=10), headers={"User-Agent": get_agent()})

    async def send_and_get(self, path: str) -> dict:
        with open(path, mode="rb") as archive_descriptor:
            archive_bytes = archive_descriptor.read()
        async with self.session.post(f"http://{self.hostname}:{PORT}/", data=archive_bytes) as resp:
            data = await resp.read()
            return json.loads(data)

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.session.close()