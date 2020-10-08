#!/bin/bash

export HOME=/home/ubuntu
export CATALINA_HOME=/opt/tomcat
export BUILD_DIR=$HOME/build
export QA_BUILD_DIR=$BUILD_DIR/qa
export PROD_BUILD_DIR=$BUILD_DIR/prod

exec &>> $HOME/deploy.log

if [[ $DEPLOYMENT_GROUP_NAME == "qa-deployment-group" ]]; then
    echo "Moving $BUILD_DIR/wise.war to $QA_BUILD_DIR"
    mv $BUILD_DIR/wise.war $QA_BUILD_DIR

    echo "Changing directory to $QA_BUILD_DIR"
    cd $QA_BUILD_DIR
elif [[ $DEPLOYMENT_GROUP_NAME == "prod-deployment-group" ]]; then
    echo "Moving $BUILD_DIR/wise.war to $PROD_BUILD_DIR"
    mv $BUILD_DIR/wise.war $PROD_BUILD_DIR

    echo "Changing directory to $PROD_BUILD_DIR"
    cd $PROD_BUILD_DIR
fi

echo "Adding application.properties to wise.war"
zip -g wise.war WEB-INF/classes/application.properties

echo "Moving wise.war to $CATALINA_HOME/webapps/ROOT.war"
mv wise.war $CATALINA_HOME/webapps/ROOT.war

echo "Copying application.properties to $CATALINA_HOME/webapps/legacy/WEB-INF/classes/application.properties"
cp WEB-INF/classes/application.properties $CATALINA_HOME/webapps/legacy/WEB-INF/classes/application.properties