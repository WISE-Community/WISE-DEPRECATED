#!/bin/bash

export HOME=/home/ubuntu
export CATALINA_HOME=/opt/tomcat
export CATALINA_BASE=$CATALINA_HOME
export BUILD_DIR=$HOME/build
export QA_BUILD_DIR=$HOME/build/qa
export PROD_BUILD_DIR=$HOME/build/prod
export WISE_BUILD_DIR=$BUILD_DIR/WISE

echo DEPLOYMENT_GROUP_NAME=$DEPLOYMENT_GROUP_NAME

if [[ $DEPLOYMENT_GROUP_NAME == "" ]]; then
  echo "Requires DEPLOYMENT_GROUP_NAME to be set"
  exit 1
fi

sudo service tomcat stop
rm -rf $CATALINA_BASE/webapps/ROOT.war
rm -rf $CATALINA_BASE/webapps/ROOT

if [[ $DEPLOYMENT_GROUP_NAME == "qa-deployment-group" ]]; then
    mv target/wise.war $QA_BUILD_DIR
    cd $QA_BUILD_DIR
elif [[ $DEPLOYMENT_GROUP_NAME == "prod-deployment-group" ]]; then
    mv target/wise.war $PROD_BUILD_DIR
    cd $PROD_BUILD_DIR
fi

zip -g wise.war WEB-INF/classes/application.properties
mv wise.war $CATALINA_BASE/webapps/ROOT.war
cp WEB-INF/classes/application.properties $CATALINA_BASE/webapps/legacy/WEB-INF/classes/application.properties
sudo service tomcat start