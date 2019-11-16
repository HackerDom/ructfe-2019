#!/bin/bash -e

TEAM=${1?Usage: switch_team_to_cloud.sh <team> <ip>}
IP=${2?Usage: switch_team_to_cloud.sh <team> <ip>}

if ! [[ $TEAM =~ ^[0-9]+$ ]]; then
 echo "Team shold be integer"
 exit 1
fi

iptables -w -A INPUT -i eth0 -m udp -p udp --dport "$((30000+TEAM))" -s "${IP}" -j ACCEPT
iptables -w -A INPUT -i eth0 -m udp -p udp --dport "$((30000+TEAM))" -j DROP
