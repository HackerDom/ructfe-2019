#!/bin/bash

# cmd tap_dev tap_mtu link_mtu ifconfig_local_ip ifconfig_netmask [ init | restart ]

tap_dev="$1"

br_dev="br$((${tap_dev#team}+10000))"

brctl addbr "$br_dev"
brctl addif "$br_dev" "$tap_dev"
ifconfig "$br_dev" up
ifconfig "$tap_dev" up
