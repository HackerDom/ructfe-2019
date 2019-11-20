#!/bin/bash

# Run in tmux, waits for changes in current branch and rebuilds image if any
# Based on: https://gist.github.com/grant-roy/49b2c19fa88dcffc46ab

# Configs:
PULL_INTERVAL=10 # in seconds


# Cd into script directory
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
cd "$BASE_DIR"

mkdir -p ./build_logs

while true; do
    echo "Checking for changes..."
    git fetch;
    LOCAL=$(git rev-parse HEAD);
    REMOTE=$(git rev-parse @{u});

    #if our local revision id doesn't match the remote, we will need to pull the changes
    if [ $LOCAL != $REMOTE ]; then
        echo "Found new changes, rebuilding!"
        #pull changes
        git pull;

        echo "-----------------------------------------------------------------"
        ./scripts/run_before_image_built_hooks.sh 
        ./rebuild_image.sh;
        echo "-----------------------------------------------------------------"
    else
        sleep $PULL_INTERVAL
    fi
done
