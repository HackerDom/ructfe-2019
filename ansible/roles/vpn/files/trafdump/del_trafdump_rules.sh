#!/bin/bash
# removes rules for traffic dump
# this script shouldn't be run normally :)

for chain in INPUT FORWARD OUTPUT; do
    iptables -t mangle -D $chain -s 10.80.0.0/14 -j NFLOG --nflog-group 1 --nflog-threshold 100
    iptables -t mangle -D $chain -s 10.60.0.0/14 -j NFLOG --nflog-group 1 --nflog-threshold 100
    iptables -t mangle -D $chain -s 10.10.10.0/28 -j NFLOG --nflog-group 1 --nflog-threshold 100
done
