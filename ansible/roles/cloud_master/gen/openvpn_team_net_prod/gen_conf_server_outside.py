import os
import sys

N = 768

SERVER_DATA = """server-bridge 10.{0}.{1}.1 255.255.255.0 10.{0}.{1}.100 10.{0}.{1}.200
port {2}
cipher AES-128-CBC
dev team{3}
dev-type tap
dev team{3}-net
ifconfig 10.{0}.{1}.1 255.255.255.0
keepalive 10 30
ping-timer-rem
persist-tun
persist-key

duplicate-cn
client-to-client

verb 3

txqueuelen 1000
tun-mtu 1500
fragment 1300
mssfix

<dh>
{4}
</dh>

<ca>
{5}
</ca>

<cert>
{6}
</cert>

<key>
{7}
</key>
"""

if __name__ != "__main__":
    print("I am not a module")
    sys.exit(0)

# gen client configs
os.chdir(os.path.dirname(os.path.realpath(__file__)))
try:
    os.mkdir("server_outside")
except FileExistsError:
    print("Remove ./server_outside dir first")
    sys.exit(1)

for i in range(N):
    dh = open("team%d-net/dh.pem" % i).read().strip()
    ca = open("team%d-net/ca.crt" % i).read().strip()
    cert = open("team%d-net/issued/team%d-server.crt" % (i, i)).read().strip()
    cert = cert[cert.index("-----BEGIN CERTIFICATE-----"):]
    key = open("team%d-net/private/team%d-server.key" % (i, i)).read().strip()

    data = SERVER_DATA.format(60 + i // 256, i % 256, 30000+i, i, dh, ca, cert, key)
    open("server_outside/%d.conf" % i, "w").write(data)

print("Finished, check ./server_outside dir")
