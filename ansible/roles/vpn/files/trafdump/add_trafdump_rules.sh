#!/bin/bash
# adds rules for traffic dump
# this script should be run once before the game starts

sysctl net.core.rmem_max=2000000000
echo "sysctl net.core.rmem_max=2000000000"

for chain in INPUT FORWARD OUTPUT; do
    if ! iptables -t mangle -C $chain -s 10.80.0.0/14 -j NFLOG --nflog-group 1 --nflog-threshold 100 &>/dev/null; then
        iptables -t mangle -A $chain -s 10.80.0.0/14 -j NFLOG --nflog-group 1 --nflog-threshold 100
    fi

    if ! iptables -t mangle -C $chain -s 10.60.0.0/14 -j NFLOG --nflog-group 1 --nflog-threshold 100 &>/dev/null; then
        iptables -t mangle -A $chain -s 10.60.0.0/14 -j NFLOG --nflog-group 1 --nflog-threshold 100
    fi

    if ! iptables -t mangle -C $chain -s 10.10.10.0/28 -j NFLOG --nflog-group 1 --nflog-threshold 100 &>/dev/null; then
        iptables -t mangle -A $chain -s 10.10.10.0/28 -j NFLOG --nflog-group 1 --nflog-threshold 100
    fi
done
