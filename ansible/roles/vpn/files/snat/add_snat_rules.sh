#!/bin/bash
# adds rules for teams snat. Team will see incoming connections from 10.8{0..3}.{0..255}.1
# this script should be run once before the game starts

# check if the rules are already exists
for num in {0..767}; do
    ip="10.$((80 + num / 256)).$((num % 256)).1"

    if iptables -t nat -C POSTROUTING -o team${num} -j SNAT --to-source ${ip} &>/dev/null; then
        echo "SNAT rules already exists, delete them first"
        exit 1
    fi
done


for num in {0..767}; do
    ip="10.$((80 + num / 256)).$((num % 256)).1"

    iptables -t nat -A POSTROUTING -o team${num} -j SNAT --to-source ${ip}
done

sysctl net.nf_conntrack_max=30000000
echo "sysctl net.nf_conntrack_max=30000000"

echo 33554432 > /sys/module/nf_conntrack/parameters/hashsize
echo "echo 33554432 > /sys/module/nf_conntrack/parameters/hashsize"
