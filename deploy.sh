#!/bin/bash
host=$1
topdir=/home/server/data

echo "start to upload to $host"
tar --exclude='./deploy.sh' --exclude='./node_modules' --exclude='./.git' --exclude='./.gitignore' --exclude='./.idea' -zcvf data_cloud.tar.gz .
scp data_cloud.tar.gz "$host:$topdir/"
rm -rf data_cloud.tar.gz

# ssh $host "cd $topdir;./server_update.sh"

echo "finish to upload to $host"

# tar zxvf data_cloud.tar.gz
# npm install
# pm2 start npm --name "data" -- run prod [user] [pwd]
# pm2 restart data
# pm2 stop data
# yunServ@411
