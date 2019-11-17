#!/bin/bash -e

filter="$1"

if [ "$filter" == "running" ]; then
 VBoxManage list runningvms
else
 VBoxManage list vms
fi

