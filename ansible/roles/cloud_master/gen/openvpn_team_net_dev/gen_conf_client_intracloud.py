import os
import sys

N = 768

SERVER = "team%d.cloud.ructfe.org"

CLIENT_DATA = """tls-client
remote {0} {1}
dev-type tap
dev team{2}
keepalive 10 30
nobind
verb 3

script-security 2
up "/etc/openvpn/add_to_team_bridge.sh"

tun-mtu 1500
fragment 1300
mssfix

<ca>
{3}
</ca>

<cert>
{4}
</cert>

<key>
{5}
</key>
"""

if __name__ != "__main__":
    print("I am not a module")
    sys.exit(0)

# gen client configs
os.chdir(os.path.dirname(os.path.realpath(__file__)))
try:
    os.mkdir("client_intracloud")
except FileExistsError:
    print("Remove ./client_intracloud dir first")
    sys.exit(1)

for i in range(N):
    ca = open("team%d-net/ca.crt" % i).read().strip()
    cert = open("team%d-net/issued/team%d-client.crt" % (i, i)).read().strip()
    cert = cert[cert.index("-----BEGIN CERTIFICATE-----"):]
    key = open("team%d-net/private/team%d-client.key" % (i, i)).read().strip()

    data = CLIENT_DATA.format(SERVER % i, 30000+i, i, ca, cert, key)
    open("client_intracloud/%d.conf" % i, "w").write(data)

print("Finished, check ./client_intracloud dir")
