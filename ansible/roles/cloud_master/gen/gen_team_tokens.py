#!/usr/bin/python3

import sys
import os
import secrets
import hashlib

N = 768

def gentoken(team, n=32):
 abc = "abcdef0123456789"
 return str(team) + "_" + "".join([secrets.choice(abc) for i in range(n)])

os.chdir(os.path.dirname(os.path.realpath(__file__)))

try:
    os.mkdir("tokens")
except FileExistsError:
    print("Remove ./tokens dir first")
    sys.exit(1)

try:
    os.mkdir("tokens_hashed")
except FileExistsError:
    print("Remove ./tokens_hashed dir first")
    sys.exit(1)

for i in range(768):
    token = gentoken(i)
    token_hashed = hashlib.sha256(token.encode()).hexdigest()
    open("tokens/%d.txt" % i, "w").write(token + "\n")
    open("tokens_hashed/%d.txt" % i, "w").write(token_hashed + "\n")
