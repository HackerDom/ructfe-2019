#!/bin/bash -e

TEAM=${1?Usage: switch_team_to_non_cloud.sh <team> <ip>}
IP=${2?Usage: switch_team_to_non_cloud.sh <team> <ip>}

if ! [[ $TEAM =~ ^[0-9]+$ ]]; then
 echo "Team shold be integer"
 exit 1
fi

while iptables -w -C INPUT -i eth0 -m udp -p udp --dport "$((30000+TEAM))" -j DROP &>/dev/null; do
  iptables -w -D INPUT -i eth0 -m udp -p udp --dport "$((30000+TEAM))" -j DROP
done

while iptables -w -C INPUT -i eth0 -m udp -p udp --dport "$((30000+TEAM))" -s "${IP}" -j ACCEPT &>/dev/null; do
  iptables -w -D INPUT -i eth0 -m udp -p udp --dport "$((30000+TEAM))" -s "${IP}" -j ACCEPT
done
