#!/usr/bin/python3

import sys
import os
import secrets

N = 768

def genpass(n=12):
 abc = "abcdefgkmnrtxyzABCDEFGKMNRTXYZ23456789"
 return "".join([secrets.choice(abc) for i in range(n)])

os.chdir(os.path.dirname(os.path.realpath(__file__)))

try:
    os.mkdir("passwds")
except FileExistsError:
    print("Remove ./passwds dir first")
    sys.exit(1)


for i in range(N):
    open("passwds/team%d_root_passwd.txt" % i, "w").write(genpass()+"\n")

