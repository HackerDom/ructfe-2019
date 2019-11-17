import os
import sys

N = 768

SERVER = "game.vpn.ructfe.org"

CLIENT_DATA = """mode p2p
dev game
dev-type tun
cipher AES-128-CBC
remote {0} {1}
remote-random-hostname
ifconfig 10.{2}.{3}.2 10.{2}.{3}.1
route 10.60.0.0 255.252.0.0
route 10.80.0.0 255.252.0.0
route 10.10.10.0 255.255.255.0
keepalive 10 30
nobind
verb 3

tun-mtu 1500
fragment 1300
mssfix

<secret>
{4}
</secret>
"""

if __name__ != "__main__":
    print("I am not a module")
    sys.exit(0)

# gen client configs
os.chdir(os.path.dirname(os.path.realpath(__file__)))
try:
    os.mkdir("client")
except FileExistsError:
    print("Remove ./client dir first")
    sys.exit(1)

for i in range(N):
    key = open("keys/%d.key" % i).read()

    data = CLIENT_DATA.format(SERVER, 30000+i, 80 + i // 256, i % 256, key)
    open("client/%d.conf" % i, "w").write(data)

print("Finished, check ./client dir")
