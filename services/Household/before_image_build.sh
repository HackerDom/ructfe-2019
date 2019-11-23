#!/bin/bash

mkdir -p ./publish/ && rm -rf ./publish/*

docker-compose -f docker-compose-build.yaml up --build
docker-compose -f docker-compose-build.yaml down
