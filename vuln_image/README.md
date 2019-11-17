
# Base image preparation

* make VM and forward port to ssh
* install Ubuntu Server from iso, make ructfe user during process
* generate new ssh keys: `ssh-keygen`
* copy new keys into VM (for ructfe user and for root)
* allow ssh as root without password (`visudo`)
* `apt install --no-install-recommends docker.io docker-compose htop mc`
* `sudo apt install virtualbox-guest-utils`
* edit `/etc/default/grub`, set: `GRUB_CMDLINE_LINUX="net.ifnames=0 biosdevname=0"`
* `update-grub`
* edit `/etc/netplan/*.yml`, rename interface to `eth0` there
* disable ructfe user: `passwd -l -d ructfe`
* `apt update && apt upgrade`
* reboot
* check and (optionally) delete logs
