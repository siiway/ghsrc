SUDO=
if [ "$UID" != "0" ]; then
	if [ -e /usr/bin/sudo -o -e /bin/sudo ]; then
		SUDO=sudo
	else
		echo "This script needs root permission."
		exit 1
	fi
fi

echo "Adding keyrings"
$SUDO mkdir -p /etc/apt/keyrings
$SUDO curl -L -o /etc/apt/keyrings/syncthing-archive-keyring.gpg https://syncthing.net/release-key.gpg

echo "Adding APT source"
read -p "Input reserve proxy url (https://example.com/) : " rpx
echo "deb [signed-by=/etc/apt/keyrings/syncthing-archive-keyring.gpg] ${rpx}https://apt.syncthing.net/ syncthing stable" | $SUDO tee /etc/apt/sources.list.d/syncthing.list

$SUDO apt-get update

# read -p "Input HTTP proxy (http://ip:port/) : " httppx

# sudo apt-get -o Acquire::http::proxy="$httppx" -o Acquire::https::proxy="$httppx" install syncthing
