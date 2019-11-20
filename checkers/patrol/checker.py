#!/usr/bin/env python3
import asyncio
import json
import os
import subprocess
import traceback
import uuid
import platform

from api import Api
from chklib import Checker, Verdict, \
    CheckRequest, PutRequest, GetRequest

checker = Checker()


@checker.define_check
async def check_service(request: CheckRequest) -> Verdict:
    d = dict()
    d['type'] = 'LIST'

    id = uuid.uuid4()
    with open(f'temp/{id}.json', 'w') as f:
        json.dump(d, f)
    async with Api(request.hostname) as api:
        try:
            downloaded_json = (await api.send_and_get(f'temp/{id}.json'))
        except Exception as e:
            os.remove(f'temp/{id}.json')
            return Verdict.DOWN(str(e), traceback.format_exc())

    if 'type' not in downloaded_json:
        os.remove(f'temp/{id}.json')
        return Verdict.MUMBLE("Bad json", "'type' not in answer")

    os.remove(f'temp/{id}.json')
    return Verdict.OK()


@checker.define_put(vuln_num=1, vuln_rate=1)
async def put_flag_into_the_service(request: PutRequest) -> Verdict:
    rid = uuid.uuid4()
    id = uuid.uuid4()

    cmd = f'./gradlew run --quiet --args="-m=create -r={rid}.json --id={id} --rid={rid} -f={request.flag}"'
    last = await get_out(cmd)

    async with Api(request.hostname) as api:
        try:
            downloaded_json = (await api.send_and_get(f'temp/{rid}.json'))
        except Exception as e:
            os.remove(f'temp/{rid}.json')
            return Verdict.DOWN(str(e), traceback.format_exc())

    if 'flag' not in downloaded_json or downloaded_json['flag'] != request.flag:
        os.remove(f'temp/{rid}.json')
        return Verdict.MUMBLE("Bad json", "'flag' not in answer or it's incorrect")

    os.remove(f'temp/{rid}.json')
    return Verdict.OK(last)


@checker.define_get(vuln_num=1)
async def get_flag_from_the_service(request: GetRequest) -> Verdict:
    id, seed = request.flag_id.split()

    rid = str(uuid.uuid4())

    d = dict()
    d['type'] = 'GET_GRAPH'
    d['graphId'] = id
    d['reqId'] = rid

    with open(f'temp/{rid}.json', 'w') as f:
        json.dump(d, f)

    async with Api(request.hostname) as api:
        try:
            downloaded_json = (await api.send_and_get(f'temp/{rid}.json'))
        except Exception as e:
            os.remove(f'temp/{rid}.json')
            return Verdict.DOWN(str(e), traceback.format_exc())

    if 'graph' not in downloaded_json:
        os.remove(f'temp/{rid}.json')
        return Verdict.MUMBLE("Bad json", "'graph' not in answer")

    for _ in range(50):
        cmd = f'./gradlew run --quiet --args="-m=iso --id={id} -r={rid}.json --rid={rid} -s={seed}"'
        perm_seed = await get_out(cmd)
        async with Api(request.hostname) as api:
            try:
                downloaded_json = (await api.send_and_get(f'temp/{rid}.json'))
            except Exception as e:
                os.remove(f'temp/{rid}.json')
                return Verdict.DOWN(str(e), traceback.format_exc())

        if 'type' not in downloaded_json \
                or (downloaded_json['type'] != 'REQ_VC' and downloaded_json['type'] != 'REQ_PERM'):
            os.remove(f'temp/{rid}.json')
            return Verdict.MUMBLE("Bad json", "'type' not in answer or it's incorrect")

        type = downloaded_json['type']

        if type == 'REQ_VC':
            cmd = f'./gradlew run --quiet --args="-m=vc -r={rid}.json --rid={rid} -s={seed} --ps={perm_seed}"'
        else:
            cmd = f'./gradlew run --quiet --args="-m=perm -r={rid}.json --rid={rid} -s={seed} --ps={perm_seed}"'

        await get_out(cmd)

        async with Api(request.hostname) as api:
            try:
                downloaded_json = (await api.send_and_get(f'temp/{rid}.json'))
            except Exception as e:
                os.remove(f'temp/{rid}.json')
                return Verdict.DOWN(str(e), traceback.format_exc())

        if 'type' not in downloaded_json \
                or (downloaded_json['type'] != 'CONTINUE' and downloaded_json['type'] != 'OK'):
            os.remove(f'temp/{rid}.json')
            return Verdict.MUMBLE("Bad json", "'type' not in answer or it's incorrect")

        if downloaded_json['type'] == 'OK':
            if 'flag' not in downloaded_json:
                os.remove(f'temp/{rid}.json')
                return Verdict.CORRUPT("Bad json", "'flag' not in answer")
            if downloaded_json['flag'] != request.flag:
                os.remove(f'temp/{rid}.json')
                return Verdict.CORRUPT("Invalid flag", "Invalid flag")
            os.remove(f'temp/{rid}.json')
            return Verdict.OK()

    os.remove(f'temp/{rid}.json')
    return Verdict.MUMBLE("Bad responses", "Too many requests")


async def get_out(cmd):
    d = dict(os.environ)
    if platform.system() == 'Darwin':
        d['JAVA_HOME'] = "/Library/Java/JavaVirtualMachines/jdk-11.0.5.jdk/Contents/Home/"

    p = await asyncio.create_subprocess_shell(cmd, shell=True,
                                              stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=d)
    stdout, stderr = await p.communicate()
    return stdout.decode('utf-8')


if __name__ == '__main__':
    checker.run()