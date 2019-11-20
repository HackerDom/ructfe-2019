#!/usr/bin/python3
# Developed by Alexander Bersenev from Hackerdom team, bay@hackerdom.ru

"""Delete vm image with all snapshots. The network is not deleted.

Recomended to be used by cloud administrators only
"""

import sys
import time
import os
import traceback

from cloud_common import (get_cloud_ip, log_progress, call_unitl_zero_exit,
                          untake_cloud_ip, SSH_OPTS, SSH_YA_OPTS)

TEAM = int(sys.argv[1])
VM_NAME = "team%d" % TEAM


def log_stderr(*params):
    print("Team %d:" % TEAM, *params, file=sys.stderr)


def main():
    team_state = open("db/team%d/team_state" % TEAM).read().strip()
    if team_state != "NOT_CLOUD":
        log_stderr("switch team to non cloud first")
        return 1

    image_state = open("db/team%d/image_deploy_state" % TEAM).read().strip()

    if image_state == "RUNNING":
        cloud_ip = get_cloud_ip(TEAM)
        if not cloud_ip:
            log_stderr("no cloud_ip ip, exiting")
            return 1

        cmd = ["sudo", "/cloud/scripts/remove_vm.sh", str(TEAM)]
        ret = call_unitl_zero_exit(["ssh"] + SSH_YA_OPTS + [cloud_ip] + cmd)
        if not ret:
            log_stderr("failed to remove team vm")
            return 1
        image_state = "NOT_STARTED"
        open("db/team%d/image_deploy_state" % TEAM, "w").write(image_state)

    if image_state == "NOT_STARTED":
        net_state = open("db/team%d/net_deploy_state" % TEAM).read().strip()
        if net_state == "NOT_STARTED":
            log_stderr("returning slot to cloud")
            untake_cloud_ip(TEAM)
        return 0
    return 1

if __name__ == "__main__":
    sys.stdout = os.fdopen(1, 'w', 1)
    print("started: %d" % time.time())
    exitcode = 1
    try:
        os.chdir(os.path.dirname(os.path.realpath(__file__)))
        exitcode = main()
    except:
        traceback.print_exc()
    print("exit_code: %d" % exitcode)
    print("finished: %d" % time.time())
