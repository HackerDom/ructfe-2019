#!/bin/bash

TEAM=${1?Syntax: ./attach_vm_gui.sh <team_id> [fix]}
FIX=${2}

if ! [[ $TEAM =~ ^[0-9]+$ ]]; then
  echo "team number validation error"
  exit 1
fi

vm="test_team${TEAM}"

# fix keyboard layout
if [ "$FIX" == fix ]; then
 echo fixing
 setxkbmap us -print | xkbcomp - $DISPLAY
fi

VirtualBox --startvm "$vm" --separate
