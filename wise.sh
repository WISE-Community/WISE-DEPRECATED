#! /bin/sh
# Starts WISE in tomcat-embedded mode using hsqldb and default settings stores in $SAMPLE_PROPERTIES_FILE
# if arg1="setup", wipes out any existing data in database/curriculum/studentupload
# if arg1="start", keeps existing data and simply starts embedded tomcat server

PWD=`pwd`
PROPERTIES_FILE="src/main/resources/wise.properties"
SAMPLE_PROPERTIES_FILE="src/main/resources/wise_sample_embedded_tomcat.properties"

if [ $# -eq 0 ]
then
    echo "Usage: ./wise.sh {setup|start}"
else
    if [ $1 == "setup" ]
    then
	# clear out curriculum and student uploads directories and any existing properties file
	find src/main/webapp/curriculum/ ! \( -name README -o -name .gitignore \) -delete
	find src/main/webapp/studentuploads/ ! \( -name README -o -name .gitignore \) -delete
	rm $PROPERTIES_FILE

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
        mvn tomcat7:run
    else
        if [ $1 == "run" ]
        then
            # make sure db tables are not wiped out
            sed -i.bak '/hibernate.hbm2ddl.auto=[none|create]/d' $PROPERTIES_FILE
            echo "hibernate.hbm2ddl.auto=none" >> $PROPERTIES_FILE

            # start embedded tomcat
            mvn tomcat7:run
        fi
    fi
fi
