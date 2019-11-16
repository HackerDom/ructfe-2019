#!/bin/bash -e

TEAM=${1?Syntax: ./launch_vm.sh <team_id>}

if ! [[ $TEAM =~ ^[0-9]+$ ]]; then
  echo "team number validation error"
  exit 1
fi

br_dev="br$(($TEAM+10000))"

vm="test_team${TEAM}"

brctl addbr "$br_dev" 2>/dev/null|| true
ifconfig "$br_dev" up

if ! VBoxManage showvminfo "$vm" &>/dev/null; then
  VBoxManage clonevm "Ubuntu_template" --register --name "$vm" --basefolder="/home/vbox_drives/" --mode all
  #VBoxManage clonevm "fat_and_stress" --register --name "$vm" --basefolder="/home/vbox_drives/" --mode all
fi

if ! VBoxManage list runningvms | grep -qP "\W${vm}\W"; then
  VBoxManage modifyvm "$vm" --nic1 bridged
  VBoxManage modifyvm "$vm" --bridgeadapter1 "$br_dev"
  VBoxManage modifyvm "$vm" --usbehci=off
fi

VBoxManage guestproperty set "$vm" team "${TEAM}"
VBoxManage guestproperty set "$vm" root_passwd_hash "$(cat /home/cloud/root_passwd_hash_team${TEAM}.txt)"

VBoxManage startvm "$vm" --type headless
