#!/bin/bash

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
cd "$BASE_DIR"

VM_NAME="ructfe2019-base"
OUTPUT_IMAGE="images/ructfe2019-deploy.ova"
SSH_PORT=2222
SSH_HOST=127.0.0.1

cd $BASE_DIR

vboxmanage snapshot "$VM_NAME" restore "base_image"

# Start vm
VBoxManage modifyvm "$VM_NAME" --natpf1 "deploy,tcp,127.0.0.1,$SSH_PORT,,22"
vboxmanage startvm "$VM_NAME" --type headless

echo "Waiting SSH up"

SSH_OPTS="-o StrictHostKeyChecking=no -o CheckHostIP=no -o NoHostAuthenticationForLocalhost=yes"
SSH_OPTS="$SSH_OPTS -o BatchMode=yes -o LogLevel=ERROR -o UserKnownHostsFile=/dev/null"
SSH_OPTS="$SSH_OPTS -o ConnectTimeout=2 -o User=root -i keys/id_rsa"
SSH="ssh $SSH_OPTS -p $SSH_PORT $SSH_HOST"

while ! $SSH echo "SSH CONNECTED"; do
    echo "Still waiting"
    sleep 1
done

# Deploy updates
ansible-playbook -i ansible_hosts --key-file keys/id_rsa image.yml

# Power off VM
$SSH poweroff || echo 'OK'
while VBoxManage list runningvms | grep -q "$VM_NAME"; do
    echo "Waiting for vm stop"
    sleep 2
done

echo "Deleting port-forwarding for deploy"
VBoxManage modifyvm "$VM_NAME" --natpf1 delete deploy

echo "VM stopped, exporting"
VBoxManage export "$VM_NAME" -o "$OUTPUT_IMAGE.temp"

echo "Swapping output image"
if [ -f "$OUTPUT_IMAGE" ]; then
    mv "$OUTPUT_IMAGE" "$OUTPUT_IMAGE.prev"
fi
mv "$OUTPUT_IMAGE.temp" "$OUTPUT_IMAGE"

echo "Done"
