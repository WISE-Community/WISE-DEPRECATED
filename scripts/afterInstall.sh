#!/bin/bash

export HOME=/home/ubuntu
export BUILD_DIR=$HOME/build-folder
export BUILD_FILES=$HOME/wise-build-files
export CATALINA_HOME=/var/lib/tomcat9

exec &>> $HOME/deploy.log

echo "Changing to $BUILD_DIR directory"
cd $BUILD_DIR

echo "Injecting application.properties into wise.war"
zip -g wise.war WEB-INF/classes/application.properties

echo "Moving wise.war to $CATALINA_HOME/webapps/ROOT.war"
mv wise.war $CATALINA_HOME/webapps/ROOT.war
chown tomcat:tomcat $CATALINA_HOME/webapps/ROOT.war

echo "Copying legacy.war to $BUILD_DIR"
cp $BUILD_FILES/legacy.war $BUILD_DIR

echo "Injecting application.properties into legacy.war"
zip -g legacy.war WEB-INF/classes/application.properties

echo "Moving legacy.war to $CATALINA_HOME/webapps/legacy.war"
mv legacy.war $CATALINA_HOME/webapps/legacy.war
chown tomcat:tomcat $CATALINA_HOME/webapps/legacy.war

echo "Deleting build-folder"
rm -rf $BUILD_DIR

echo "Finishing deployment at $(date)"