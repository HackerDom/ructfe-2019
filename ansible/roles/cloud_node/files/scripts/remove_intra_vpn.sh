#!/bin/bash -e

TEAM=${1?Syntax: ./remove_intra_vpn.sh <team_id>}

if ! [[ $TEAM =~ ^[0-9]+$ ]]; then
  echo "team number validation error"
  exit 1
fi

rm "/etc/openvpn/client_intracloud_team${TEAM}.conf" || true
systemctl stop "openvpn@client_intracloud_team${TEAM}"
