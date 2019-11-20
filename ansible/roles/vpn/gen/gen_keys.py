import os
import sys
from subprocess import call

N = 768
OPENVPN_PATH = "/usr/sbin/openvpn"

if __name__ != "__main__":
	print("I am not a module")
	sys.exit(0)


os.chdir(os.path.dirname(os.path.realpath(__file__)))
try:
	os.mkdir("keys")
	os.chdir("keys")
except FileExistsError:
	print("Remove ./keys directory first")
	sys.exit(1)

for i in range(N):
	keyname = "%d.key" % i
	call([OPENVPN_PATH, "--genkey", "--secret", keyname])
	if not os.path.isfile(keyname):
		print("Failed to gen: %s" % keyname)
		break
else:
	print("All ok")
