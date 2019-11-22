import subprocess
import uuid
import asyncio
import os
import platform
import sys

async def get_out(cmd):
    d = dict(os.environ)
    if platform.system() == 'Darwin':
        d['JAVA_HOME'] = "/Library/Java/JavaVirtualMachines/jdk-11.0.5.jdk/Contents/Home/"

    p = await asyncio.create_subprocess_shell(cmd, shell=True,
                                              stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=d)

    stdout, stderr = await p.communicate()

    if p.returncode != 101:
        print(stderr.decode('utf-8'), file=sys.stderr)
        return -1

    return stdout.decode('utf-8').strip()

async def put_ant_get():
    id = uuid.uuid4()
    cmd = f'./checker.py PUT localhost id {id} 1'

    ret = await get_out(cmd)

    assert(ret != -1)

    cmd = f'./checker.py GET localhost "{ret}" {id} 1'

    assert(await get_out(cmd) != -1)

async def checks(n):
    l = []
    for _ in range(n):
        l.append(put_ant_get())
    for c in l:
        await c


if __name__ == "__main__":
    asyncio.run(checks(50))
