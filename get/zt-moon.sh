#!/usr/bin/bash

SUDO=
if [ "$UID" != "0" ]; then
	if [ -e /usr/bin/sudo -o -e /bin/sudo ]; then
		SUDO=sudo
	else
		echo "This script needs root permission."
		exit 1
	fi
fi

if [ -f /usr/sbin/zerotier-one -a -d /var/lib/zerotier-one ]; then
    echo "Found zerotier program."
else
    echo "Zerotier program not found."
    exit 1
fi

cd /var/lib/zerotier-one

if [ -f /var/lib/zerotier-one/moon.json ]; then
    echo "Detected moon.json."
else
    $SUDO zerotier-idtool initmoon identity.public>>/var/lib/zerotier-one/moon.json
    echo "Please edit '/var/lib/zerotier-one/moon.json' and re-run this script."
    echo "tip: copy 'id' in the json file for use."
    exit 1
fi

if [ "$1" == "nogenmoon" ]; then
    echo "Skipped genmoon."
else
    $SUDO zerotier-idtool genmoon /var/lib/zerotier-one/moon.json
fi

read -p "Input moon filename: " moonname
if [ -f $moonname ]; then
    mkdir /var/lib/zerotier-one/moods.d
    $SUDO cp $moonname /var/lib/zerotier-one/moons.d/
    if [ -f /usr/sbin/ufw ]; then
        echo "Detected ufw, auto allow port 9993"
        $SUDO ufw allow 9993
    fi
    echo "Restarting zerotier service."
    $SUDO /usr/sbin/zerotier-one restart
    echo "tip: if you enabled firewall and zerotier-one shows error, remember allow port 9993 and restart zerotier-one service manually!"
    echo "Finished!"
    exit 0
else
    echo "$moonname not found! / restart using arg 'nogenmoon'"
    exit 1
fi
