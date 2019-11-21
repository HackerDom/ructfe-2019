from base64 import b64decode, b64encode
from json import dumps

from aiohttp import web
from webargs import fields
from webargs.aiohttpparser import use_args


class LweHandler:
    def __init__(self, algo, db):
        self._algo = algo
        self._db = db

    @use_args({
        'login': fields.Str(required=True)
    })
    async def get_pub_key(self, request, args):
        login = args['login']
        pub_key = await self._db.get_pub_key(login)
        if pub_key is None:
            pub_key, priv_key = self._algo.generate_keys()
            pub_key = b64encode(b','.join(str(x).encode() for x in pub_key)).decode()
            priv_key = b64encode(b';'.join(b','.join(str(y).encode() for y in x) for x in priv_key)).decode()
            await self._db.save_keys(login, {'pub_key': pub_key, 'priv_key': priv_key})
        pub_key = await self._db.get_pub_key(login)
        return web.Response(body=dumps({'pub_key': pub_key}))

    @use_args({
        'login': fields.Str(required=True),
        'm': fields.Str(required=True)
    })
    async def sign(self, request, args):
        note_hash = bytes.fromhex(args['m'])
        login = args['login']
        priv_key = await self._db.get_priv_key(login)
        priv_key = list(list(map(int, x.split(','))) for x in b64decode(priv_key).decode().split(';'))
        s = self._algo.sign(note_hash, priv_key)
        s = b64encode(b';'.join(b','.join(str(y).encode() for y in x) for x in s)).decode()
        await self._db.set_note_hash(login, note_hash)
        return web.Response(body=dumps({'s': s}))

    @use_args({
        'login': fields.Str(required=True),
        'm': fields.Str(required=True),
        's': fields.Str(required=True)
    })
    async def verify(self, request, args):
        note_hash = bytes.fromhex(args['m'])
        sign = list(list(map(int, x.split(','))) for x in b64decode(args['s'].encode()).decode().split(';'))
        login = args['login']
        is_note_hash = await self._db.is_note_hash(login, note_hash)
        if is_note_hash:
            pub_key = await self._db.get_pub_key(login)
            pub_key = list(map(int, b64decode(pub_key).decode().split(',')))
            is_valid = self._algo.verify(note_hash, pub_key, sign)
            return web.Response(body=dumps({'res': is_valid}))
        return web.Response(body=dumps({'res': False}))
