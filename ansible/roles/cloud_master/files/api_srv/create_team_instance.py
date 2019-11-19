#!/usr/bin/python3
# Developed by Alexander Bersenev from Hackerdom team, bay@hackerdom.ru

"""Creates vm instance for a team"""

import sys
import json
import time
import os
import traceback

import do_api
from cloud_common import (get_cloud_ip, log_progress, take_cloud_ip,
                          call_unitl_zero_exit,SSH_OPTS, SSH_DO_OPTS,
                          SSH_YA_OPTS, DOMAIN)

TEAM = int(sys.argv[1])
VM_NAME = "team%d" % TEAM

DO_IMAGE = 55105641
DO_SSH_KEYS = [435386, 25814756]


def log_stderr(*params):
    print("Team %d:" % TEAM, *params, file=sys.stderr)


def main():
    net_state = open("db/team%d/net_deploy_state" % TEAM).read().strip()

    cloud_ip = get_cloud_ip(TEAM)
    if not cloud_ip:
        cloud_ip = take_cloud_ip(TEAM)
        if not cloud_ip:
            print("msg: ERR, no free vm slots remaining")
            return 1

    log_progress("0%")
    droplet_id = None
    if net_state == "NOT_STARTED":
        exists = do_api.check_vm_exists(VM_NAME)
        if exists is None:
            log_stderr("failed to determine if vm exists, exiting")
            return 1

        log_progress("5%")

        if not exists:
            droplet_id = do_api.create_vm(
                VM_NAME, image=DO_IMAGE, ssh_keys=DO_SSH_KEYS)
            if droplet_id is None:
                log_stderr("failed to create vm, exiting")
                return 1

        net_state = "DO_LAUNCHED"
        open("db/team%d/net_deploy_state" % TEAM, "w").write(net_state)
        time.sleep(1)  # this allows to make less requests (there is a limit)

    log_progress("10%")
    ip = None
    if net_state == "DO_LAUNCHED":
        if not droplet_id:
            ip = do_api.get_ip_by_vmname(VM_NAME)
        else:
            ip = do_api.get_ip_by_id(droplet_id)

        if ip is None:
            log_stderr("no ip, exiting")
            return 1

        log_progress("15%")

        domain_ids = do_api.get_domain_ids_by_hostname(VM_NAME, DOMAIN)
        if domain_ids is None:
            log_stderr("failed to check if dns exists, exiting")
            return 1

        if domain_ids:
            for domain_id in domain_ids:
                do_api.delete_domain_record(domain_id, DOMAIN)

        log_progress("17%")

        if do_api.create_domain_record(VM_NAME, ip, DOMAIN):
            net_state = "DNS_REGISTERED"
            open("db/team%d/net_deploy_state" % TEAM, "w").write(net_state)
        else:
            log_stderr("failed to create vm: dns register error")
            return 1

        for i in range(20, 60):
            # just spinning for the sake of smooth progress
            log_progress("%d%%" % i)
            time.sleep(1)

    log_progress("60%")

    if net_state == "DNS_REGISTERED":
        if ip is None:
            ip = do_api.get_ip_by_vmname(VM_NAME)

            if ip is None:
                log_stderr("no ip, exiting")
                return 1

        log_progress("65%")

        file_from = "db/team%d/server_outside.conf" % TEAM
        file_to = "%s:/etc/openvpn/server_outside_team%d.conf" % (ip, TEAM)
        ret = call_unitl_zero_exit(["scp"] + SSH_DO_OPTS +
                                   [file_from, file_to])
        if not ret:
            log_stderr("scp to DO failed")
            return 1

        log_progress("70%")

        file_from = "db/team%d/game_network.conf" % TEAM
        file_to = "%s:/etc/openvpn/game_network_team%d.conf" % (ip, TEAM)
        ret = call_unitl_zero_exit(["scp"] + SSH_DO_OPTS +
                                   [file_from, file_to])
        if not ret:
            log_stderr("scp to DO failed")
            return 1

        log_progress("72%")

        cmd = ["systemctl start openvpn@server_outside_team%d" % TEAM]
        ret = call_unitl_zero_exit(["ssh"] + SSH_DO_OPTS + [ip] + cmd)
        if not ret:
            log_stderr("start internal tun")
            return 1

        # UNCOMMENT BEFORE THE GAME
        dest = "10.%d.%d.2" % (60 + TEAM//256, TEAM%256)
        cmd = ["iptables -t nat -A PREROUTING -d %s -p tcp " % ip +
               "--dport 22 -j DNAT --to-destination %s:22" % dest]
        ret = call_unitl_zero_exit(["ssh"] + SSH_DO_OPTS + [ip] + cmd)
        if not ret:
           log_stderr("unable to nat port 22")
           return 1

        net_state = "DO_DEPLOYED"
        open("db/team%d/net_deploy_state" % TEAM, "w").write(net_state)

    log_progress("75%")

    if net_state == "DO_DEPLOYED":
        log_progress("77%")

        file_from = "db/team%d/client_intracloud.conf" % TEAM
        file_to = "%s:/home/cloud/client_intracloud_team%d.conf" % (cloud_ip,
                                                                    TEAM)
        ret = call_unitl_zero_exit(["scp"] + SSH_YA_OPTS +
                                   [file_from, file_to])
        if not ret:
            log_stderr("scp to YA failed")
            return 1

        log_progress("78%")

        cmd = ["sudo", "/cloud/scripts/launch_intra_vpn.sh", str(TEAM)]
        ret = call_unitl_zero_exit(["ssh"] + SSH_YA_OPTS + [cloud_ip] + cmd)
        if not ret:
            log_stderr("launch team intra vpn")
            return 1

        net_state = "READY"
        open("db/team%d/net_deploy_state" % TEAM, "w").write(net_state)

    image_state = open("db/team%d/image_deploy_state" % TEAM).read().strip()

    log_progress("80%")

    if net_state == "READY":
        if image_state == "NOT_STARTED":
            file_from = "db/team%d/root_passwd_hash.txt" % TEAM
            file_to = "%s:/home/cloud/root_passwd_hash_team%d.txt" % (cloud_ip,
                                                                      TEAM)
            ret = call_unitl_zero_exit(["scp"] + SSH_YA_OPTS +
                                       [file_from, file_to])
            if not ret:
                log_stderr("scp to YA failed")
                return 1

            log_progress("85%")

            cmd = ["sudo", "/cloud/scripts/launch_vm.sh", str(TEAM)]
            ret = call_unitl_zero_exit(["ssh"] + SSH_YA_OPTS +
                                       [cloud_ip] + cmd)
            if not ret:
                log_stderr("launch team vm")
                return 1

            image_state = "RUNNING"
            open("db/team%d/image_deploy_state" % TEAM, "w").write(image_state)
    
    log_progress("100%")
    return 0


if __name__ == "__main__":
    sys.stdout = os.fdopen(1, 'w', 1)
    print("started: %d" % time.time())
    exitcode = 1
    try:
        os.chdir(os.path.dirname(os.path.realpath(__file__)))
        exitcode = main()

        net_state = open("db/team%d/net_deploy_state" % TEAM).read().strip()
        image_state = open("db/team%d/image_deploy_state" % TEAM).read().strip()

        log_stderr("NET_STATE:", net_state)
        log_stderr("IMAGE_STATE:", image_state)

        if net_state != "READY":
            print("msg: ERR, failed to set up the network")
        elif image_state != "RUNNING":
            print("msg: ERR, failed to start up the vm")
    except:
        traceback.print_exc()
    print("exit_code: %d" % exitcode)
    print("finished: %d" % time.time())
