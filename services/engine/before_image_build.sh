#!/bin/sh

mkdir -p engine/bin/ && \
rm -f engine/bin/engine

docker build -f engine/Dockerfile_build -t engine_build engine && \
docker run --rm -d --name engine_build engine_build && \
docker cp engine_build:/tmp/bin/engine engine/bin/engine

docker stop engine_build
# docker image rm engine_build
