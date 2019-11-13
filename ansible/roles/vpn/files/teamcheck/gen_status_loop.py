#!/usr/bin/python3

import jinja2
import subprocess
import re
import time
import traceback
import os

from teams import get_teams

ROUTER_PINGONCE_FILE = "router_ping_once.txt"
IMAGE_PINGONCE_FILE = "image_ping_once.txt"
SERVICE_UPONCE_FILE = "service_up_once.txt"

CHECKER_FILE = "./team_tcp_checker.py"

TEMPLATE_FILE = "status.tpl"
STATUS_HTML = "status.html"

PAUSE = 1

def get_router_ip(team):
    return "10.%s.%s.2" % (80 + team // 256, team % 256)

def get_image_ip(team):
    return "10.%s.%s.3" % (60 + team // 256, team % 256)

def get_ping_like_cmd_parsed_ret(args, hosts):
    ret = {}

    router_ping_proc = subprocess.Popen(args + hosts,
                                        stdout=subprocess.PIPE,
                                        stderr=subprocess.PIPE)
    out, err = router_ping_proc.communicate()
    # print(out)
    for line in err.decode().split("\n"):
        if ":" not in line:
            continue
        host, result = map(str.strip, line.split(":", 1))

        if host not in hosts:
            continue

        try:
            ret[host] = float(result)
        except ValueError:
            if result == "-":
                ret[host] = None
            else:
                print("Surprising output: %s" % err.decode())

    return ret


def is_net_opened():
    return open("/proc/sys/net/ipv4/ip_forward").read()[0] == "1"


def get_services_up(hosts):
    """ returns: host -> test_time | None """
    return get_ping_like_cmd_parsed_ret([CHECKER_FILE], hosts)


def get_hosts_ping(hosts):
    """ returns: host -> ping_time | None """
    fping_base = ["fping", "-q", "-C1", "-t5000"]
    return get_ping_like_cmd_parsed_ret(fping_base, hosts)


def loop():
    teams = get_teams()

    # create flags files if not exists
    open(ROUTER_PINGONCE_FILE, 'ab').close()
    open(IMAGE_PINGONCE_FILE,  'ab').close()
    open(SERVICE_UPONCE_FILE,  'ab').close()

    routers_pingonce_data = open(ROUTER_PINGONCE_FILE, "r", 1).read()
    images_pingonce_data = open(IMAGE_PINGONCE_FILE, "r", 1).read()
    service_uponce_data = open(SERVICE_UPONCE_FILE, "r", 1).read()

    routers_pingonce = set(re.findall(r"\d+", routers_pingonce_data))
    images_pingonce = set(re.findall(r"\d+", images_pingonce_data))
    services_uponce = set(re.findall(r"\d+", service_uponce_data))

    # get list to ping
    team_to_router = {}
    team_to_image = {}

    router_to_team = {}
    image_to_team = {}

    for team in teams:
        team_router = get_router_ip(team)
        team_image = get_image_ip(team)

        team_to_router[team] = team_router
        team_to_image[team] = team_image

        router_to_team[team_router] = team
        image_to_team[team_image] = team

    # ping teams
    router_pings = get_hosts_ping(list(team_to_router.values()))
    image_pings = get_hosts_ping(list(team_to_image.values()))
    image_service_ups = get_services_up(list(team_to_image.values()))

    # generate result dict for each team
    result = []
    for team in teams:
        team_name = teams[team]
        team_router = team_to_router[team]
        team_image = team_to_image[team]

        router_ping = router_pings.get(team_router)
        router_pingonce = str(team) in routers_pingonce
        image_ping = image_pings.get(team_image)
        image_pingonce = str(team) in images_pingonce
        service_up = image_service_ups.get(team_image)
        service_uponce = str(team) in services_uponce

        if router_ping is not None:
            if str(team) not in routers_pingonce:
                routers_pingonce.add(str(team))
                router_pingonce = True

                with open(ROUTER_PINGONCE_FILE, "a") as f:
                    f.write(str(team) + "\n")

        if image_ping is not None:
            if str(team) not in images_pingonce:
                images_pingonce.add(str(team))
                image_pingonce = True

                with open(IMAGE_PINGONCE_FILE, "a") as f:
                    f.write(str(team) + "\n")

        if service_up is not None:
            if str(team) not in services_uponce:
                services_uponce.add(str(team))
                service_uponce = True

                with open(SERVICE_UPONCE_FILE, "a") as f:
                    f.write(str(team) + "\n")

        result.append({"id": team,
                       "name": team_name,
                       "router_ip": team_to_router[team],
                       "image_ip": team_to_image[team],
                       "router_ping": router_ping,
                       "router_pingonce": router_pingonce,
                       "image_ping": image_ping,
                       "image_pingonce": image_pingonce,
                       "service_up": service_up,
                       "service_uponce": service_uponce})

    # compute sums
    sums = {}

    for col in ("router_ping", "router_pingonce", "image_ping",
                "image_pingonce", "service_up", "service_uponce"):
        sums[col] = sum(bool(row[col]) for row in result)
    print(sums)


    # generate html by result
    template = open(TEMPLATE_FILE, encoding="utf8").read()
    time_str = time.strftime("%a, %d %b %Y %H:%M:%S +0000", time.gmtime())
    html = jinja2.Template(template, autoescape=True).render(
        result=result, time=time_str, netopened=is_net_opened(), sums=sums)
    open(STATUS_HTML, "w").write(html)


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.realpath(__file__)))
    while True:
        try:
            loop()
        except:
            traceback.print_exc()
        finally:
            print("Sleeping %d" % PAUSE)
            time.sleep(PAUSE)
