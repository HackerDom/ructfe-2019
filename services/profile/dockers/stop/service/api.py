from aiohttp import web

from service.handler import StopHandler
from service.stop import Lampfie
from service.db import DB

db = DB()
handler = StopHandler(Lampfie(), db)

app = web.Application()
app.add_routes([
    web.get('/get_pub_key', handler.get_pub_key),
    web.post('/sign', handler.sign),
    web.post('/verify', handler.verify)
])