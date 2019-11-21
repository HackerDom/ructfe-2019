import aioredis


class DB:
    def __init__(self):
        self.addr = 'redis://redis:6379/2?encoding=utf-8'
        self.db = None

    async def get_db(self):
        if self.db is None:
            self.db = await aioredis.create_redis(self.addr)
        return self.db

    async def save_keys(self, login, keys):
        db = await self.get_db()
        return await db.hmset_dict('/keys/{}'.format(login), keys)

    async def get_pub_key(self, login):
        db = await self.get_db()
        return await db.hget('/keys/{}'.format(login), 'pub_key')

    async def get_priv_key(self, login):
        db = await self.get_db()
        return await db.hget('/keys/{}'.format(login), 'priv_key')

    async def set_note_hash(self, login, note_hash):
        db = await self.get_db()
        return await db.sadd('/notes/{}'.format(login), note_hash)
    
    async def is_note_hash(self, login, note_hash):
        db = await self.get_db()
        return await db.sismember('/notes/{}'.format(login), note_hash)