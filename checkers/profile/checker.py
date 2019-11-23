#!/usr/bin/env python3.7
import os
import traceback
from base64 import b64decode, b64encode

import asyncio

from api import API
from algos.lwe.rlwe import RLWE
from algos.stop.stop import Nitzerwint
from chklib import Checker, CheckRequest, GetRequest, PutRequest, Verdict

checker = Checker()


@checker.define_check
async def check_service(request: CheckRequest) -> Verdict:
    async with API(request.hostname) as api:
        try:
            await api.health_check()
        except Exception as ex:
            return Verdict.DOWN('', traceback.format_exc())
    return Verdict.OK()


@checker.define_put(vuln_num=1, vuln_rate=1)
async def put_flag_lwe(request: PutRequest) -> Verdict:
    login = os.urandom(5).hex()
    algo = 'lwe'

    async with API(request.hostname) as api:
        try:
            pub_key = await api.get_pub_key(algo, login)
            pub_key = list(list(map(int, x.split(','))) for x in b64decode(pub_key['pub_key']).decode().split(';'))

        except Exception as e:
            return Verdict.MUMBLE("Can't get public key", traceback.format_exc())
    
        try:
            signed = await api.sign(algo, login, request.flag)
            signature, note_hash = signed['s'], signed['h']
 
            _signature = list(list(map(int, x.split(','))) for x in b64decode(signature).decode().split(';'))
            _note_hash = bytes.fromhex(note_hash)
        except Exception as e:
            return Verdict.MUMBLE("Can't sign message", traceback.format_exc())

    algo = RLWE(16, 929)
    if algo.verify(_note_hash, pub_key, _signature):
        return Verdict.OK("{}:{}:{}".format(login, note_hash, signature))
    else:
        return Verdict.MUMBLE('Wrong signature', 'Wrong signature')


@checker.define_get(vuln_num=1)
async def get_flag_lwe(request: GetRequest) -> Verdict:
    login, note_hash, signature = request.flag_id.split(':')
    algo = 'lwe'

    async with API(request.hostname) as api:
        try:
            users = await api.get_users()
            if login not in users['users']:
                return Verdict.MUMBLE('No user', 'No user')
        except Exception as e:
            return Verdict.MUMBLE("Can't get users", traceback.format_exc())

        try:
            notes = await api.get_notes(algo, login)
            if note_hash not in notes['notes']:
                return Verdict.MUMBLE('No note', 'No note')
        except Exception as e:
            return Verdict.MUMBLE("Can't get notes", traceback.format_exc())

        try:
            pub_key = await api.get_pub_key(algo, login)
            pub_key = list(list(map(int, x.split(','))) for x in b64decode(pub_key['pub_key']).decode().split(';'))
        except Exception as e:
            return Verdict.MUMBLE("No public key", traceback.format_exc())
        
        try:
            verified = await api.verify(algo, login, signature, note_hash)
            flag = verified['data']
        except Exception as e:
            return Verdict.MUMBLE("Can't validate", traceback.format_exc())

        if flag != request.flag:
            return Verdict.MUMBLE('Wrong data')
        return Verdict.OK()


@checker.define_put(vuln_num=2, vuln_rate=1)
async def put_flag_stop(request: PutRequest) -> Verdict:
    login = os.urandom(5).hex()
    algo = 'stop'

    async with API(request.hostname) as api:
        try:
            pub_key = await api.get_pub_key(algo, login)
            pub_key = list(map(bytes.fromhex, b64decode(pub_key['pub_key']).decode().split(',')))
        except Exception as e:
            return Verdict.MUMBLE("Can't get public key", traceback.format_exc())
    
        try:
            signed = await api.sign(algo, login, request.flag)
            signature, note_hash = signed['s'], signed['h']
 
            _signature = bytes.fromhex(signature)
            _note_hash = bytes.fromhex(note_hash)
        except Exception as e:
            return Verdict.MUMBLE("Can't sign message", traceback.format_exc())

    algo = Nitzerwint()

    if algo.verify(_note_hash, pub_key, _signature):
        return Verdict.OK("{}:{}:{}".format(login, note_hash, signature))
    else:
        return Verdict.MUMBLE('Wrong signature', 'Wrong signature')


@checker.define_get(vuln_num=2)
async def get_flag_stop(request: GetRequest) -> Verdict:
    login, note_hash, signature = request.flag_id.split(':')
    algo = 'stop'

    async with API(request.hostname) as api:
        try:
            users = await api.get_users()
            if login not in users['users']:
                return Verdict.MUMBLE('No user', 'No user')
        except Exception as e:
            return Verdict.MUMBLE("Can't get users", traceback.format_exc())

        try:
            notes = await api.get_notes(algo, login)
            if note_hash not in notes['notes']:
                return Verdict.MUMBLE('No note', 'No note')
        except Exception as e:
            return Verdict.MUMBLE("Can't get notes", traceback.format_exc())

        try:
            pub_key = await api.get_pub_key(algo, login)
            pub_key = list(map(bytes.fromhex, b64decode(pub_key['pub_key']).decode().split(',')))
        except Exception as e:
            return Verdict.MUMBLE("No public key", traceback.format_exc())
        
        try:
            verified = await api.verify(algo, login, signature, note_hash)
            flag = verified['data']
        except Exception as e:
            return Verdict.MUMBLE("Can't validate", traceback.format_exc())

        if flag != request.flag:
            return Verdict.MUMBLE('Wrong data')
        return Verdict.OK()


if __name__ == "__main__":
    checker.run()