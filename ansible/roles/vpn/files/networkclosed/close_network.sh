#!/bin/bash

# go to script dir 
cd "$( dirname "${BASH_SOURCE[0]}" )"

echo 0 > /proc/sys/net/ipv4/ip_forward

for num in {0..767}; do
    ip="10.$((80 + num / 256)).$((num % 256)).1"

    if ! iptables -t nat -C PREROUTING -i team${num} -p tcp -m tcp -m comment --comment closednetwork -j DNAT --to-destination ${ip}:40002 &> /dev/null; then
        iptables -t nat -A PREROUTING -i team${num} -p tcp -m tcp -m comment --comment closednetwork -j DNAT --to-destination ${ip}:40002 &> /dev/null
        #echo "Added DNAT rule for team ${num}"
    fi
done

./check_network.sh
