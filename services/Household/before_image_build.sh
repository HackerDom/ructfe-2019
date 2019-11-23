#!/bin/bash

docker-compose -f docker-compose-build.yaml up --build
docker-compose -f docker-compose-build.yaml down
