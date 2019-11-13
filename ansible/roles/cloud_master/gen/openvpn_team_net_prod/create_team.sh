#!/bin/bash

NUM="$1"

./easyrsa --pki-dir="team${NUM}-net" init-pki
EASYRSA_REQ_CN="team${NUM}-net" ./easyrsa --batch --pki-dir="team${NUM}-net" build-ca nopass
./easyrsa --batch --pki-dir="team${NUM}-net" build-client-full "team${NUM}-client" nopass
./easyrsa --batch --pki-dir="team${NUM}-net" build-server-full "team${NUM}-server" nopass
./easyrsa --batch --pki-dir="team${NUM}-net" gen-dh