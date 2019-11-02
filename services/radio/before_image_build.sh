#!/bin/bash

docker build -f Dockerfile.build -t radio/ctf . && docker run --rm -v `pwd`:/go/src/github.com/HackerDom/ructfe-2019/services/radio/ radio/ctf make build