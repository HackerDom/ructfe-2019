#!/bin/bash
# checks rules for traf dump
# this script should be run once before the game starts

for chain in INPUT FORWARD OUTPUT; do
    echo "$chain chain:"
    if ! iptables -t mangle -C $chain -s 10.80.0.0/14 -j NFLOG --nflog-group 1 --nflog-threshold 100 &>/dev/null; then
        echo " 10.80.0.0/14 rule is OFF"
    else
        echo " 10.80.0.0/14 rule is ON"
    fi

    if ! iptables -t mangle -C $chain -s 10.60.0.0/14 -j NFLOG --nflog-group 1 --nflog-threshold 100 &>/dev/null; then
        echo " 10.60.0.0/14 rule is OFF"
    else
        echo " 10.60.0.0/14 rule is ON"
    fi

    if ! iptables -t mangle -C $chain -s 10.10.10.0/28 -j NFLOG --nflog-group 1 --nflog-threshold 100 &>/dev/null; then
        echo " 10.10.10.0/28 rule is OFF"
    else
        echo " 10.10.10.0/28 rule is ON"
    fi
done
