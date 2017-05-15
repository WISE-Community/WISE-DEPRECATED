#!/bin/sh
# Starts WISE in tomcat-embedded mode using hsqldb and default settings stores in $SAMPLE_PROPERTIES_FILE
# if arg1="run", keeps existing data and simply starts embedded tomcat server. If this is the first time running, it will
# initialize the data before starting.
# if arg1="reset", wipes out any existing data in database/curriculum/studentupload

PWD=`pwd`
PROPERTIES_FILE="src/main/resources/wise.properties"
SAMPLE_PROPERTIES_FILE="src/main/resources/wise_sample_embedded_tomcat.properties"

# check for no arguments
if [ "$#" -ne 1 ]
then
        echo "Usage: ./wise.sh {reset|run}"
        exit 0
fi

# check for valid arguments
if [ $1 != "reset" -a $1 != "run" -a $1 != "dev" ]
then
    echo "Usage: ./wise.sh {reset|run|dev}"
    exit 0
fi

if [ $1 = "reset" ]
then
# confirm reset with user
read -p "Are you sure? This will delete all existing users, projects, and student work. [y/n]: " -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
  # clear out curriculum and student uploads directories and any existing properties file
  find src/main/webapp/curriculum/ ! \( -name README -o -name .gitignore \) -type d \( -path demo \) -delete
  find src/main/webapp/studentuploads/ ! \( -name README -o -name .gitignore \) -delete
  rm $PROPERTIES_FILE
fi

else
  if [ ! -f $PROPERTIES_FILE ]
  then
    # properties file does not exist, assume this is a fresh install
    # install npm dependencies and jspm depedencies (happens in postinstall)
    
    if [ $1 = "dev" ]
    then
      # if in dev mode, make sure github token is registered so we don't run into rate limit
      jspm registry config github
    fi

    npm install

    # copy sample property file and set paths automatically
    cp $SAMPLE_PROPERTIES_FILE $PROPERTIES_FILE
    sed -i.bak '/wiseBaseDir=.*/d' $PROPERTIES_FILE
    echo "wiseBaseDir=src/main/webapp/" >> $PROPERTIES_FILE
    sed -i.bak '/curriculum_base_dir=.*/d' $PROPERTIES_FILE
    echo "curriculum_base_dir=src/main/webapp/curriculum" >> $PROPERTIES_FILE
    sed -i.bak '/studentuploads_base_dir=.*/d' $PROPERTIES_FILE
    echo "studentuploads_base_dir=src/main/webapp/studentuploads" >> $PROPERTIES_FILE

    # prepare to recreate db tables
    sed -i.bak '/hibernate.hbm2ddl.auto=[none|create]/d' $PROPERTIES_FILE
    echo "hibernate.hbm2ddl.auto=create" >> $PROPERTIES_FILE

    if [ $1 = "dev" ]
    then
      # starts npm watch-all in background, which transpiles es6 to js and watches changes to sass files
      npm run watch-all&
    fi

    # start embedded tomcat
    mvn clean tomcat7:run

  else
    # make sure db tables are not wiped out
    sed -i.bak '/hibernate.hbm2ddl.auto=[none|create]/d' $PROPERTIES_FILE
    echo "hibernate.hbm2ddl.auto=none" >> $PROPERTIES_FILE

    if [ $1 = "dev" ]
    then
      # starts npm watch-all in background, which transpiles es6 to js and watches changes to sass files
      npm run watch-all&
    fi

    # start embedded tomcat
    mvn clean tomcat7:run
  fi
fi

