import redis


class DB:
    def __init__(self):
        self._db = redis.Redis.from_url('redis://redis:6379/?encoding=utf-8', decode_responses=True)

    def save_login(self, login):
        return self._db.sadd('/logins', login)

    def check_login(self, login):
        return self._db.sismember('/logins', login)

    def get_logins(self):
        return self._db.smembers('/logins')

    def save_note(self, login, algo, note_hash, note_body):
        with self._db.pipeline() as pipe:
            return pipe.sadd('/notes/{}/{}'.format(algo, login), note_hash).hmset("/{}/{}".format(algo, note_hash), note_body).execute()

    def get_notes(self, login, algo):
        return self._db.smembers('/notes/{}/{}'.format(algo, login))

    def get_note(self, algo, note_hash):
        return self._db.hgetall("/{}/{}".format(algo, note_hash))