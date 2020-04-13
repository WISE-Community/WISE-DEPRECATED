#!/bin/bash
# Starts WISE in tomcat-embedded mode using hsqldb and default settings stores in $SAMPLE_PROPERTIES_FILE
# if arg1="run", keeps existing data and simply starts embedded tomcat server.
# If this is the first time running, it will initialize the data before starting.
# if arg1="reset", it wipes out any existing data in database/curriculum/studentupload

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

PWD=`pwd`
TODAY=`/bin/date +\%Y\%m\%d`
PROPERTIES_FILE="src/main/resources/application.properties"
SAMPLE_PROPERTIES_FILE="src/main/resources/application_sample.properties"

if [ $# -ne 1 ] || !([ $1 == "reset" ] || [ $1 == "package" ] || [ $1 == "dev" ] || [ $1 == "run" ]); then
  echo "Usage: ./wise.sh {reset|package|dev|run}"
  exit 1
fi

if [ $1 = "reset" ]; then
  read -p "Are you sure? This will delete all existing users, projects, and student work. [y/n]: " -n 1 -r
  echo    # move to a new line
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    find $PWD/src/main/webapp/curriculum/ ! \( -name README -o -name .gitignore \) -type d \( -path demo \) -delete
    find $PWD/src/main/webapp/studentuploads/ ! \( -name README -o -name .gitignore \) -delete
    rm $PWD/$PROPERTIES_FILE
    mv $PWD/hsqldb $PWD/hsqldb-bak-$TODAY
  fi
  exit 0
fi

if [ $1 = "package" ]; then
  npm install
  npm run build-prod
  ./mvnw clean -Dmaven.test.skip=true package
  exit 0
fi

if [ ! -f $PROPERTIES_FILE ]; then
  # properties file does not exist so assume this is a fresh install
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
  sed -i.bak '/hibernate.hbm2ddl.auto=[none|create|update]/d' $PROPERTIES_FILE
  echo "hibernate.hbm2ddl.auto=create-only" >> $PROPERTIES_FILE
else
  # make sure db tables are not wiped out
  sed -i.bak '/hibernate.hbm2ddl.auto=[none|create|update]/d' $PROPERTIES_FILE
  echo "hibernate.hbm2ddl.auto=none" >> $PROPERTIES_FILE
fi

if [ $1 = "dev" ]; then
  npm run build-dev&
fi

./mvnw spring-boot:run
exit 0
