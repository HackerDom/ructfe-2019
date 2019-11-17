#!/bin/bash

echo "Running pre-built scripts for services"

for service_dir in services/* ; do
    echo "Found $service_dir..."
    ls "$service_dir/before_image_build.sh"
    if [ -f "$service_dir/before_image_build.sh" ] ; then
        echo "  found before_image_build.sh hook. Running:"
        (cd "$service_dir" && ./before_image_build.sh)
    else
        echo "  no before_image_build.sh hook"
    fi
done
