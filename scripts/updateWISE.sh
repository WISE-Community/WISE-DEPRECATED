#!/bin/bash

export HOME=/home/ubuntu
export CATALINA_HOME=/opt/tomcat
export CATALINA_BASE=$CATALINA_HOME
export BUILD_DIR=$HOME/build
export QA_BUILD_DIR=$HOME/build/qa
export PROD_BUILD_DIR=$HOME/build/prod
export WISE_BUILD_DIR=$BUILD_DIR/WISE

sudo service tomcat stop
sleep 10
rm -rf $CATALINA_BASE/webapps/ROOT.war
rm -rf $CATALINA_BASE/webapps/ROOT
cd $WISE_BUILD_DIR
git log -n 5
./wise.sh package
if [ $DEPLOYMENT_GROUP_NAME == "qa-deployment-group" ];
then
    mv $WISE_BUILD_DIR/target/wise.war $QA_BUILD_DIR
    cd $QA_BUILD_DIR
elif [ $DEPLOYMENT_GROUP_NAME == "prod-deployment-group" ];
then
    mv $WISE_BUILD_DIR/target/wise.war $PROD_BUILD_DIR
    cd $PROD_BUILD_DIR
fi
zip -g wise.war WEB-INF/classes/application.properties
mv wise.war ROOT.war
mv ROOT.war $CATALINA_BASE/webapps
sudo service tomcat start
