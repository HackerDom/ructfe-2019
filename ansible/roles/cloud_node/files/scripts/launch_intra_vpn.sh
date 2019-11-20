#!/bin/bash -e

TEAM=${1?Syntax: ./launch_intra_vpn.sh <team_id>}

if ! [[ $TEAM =~ ^[0-9]+$ ]]; then
  echo "team number validation error"
  exit 1
fi

cp "/home/cloud/client_intracloud_team${TEAM}.conf" /etc/openvpn/
chown root:root "/etc/openvpn/client_intracloud_team${TEAM}.conf"
systemctl start "openvpn@client_intracloud_team${TEAM}"
