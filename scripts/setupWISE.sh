#!/bin/bash

export SETUP_DIR=/home/ubuntu/setup

cd $SETUP_DIR
if [ "$DEPLOYMENT_GROUP_NAME" == "qa-deployment-group" ] || [ "$1" == "qa" ];
then
    ./setupServer.sh qa
elif [ "$DEPLOYMENT_GROUP_NAME" == "prod-deployment-group" ] || [ "$1" == "prod" ];
then
    ./setupServer.sh prod
fi
