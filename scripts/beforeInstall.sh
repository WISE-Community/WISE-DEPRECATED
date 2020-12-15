#!/bin/bash

export HOME=/home/ubuntu
export BUILD_DIR=$HOME/build-folder
export BUILD_FILES=$HOME/wise-build-files
export CATALINA_HOME=/var/lib/tomcat9

sudo -u ubuntu -g ubuntu touch $HOME/deploy.log
exec &>> $HOME/deploy.log

echo "Starting deployment at $(date)"

if [[ $DEPLOYMENT_GROUP_NAME == "qa-deployment-group" ]]; then
    env="qa"
elif [[ $DEPLOYMENT_GROUP_NAME == "prod-deployment-group" ]]; then
    env="prod"
fi

echo "Updating Ubuntu"
apt-get update
apt-get upgrade -y

echo "Setting server timezone to Los Angeles"
timedatectl set-timezone America/Los_Angeles

echo "Installing AWS CLI"
apt-get install awscli -y

echo "Downloading files from wise-build-files S3 bucket"
sudo -u ubuntu -g ubuntu mkdir $HOME/wise-build-files
sudo -u ubuntu -g ubuntu aws s3 sync s3://wise-build-files $HOME/wise-build-files
chmod u+x $HOME/wise-build-files/sync.sh

echo "Installing Java 11"
apt-get install openjdk-11-jdk-headless -y

echo "Create tomcat group"
groupadd -g 1001 tomcat

echo "Create tomcat user"
useradd -u 1001 -g tomcat -c "Apache Tomcat" -d / -s /usr/sbin/nologin tomcat

echo "Adding ubuntu user to tomcat group"
usermod -a -G tomcat ubuntu

echo "Installing Tomcat 9"
apt-get install tomcat9 -y

echo "Removing Tomcat ROOT folder"
rm -rf $CATALINA_HOME/webapps/ROOT

echo "Add https to Tomcat server.xml"
sed 's/<Connector port="8080"/<Connector port="8080" scheme="https"/' -i $CATALINA_HOME/conf/server.xml

echo "Downlading setenv.sh Tomcat file"
cp $BUILD_FILES/setenv.sh /usr/share/tomcat9/bin/setenv.sh

echo "Restarting Tomcat"
service tomcat9 restart

echo "Creating Tomcat curriculum and studentuploads folders"
sudo -u ubuntu -g tomcat mkdir $CATALINA_HOME/webapps/curriculum
sudo -u ubuntu -g tomcat mkdir $CATALINA_HOME/webapps/studentuploads

echo "Installing Nginx"
apt-get install nginx -y

echo "Adding Nginx www-data user to tomcat group"
usermod -a -G tomcat www-data

echo "Downloading WISE Nginx config file"
rm -f /etc/nginx/sites-enabled/*
cp $BUILD_FILES/$env/wise.conf /etc/nginx/sites-enabled/wise.conf
systemctl restart nginx

echo "Creating additional folders for WISE"
mkdir -p $HOME/build-folder/WEB-INF/classes
sudo -u ubuntu -g ubuntu mkdir $HOME/backup
sudo -u ubuntu -g tomcat mkdir $HOME/googleTokens

echo "Downloading application.properties file"
cp $BUILD_FILES/$env/application.properties $BUILD_DIR/WEB-INF/classes/application.properties

echo "Installing network drive package"
apt-get install nfs-common -y

echo "Mounting network drive folders"
cp $BUILD_FILES/$env/fstab /etc/fstab
mount -a

echo "Downloading .vimrc file"
sudo -u ubuntu -g ubuntu cp $BUILD_FILES/.vimrc $HOME/.vimrc

echo "Downloading text to append to .bashrc"
cat $BUILD_FILES/append-to-bashrc.txt >> ~/.bashrc
source ~/.bashrc

echo "Installing tree"
apt-get install tree -y

echo "Downloading message of the day script to display notes"
cp $BUILD_FILES/99-notes /etc/update-motd.d/99-notes
chmod 755 /etc/update-motd.d/99-notes