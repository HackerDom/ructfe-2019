#!/bin/bash -e

host="${1?Usage: ./check_put_get_get.sh <host> <script> [vuln]}"
script="${2?Usage: ./check_put_get_get.sh <host> <script> [vuln]}"
vuln="$3"

dirname="$(dirname $script)"
filename="$(basename $script)"

id="$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 8 | head -n 1)"
flag="$(cat /dev/urandom | tr -dc 'a-f0-9' | fold -w 31 | head -n 1)="

cd "$dirname"

"./$filename" check "$host" || echo "check $host" $?
id=$("./$filename" put "$host" "$id" "$flag" "$vuln") || echo put "$host" "$id" "$flag" "$vuln" $?
"./$filename" get "$host" "$id" "$flag" "$vuln" || echo get "$host" "$id" "$flag" "$vuln" $?
"./$filename" get "$host" "$id" "$flag" "$vuln" || echo get "$host" "$id" "$flag" "$vuln" $?
