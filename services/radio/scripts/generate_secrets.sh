#!/bin/bash
set -e

generate_key() {
    declare -r key_path=$1
    echo -n "$(date +\"%s\")$key_path" | sha256sum | awk '{print $1}' > $key_path 
}

declare -r jwt_secret_path="${SECRET_PATH%/}/jwt_secret"
declare -r session_key="${SECRET_PATH%/}/session_key"

generate_key $jwt_secret_path
generate_key $session_key
