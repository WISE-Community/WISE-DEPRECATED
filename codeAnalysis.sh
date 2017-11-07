#! /bin/sh
alias plato=./node_modules/plato/bin/plato
export OUTPUT_DIR=~/codeAnalysisReport/`/bin/date +\%Y\%m\%d`
echo "Report will be at: $OUTPUT_DIR"

echo "Generating W5 AT Plato Report..."
plato -d $OUTPUT_DIR/PlatoReport_AT -r src/main/webapp/wise5/authoringTool/
echo "Generating W5 VLE Plato Report..."
plato -d $OUTPUT_DIR/PlatoReport_VLE -r src/main/webapp/wise5/vle/
echo "Generating W5 CM Plato Report..."
plato -d $OUTPUT_DIR/PlatoReport_CM -r src/main/webapp/wise5/classroomMonitor/
echo "Generating W5 Services Plato Report..."
plato -d $OUTPUT_DIR/PlatoReport_Services -r src/main/webapp/wise5/services/
echo "Generating W5 Components Plato Report..."
plato -d $OUTPUT_DIR/PlatoReport_Components -r src/main/webapp/wise5/components/

unalias plato
