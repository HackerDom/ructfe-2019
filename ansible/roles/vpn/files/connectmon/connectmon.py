#!/usr/bin/env python3

import re
import sys
import collections
import socket
import subprocess
import traceback
import time

TEAMS_NUM = 20
SERVICE_NUM = 20

CLIENT_TIMEOUT = 5
CHILD_WAIT_TIMEOUT = 5

JURY_NET_PREFIXES = ["10.10.10.", "127.0.0."]

CONNTRACK_ARGS = ["conntrack", "-L"]

LINE_RE = re.compile(r"""
    ^
        (tcp|udp|dccp)\s+
        (?#protocol_code)(?:6|17|33)\s+
        (?#data_len)(\d+)\s+
        (?#state)(?:(\w+)\s+)?
        src=(\d+\.\d+\.\d+\.\d+)\s+
        dst=(\d+\.\d+\.\d+\.\d+)\s+
        sport=\d+\s+
        dport=(\d+)\s+
        (?:\[UNREPLIED\]\s+)?
        src=(?:\d+\.\d+\.\d+\.\d+)\s+
        dst=(?:\d+\.\d+\.\d+\.\d+)\s+
        sport=\d+\s+
        dport=\d+\s+
        (?:\[ASSURED\]\s+)?
        mark=\d+\s+
        use=\d+\s*
    $
""", re.VERBOSE)

TEAM_NAMES = collections.defaultdict(str, {
    0: "jury",
})

SERVICE_NAMES = collections.defaultdict(str, {
    80: "http",
})


def ip_to_team(ip):
    m = re.match(r"10\.(6[0-3])\.(\d+)\.\d+", ip)
    if not m:
        # jury is a team 0
        if re.match(r"10\.10\.10\.\d+", ip):
            return 0
        return None

    team = (int(m.group(1)) - 60) * 256 + int(m.group(2))
    return team


def addr_to_service(ip, port):
    m = re.match(r"10\.6[0-3]\.\d+\.(\d+)", ip)
    if not m:
        return None

    # service = int(m.group(1))
    service = int(port)
    return service


def count_connections(conntract_reader):
    connect_cnt = collections.Counter()

    for line in conntract_reader:
        line = line.strip()

        if line.startswith("icmp") or line.startswith("unknown"):
            continue

        m = LINE_RE.match(line)
        if not m:
            print("Bad line:", line, file=sys.stderr)
            continue

        proto, data_len, state, src_ip, dst_ip, dst_port = m.groups()
        # udp connections don't have states
        if not state:
            state = "ESTABLISHED"
        data_len = int(data_len)

        src_team = ip_to_team(src_ip)
        dst_team = ip_to_team(dst_ip)
        dst_service = addr_to_service(dst_ip, dst_port)

        # connections not to services are not interesting
        if dst_service is None:
            continue

        # external connections are not interesting
        if src_team is None or dst_team is None:
            continue

        # skip not established connections
        # if state != "ESTABLISHED":
            # continue

        # udp and dccp are borring
        if proto in ["udp", "dccp"]:
            continue

        connect_cnt[(src_team, dst_team, dst_service)] += 1
    return connect_cnt


def count_connections_from_conntrack():
    p = subprocess.Popen(CONNTRACK_ARGS, encoding="utf8",
                         stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    connect_cnt = count_connections(p.stdout)
    p.wait(timeout=CHILD_WAIT_TIMEOUT)

    return connect_cnt


def handle_client(cl):
    connect_cnt = count_connections_from_conntrack()

    pkt_body_list = []
    pkt_body_list.append("# HELP ctf_connects The number of established connections between teams")
    pkt_body_list.append("# TYPE ctf_connects gauge")

    # for src_team in range(TEAMS_NUM):
    #     for dst_team in range(TEAMS_NUM):
    #         for dst_service in range(SERVICE_NUM):
    for src_team, dst_team, dst_service in connect_cnt:
        val = connect_cnt[(src_team, dst_team, dst_service)]

        src_team_metric_name = 'src_team="%d %s"' % (src_team, TEAM_NAMES[src_team])
        dst_team_metric_name = 'dst_team="%d %s"' % (dst_team, TEAM_NAMES[dst_team])
        dst_service_metric_name = 'dst_service="%d %s"' % (dst_service, SERVICE_NAMES[dst_service])

        metric = 'ctf_connects{%s,%s,%s} %d' % (src_team_metric_name, dst_team_metric_name, 
                                                dst_service_metric_name, val)
        pkt_body_list.append(metric)
    pkt_body = ("\n".join(pkt_body_list) + "\n").encode()

    pkt_header_list = []
    pkt_header_list.append("HTTP/1.1 200 OK")
    pkt_header_list.append("Content-Length: %d" % len(pkt_body))
    pkt_header_list.append("Content-Type: text/plain; version=0.0.4; charset=utf-8")
    pkt_header_list.append("Date: %s" % time.strftime("%a, %d %b %Y %H:%M:%S GMT", time.gmtime()))

    pkt_header = "\r\n".join(pkt_header_list).encode()

    pkt = pkt_header + b"\r\n\r\n" + pkt_body

    cl.sendall(pkt)
    # cl.shutdown(socket.SHUT_WR)


def serve():
    s = socket.socket()
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(("0.0.0.0", 9300))
    s.listen()

    while True:
        cl, cl_addr = s.accept()
        try:
            cl.settimeout(CLIENT_TIMEOUT)
            cl_host, cl_port = cl_addr

            client_good = False
            for prefix in JURY_NET_PREFIXES:
                if cl_host.startswith(prefix):
                    client_good = True

            if not client_good:
                continue
            
            cl.recv(65536)

            handle_client(cl)

        except Exception as E:
            print("Exception while handling client", E, file=sys.stderr)
            traceback.print_exc()
        finally:
            cl.close()


def print_team_info(team):
    connect_cnt = count_connections_from_conntrack()

    print("Team %d (%s) outgoing connections:" % (team, TEAM_NAMES[team]))

    out_stats = []
    for src_team, dst_team, dst_service in connect_cnt:
        if src_team != team:
            continue
        
        val = connect_cnt[(src_team, dst_team, dst_service)]

        if val == 0:
            continue
    
        dst_team_name = TEAM_NAMES[dst_team]
        dst_service_name = TEAM_NAMES[dst_service]
        
        out_msg = "to team %d %s service %d %s: %d" % (dst_team, dst_team_name, dst_service, 
                                                       dst_service_name, val)
        out_stats.append((val, out_msg))
    
    for val, out_msg in sorted(out_stats, reverse=True):
        print(out_msg)
    print()

    print("Team %d (%s) incoming connections:" % (team, TEAM_NAMES[team]))
    
    in_stats = []
    for src_team, dst_team, dst_service in connect_cnt:
        if dst_team != team:
            continue
        val = connect_cnt[(src_team, dst_team, dst_service)]

        if val == 0:
            continue
    
        src_team_name = TEAM_NAMES[src_team]
        dst_service_name = TEAM_NAMES[dst_service]
        
        in_msg = "from team %d %s service %d %s: %d" % (src_team, src_team_name, dst_service,
                                                        dst_service_name, val)
        in_stats.append((val, in_msg))
    
    for val, in_msg in sorted(in_stats, reverse=True):
        print(in_msg)
    


if __name__ == "__main__":
    if len(sys.argv) <= 1:
        serve()
    else:
        print_team_info(int(sys.argv[1]))
