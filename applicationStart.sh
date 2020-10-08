#!/bin/bash

export HOME=/home/ubuntu

exec &>> $HOME/deploy.log

echo "Starting Tomcat"
sudo service tomcat start

echo "Finishing deployment at $(date)"