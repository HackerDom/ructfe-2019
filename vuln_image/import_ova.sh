#!/bin/bash

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

cd "$BASE_DIR"

if [ -z "$1" ]; then
    echo "USAGE: import_ova.sh $image_file" >&2
    exit 1
fi

VM_NAME="ructfe2019-base"
FORWARD_PORT=2222
IMAGE_FILE="$1"

set -eux

if VBoxManage showvminfo "$VM_NAME" --machinereadable &> /dev/null; then
 VBoxManage unregistervm "$VM_NAME" --delete
fi

VBoxManage import "$IMAGE_FILE" --options importtovdi --vsys 0 --vmname $VM_NAME

# quick fixup
VBoxManage modifyvm "$VM_NAME" --natpf1 delete "Rule 1"

VBoxManage snapshot "$VM_NAME" take "base_image"
