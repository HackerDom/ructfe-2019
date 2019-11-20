#!/bin/bash

if /usr/sbin/VBoxControl --nologo guestproperty get team; then
  echo "Cloud detected"
  TEAM="$(/usr/sbin/VBoxControl --nologo guestproperty get team|cut -d' ' -f 2)"
  echo "TEAM=$TEAM"

  echo "network:" > /etc/netplan/50-cloud-init.yaml
  echo "  version: 2" >> /etc/netplan/50-cloud-init.yaml
  echo "  ethernets:" >> /etc/netplan/50-cloud-init.yaml
  echo "    eth0:" >> /etc/netplan/50-cloud-init.yaml
  echo "      dhcp4: no" >> /etc/netplan/50-cloud-init.yaml
  echo "      dhcp6: no" >> /etc/netplan/50-cloud-init.yaml
  echo "      addresses: [10.$((60 + TEAM / 256)).$((TEAM % 256)).2/24,]" >>  /etc/netplan/50-cloud-init.yaml
  echo "      gateway4: 10.$((60 + TEAM / 256)).$((TEAM % 256)).1" >>  /etc/netplan/50-cloud-init.yaml
  echo "      nameservers:" >> /etc/netplan/50-cloud-init.yaml
  echo "        addresses: [8.8.8.8, 8.8.4.4]" >> /etc/netplan/50-cloud-init.yaml

  /usr/sbin/netplan apply
fi

if /usr/sbin/VBoxControl --nologo guestproperty get root_passwd_hash; then
  PASS_HASH="$(VBoxControl --nologo guestproperty get root_passwd_hash | cut -d' ' -f 2)"
  usermod -p "$PASS_HASH" root
fi
