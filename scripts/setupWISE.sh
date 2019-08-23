#!/bin/bash

export SETUP_DIR=/home/ubuntu/setup

cd $SETUP_DIR
if [ $DEPLOYMENT_GROUP_NAME == "qa-deployment-group" ];
then
    ./setupServer.sh qa
elif [ $DEPLOYMENT_GROUP_NAME == "prod-deployment-group" ];
then
    ./setupServer.sh prod
fi
