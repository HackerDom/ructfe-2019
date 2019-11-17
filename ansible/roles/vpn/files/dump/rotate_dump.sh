#!/bin/bash -e

DUMP_NAME="${1?No file name to rotate}"
NEW_DUMP_NAME="$(date "+%Y%m%d-%H%M%S.%N")"

mv -- "${DUMP_NAME}" "${NEW_DUMP_NAME}"

gzip -1 -- "${NEW_DUMP_NAME}"
