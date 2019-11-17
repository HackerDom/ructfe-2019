#!/usr/bin/python3
# Developed by Alexander Bersenev from Hackerdom team, bay@hackerdom.ru

"""Delete the router do instance for team. The vm image is not deleted.

Recomended to be used by cloud administrators only
"""

import sys
import time
import os
import traceback

import do_api
from cloud_common import (get_cloud_ip, log_progress, call_unitl_zero_exit,
                          untake_cloud_ip, SSH_OPTS, SSH_DO_OPTS, SSH_YA_OPTS,
                          DOMAIN)


TEAM = int(sys.argv[1])
VM_NAME = "team%d" % TEAM


def log_stderr(*params):
    print("Team %d:" % TEAM, *params, file=sys.stderr)


def main():
    team_state = open("db/team%d/team_state" % TEAM).read().strip()
    if team_state != "NOT_CLOUD":
        log_stderr("switch team to non cloud first")
        return 1

    net_state = open("db/team%d/net_deploy_state" % TEAM).read().strip()

    droplet_id = None
    if net_state == "READY":
        cloud_ip = get_cloud_ip(TEAM)
        if not cloud_ip:
            log_stderr("no cloud ip, exiting")
            return 1

        cmd = ["sudo", "/cloud/scripts/remove_intra_vpn.sh", str(TEAM)]
        ret = call_unitl_zero_exit(["ssh"] + SSH_YA_OPTS +
                                   [cloud_ip] + cmd)
        if not ret:
            log_stderr("remove team intra vpn failed")
            return 1

        net_state = "DO_DEPLOYED"
        open("db/team%d/net_deploy_state" % TEAM, "w").write(net_state)

    if net_state == "DO_DEPLOYED":
        net_state = "DNS_REGISTERED"
        open("db/team%d/net_deploy_state" % TEAM, "w").write(net_state)

    if net_state == "DNS_REGISTERED":
        domain_ids = do_api.get_domain_ids_by_hostname(
            VM_NAME, DOMAIN, print_warning_on_fail=True)
        if domain_ids is None:
            log_stderr("failed to get domain ids, exiting")
            return 1

        for domain_id in domain_ids:
            if not do_api.delete_domain_record(domain_id, DOMAIN):
                log_stderr("failed to delete domain %d, exiting" % domain_id)
                return 1

        net_state = "DO_LAUNCHED"
        open("db/team%d/net_deploy_state" % TEAM, "w").write(net_state)

    if net_state == "DO_LAUNCHED":
        do_ids = do_api.get_ids_by_vmname(VM_NAME)

        if do_ids is None:
            log_stderr("failed to get vm ids, exiting")
            return 1

        if len(do_ids) > 1:
            log_stderr("warinig: more than 1 droplet to be deleted")

        for do_id in do_ids:
            if not do_api.delete_vm_by_id(do_id):
                log_stderr("failed to delete droplet %d, exiting" % do_id)
                return 1

        net_state = "NOT_STARTED"
        open("db/team%d/net_deploy_state" % TEAM, "w").write(net_state)

    if net_state == "NOT_STARTED":
        image_state = open("db/team%d/image_deploy_state" % TEAM).read().strip()
        if image_state == "NOT_STARTED":
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
