source /home/ubuntu/.profile

export HOME=/home/ubuntu
export CATALINA_HOME=/opt/tomcat
export CATALINA_BASE=$CATALINA_HOME
export BUILD_DIR=$HOME/build
export WISE_BUILD_DIR=$BUILD_DIR/WISE
export GIT_BRANCH=develop

sudo service tomcat stop
sleep 10
rm -rf $CATALINA_BASE/webapps/ROOT.war
rm -rf $CATALINA_BASE/webapps/ROOT
cd $WISE_BUILD_DIR
#git checkout $GIT_BRANCH
#git pull
git log -n 5
./wise.sh package
mv $WISE_BUILD_DIR/target/wise.war $BUILD_DIR
cd $BUILD_DIR
zip -g wise.war WEB-INF/classes/application.properties
mv wise.war ROOT.war
mv ROOT.war $CATALINA_BASE/webapps
sudo service tomcat start
