from base64 import b64decode, b64encode
from json import dumps

from aiohttp import web

from service.handler import LweHandler
from service.rlwe import RLWE
from service.db import DB


db = DB()
algo = RLWE(16, 929, 5)
handler = LweHandler(algo, DB())

app = web.Application()
app.add_routes([
    web.get('/get_pub_key', handler.get_pub_key),
    web.post('/sign', handler.sign),
    web.post('/verify', handler.verify)
])