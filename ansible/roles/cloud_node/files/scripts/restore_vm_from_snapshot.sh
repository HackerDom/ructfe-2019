#!/bin/bash -e

TEAM=${1?Syntax: ./restore_vm_from_snapshot.sh <team_id> <name>}
NAME=${2?Syntax: ./restore_vm_from_snapshot.sh <team_id> <name>}

if ! [[ $TEAM =~ ^[0-9]+$ ]]; then
  echo "team number validation error"
  exit 1
fi

vm="test_team${TEAM}"

# check if snapshot exists
if ! VBoxManage snapshot "$vm" showvminfo "$NAME" &>/dev/null; then
 echo "msg: ERR, snapshot doesn't exist"
 exit 1
fi

VBoxManage controlvm "$vm" savestate || true

if ! VBoxManage snapshot "$vm" restore "$NAME"; then
 # something gone wrong
 echo 'msg: ERR, restore failed, trying to relaunch vm from the last saved state'
fi

# go to script dir
MY_NAME="`readlink -f "$0"`"
MY_DIR="`dirname "$MY_NAME"`"
cd "${MY_DIR}"

./launch_vm.sh "$TEAM"
