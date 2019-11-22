#!/usr/bin/env python3
import asyncio
import json
import os
import subprocess
import traceback
import uuid
import platform
import sys

from api import Api
from chklib import Checker, Verdict, \
    CheckRequest, PutRequest, GetRequest

checker = Checker()


@checker.define_check
async def check_service(request: CheckRequest) -> Verdict:
    d = dict()
    d['type'] = 'LIST'

    id = uuid.uuid4()
    _json = json.dumps(d)

    async with Api(request.hostname) as api:
        try:
            downloaded_json = (await api.send_and_get(_json))
        except Exception as e:
            return Verdict.DOWN(str(e), traceback.format_exc())

    if 'type' not in downloaded_json:
        print("during check", file=sys.stderr)
        return Verdict.MUMBLE("Bad json", "'type' not in answer")

    return Verdict.OK()


@checker.define_put(vuln_num=1, vuln_rate=1)
async def put_flag_into_the_service(request: PutRequest) -> Verdict:
    rid = uuid.uuid4()
    id = uuid.uuid4()

    cmd = f'java -Xss1024m -jar ./build/libs/patrol-1.0.0.jar -m=create --id={id} --rid={rid} -f={request.flag}'
    _json, last = await get_out(cmd)

    async with Api(request.hostname) as api:
        try:
            downloaded_json = (await api.send_and_get(_json))
        except Exception as e:
            return Verdict.DOWN(str(e), traceback.format_exc())

    if 'flag' not in downloaded_json or downloaded_json['flag'] != request.flag:
        print(f"after put, json={downloaded_json}, reason={downloaded_json['reason']}", file=sys.stderr)
        return Verdict.MUMBLE("Bad json", "'flag' not in answer or it's incorrect")

    return Verdict.OK(last)


@checker.define_get(vuln_num=1)
async def get_flag_from_the_service(request: GetRequest) -> Verdict:
    id, seed = request.flag_id.split()

    rid = str(uuid.uuid4())

    d = dict()
    d['type'] = 'GET_GRAPH'
    d['graphId'] = id
    d['reqId'] = rid

    _json = json.dumps(d)

    async with Api(request.hostname) as api:
        try:
            downloaded_json = (await api.send_and_get(_json))
        except Exception as e:
            return Verdict.DOWN(str(e), traceback.format_exc())

    if 'graph' not in downloaded_json:
        return Verdict.MUMBLE("Bad json", "'graph' not in answer")

    for _ in range(30):
        cmd = f'java -Xss1024m -jar ./build/libs/patrol-1.0.0.jar -m=iso -s={seed} --id={id} --rid={rid}'
        _json, perm_seed = await get_out(cmd)
        async with Api(request.hostname) as api:
            try:
                downloaded_json = (await api.send_and_get(_json))
            except Exception as e:
                return Verdict.DOWN(str(e), traceback.format_exc())

        if 'type' not in downloaded_json \
                or (downloaded_json['type'] != 'REQ_VC' and downloaded_json['type'] != 'REQ_PERM'):
            print(f"after sending iso, reason={downloaded_json['reason']}", file=sys.stderr)
            return Verdict.MUMBLE("Bad json", "'type' not in answer or it's incorrect")

        type = downloaded_json['type']

        if type == 'REQ_VC':
            cmd = f'java -Xss1024m -jar ./build/libs/patrol-1.0.0.jar -m=vc' \
                f' -s={seed} --ps={perm_seed} --rid={rid}'
        else:
            cmd = f'java -Xss1024m -jar ./build/libs/patrol-1.0.0.jar -m=perm' \
                f' -s={seed} --rid={rid} --ps={perm_seed}'

        _json, _ = await get_out(cmd)

        async with Api(request.hostname) as api:
            try:
                downloaded_json = (await api.send_and_get(_json))
            except Exception as e:
                return Verdict.DOWN(str(e), traceback.format_exc())

        if 'type' not in downloaded_json \
                or (downloaded_json['type'] != 'CONTINUE' and downloaded_json['type'] != 'OK'):
            print(f"after sending {type}, reason={downloaded_json['reason']}", file=sys.stderr)
            return Verdict.MUMBLE("Bad json", "'type' not in answer or it's incorrect")

        if downloaded_json['type'] == 'OK':
            if 'flag' not in downloaded_json:
                return Verdict.CORRUPT("Bad json", "'flag' not in answer")
            if downloaded_json['flag'] != request.flag:
                return Verdict.CORRUPT("Invalid flag", "Invalid flag")
            return Verdict.OK()

    return Verdict.MUMBLE("Bad responses", "Too many requests")


async def get_out(cmd):
    d = dict(os.environ)
    if platform.system() == 'Darwin':
        d['JAVA_HOME'] = "/Library/Java/JavaVirtualMachines/jdk-11.0.5.jdk/Contents/Home/"

    p = await asyncio.create_subprocess_shell(cmd, shell=True,
                                              stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=d)

    stdout, stderr = await p.communicate()

    if p.returncode:
        print(cmd, file=sys.stderr)
        return -1

    return stdout.decode('utf-8').strip(), stderr.decode('utf-8').strip()


if __name__ == '__main__':
    checker.run()
