import os
import sys

N = 768

SERVER = "team%d.cloud.ructfe.org"

CLIENT_DATA = """client
tls-client
cipher AES-128-CBC
remote {0} {1}
dev tap
route 10.60.0.0 255.252.0.0
route 10.80.0.0 255.252.0.0
route 10.10.10.0 255.255.255.0
keepalive 10 30
nobind
verb 3

tun-mtu 1500
fragment 1300
mssfix

<ca>
{2}
</ca>

<cert>
{3}
</cert>

<key>
{4}
</key>
"""

if __name__ != "__main__":
    print("I am not a module")
    sys.exit(0)

# gen client configs
os.chdir(os.path.dirname(os.path.realpath(__file__)))
try:
    os.mkdir("client_entergame")
except FileExistsError:
    print("Remove ./client_entergame dir first")
    sys.exit(1)

for i in range(N):
    ca = open("team%d-net/ca.crt" % i).read().strip()
    cert = open("team%d-net/issued/team%d-client.crt" % (i, i)).read().strip()
    cert = cert[cert.index("-----BEGIN CERTIFICATE-----"):]
    key = open("team%d-net/private/team%d-client.key" % (i, i)).read().strip()

    data = CLIENT_DATA.format(SERVER % i, 30000+i, ca, cert, key)
    open("client_entergame/%d.conf" % i, "w").write(data)

print("Finished, check ./client_entergame dir")
