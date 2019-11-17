#!/bin/bash -e

TEAM=${1?Syntax: ./remove_vm.sh <team_id>}

if ! [[ $TEAM =~ ^[0-9]+$ ]]; then
  echo "team number validation error"
  exit 1
fi

vm="test_team${TEAM}"

if VBoxManage list runningvms | grep -qP "\W${vm}\W"; then
  VBoxManage controlvm "$vm" poweroff
fi

if VBoxManage showvminfo "$vm" &>/dev/null; then
  VBoxManage unregistervm "$vm" --delete
fi
