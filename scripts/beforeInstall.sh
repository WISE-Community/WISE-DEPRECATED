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

echo 'Setting Tomcat to run as ubuntu user'
sed 's/User=tomcat/User=ubuntu/' -i /lib/systemd/system/tomcat9.service
systemctl daemon-reload

echo "Add https to Tomcat server.xml"
sed 's/<Connector port="8080"/<Connector port="8080" scheme="https"/' -i $CATALINA_HOME/conf/server.xml

echo "Copying setenv.sh file to Tomcat bin folder"
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

echo "Adding ip to nginx.conf"
sed 's/http {/http {\n        add_header ip $server_addr;/' -i /etc/nginx/nginx.conf

echo "Adding gzip_types to nginx.conf"
sed 's/gzip on;/gzip on;\n        gzip_types text\/plain text\/xml image\/gif image\/jpeg image\/png image\/svg+xml application\/json application\/javascript application\/x-javascript text\/javascript text\/css;/' -i /etc/nginx/nginx.conf

echo "Copying WISE Nginx config file to Nginx sites-enabled folder"
rm -f /etc/nginx/sites-enabled/*
cp $BUILD_FILES/$env/wise.conf /etc/nginx/sites-enabled/wise.conf
systemctl restart nginx

echo "Creating additional folders for WISE"
mkdir -p $HOME/build-folder/WEB-INF/classes
sudo -u ubuntu -g ubuntu mkdir $HOME/backup
sudo -u ubuntu -g tomcat mkdir $HOME/googleTokens

echo "Copying application.properties file to the build folder"
cp $BUILD_FILES/$env/application.properties $BUILD_DIR/WEB-INF/classes/application.properties

echo "Installing network drive package"
apt-get install nfs-common -y

echo "Mounting network drive folders"
cp $BUILD_FILES/$env/fstab /etc/fstab
mount -a

echo "Copying .vimrc file to the ubuntu home folder"
sudo -u ubuntu -g ubuntu cp $BUILD_FILES/.vimrc $HOME/.vimrc

echo "Appending text to .bashrc"
cat $BUILD_FILES/append-to-bashrc.txt >> ~/.bashrc
cat $BUILD_FILES/$env/append-to-bashrc.txt >> ~/.bashrc
source ~/.bashrc

echo "Copying message of the day file to update-motd.d folder to display notes on login"
cp $BUILD_FILES/99-notes /etc/update-motd.d/99-notes
cat $BUILD_FILES/$env/append-to-99-notes.txt >> /etc/update-motd.d/99-notes
chmod 755 /etc/update-motd.d/99-notes

echo "Install mysql client"
apt-get install mysql-client-core-8.0 -y

echo "Install redis client"
apt-get install redis-tools -y

echo "Installing tree"
apt-get install tree -y
