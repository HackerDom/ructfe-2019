#!/bin/bash -e

TEAM=${1?Syntax: ./reboot_vm.sh <team_id>}

if ! [[ $TEAM =~ ^[0-9]+$ ]]; then
  echo "team number validation error"
  exit 1
fi

vm="test_team${TEAM}"

if ! VBoxManage list runningvms | grep -qP "\W${vm}\W"; then
  echo 'msg: ERR, not running'
  exit 1
fi

# go to script dir
MY_NAME="`readlink -f "$0"`"
MY_DIR="`dirname "$MY_NAME"`"
cd "${MY_DIR}"

# hack around unstable VirtualBox work
timeout 20 VBoxManage controlvm "$vm" reset || [ $? -ne 124 ] || (pkill -9 -f "VBoxHeadless --comment ${vm} --startvm"; echo "That's why nobody uses VirtualBox in clouds"; sleep 5; ./launch_vm.sh "$TEAM")
