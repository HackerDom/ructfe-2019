#!/usr/bin/env python3
import asyncio
import json
import os
import subprocess
import traceback
import uuid
import platform
import sys
import random

import datetime

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
            return Verdict.DOWN("couldn't connect", traceback.format_exc())

    if 'type' not in downloaded_json:
        print("during check", file=sys.stderr)
        return Verdict.MUMBLE("Bad json, 'type' not in answer", "")

    return Verdict.OK()


async def check_in_list(request, id):
    d = dict()
    d['type'] = 'LIST'
    _json = json.dumps(d)

    async with Api(request.hostname) as api:
        try:
            downloaded_json = (await api.send_and_get(_json))
        except Exception as e:
            return False
    try:
        if 'ids' not in downloaded_json or str(id) not in downloaded_json['ids']:
            return False
    except Exception:
        return False
    return True


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
            return Verdict.DOWN("couldn't connect", traceback.format_exc())

    if 'flag' not in downloaded_json or downloaded_json['flag'] != request.flag:
        try:
            print(f"after put, json={downloaded_json}, reason={downloaded_json['reason']}", file=sys.stderr)
        except:
            pass
        return Verdict.MUMBLE("Bad json, 'flag' not in answer or it's incorrect", "")

    if not await check_in_list(request, id):
        return Verdict.MUMBLE("Bad list, id not in answer.ids", "")

    return Verdict.OK(last)


async def get_graph_and_vc(id, seed, rid):
    cmd = f'java -Xss1024m -jar ./build/libs/patrol-1.0.0.jar -m=default_vc -v=false --id={id} -s={seed} --rid={rid}'
    _json, _ = await get_out(cmd)

    request = json.loads(_json)

    return request


def modify_graph(graph):
    n = graph['n']
    perm = list(range(n))
    random.shuffle(perm)
    g = dict()
    g['n'] = n
    g['weight'] = [0 for _ in range(n)]
    for i in range(n):
        g['weight'][perm[i]] = graph['weight'][i]
    g['limit'] = graph['limit']
    g['edges'] = []
    for e in graph['edges']:
        v = e['v']
        u = e['u']
        g['edges'].append({"v": perm[v], "u": perm[u]})
    return g, perm


def create_iso(req, reqId):
    d = dict()
    d['reqId'] = reqId
    d['type'] = 'SEND_ISO'
    d['graphId'] = req['graphId']
    d['graph'], perm = modify_graph(req['graph'])
    return d, perm


def modify_vc(vc, perm):
    return [perm[v] for v in vc]


def create_vc(vc, perm, reqId):
    d = dict()
    d['reqId'] = reqId
    d['type'] = 'SEND_VC'
    d['vc'] = modify_vc(vc, perm)
    return d


def create_perm(perm, reqId):
    d = dict()
    d['reqId'] = reqId
    d['type'] = 'SEND_PERM'
    d['perm'] = perm
    return d


@checker.define_get(vuln_num=1)
async def get_flag_from_the_service(request: GetRequest) -> Verdict:
    start = datetime.datetime.now()
    print(f"Started at {start}.", file=sys.stderr)
    id, seed, _vc, lim = request.flag_id.split()
    vc = json.loads(_vc)

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
            return Verdict.DOWN("couldn't connect", traceback.format_exc())
    print(f"[{datetime.datetime.now()}] Send and downloaded json from team, elapsed {datetime.datetime.now() - start}", file=sys.stderr)

    if 'graph' not in downloaded_json:
        return Verdict.MUMBLE("Bad json, 'graph' not in answer", "")

    print(f"[{datetime.datetime.now()}] Getting graph & vc locally...", file=sys.stderr)

    req = await get_graph_and_vc(id, seed, rid)
    print(f"[{datetime.datetime.now()}] Got graph & vc.", file=sys.stderr)

    req['vc'] = vc
    req['graph']['limit'] = lim

    for i in range(30):
        start = datetime.datetime.now()
        print(f"[{i}] Started at: {start}", file=sys.stderr)

        iso_req, perm = create_iso(req, req['reqId'])
        async with Api(request.hostname) as api:
            try:
                downloaded_json = (await api.send_and_get(json.dumps(iso_req)))
            except Exception as e:
                return Verdict.DOWN("couldn't connect", traceback.format_exc())

        if 'type' not in downloaded_json \
                or (downloaded_json['type'] != 'REQ_VC' and downloaded_json['type'] != 'REQ_PERM'):
            try:
                print(f"after sending iso, reason={downloaded_json['reason']}", file=sys.stderr)
            except:
                pass
            return Verdict.MUMBLE("Bad json, 'type' not in answer or it's incorrect", "")

        type = downloaded_json['type']

        if type == 'REQ_VC':
            vc_req = create_vc(req['vc'], perm, req['reqId'])
            data = json.dumps(vc_req)
        else:
            perm_req = create_perm(perm, req['reqId'])
            data = json.dumps(perm_req)

        async with Api(request.hostname) as api:
            try:
                downloaded_json = (await api.send_and_get(data))
            except Exception as e:
                return Verdict.DOWN("couldn't connect", traceback.format_exc())

        if 'type' not in downloaded_json \
                or (downloaded_json['type'] != 'CONTINUE' and downloaded_json['type'] != 'OK'):
            try:
                print(f"after sending {type}, reason={downloaded_json['reason']}", file=sys.stderr)
            except:
                pass
            return Verdict.MUMBLE("Bad json, 'type' not in answer or it's incorrect", "")

        if downloaded_json['type'] == 'OK':
            if 'flag' not in downloaded_json:
                return Verdict.CORRUPT("Bad json, 'flag' not in answer", "")
            if downloaded_json['flag'] != request.flag:
                return Verdict.CORRUPT("Invalid flag", "Invalid flag")
            return Verdict.OK()
        print(f"[{i}] Elapsed in: {datetime.datetime.now() - start}", file=sys.stderr)
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
        print(stderr, file=sys.stderr)
        return -1

    return stdout.decode('utf-8').strip(), stderr.decode('utf-8').strip()


if __name__ == '__main__':
    checker.run()
