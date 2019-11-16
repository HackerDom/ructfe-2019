#!/bin/bash -e

TEAM=${1?Syntax: ./list_snapshots.sh <team_id>}

if ! [[ $TEAM =~ ^[0-9]+$ ]]; then
  echo "team number validation error"
  exit 1
fi

vm="test_team${TEAM}"

VBoxManage snapshot "$vm" list || true
