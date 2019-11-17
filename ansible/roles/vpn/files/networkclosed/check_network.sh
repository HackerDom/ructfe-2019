#!/bin/bash

NETOPENED=$(cat /proc/sys/net/ipv4/ip_forward)

if [[ $NETOPENED == 1 ]]; then
  echo Network is opened

  for num in {0..767}; do
    ip="10.$((80 + num / 256)).$((num % 256)).1"
    iptables -t nat -w -C PREROUTING -i team${num} -p tcp -m tcp -m comment --comment closednetwork -j DNAT --to-destination ${ip}:40002 &> /dev/null
    if [[ $? == 0 ]]; then
      echo "Warning: DNAT record still exists for team ${num}"
    fi
  done
   
else
  echo Network is closed

  for num in {0..767}; do
    ip="10.$((80 + num / 256)).$((num % 256)).1"
    iptables -t nat -w -C PREROUTING -i team${num} -p tcp -m tcp -m comment --comment closednetwork -j DNAT --to-destination ${ip}:40002 &> /dev/null
    if [[ $? != 0 ]]; then
      echo "Warning: no DNAT record for team ${num}"
    fi
  done
fi
