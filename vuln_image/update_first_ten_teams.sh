#!/bin/bash


# Cd into script directory
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
cd "$BASE_DIR"

ssh-add keys/id_rsa
ansible-playbook -i teams1-10.hosts image.yml
