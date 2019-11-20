#!/bin/bash

# Requires wireshark-common package

team="$1"
lastfiles=5

if [ -z $team ]; then
 echo "USAGE: ./get_pkg_stat.sh <team_num>"
 exit
fi

teamdump="$(mktemp -d /home/dump/tmp.team${team}_XXXXX)"
if [[ $? != 0 ]]; then
    exit 1
fi

if [ -z $teamdump ]; then
    exit 1
fi


cd /home/dump/big/

net1="10.$((60 + team / 256)).$((team % 256)).0/24"
net2="10.$((80 + team / 256)).$((team % 256)).0/24"

c=0
for f in $(ls -t *| head -${lastfiles}|tac); do
    tshark -nr "$f" -w "${teamdump}/${c}" "ip.addr==$net1 || ip.addr==$net2" 2>/dev/null
    c=$((c + 1))
    echo "$c/$lastfiles"
done

mergecap -F pcap -w "/home/dump/latest.team${team}.cap" ${teamdump}/*
rm -rf "${teamdump}"

getstat() {
    tshark -nqr "/home/dump/latest.team${team}.cap" $1 2>/dev/null
    echo
}

getstat "-z io,phs"
getstat "-z conv,tcp"
getstat "-z conv,ip"
getstat "-z endpoints,tcp"
getstat "-z endpoints,ip"
getstat "-z io,stat,10,tcp.flags.syn==1,tcp.flags.ack==1"
getstat "-z expert,warn,ip"
getstat "-z conv,tcp"
