#!/bin/bash
set -e

echo "Temporary script for deploy application..."
cd /opt/acs

echo "Stop application services: "
sudo systemctl stop genieacs-ui
sudo systemctl stop genieacs-fs
sudo systemctl stop genieacs-nbi
sudo systemctl stop genieacs-cwmp

echo "Update application: "
git pull origin master
npm install
npm run build

cp /opt/acs/genieacs.env.template /opt/acs/dist/genieacs.env
node -e "console.log(\"GENIEACS_UI_JWT_SECRET=\" + require('crypto').randomBytes(128).toString('hex'))" >> /opt/acs/dist/genieacs.env
chmod 600 /opt/acs/dist/genieacs.env

echo "Start application services: "
sudo systemctl start genieacs-cwmp
sudo systemctl start genieacs-nbi
sudo systemctl start genieacs-fs
sudo systemctl start genieacs-ui

echo "ALL, DONE! Update DataBase if it needed..."
