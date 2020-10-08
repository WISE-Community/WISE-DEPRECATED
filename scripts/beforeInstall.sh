#!/bin/bash

export HOME=/home/ubuntu
export CATALINA_HOME=/opt/tomcat

exec &>> $HOME/deploy.log

echo "Starting deployment at $(date)"

echo "Stopping Tomcat"
sudo service tomcat stop

echo "Deleting $CATALINA_HOME/webapps/ROOT.war"
rm -rf $CATALINA_HOME/webapps/ROOT.war

echo "Deleting $CATALINA_HOME/webapps/ROOT"
rm -rf $CATALINA_HOME/webapps/ROOT