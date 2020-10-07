#!/bin/bash

export HOME=/home/ubuntu
export CATALINA_HOME=/opt/tomcat
export CATALINA_BASE=$CATALINA_HOME
export BUILD_DIR=$HOME/build
export QA_BUILD_DIR=$HOME/build/qa
export PROD_BUILD_DIR=$HOME/build/prod
export WISE_BUILD_DIR=$BUILD_DIR/WISE

echo DEPLOYMENT_GROUP_NAME=$DEPLOYMENT_GROUP_NAME >> update.log

if [[ $DEPLOYMENT_GROUP_NAME == "" ]]; then
  echo "Requires DEPLOYMENT_GROUP_NAME to be set" >> update.log
  exit 1
fi

sudo service tomcat stop
echo "Stopped Tomcat" >> update.log
rm -rf $CATALINA_BASE/webapps/ROOT.war
rm -rf $CATALINA_BASE/webapps/ROOT
echo "Removed ROOT.war and ROOT" >> update.log

if [[ $DEPLOYMENT_GROUP_NAME == "qa-deployment-group" ]]; then
    echo "Moving target/wise.war to $QA_BUILD_DIR" >> update.log
    mv target/wise.war $QA_BUILD_DIR
    echo "Changing to QA_BUILD_DIR directory" >> update.log
    cd $QA_BUILD_DIR
elif [[ $DEPLOYMENT_GROUP_NAME == "prod-deployment-group" ]]; then
    echo "Moving target/wise.war to $PROD_BUILD_DIR" >> update.log
    mv target/wise.war $PROD_BUILD_DIR
    echo "Changing to PROD_BUILD_DIR directory" >> update.log
    cd $PROD_BUILD_DIR
fi

zip -g wise.war WEB-INF/classes/application.properties
echo "Added application.properties to wise.war" >> update.log
mv wise.war $CATALINA_BASE/webapps/ROOT.war
echo "Moved wise.war to ROOT.war" >> update.log
cp WEB-INF/classes/application.properties $CATALINA_BASE/webapps/legacy/WEB-INF/classes/application.properties
sudo service tomcat start
echo "Started Tomcat" >> update.log