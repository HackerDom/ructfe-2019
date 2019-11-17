#!/bin/bash -e

TEAM=${1?Syntax: ./remove_snapshot.sh <team_id> <name>}
NAME=${2?Syntax: ./remove_snapshot.sh <team_id> <name>}

QUOTA=25
WARN_FROM=10

if ! [[ $TEAM =~ ^[0-9]+$ ]]; then
  echo "team number validation error"
  exit 1
fi

vm="test_team${TEAM}"

VBoxManage snapshot "$vm" delete "$NAME"

used=$(du -s "/home/vbox_drives/${vm}" | cut -f 1)
remain=$(( QUOTA - used/1000/1000))

echo "msg: warning: ${remain}GB remaining for your team"
