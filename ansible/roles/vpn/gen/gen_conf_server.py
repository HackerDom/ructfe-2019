import os
import sys

N = 768

SERVER_DATA = """mode p2p
port {0}
dev team{1}
dev-type tun
cipher AES-128-CBC
ifconfig 10.{2}.{3}.1 10.{2}.{3}.2
route 10.{4}.{3}.0 255.255.255.0
keepalive 10 60
ping-timer-rem
persist-tun
persist-key

txqueuelen 1000
tun-mtu 1500
fragment 1300
mssfix

<secret>
{5}
</secret>
"""

if __name__ != "__main__":
    print("I am not a module")
    sys.exit(0)

# gen client configs
os.chdir(os.path.dirname(os.path.realpath(__file__)))
try:
    os.mkdir("server")
except FileExistsError:
    print("Remove ./server dir first")
    sys.exit(1)

for i in range(N):
    key = open("keys/%d.key" % i).read()

    data = SERVER_DATA.format(30000+i, i, 80 + i // 256, 
                              i % 256, 60 + i // 256, key)
    open("server/%d.conf" % i, "w").write(data)

print("Finished, check ./server dir")
