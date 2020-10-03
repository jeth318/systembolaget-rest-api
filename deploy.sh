#!/usr/bin/env bash
BRANCH_NAME=$1;

if [[ $BRANCH_NAME == "master" ]]; then
	cd /home/pi/Apps/systembolaget-rest-api
else
	exit 0;
fi


echo "Stashing lock files "
git stash

echo "Dropping stash"
git stash drop

echo "Pulling from ${BRANCH_NAME}"
git pull origin ${BRANCH_NAME}
echo "Pulled successfully"

echo "Installing dependencies"
npm install
echo "Project dependencies was installed"

echo "Rebooting systembolaget-rest-api"

if [[ $BRANCH_NAME == "master" ]]; then
	echo "pm2 restart systembolaget-rest-api"
else
    exit 0;
fi
echo "Reboot OK"
echo "Deployment complete, and it was a success!"

exit 0
