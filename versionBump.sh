#!/bin/sh
# usage: sh versionBump.sh NEW_VERSION_NUMBER
# updates files containing version information in WISE and encourages user to commit them

if [ $# -eq 0 ]
  then
    echo "Usage: versionBump.sh NEW_VERSION_NUMBER"
    exit 1
fi

export NEW_VERSION_NUMBER=$1

if [[ $NEW_VERSION_NUMBER =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Valid version number...continuing."
else 
    echo "Invalid version number...must be like \"x.y.z\". Exiting without bumping version."
    exit 1
fi

echo ${NEW_VERSION_NUMBER} > src/main/resources/version.txt

# Note: this assumes that WISE version is the first "version":"..." field in package.json
sed -i.bak "1,/\"version\": \".*\"/{s/\"version\": \".*\"/\"version\": \"${NEW_VERSION_NUMBER}\"/;}" package.json && rm package.json.bak

# Note: this assumes that WISE version is the first <version>...</version> tag in pom.xml
sed -i.bak "1,/<version>.*<\/version>/{s/<version>.*<\/version>/<version>${NEW_VERSION_NUMBER}<\/version>/;}" pom.xml && rm pom.xml.bak

# Note: this assumes that WISE version is in the ?v=versionNumber in jsp
sed -i.bak "1,/config\.js\?v\=.*\""/{s/config\.js\?v\=.*\"/config\.js\?v\=${NEW_VERSION_NUMBER}\""/;}" src/main/webapp/portal/author.jsp

# Note: this assumes that WISE version is in the ?v=versionNumber in jsp
sed -i.bak "1,/config\.js\?v\=.*\""/{s/config\.js\?v\=.*\"/config\.js\?v\=${NEW_VERSION_NUMBER}\""/;}" src/main/webapp/portal/classroomMonitor.jsp

# Note: this assumes that WISE version is in the ?v=versionNumber in jsp
sed -i.bak "1,/config\.js\?v\=.*\""/{s/config\.js\?v\=.*\"/config\.js\?v\=${NEW_VERSION_NUMBER}\""/;}" src/main/webapp/portal/student.jsp

# Note: this assumes that WISE version is in the ?v=versionNumber in config.js
sed -i.bak "1,/\'\?v\=.*\'"/{s/\'\?v\=.*\'/\'\?v\=${NEW_VERSION_NUMBER}\'"/;}" src/main/webapp/wise5/config.js

echo "Bumped version number to ${NEW_VERSION_NUMBER}.\nYou might want to commit changes now:\ngit commit -a -m \"Bumped version number to ${NEW_VERSION_NUMBER}\""
