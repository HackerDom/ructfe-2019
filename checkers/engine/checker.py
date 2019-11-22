#!/usr/bin/env python3.7

import os
import traceback

from random import randint, choice
from string import ascii_uppercase, digits
from subprocess import Popen, PIPE

from api import API
from chklib import Checker, CheckRequest, GetRequest, PutRequest, Verdict


checker = Checker()


def rands(alpha, length):
    return ''.join(choice(alpha) for _ in range(length))


def fake_flag():
    return rands(ascii_uppercase + digits, 31) + '='


def flag_meat(meat_size=16*1024, fakes_count=128):
    meat = rands(ascii_uppercase + digits + '=', meat_size)
    fakes = [(randint(0, len(meat) - 1), fake_flag()) for _ in range(fakes_count)]
    
    offset = 0
    for x, fake in fakes:
        x = x + offset
        meat = meat[:x] + fake + meat[x:]
        offset += len(fake)
    
    return meat


@checker.define_check
async def check_service(request: CheckRequest) -> Verdict:
    async with API(request.hostname) as api:
        try:
            status = await api.health_check()
        except Exception as ex:
            return Verdict.DOWN('Connection error', traceback.format_exc())

        if status != 200:
            return Verdict.MUMBLE('Ping failed', f'Status: {status}')
    
    return Verdict.OK()


@checker.define_put(vuln_num=1, vuln_rate=1)
async def put_flag(request: PutRequest) -> Verdict:
    process = Popen(['./generator', request.flag, '0', '0', '0'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
    fuel, err = process.communicate(timeout=2)

    if len(err) > 0:
        return Verdict.CHECKER_ERROR('Internal checker error', repr(err))
    
    async with API(request.hostname) as api:
        try:
            status, fuel_id = await api.upload_fuel(fuel)
        except Exception as ex:
            return Verdict.DOWN('Connection error', traceback.format_exc())
    
        if status != 200:
            return Verdict.MUMBLE('Can\'t upload fuel', f'Status: {status}')
        
        if len(fuel_id) == 0:
            return Verdict.MUMBLE('Fuel name is empty', '')

    return Verdict.OK(fuel_id)


@checker.define_get(vuln_num=1)
async def get_flag(request: GetRequest) -> Verdict:
    fuel_id = request.flag_id

    meat = flag_meat()
    index = randint(0, len(meat) - 1)
    payload = meat[:index] + request.flag + meat[index:]

    result = f'[{index} -> {index + len(request.flag) - 1}] ({len(request.flag)})'

    async with API(request.hostname) as api:
        try:
            status, fuel_ids = await api.list_fuel()
        except Exception as ex:
            return Verdict.DOWN('Connection error', traceback.format_exc())

        if status != 200 or fuel_id not in fuel_ids:
            return Verdict.CORRUPT('Can\'t find fuel', f'Status: {status}')
        
        try:
            status, response = await api.check_fuel_property(fuel_id, payload)
        except Exception as ex:
            return Verdict.DOWN('Connection error', traceback.format_exc())

        if status != 200 or response != result:
            return Verdict.CORRUPT('Can\'t check property', f'Status: {status}')

    return Verdict.OK()


if __name__ == '__main__':
    checker.run()
