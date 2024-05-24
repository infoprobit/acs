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

echo "Start application services: "
sudo systemctl start genieacs-cwmp
sudo systemctl start genieacs-nbi
sudo systemctl start genieacs-fs
sudo systemctl start genieacs-ui

echo "ALL, DONE! Update DataBase if it needed..."
