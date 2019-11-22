#!/bin/bash

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
cd "$BASE_DIR"

INPUT_IMAGE="images/ructfe2019-deploy.ova"
#INPUT_IMAGE="images/ructfe2019-base3.ova"
ENCRYPTED_DIR="images/encrypted"

rm -rf "$ENCRYPTED_DIR"
mkdir -p "$ENCRYPTED_DIR"
ln "$INPUT_IMAGE" "$ENCRYPTED_DIR/ructfe2019.ova"
cd $ENCRYPTED_DIR
time sha256sum ructfe2019.ova > sha256sum.txt
time 7z a -p9w2hJ25jBvZNgPXrDX3AVGNh6hPbUg6k ructfe2019.ova.7z ructfe2019.ova

