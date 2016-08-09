#! /bin/sh
# Starts WISE in tomcat-embedded mode using hsqldb and default settings stores in $SAMPLE_PROPERTIES_FILE
# if arg1="run", keeps existing data and simply starts embedded tomcat server. If this is the first time running, it will
# initialize the data before starting.
# if arg1="reset", wipes out any existing data in database/curriculum/studentupload

PWD=`pwd`
PROPERTIES_FILE="src/main/resources/wise.properties"
SAMPLE_PROPERTIES_FILE="src/main/resources/wise_sample_embedded_tomcat.properties"

if [ \( $# -eq 0 \) -o \( $1 != "reset" -a $1 != "run" \) ]
then
    echo "Usage: ./wise.sh {reset|run}"
    exit 0
fi


if [ $1 = "reset" ]
then
  # clear out curriculum and student uploads directories and any existing properties file
  find src/main/webapp/curriculum/ ! \( -name README -o -name .gitignore \) -type d \( -path demo \) -delete
  find src/main/webapp/studentuploads/ ! \( -name README -o -name .gitignore \) -delete
  rm $PROPERTIES_FILE
else
  if [ ! -f $PROPERTIES_FILE ]
  then
    # properties file does not exist, assume this is a fresh install
    # install npm dependencies and jspm depedencies (happens in postinstall)
    npm install

    # copy sample property file and set paths automatically
    cp $SAMPLE_PROPERTIES_FILE $PROPERTIES_FILE
    sed -i.bak '/wiseBaseDir=.*/d' $PROPERTIES_FILE
    echo "wiseBaseDir=$PWD/src/main/webapp/" >> $PROPERTIES_FILE
    sed -i.bak '/curriculum_base_dir=.*/d' $PROPERTIES_FILE
    echo "curriculum_base_dir=$PWD/src/main/webapp/curriculum" >> $PROPERTIES_FILE
    sed -i.bak '/studentuploads_base_dir=.*/d' $PROPERTIES_FILE
    echo "studentuploads_base_dir=$PWD/src/main/webapp/studentuploads" >> $PROPERTIES_FILE

    # prepare to recreate db tables
    sed -i.bak '/hibernate.hbm2ddl.auto=[none|create]/d' $PROPERTIES_FILE
    echo "hibernate.hbm2ddl.auto=create" >> $PROPERTIES_FILE

    # start embedded tomcat
    mvn clean compile tomcat7:run

  else
    # make sure db tables are not wiped out
    sed -i.bak '/hibernate.hbm2ddl.auto=[none|create]/d' $PROPERTIES_FILE
    echo "hibernate.hbm2ddl.auto=none" >> $PROPERTIES_FILE

    # start embedded tomcat
    mvn clean compile tomcat7:run
  fi
fi

