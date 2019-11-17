#!/bin/bash
# checks rules for teams snat. Team will see incoming connections from 10.8{0..3}.{0..254}.1
# this script should be run once before the game starts

for num in {0..767}; do 
    ip="10.$((80 + num / 256)).$((num % 256)).1"

    if ! iptables -t nat -C POSTROUTING -o team${num} -j SNAT --to-source ${ip}; then
        echo "Holy sheet! Team ${num} is not SNATted!!!"
        echo "You can fix it with this command"
        echo "iptables -t nat -A POSTROUTING -o team${num} -j SNAT --to-source ${ip}"
    fi
done
