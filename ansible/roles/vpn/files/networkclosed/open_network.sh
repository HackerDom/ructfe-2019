#!/bin/bash

# go to script dir
cd "$( dirname "${BASH_SOURCE[0]}" )"

echo 1 > /proc/sys/net/ipv4/ip_forward

for num in {0..767}; do
    ip="10.$((80 + num / 256)).$((num % 256)).1"

    while iptables -t nat -C PREROUTING -i team${num} -p tcp -m tcp -m comment --comment closednetwork -j DNAT --to-destination ${ip}:40002 &>/dev/null; do
        iptables -t nat -D PREROUTING -i team${num} -p tcp -m tcp -m comment --comment closednetwork -j DNAT --to-destination ${ip}:40002
    done;
done

./check_network.sh
