#!/bin/bash
set -e

./scripts/generate_secrets.sh > /dev/null

if [ $? -eq 0 ]
then
    echo "Secret successfully created"
else 
    echo "Can't create secret" >&2
    exit 1
fi

$APP_DIR/radio -migrate
if [ $? -ne 0 ]
then
    echo "Can't migrate secret" >&2
    exit 1
fi

$APP_DIR/radio
