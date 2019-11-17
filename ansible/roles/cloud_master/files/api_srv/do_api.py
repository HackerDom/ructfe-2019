# Developed by Alexander Bersenev from Hackerdom team, bay@hackerdom.ru

"""Common functions that make requests to digital ocean api"""

import requests
import time
import json
import sys

from do_token import TOKEN


VERBOSE = True

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": "Bearer %s" % TOKEN,
}


def log(*params):
    if VERBOSE:
        print(*params, file=sys.stderr)


def get_all_vms(attempts=5, timeout=10):
    vms = {}
    url = "https://api.digitalocean.com/v2/droplets?per_page=200"

    cur_attempt = 1

    while True:
        try:
            resp = requests.get(url, headers=HEADERS)
            if not str(resp.status_code).startswith("2"):
                log(resp.status_code, resp.headers, resp.text)
                raise Exception("bad status code %d" % resp.status_code)

            data = json.loads(resp.text)

            for droplet in data["droplets"]:
                vms[droplet["id"]] = droplet

            if ("links" in data and "pages" in data["links"] and
                                    "next" in data["links"]["pages"]):
                url = data["links"]["pages"]["next"]
            else:
                break

        except Exception as e:
            log("get_all_vms trying again %s" % (e,))
            cur_attempt += 1
            if cur_attempt > attempts:
                return None  # do not return parts of the output
            time.sleep(timeout)
    return list(vms.values())


def get_ids_by_vmname(vm_name):
    ids = set()

    droplets = get_all_vms()
    if droplets is None:
        return None

    for droplet in droplets:
        if droplet["name"] == vm_name:
            ids.add(droplet['id'])
    return ids


def check_vm_exists(vm_name):
    droplets = get_all_vms()
    if droplets is None:
        return None

    for droplet in droplets:
        if droplet["name"] == vm_name:
            return True
    return False


def create_vm(vm_name, image, ssh_keys,
              region="ams2", size="s-1vcpu-1gb", attempts=10, timeout=20):
    for i in range(attempts):
        try:
            data = json.dumps({
                "name": vm_name,
                "region": region,
                "size": size,
                "image": image,
                "ssh_keys": ssh_keys,
                "backups": False,
                "ipv6": False,
                "user_data": "#!/bin/bash\n\n",
                "private_networking": None,
                "volumes": None,
                "tags": []  # tags are too unstable in DO
            })

            log("creating new")
            url = "https://api.digitalocean.com/v2/droplets"
            resp = requests.post(url, headers=HEADERS, data=data)
            if resp.status_code not in [200, 201, 202]:
                log(resp.status_code, resp.headers, resp.text)
                raise Exception("bad status code %d" % resp.status_code)

            droplet_id = json.loads(resp.text)["droplet"]["id"]
            return droplet_id
        except Exception as e:
            log("create_vm trying again %s" % (e,))
        time.sleep(timeout)
    return None


def delete_vm_by_id(droplet_id, attempts=10, timeout=20):
    for i in range(attempts):
        try:
            log("deleting droplet")
            url = "https://api.digitalocean.com/v2/droplets/%d" % droplet_id
            resp = requests.delete(url, headers=HEADERS)
            if not str(resp.status_code).startswith("2"):
                log(resp.status_code, resp.headers, resp.text)
                raise Exception("bad status code %d" % resp.status_code)
            return True
        except Exception as e:
            log("delete_vm_by_id trying again %s" % (e,))
        time.sleep(timeout)
    return False


def get_ip_by_id(droplet_id, attempts=5, timeout=20):
    for i in range(attempts):
        try:
            url = "https://api.digitalocean.com/v2/droplets/%d" % droplet_id
            resp = requests.get(url, headers=HEADERS)
            data = json.loads(resp.text)

            return data['droplet']['networks']['v4'][0]['ip_address']
        except Exception as e:
            log("get_ip_by_id trying again %s" % (e,))
        time.sleep(timeout)
    log("failed to get ip by id")
    return None


def get_ip_by_vmname(vm_name):
    ids = set()

    droplets = get_all_vms()
    if droplets is None:
        return None

    for droplet in droplets:
        if droplet["name"] == vm_name:
            ids.add(droplet['id'])

    if len(ids) > 1:
        log("warning: there are more than one droplet with name " + vm_name +
            ", using random :)")

    if not ids:
        return None

    return get_ip_by_id(list(ids)[0])


def get_all_domain_records(domain, attempts=5, timeout=20):
    records = {}
    url = ("https://api.digitalocean.com/v2/domains/" + domain +
           "/records?per_page=200")

    cur_attempt = 1

    while True:
        try:
            resp = requests.get(url, headers=HEADERS)
            if not str(resp.status_code).startswith("2"):
                log(resp.status_code, resp.headers, resp.text)
                raise Exception("bad status code %d" % resp.status_code)

            data = json.loads(resp.text)
            for record in data["domain_records"]:
                records[record["id"]] = record

            if ("links" in data and "pages" in data["links"] and
                                    "next" in data["links"]["pages"]):
                url = data["links"]["pages"]["next"]
            else:
                break
        except Exception as e:
            log("get_all_domain_records trying again %s" % (e,))
            cur_attempt += 1
            if cur_attempt > attempts:
                return None  # do not return parts of the output
            time.sleep(timeout)

    return list(records.values())


def get_domain_ids_by_hostname(host_name, domain, print_warning_on_fail=False):
    ids = set()

    records = get_all_domain_records(domain)
    if records is None:
        return None

    for record in records:
        if record["type"] == "A" and record["name"] == host_name:
            ids.add(record['id'])

    if not ids:
        if print_warning_on_fail:
            log("failed to get domain ids by hostname", host_name)

    return ids


def create_domain_record(name, ip, domain, attempts=10, timeout=20):
    for i in range(attempts):
        try:
            data = json.dumps({
                "type": "A",
                "name": name,
                "data": ip,
                "ttl": 30
            })
            url = "https://api.digitalocean.com/v2/domains/%s/records" % domain
            resp = requests.post(url, headers=HEADERS, data=data)
            if not str(resp.status_code).startswith("2"):
                log(resp.status_code, resp.headers, resp.text)
                raise Exception("bad status code %d" % resp.status_code)
            return True
        except Exception as e:
            log("create_domain_record trying again %s" % (e,))
        time.sleep(timeout)
    return None


def delete_domain_record(domain_id, domain, attempts=10, timeout=20):
    for i in range(attempts):
        try:
            log("deleting domain record %d" % domain_id)
            url = ("https://api.digitalocean.com/v2/domains" +
                   "/%s/records/%d" % (domain, domain_id))
            resp = requests.delete(url, headers=HEADERS)
            if not str(resp.status_code).startswith("2"):
                log(resp.status_code, resp.headers, resp.text)
                raise Exception("bad status code %d" % resp.status_code)
            return True
        except Exception as e:
            log("delete_domain_record trying again %s" % (e,))
        time.sleep(timeout)
    return False
