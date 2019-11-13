#!/bin/bash

num=$1

if [ -z $num ]; then
 echo "USAGE: block_team.sh team_num"
 exit
fi

if [[ ! $num =~ ^[0-9]+$ ]]; then
 echo "Team num should be number"
 exit
fi

ip="10.$((80 + num / 256)).$((num % 256)).1"

# add the couple of rules
iptables -t nat -D PREROUTING -m tcp -m comment --comment "antidos" -p tcp -i "team${num}" -j DNAT --to-destination "${ip}:40001"
