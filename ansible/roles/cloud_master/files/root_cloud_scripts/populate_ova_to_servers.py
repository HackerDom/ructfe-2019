#!/usr/bin/python3
# Developed by Alexander Bersenev from Hackerdom team, bay@hackerdom.ru

"""Copies ova to all cloud servers and imports it, deleting the old vm"""

import sys
import json
import time
import os
import re
import shlex
import subprocess
import multiprocessing


OVA_NAME = sys.argv[1]
VM_NAME = sys.argv[2]

CLOUD_IPS = ["93.158.156.113", "93.158.156.114", "93.158.156.115",
             "93.158.156.116", "93.158.156.117", "93.158.156.118",
             "93.158.156.119", "93.158.156.120", "93.158.156.121",
             "93.158.156.122"]

SSH_OPTS = [
    "-o", "StrictHostKeyChecking=no",
    "-o", "CheckHostIP=no",
    "-o", "NoHostAuthenticationForLocalhost=yes",
    "-o", "BatchMode=yes",
    "-o", "LogLevel=ERROR",
    "-o", "UserKnownHostsFile=/dev/null",
    "-o", "ConnectTimeout=10",
    "-o", "User=root"
]


def log_stderr(*params):
    print(*params, file=sys.stderr)


def copy_image(cloud_ip):
    file_from = OVA_NAME
    print("deploying %s:" % cloud_ip)
    file_to_name = "/root/%s.ova" % VM_NAME
    file_to = "%s:%s" % (cloud_ip, file_to_name)
    ssh_arg = ["-e"] + [" ".join(map(shlex.quote, ["ssh"] + SSH_OPTS))]
    code = subprocess.call(["rsync", "--progress"] + ssh_arg +
                               [file_from, file_to])
    if code != 0:
        log_stderr("scp to YA host %s failed" % cloud_ip)
        return False
    return True


def reimport_image(cloud_ip):
    code = subprocess.call(["ssh"] + SSH_OPTS + [cloud_ip] +
                           ["/cloud/scripts/reimport_vm.sh", VM_NAME])
    if code != 0:
        log_stderr("reimport vm failed on %s" % cloud_ip)
        return False
    return True


def main():
    p = multiprocessing.Pool(len(CLOUD_IPS))
    print("Copying image to nodes")
    copy_result = p.map(copy_image, CLOUD_IPS)
    print(copy_result)
    print("Reimporting image")
    reimport_result = p.map(reimport_image, CLOUD_IPS)
    print(reimport_result)
    return int(not (all(copy_result) and all(reimport_result)))

if __name__ == "__main__":
    sys.exit(main())
