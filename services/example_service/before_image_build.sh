#!/bin/bash

# compile service binary
docker run --rm -v `pwd`:/usr/src/app -w /usr/src/app nimlang/nim nim compile src/example_service.nim

