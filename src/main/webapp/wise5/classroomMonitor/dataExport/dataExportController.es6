'use strict';

class DataExportController {

    constructor($injector,
                $rootScope,
                $scope,
                $state,
                AnnotationService,
                ConfigService,
                ProjectService,
                StudentStatusService,
                TeacherDataService,
                TeacherWebSocketService,
                UtilService) {

        this.$injector = $injector;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;
        this.TeacherWebSocketService = TeacherWebSocketService;
        this.UtilService = UtilService;
        this.exportStepSelectionType = "exportAllSteps";
        this.exportType = null;  // type of export: [latestWork, allWork, events]

        // get the project
        // create the mapping of node id to order for the import project
        this.ProjectService.retrieveProject().then((projectJSON) => {
            this.project = projectJSON;
            // calculate the node order of the import project
            let nodeOrderOfProject = this.ProjectService.getNodeOrderOfProject(this.project);
            this.projectIdToOrder = nodeOrderOfProject.idToOrder;
            this.projectItems = nodeOrderOfProject.nodes;
        });

        // save event when data export view is displayed
        let context = "ClassroomMonitor", nodeId = null, componentId = null, componentType = null,
            category = "Navigation", event = "dataExportViewDisplayed", data = {};
        this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);
    }

    hello() {
        ocpu.seturl("//128.32.189.240:81/ocpu/user/wiser/library/wiser/R");
        // perform the request
        var req = ocpu.call("hello", {
            "name": "Hiroki"
        }, (session) => {
            session.getStdout((returnedCSVString) => {
                var csvBlob = new Blob([returnedCSVString], {type: 'text/csv'});
                var csvUrl = URL.createObjectURL(csvBlob);
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                a.href = csvUrl;
                a.download = "export_" + runId + ".csv";
                a.click();

                // timeout is required for FF.
                window.setTimeout(() => {
                    URL.revokeObjectURL(csvUrl);  // tell browser to release URL reference
                }, 3000);
            });
        });
    };

    /**
     * Export all or latest work for this run in CSV format
     * latestWork, allWork, and events will call this function with a null exportType.
     */
    export(exportType = null) {
        if (exportType == null) {
            exportType = this.exportType;
        }

        // save event for this export request
        let context = "ClassroomMonitor", nodeId = null, componentId = null, componentType = null,
            category = "UserInteraction", event = "exportRequested", data = {"exportType": exportType};
        this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);

        /*
        if ((exportType === "latestStudentWork" || exportType === "allStudentWork" || exportType === "events") && this.exportStepSelectionType !== "exportAllSteps") {
            // get the nodes that were selected
            let selectedNodes = this.getSelectedNodesToExport();

            if (selectedNodes == null || selectedNodes.length == 0) {
                // the user did not select any steps to export
                alert('Please select a step to export.');
            }
            return;
        }

        if (exportType === "events") {
            // events are handled separately right now
            this.exportEvents();
            return;
        }
        */

        if (exportType === "allStudentWork") {
            this.exportAllStudentWork();
        } else if (exportType === "latestStudentWork") {
            this.exportLatestStudentWork();
        } else if (exportType === "events") {
            this.exportEvents();
        } else if (exportType === "latestNotebookItems" || exportType === "allNotebookItems") {
            this.exportNotebookItems(exportType);
        } else if (exportType === "notifications") {
            this.exportNotifications();
        }

        /*
        this.TeacherDataService.getExport0(exportType).then((result) => {
            if (result == null) {
                alert("Error retrieving result");
                return;
            }

            if (exportType === "studentAssets") {
                return; // no further processing necessary
            }
            let onlyExportNodes = null;  // this varioable is used later when looping through all rows
            if (this.exportStepSelectionType !== "exportAllSteps") {
                // get the nodes that were selected
                onlyExportNodes = this.getSelectedNodesToExport();
            }

            let runId = this.ConfigService.getRunId();
            let exportFilename = "";

            let csvString = "";  // resulting csv string

            if (exportType === "latestStudentWork" || exportType === "allStudentWork") {
                let COLUMN_INDEX_ID = 0;
                let COLUMN_INDEX_NODE_ID = 1;
                let COLUMN_INDEX_COMPONENT_ID = 2;
                let COLUMN_INDEX_COMPONENT_TYPE = 3;
                let COLUMN_INDEX_STEP_NUMBER = 4;
                let COLUMN_INDEX_STEP_TITLE = 5;
                let COLUMN_INDEX_COMPONENT_PART_NUMBER = 6;
                let COLUMN_INDEX_IS_AUTO_SAVE = 7;
                let COLUMN_INDEX_IS_SUBMIT = 8;
                let COLUMN_INDEX_CLIENT_SAVE_TIME = 9;
                let COLUMN_INDEX_SERVER_SAVE_TIME = 10;
                let COLUMN_INDEX_STUDENT_DATA = 11;
                let COLUMN_INDEX_PERIOD_ID = 12;
                let COLUMN_INDEX_RUN_ID = 13;
                let COLUMN_INDEX_WORKGROUP_ID = 14;
                let COLUMN_INDEX_PERIOD_NAME = 15;
                let COLUMN_INDEX_TEACHER_USERNAME = 16;
                let COLUMN_INDEX_PROJECT_ID = 17;
                let COLUMN_INDEX_WISE_IDS = 18;
                let COLUMN_INDEX_WISE_ID_1 = 18;
                let COLUMN_INDEX_WISE_ID_2 = 19;
                let COLUMN_INDEX_WISE_ID_3 = 20;
                let COLUMN_INDEX_STUDENT_RESPONSE = 21;

                if (exportType === "latestStudentWork") {
                    let hash = {};  // store latestStudentWork. Assume that key = (nodeId, componentId, workgroupId)
                    result = result.reverse().filter( (studentWorkRow) => {
                        let hashKey = studentWorkRow[COLUMN_INDEX_NODE_ID] + "_" + studentWorkRow[COLUMN_INDEX_COMPONENT_ID] + "_" + studentWorkRow[COLUMN_INDEX_WORKGROUP_ID];
                        if (!hash.hasOwnProperty(hashKey)) {
                            // remember in hash
                            hash[hashKey] = studentWorkRow;
                            return true;
                        } else {
                            // we already have the latest, so we can disregard this studentWorkRow.
                            return false;
                        }
                    }).reverse();
                    exportFilename = "latest_work_" + runId + ".csv";
                } else if (exportType === "allStudentWork") {
                    exportFilename = "all_work_" + runId + ".csv";
                }

                for (let rowIndex = 0; rowIndex < result.length; rowIndex++) {
                    let row = result[rowIndex];

                    if (rowIndex === 0) {
                        // append additional header columns
                        row[COLUMN_INDEX_WISE_ID_1] = "WISE ID 1";
                        row[COLUMN_INDEX_WISE_ID_2] = "WISE ID 2";
                        row[COLUMN_INDEX_WISE_ID_3] = "WISE ID 3";
                        row[COLUMN_INDEX_STUDENT_RESPONSE] = "Response";
                    } else {
                        // for all non-header rows, fill in step numbers, titles, and component part numbers.
                        let nodeId = row[COLUMN_INDEX_NODE_ID];
                        let componentId = row[COLUMN_INDEX_COMPONENT_ID];
                        if (this.exportStepSelectionType !== "exportAllSteps") {
                            // is user chose certain steps/components to export, see if we need to include this row or not in the export.
                            // get the nodes that were selected
                            if (nodeId != null && componentId != null) {
                                let searchString = nodeId + "-" + componentId;
                                if (onlyExportNodes != null && onlyExportNodes.length > 0) {
                                    if (onlyExportNodes.indexOf(searchString) == -1) {
                                        continue;  // user didn't select this node to export, so ignore this row and keep looping
                                    }
                                }
                            } else if (nodeId != null) {
                                // only looking for this specific node, not node+component
                                let searchString = nodeId;
                                if (onlyExportNodes != null && onlyExportNodes.length > 0) {
                                    if (onlyExportNodes.indexOf(searchString) == -1) {
                                        continue;  // user didn't select this node to export, so ignore this row and keep looping
                                    }
                                }
                            } else if (nodeId == null && componentId == null) {
                                continue;  // don't add general work to export
                            }
                        }
                        row[COLUMN_INDEX_STEP_NUMBER] = this.ProjectService.getNodePositionById(nodeId);
                        row[COLUMN_INDEX_STEP_TITLE] = this.ProjectService.getNodeTitleByNodeId(nodeId);
                        row[COLUMN_INDEX_COMPONENT_PART_NUMBER] = this.ProjectService.getComponentPositionByNodeIdAndComponentId(nodeId, componentId) + 1; // make it 1-indexed for researchers
                        let workgroupId = row[COLUMN_INDEX_WORKGROUP_ID];
                        let wiseIDs = row[COLUMN_INDEX_WISE_IDS];
                        let wiseIDsArray = wiseIDs.split(",");
                        row[COLUMN_INDEX_WISE_ID_1] = wiseIDsArray[0];
                        row[COLUMN_INDEX_WISE_ID_2] = wiseIDsArray[1] || "";
                        row[COLUMN_INDEX_WISE_ID_3] = wiseIDsArray[2] || "";

                        // get the student data JSON and extract responses into its own column
                        let studentDataJSONCell = row[COLUMN_INDEX_STUDENT_DATA];
                        row[COLUMN_INDEX_STUDENT_RESPONSE] = studentDataJSONCell.response || "";
                    }

                    var projectName = this.ProjectService.getProjectTitle();

                    // append row to csvString
                    for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
                        let cell = row[cellIndex];
                        if (typeof cell === "object") {
                            cell = "\"" + JSON.stringify(cell).replace(/"/g, '""') + "\"";
                        } else if (typeof cell === "string") {
                            cell = "\"" + cell + "\"";
                        }
                        csvString += cell + ",";
                    }
                    csvString += "\r\n";
                }

            } else if (exportType === "latestNotebookItems" || exportType === "allNotebookItems") {
                exportFilename = "notebook_" + runId + ".csv";

                let COLUMN_INDEX_LOCAL_NOTEBOOK_ITEM_ID = 1;
                let COLUMN_INDEX_NODE_ID = 2;
                let COLUMN_INDEX_COMPONENT_ID = 3;
                let COLUMN_INDEX_STEP_NUMBER = 4;
                let COLUMN_INDEX_STEP_TITLE = 5;
                let COLUMN_INDEX_COMPONENT_PART_NUMBER = 6;
                let COLUMN_INDEX_TYPE = 9;
                let COLUMN_INDEX_STUDENT_DATA = 10;
                let COLUMN_INDEX_WORKGROUP_ID = 13;
                let COLUMN_INDEX_WISE_IDS = 17;
                let COLUMN_INDEX_WISE_ID_1 = 17;
                let COLUMN_INDEX_WISE_ID_2 = 18;
                let COLUMN_INDEX_WISE_ID_3 = 19;
                let COLUMN_INDEX_STUDENT_RESPONSE = 20;

                if (exportType === "latestNotebookItems") {
                    let hash = {};  // store latestStudentWork. Assume that key = (localNotebookItemId)
                    result = result.reverse().filter( (studentWorkRow) => {
                        let hashKey = studentWorkRow[COLUMN_INDEX_LOCAL_NOTEBOOK_ITEM_ID] + "_" + studentWorkRow[COLUMN_INDEX_WORKGROUP_ID];
                        if (!hash.hasOwnProperty(hashKey)) {
                            // remember in hash
                            hash[hashKey] = studentWorkRow;
                            return true;
                        } else {
                            // we already have the latest, so we can disregard this studentWorkRow.
                            return false;
                        }
                    }).reverse();
                    exportFilename = "latest_notebook_items_" + runId + ".csv";
                } else if (exportType === "allNotebookItems") {
                    exportFilename = "all_notebook_items_" + runId + ".csv";
                }

                for (let rowIndex = 0; rowIndex < result.length; rowIndex++) {
                    let row = result[rowIndex];

                    if (rowIndex === 0) {
                        // append additional header columns
                        row[COLUMN_INDEX_WISE_ID_1] = "WISE ID 1";
                        row[COLUMN_INDEX_WISE_ID_2] = "WISE ID 2";
                        row[COLUMN_INDEX_WISE_ID_3] = "WISE ID 3";
                        row[COLUMN_INDEX_STUDENT_RESPONSE] = "response";
                    } else {
                        // for all non-header rows, fill in step numbers, titles, and component part numbers.
                        let nodeId = row[COLUMN_INDEX_NODE_ID];
                        let componentId = row[COLUMN_INDEX_COMPONENT_ID];
                        row[COLUMN_INDEX_STEP_NUMBER] = this.ProjectService.getNodePositionById(nodeId);
                        row[COLUMN_INDEX_STEP_TITLE] = this.ProjectService.getNodeTitleByNodeId(nodeId);
                        row[COLUMN_INDEX_COMPONENT_PART_NUMBER] = this.ProjectService.getComponentPositionByNodeIdAndComponentId(nodeId, componentId) + 1; // make it 1-indexed for researchers
                        let wiseIDs = row[COLUMN_INDEX_WISE_IDS];
                        let wiseIDsArray = wiseIDs.split(",");
                        row[COLUMN_INDEX_WISE_ID_1] = wiseIDsArray[0];
                        row[COLUMN_INDEX_WISE_ID_2] = wiseIDsArray[1] || "";
                        row[COLUMN_INDEX_WISE_ID_3] = wiseIDsArray[2] || "";

                        // get the student data JSON and extract responses into its own column
                        let studentDataJSONCell = row[COLUMN_INDEX_STUDENT_DATA];
                        if (row[COLUMN_INDEX_TYPE] === "report") {
                            if (studentDataJSONCell.content != null) {
                                row[COLUMN_INDEX_STUDENT_RESPONSE] = this.escapeContent(studentDataJSONCell.content);
                            } else {
                                row[COLUMN_INDEX_STUDENT_RESPONSE] = "";
                            }
                        } else if (row[COLUMN_INDEX_TYPE] === "note") {
                            if (studentDataJSONCell.text != null) {
                                row[COLUMN_INDEX_STUDENT_RESPONSE] = this.escapeContent(studentDataJSONCell.text);
                            } else {
                                row[COLUMN_INDEX_STUDENT_RESPONSE] = "";
                            }
                        }
                    }

                    // append row to csvString
                    for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
                        let cell = row[cellIndex];
                        if (typeof cell === "object") {
                            cell = "\"" + JSON.stringify(cell).replace(/"/g, '""') + "\"";
                        } else if (typeof cell === "string") {
                            cell = "\"" + cell + "\"";
                        }
                        csvString += cell + ",";
                    }
                    csvString += "\r\n";
                }
            } else if (exportType === "notifications") {
                exportFilename = "notifications_" + runId + ".csv";

                let COLUMN_INDEX_NODE_ID = 1;
                let COLUMN_INDEX_COMPONENT_ID = 2;
                let COLUMN_INDEX_STEP_NUMBER = 4;
                let COLUMN_INDEX_STEP_TITLE = 5;
                let COLUMN_INDEX_COMPONENT_PART_NUMBER = 6;
                let COLUMN_INDEX_TYPE = 10;
                let COLUMN_INDEX_WISE_IDS = 21;
                let COLUMN_INDEX_WISE_ID_1 = 21;
                let COLUMN_INDEX_WISE_ID_2 = 22;
                let COLUMN_INDEX_WISE_ID_3 = 23;

                for (let rowIndex = 0; rowIndex < result.length; rowIndex++) {
                    let row = result[rowIndex];

                    if (rowIndex === 0) {
                        // append additional header columns
                        row[COLUMN_INDEX_WISE_ID_1] = "WISE ID 1";
                        row[COLUMN_INDEX_WISE_ID_2] = "WISE ID 2";
                        row[COLUMN_INDEX_WISE_ID_3] = "WISE ID 3";
                    } else {
                        // for all non-header rows, fill in step numbers, titles, and component part numbers.
                        let nodeId = row[COLUMN_INDEX_NODE_ID];
                        let componentId = row[COLUMN_INDEX_COMPONENT_ID];
                        row[COLUMN_INDEX_STEP_NUMBER] = this.ProjectService.getNodePositionById(nodeId);
                        row[COLUMN_INDEX_STEP_TITLE] = this.ProjectService.getNodeTitleByNodeId(nodeId);
                        row[COLUMN_INDEX_COMPONENT_PART_NUMBER] = this.ProjectService.getComponentPositionByNodeIdAndComponentId(nodeId, componentId) + 1; // make it 1-indexed for researchers
                        let wiseIDs = row[COLUMN_INDEX_WISE_IDS];
                        let wiseIDsArray = wiseIDs.split(",");
                        row[COLUMN_INDEX_WISE_ID_1] = wiseIDsArray[0];
                        row[COLUMN_INDEX_WISE_ID_2] = wiseIDsArray[1] || "";
                        row[COLUMN_INDEX_WISE_ID_3] = wiseIDsArray[2] || "";
                    }

                    // append row to csvString
                    for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
                        let cell = row[cellIndex];
                        if (typeof cell === "object") {
                            cell = "\"" + JSON.stringify(cell).replace(/"/g, '""') + "\"";
                        } else if (typeof cell === "string") {
                            cell = "\"" + cell + "\"";
                        }
                        csvString += cell + ",";
                    }
                    csvString += "\r\n";
                }
            }

            let csvBlob = new Blob([csvString], {type: 'text/csv'});
            let csvUrl = URL.createObjectURL(csvBlob);
            let a = document.createElement("a");
            document.body.appendChild(a);
            a.href = csvUrl;
            a.download = exportFilename;
            a.click();

            // timeout is required for FF.
            window.setTimeout(() => {
                URL.revokeObjectURL(csvUrl);  // tell browser to release URL reference
            }, 3000);
        });
        */
    }

    /**
     * Export all the student work
     */
    exportAllStudentWork() {
        this.exportStudentWork("allStudentWork");
    }

    /**
     * Export the latest student work
     */
    exportLatestStudentWork() {
        this.exportStudentWork("latestStudentWork");
    }

    /**
     * Export all the student work
     * @param exportType the export type e.g. "allStudentWork" or "latestStudentWork"
     */
    exportStudentWork(exportType) {

        var selectedNodes = null;

        if (this.exportStepSelectionType === "exportSelectSteps") {
            // we are going to export the work for the steps that were selected

            // get the steps that were selected
            selectedNodes = this.getSelectedNodesToExport();

            if (selectedNodes == null || selectedNodes.length == 0) {
                /*
                 * the user did not select any steps to export so we will not
                 * generate the export
                 */
                alert('Please select a step to export.');
                return;
            }
        }

        // request the student data from the server and then generate the export
        this.TeacherDataService.getExport("allStudentWork").then((result) => {

            // get the workgroups in the class
            var workgroups = this.ConfigService.getClassmateUserInfosSortedByWorkgroupId();

            // get the run id
            var runId = this.ConfigService.getRunId();

            // the rows that will show up in the export
            var rows = [];

            // the counter for the rows
            var rowCounter = 1;

            // mapping from column name to column number
            var columnNameToNumber = {};

            // an array of column names
            var columnNames = [
                "#",
                "Workgroup ID",
                "WISE ID 1",
                "WISE ID 2",
                "WISE ID 3",
                "Class Period",
                "Project ID",
                "Project Name",
                "Run ID",
                "Start Date",
                "End Date",
                "Student Work ID",
                "Server Timestamp",
                "Client Timestamp",
                "Node ID",
                "Component ID",
                "Component Part Number",
                "Teacher Score Server Timestamp",
                "Teacher Score Client Timestamp",
                "Teacher Score",
                "Max Teacher Score",
                "Teacher Comment Server Timestamp",
                "Teacher Comment Client Timestamp",
                "Teacher Comment",
                "Auto Score Server Timestamp",
                "Auto Score Client Timestamp",
                "Auto Score",
                "Max Auto Score",
                "Auto Comment Server Timestamp",
                "Auto Comment Client Timestamp",
                "Auto Comment",
                "Step Title",
                "Component Type",
                "Component Prompt",
                "Student Data",
                "Component Revision Counter",
                "Is Correct",
                "Is Submit",
                "Submit Count",
                "Response"
            ];

            var headerRow = [];

            // generate the header row by looping through all the column names
            for (var c = 0; c < columnNames.length; c++) {

                // get a column name
                var columnName = columnNames[c];

                if (columnName != null) {
                    // add a mapping from column name to column number
                    columnNameToNumber[columnName] = c;
                }

                // add the column name to the header row
                headerRow.push(columnName);
            }

            // add the header row to the rows
            rows.push(headerRow);

            if (workgroups != null) {

                // loop through all the workgroup
                for (var w = 0; w < workgroups.length; w++) {

                    // get a workgroup
                    var workgroup = workgroups[w];

                    if (workgroup != null) {

                        // get the workgroup information
                        var workgroupId = workgroup.workgroupId;
                        var periodName = workgroup.periodName;
                        var userInfo = this.ConfigService.getUserInfoByWorkgroupId(workgroupId);

                        // get the WISE IDs
                        var wiseIds = this.ConfigService.getWISEIds(workgroupId);
                        var wiseId1 = wiseIds[0];
                        var wiseId2 = wiseIds[1];
                        var wiseId3 = wiseIds[2];

                        /*
                         * a mapping from component to component revision counter.
                         * the key will be {{nodeId}}_{{componentId}} and the
                         * value will be a number.
                         */
                        var componentRevisionCounter = {};

                        // get the component states for the workgroup
                        var componentStates = [];

                        if (exportType === "allStudentWork") {
                            componentStates = this.TeacherDataService.getComponentStatesByWorkgroupId(workgroupId);
                        } else if (exportType === "latestStudentWork") {
                            componentStates = this.TeacherDataService.getLatestComponentStatesByWorkgroupId(workgroupId);
                        }

                        if (componentStates != null) {

                            // loop through all the component states
                            for (var c = 0; c < componentStates.length; c++) {

                                // get a component state
                                var componentState = componentStates[c];

                                if (componentState != null) {

                                    var exportRow = true;

                                    if (this.exportStepSelectionType === "exportSelectSteps") {
                                        // we are only exporting selected steps
                                        if (!this.isComponentSelected(selectedNodes, componentState.nodeId, componentState.componentId)) {
                                            // the component state is for a step that is not selected
                                            exportRow = false;
                                        }
                                    }

                                    if (exportRow) {

                                        // create the export row
                                        var row = this.createStudentWorkExportRow(columnNames, columnNameToNumber, rowCounter, workgroupId, wiseId1, wiseId2, wiseId3, periodName, componentRevisionCounter, componentState);

                                        // add the row to the rows
                                        rows.push(row);

                                        // increment the row counter
                                        rowCounter++;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            var fileName = "";

            // make the file name
            if (exportType === "allStudentWork") {
                fileName = "all_work_" + runId + ".csv";
            } else if (exportType === "latestStudentWork") {
                fileName = "latest_work_" + runId + ".csv";
            }

            // generate the csv file and have the client download it
            this.generateCSVFile(rows, fileName);
        });
    }

    /**
     * Create the array that will be used as a row in the student work export
     * @param columnNames all the header column name
     * @param columnNameToNumber the mapping from column name to column number
     * @param rowCounter the current row number
     * @param workgroupId the workgroup id
     * @param wiseId1 the WISE ID 1
     * @param wiseId2 the WISE ID 2
     * @param wiseId3 the WISE ID 3
     * @param periodName the period name
     * @param componentRevisionCounter the mapping of component to revision counter
     * @param componentState the component state
     * @return an array containing the cells in the row
     */
    createStudentWorkExportRow(columnNames, columnNameToNumber, rowCounter, workgroupId, wiseId1, wiseId2, wiseId3, periodName, componentRevisionCounter, componentState) {

        // create the row and prepopulate the elements with an empty string
        var row = new Array(columnNames.length);
        row.fill("");

        // set the row number
        row[columnNameToNumber["#"]] = rowCounter;

        // set workgroup id
        row[columnNameToNumber["Workgroup ID"]] = workgroupId;

        if (wiseId1 != null) {
            // set the WISE ID 1
            row[columnNameToNumber["WISE ID 1"]] = wiseId1;
        }

        if (wiseId2 != null) {
            // set the WISE ID 2
            row[columnNameToNumber["WISE ID 2"]] = wiseId2;
        }

        if (wiseId3 != null) {
            // set the WISE ID 3
            row[columnNameToNumber["WISE ID 3"]] = wiseId3;
        }

        row[columnNameToNumber["Class Period"]] = periodName;

        // set the project id
        row[columnNameToNumber["Project ID"]] = this.ConfigService.getProjectId();

        // set the project name
        row[columnNameToNumber["Project Name"]] = this.ProjectService.getProjectTitle();

        // set the run id
        row[columnNameToNumber["Run ID"]] = this.ConfigService.getRunId();

        // set the student work id
        row[columnNameToNumber["Student Work ID"]] = componentState.id;

        if (componentState.serverSaveTime != null) {
            // get the server save time
            var serverSaveTime = new Date(componentState.serverSaveTime);

            if (serverSaveTime != null) {
                // get the time stamp string e.g. Wed Apr 06 2016 9:05:38 AM
                var serverSaveTimeString = serverSaveTime.toDateString() + " " + serverSaveTime.toLocaleTimeString();
                row[columnNameToNumber["Server Timestamp"]] = serverSaveTimeString;
            }
        }

        if (componentState.clientSaveTime != null) {
            // get the client save time
            var clientSaveTime = new Date(componentState.clientSaveTime);

            if (clientSaveTime != null) {
                // get the time stamp string e.g. Wed Apr 06 2016 9:05:38 AM
                var clientSaveTimeString = clientSaveTime.toDateString() + " " + clientSaveTime.toLocaleTimeString();
                row[columnNameToNumber["Client Timestamp"]] = clientSaveTimeString;
            }
        }

        // set the node id
        row[columnNameToNumber["Node ID"]] = componentState.nodeId;

        // set the component id
        row[columnNameToNumber["Component ID"]] = componentState.componentId;

        // set the step title
        row[columnNameToNumber["Step Title"]] = this.ProjectService.getNodePositionAndTitleByNodeId(componentState.nodeId);

        // get the component part number
        var componentPartNumber = this.ProjectService.getComponentPositionByNodeIdAndComponentId(componentState.nodeId, componentState.componentId) + 1;

        // set the component part number
        row[columnNameToNumber["Component Part Number"]] = componentPartNumber;

        // get the component
        var component = this.ProjectService.getComponentByNodeIdAndComponentId(componentState.nodeId, componentState.componentId);

        if (component != null) {
            // set the component type
            row[columnNameToNumber["Component Type"]] = component.type;

            if (component.prompt != null) {
                // get the prompt with the html tags removed
                var prompt = this.UtilService.removeHTMLTags(component.prompt);

                // replace " with ""
                prompt = prompt.replace(/"/g, '""');

                // set the prompt with the html tags removed
                row[columnNameToNumber["Component Prompt"]] = prompt;
            }
        }

        // get the annotations
        var teacherScoreAnnotation = this.AnnotationService.getLatestTeacherScoreAnnotationByStudentWorkId(componentState.id);
        var teacherCommentAnnotation = this.AnnotationService.getLatestTeacherCommentAnnotationByStudentWorkId(componentState.id);
        var autoScoreAnnotation = this.AnnotationService.getLatestAutoScoreAnnotationByStudentWorkId(componentState.id);
        var autoCommentAnnotation = this.AnnotationService.getLatestAutoCommentAnnotationByStudentWorkId(componentState.id);

        if (teacherScoreAnnotation != null) {
            // handle the teacher score

            if (teacherScoreAnnotation.serverSaveTime != null) {
                var teacherScoreServerSaveTime = new Date(teacherScoreAnnotation.serverSaveTime);

                if (teacherScoreServerSaveTime != null) {
                    // get the teacher score server timestamp e.g. Wed Apr 06 2016 9:05:38 AM
                    var teacherScoreServerSaveTimeString = teacherScoreServerSaveTime.toDateString() + " " + teacherScoreServerSaveTime.toLocaleTimeString();
                    row[columnNameToNumber["Teacher Score Server Timestamp"]] = teacherScoreServerSaveTimeString;
                }
            }

            if (teacherScoreAnnotation.clientSaveTime != null) {
                var teacherScoreClientSaveTime = new Date(teacherScoreAnnotation.clientSaveTime);

                if (teacherScoreClientSaveTime != null) {
                    // get the teacher score client timestamp e.g. Wed Apr 06 2016 9:05:38 AM
                    var teacherScoreClientSaveTimeString = teacherScoreClientSaveTime.toDateString() + " " + teacherScoreClientSaveTime.toLocaleTimeString();
                    row[columnNameToNumber["Teacher Score Client Timestamp"]] = teacherScoreClientSaveTimeString;
                }
            }

            var data = teacherScoreAnnotation.data;

            if (data != null) {
                // get the teacher score
                var score = data.value;

                if (score != null) {
                    // set the teacher score
                    row[columnNameToNumber["Teacher Score"]] = score;
                }

                // get the max score if available
                var maxScore = this.ProjectService.getMaxScoreForComponent(componentState.nodeId, componentState.componentId);

                if (maxScore != null) {
                    // set the max score
                    row[columnNameToNumber["Max Teacher Score"]] = maxScore;
                }
            }
        }

        if (teacherCommentAnnotation != null) {
            // handle the teacher comment

            if (teacherCommentAnnotation.serverSaveTime != null) {
                var teacherCommentServerSaveTime = new Date(teacherCommentAnnotation.serverSaveTime);

                if (teacherCommentServerSaveTime != null) {
                    // get the teacher comment server timestamp e.g. Wed Apr 06 2016 9:05:38 AM
                    var teacherCommentServerSaveTimeString = teacherCommentServerSaveTime.toDateString() + " " + teacherCommentServerSaveTime.toLocaleTimeString();
                    row[columnNameToNumber["Teacher Comment Server Timestamp"]] = teacherCommentServerSaveTimeString;
                }
            }

            if (teacherCommentAnnotation.clientSaveTime != null) {
                var teacherCommentClientSaveTime = new Date(teacherCommentAnnotation.clientSaveTime);

                if (teacherCommentClientSaveTime != null) {
                    // get the teacher comment client timestamp e.g. Wed Apr 06 2016 9:05:38 AM
                    var teacherCommentClientSaveTimeString = teacherCommentClientSaveTime.toDateString() + " " + teacherCommentClientSaveTime.toLocaleTimeString();
                    row[columnNameToNumber["Teacher Comment Client Timestamp"]] = teacherCommentClientSaveTimeString;
                }
            }

            var data = teacherCommentAnnotation.data;

            if (data != null) {
                // get the teacher comment
                var comment = data.value;

                if (comment != null) {
                    // set the teacher comment
                    row[columnNameToNumber["Teacher Comment"]] = comment;
                }
            }
        }

        if (autoScoreAnnotation != null) {
            // handle the auto score

            if (autoScoreAnnotation.serverSaveTime != null) {
                var autoScoreServerSaveTime = new Date(autoScoreAnnotation.serverSaveTime);

                if (autoScoreServerSaveTime != null) {
                    // get the auto score server timestamp e.g. Wed Apr 06 2016 9:05:38 AM
                    var autoScoreServerSaveTimeString = autoScoreServerSaveTime.toDateString() + " " + autoScoreServerSaveTime.toLocaleTimeString();
                    row[columnNameToNumber["Auto Score Server Timestamp"]] = autoScoreServerSaveTimeString;
                }
            }

            if (autoScoreAnnotation.clientSaveTime != null) {
                var autoScoreClientSaveTime = new Date(autoScoreAnnotation.clientSaveTime);

                if (autoScoreClientSaveTime != null) {
                    // get the auto score client timestamp e.g. Wed Apr 06 2016 9:05:38 AM
                    var autoScoreClientSaveTimeString = autoScoreClientSaveTime.toDateString() + " " + autoScoreClientSaveTime.toLocaleTimeString();
                    row[columnNameToNumber["Auto Score Client Timestamp"]] = autoScoreClientSaveTimeString;
                }
            }

            var data = autoScoreAnnotation.data;

            if (data != null) {
                // get the auto score
                var autoScore = data.value;

                if (autoScore != null) {
                    // set the auto score
                    row[columnNameToNumber["Auto Score"]] = autoScore;
                }

                // get the max auto score
                var maxAutoScore = data.maxAutoScore;

                if (maxAutoScore != null) {
                    // set the max auto score
                    row[columnNameToNumber["Max Auto Score"]] = maxAutoScore;
                }
            }
        }

        if (autoCommentAnnotation != null) {
            // handle the auto comment

            if (autoCommentAnnotation.serverSaveTime != null) {
                var autoCommentServerSaveTime = new Date(autoCommentAnnotation.serverSaveTime);

                if (autoCommentServerSaveTime != null) {
                    // get the auto comment server timestamp e.g. Wed Apr 06 2016 9:05:38 AM
                    var autoCommentServerSaveTimeString = autoCommentServerSaveTime.toDateString() + " " + autoCommentServerSaveTime.toLocaleTimeString();
                    row[columnNameToNumber["Auto Comment Server Timestamp"]] = autoCommentServerSaveTimeString;
                }
            }

            if (autoCommentAnnotation.clientSaveTime != null) {
                var autoCommentClientSaveTime = new Date(autoCommentAnnotation.clientSaveTime);

                if (autoCommentClientSaveTime != null) {
                    // get the auto comment timestamp e.g. Wed Apr 06 2016 9:05:38 AM
                    var autoCommentClientSaveTimeString = autoCommentClientSaveTime.toDateString() + " " + autoCommentClientSaveTime.toLocaleTimeString();
                    row[columnNameToNumber["Auto Comment Client Timestamp"]] = autoCommentClientSaveTimeString;
                }
            }

            var data = autoCommentAnnotation.data;

            if (data != null) {
                // get the auto comment
                var autoComment = data.value;

                if (autoComment != null) {
                    // set the auto comment
                    row[columnNameToNumber["Auto Comment"]] = this.UtilService.removeHTMLTags(autoComment);
                }
            }
        }

        var studentData = componentState.studentData;

        if (studentData != null) {
            // set the student data JSON
            row[columnNameToNumber["Student Data"]] = studentData;

            var isCorrect = studentData.isCorrect;

            if (isCorrect != null) {
                // set the is correct value
                if (isCorrect) {
                    row[columnNameToNumber["Is Correct"]] = 1;
                } else {
                    row[columnNameToNumber["Is Correct"]] = 0;
                }
            }
        }

        // get the component type
        var componentType = componentState.componentType;

        if (componentType != null) {
            // get the component type service
            var componentService = this.$injector.get(componentType + 'Service');

            if (componentService != null && componentService.getStudentDataString != null) {

                // get the student data string from the component state
                var studentDataString = componentService.getStudentDataString(componentState);

                if (studentDataString != null) {
                    // set the response
                    row[columnNameToNumber["Response"]] = studentDataString;
                }
            }
        }

        // create the {{nodeId}}_{{componentId}} key to look up the component revision counter
        var nodeIdAndComponentId = componentState.nodeId + "_" + componentState.componentId;

        if (componentRevisionCounter[nodeIdAndComponentId] == null) {
            // initialize the component revision counter for this component to 1 if there is no entry
            componentRevisionCounter[nodeIdAndComponentId] = 1;
        }

        // get the revision counter
        var revisionCounter = componentRevisionCounter[nodeIdAndComponentId];

        if (componentState.revisionCounter == null) {
            /*
             * use the revision counter obtained from the componentRevisionCounter
             * mapping. this case will happen when we are exporting all student
             * work.
             */
            row[columnNameToNumber["Component Revision Counter"]] = revisionCounter;
        } else {
            /*
             * use the revision counter from the value in the component state.
             * this case will happen when we are exporting latest student work
             * because the revision counter needs to be previously calculated
             * and then set into the component state
             */
            row[columnNameToNumber["Component Revision Counter"]] = componentState.revisionCounter;
        }

        // increment the revision counter
        componentRevisionCounter[nodeIdAndComponentId] = revisionCounter + 1;

        var isSubmit = componentState.isSubmit;

        if (isSubmit) {
            // set the is submit value
            row[columnNameToNumber["Is Submit"]] = 1;

            if (studentData != null) {
                var submitCounter = studentData.submitCounter;

                if (submitCounter != null) {
                    // set the submit counter
                    row[columnNameToNumber["Submit Count"]] = submitCounter;
                }
            }
        } else {
            // set the is submit value
            row[columnNameToNumber["Is Submit"]] = 0;
        }

        return row;
    }

    /**
     * Check if a component is selected
     * @param selectedNodes an array of node id and component id strings
     * e.g.
     * ["node1-38fj20egrj", "node2-c4e5dft0u1"]
     * @param nodeId the node id to check
     * @param componentId the component id to check
     * @return whether the component is selected
     */
    isComponentSelected(selectedNodes, nodeId, componentId) {
        var result = false;

        if (selectedNodes != null && nodeId != null && componentId != null) {

            // create the node id and component id string
            var nodeIdAndComponentId = nodeId + "-" + componentId;

            // check if the component is selected
            if (selectedNodes.indexOf(nodeIdAndComponentId) == -1) {
                // the component is not selected
                result = false;
            } else {
                // the component is selected
                result = true;
            }
        }

        return result;
    }

    /**
     * Check if a node is selected
     * @param selectedNodes an array of node ids
     * e.g.
     * ["node1", "node2"]
     * @param nodeId the node id to check
     * @return whether the node is selected
     */
    isNodeSelected(selectedNodes, nodeId) {
        var result = false;

        if (selectedNodes != null && nodeId != null) {

            // check if the node is selected
            if (selectedNodes.indexOf(nodeId) == -1) {
                // the node is not selected
                result = false;
            } else {
                // the node is selected
                result = true;
            }
        }

        return result;
    }

    /**
     * Generate the csv file and have the client download it
     * @param rows a 2D array that represents the rows in the export
     * each row contains an array. the inner array contains strings or
     * numbers which represent the cell values in the export.
     * @param fileName the name of the file that will be generated
     */
    generateCSVFile(rows, fileName) {

        // used to accumulate the csv string
        var csvString = "";

        if (rows != null) {

            // loop through all the rows
            for (var r = 0; r < rows.length; r++) {
                var row = rows[r];

                if (row != null) {

                    // loop through all the cells
                    for (var c = 0; c < row.length; c++) {

                        // get the cell value
                        var cell = row[c];

                        if (typeof cell === "object") {
                            /*
                             * the cell value is an object so we will obtain the
                             * string representation of the object and wrap it
                             * in quotes
                             */

                            // convert the
                            cell = JSON.stringify(cell);

                            // replace " with ""
                            cell = cell.replace(/"/g, '""');

                            if (cell != null && cell.length >= 32767) {
                                /*
                                 * the cell value is larger than the allowable
                                 * excel cell size so we will display the string
                                 * "Data Too Large" instead
                                 */
                                cell = "Data Too Large";
                            }

                            // wrap the cell in quotes
                            cell = '"' + cell + '"';
                        } else if (typeof cell === "string") {
                            // the cell value is a string

                            if (cell != null && cell.length >= 32767) {
                                /*
                                 * the cell value is larger than the allowable
                                 * excel cell size so we will display the string
                                 * "Data Too Large" instead
                                 */
                                cell = "Data Too Large";
                            }

                            // wrap the cell in quotes
                            cell = '"' + cell + '"';
                        }

                        // separate cells with a comma
                        csvString += cell + ",";
                    }

                    // separate lines
                    csvString += "\r\n";
                }
            }
        }

        // generate the blob that will be written to the file
        let csvBlob = new Blob([csvString], {type: 'text/csv'});

        // create a url to the blob object
        let csvUrl = URL.createObjectURL(csvBlob);

        // create an <a> element
        let a = document.createElement("a");

        // add the <a> element to the body
        document.body.appendChild(a);

        // set the url of the <a> element
        a.href = csvUrl;

        // set the file name
        a.download = fileName;

        // click the <a> element to download the file
        a.click();

        // timeout is required for FF.
        window.setTimeout(() => {
            URL.revokeObjectURL(csvUrl);  // tell browser to release URL reference
        }, 3000);
    }

    escapeContent(str) {
        return str
            .replace(/[\n]/g, '\\n')
            .replace(/[\r]/g, '\\r')
            .replace(/[\t]/g, '\\t');
    }

    /**
     * Export the events
     */
    exportEvents(exportType) {

        var selectedNodes = null;

        if (this.exportStepSelectionType === "exportSelectSteps") {
            // we are going to export the work for the steps that were selected

            // get the steps that were selected
            selectedNodes = this.getSelectedNodesToExport();

            if (selectedNodes == null || selectedNodes.length == 0) {
                /*
                 * the user did not select any steps to export so we will not
                 * generate the export
                 */
                alert('Please select a step to export.');
                return;
            }
        }

        // request the student data from the server and then generate the export
        this.TeacherDataService.getExport("events").then((result) => {

            // get the workgroups in the class
            var workgroups = this.ConfigService.getClassmateUserInfosSortedByWorkgroupId();

            // get the run id
            var runId = this.ConfigService.getRunId();

            // the rows that will show up in the export
            var rows = [];

            // the counter for the rows
            var rowCounter = 1;

            // mapping from column name to column number
            var columnNameToNumber = {};

            // an array of column names
            var columnNames = [
                "#",
                "Workgroup ID",
                "WISE ID 1",
                "WISE ID 2",
                "WISE ID 3",
                "Class Period",
                "Project ID",
                "Project Name",
                "Run ID",
                "Start Date",
                "End Date",
                "Event ID",
                "Server Timestamp",
                "Client Timestamp",
                "Node ID",
                "Component ID",
                "Component Part Number",
                "Step Title",
                "Component Type",
                "Component Prompt",
                "Group Event Counter",
                "Context",
                "Category",
                "Event",
                "Event Data"
            ];

            var headerRow = [];

            // generate the header row by looping through all the column names
            for (var c = 0; c < columnNames.length; c++) {

                // get a column name
                var columnName = columnNames[c];

                if (columnName != null) {
                    // add a mapping from column name to column number
                    columnNameToNumber[columnName] = c;
                }

                // add the column name to the header row
                headerRow.push(columnName);
            }

            // add the header row to the rows
            rows.push(headerRow);

            if (workgroups != null) {

                // loop through all the workgroup
                for (var w = 0; w < workgroups.length; w++) {

                    // get a workgroup
                    var workgroup = workgroups[w];

                    if (workgroup != null) {

                        // get the workgroup information
                        var workgroupId = workgroup.workgroupId;
                        var periodName = workgroup.periodName;
                        var userInfo = this.ConfigService.getUserInfoByWorkgroupId(workgroupId);

                        // get the WISE IDs
                        var wiseIds = this.ConfigService.getWISEIds(workgroupId);
                        var wiseId1 = wiseIds[0];
                        var wiseId2 = wiseIds[1];
                        var wiseId3 = wiseIds[2];

                        /*
                         * a mapping from component to component event count.
                         * the key will be {{nodeId}}_{{componentId}} and the
                         * value will be a number.
                         */
                        var componentEventCount = {};

                        // get the events for the workgroup
                        var events = [];

                        events = this.TeacherDataService.getEventsByWorkgroupId(workgroupId);

                        if (events != null) {

                            // loop through all the events
                            for (var e = 0; e < events.length; e++) {

                                // get an event
                                var event = events[e];

                                if (event != null) {

                                    var exportRow = true;

                                    if (this.exportStepSelectionType === "exportSelectSteps") {
                                        // we are only exporting selected steps

                                        if (event.nodeId != null && event.componentId != null) {
                                            // this is a component event

                                            if (!this.isComponentSelected(selectedNodes, event.nodeId, event.componentId)) {
                                                // the event is for a component that is not selected
                                                exportRow = false;
                                            }
                                        } else if (event.nodeId != null) {
                                            // this is a node event

                                            if (!this.isNodeSelected(selectedNodes, event.nodeId)) {
                                                // the event is for a node that is not selected
                                                exportRow = false;
                                            }
                                        } else {
                                            // this is a global event
                                            exportRow = false;
                                        }
                                    }

                                    if (exportRow) {

                                        // create the export row
                                        var row = this.createEventExportRow(columnNames, columnNameToNumber, rowCounter, workgroupId, wiseId1, wiseId2, wiseId3, periodName, componentEventCount, event);

                                        // add the row to the rows
                                        rows.push(row);

                                        // increment the row counter
                                        rowCounter++;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            var fileName = "events_" + runId;

            // generate the csv file and have the client download it
            this.generateCSVFile(rows, fileName);
        });
    }

    /**
     * Create the array that will be used as a row in the events export
     * @param columnNames all the header column name
     * @param columnNameToNumber the mapping from column name to column number
     * @param rowCounter the current row number
     * @param workgroupId the workgroup id
     * @param wiseId1 the WISE ID 1
     * @param wiseId2 the WISE ID 2
     * @param wiseId3 the WISE ID 3
     * @param periodName the period name
     * @param componentEventCount the mapping of component to event count
     * @param event the event
     * @return an array containing the cells in the row
     */
    createEventExportRow(columnNames, columnNameToNumber, rowCounter, workgroupId, wiseId1, wiseId2, wiseId3, periodName, componentEventCount, event) {

        // create the row and prepopulate the elements with an empty string
        var row = new Array(columnNames.length);
        row.fill("");

        // set the row number
        row[columnNameToNumber["#"]] = rowCounter;

        // set workgroup id
        row[columnNameToNumber["Workgroup ID"]] = workgroupId;

        if (wiseId1 != null) {
            // set the WISE ID 1
            row[columnNameToNumber["WISE ID 1"]] = wiseId1;
        }

        if (wiseId2 != null) {
            // set the WISE ID 2
            row[columnNameToNumber["WISE ID 2"]] = wiseId2;
        }

        if (wiseId3 != null) {
            // set the WISE ID 3
            row[columnNameToNumber["WISE ID 3"]] = wiseId3;
        }

        row[columnNameToNumber["Class Period"]] = periodName;

        // set the project id
        row[columnNameToNumber["Project ID"]] = this.ConfigService.getProjectId();

        // set the project name
        row[columnNameToNumber["Project Name"]] = this.ProjectService.getProjectTitle();

        // set the run id
        row[columnNameToNumber["Run ID"]] = this.ConfigService.getRunId();

        // set the student work id
        row[columnNameToNumber["Event ID"]] = event.id;

        if (event.serverSaveTime != null) {
            // get the server save time
            var serverSaveTime = new Date(event.serverSaveTime);

            if (serverSaveTime != null) {
                var serverSaveTimeString = serverSaveTime.toDateString() + " " + serverSaveTime.toLocaleTimeString();

                // set the timestamp
                row[columnNameToNumber["Server Timestamp"]] = serverSaveTimeString;
            }
        }

        if (event.clientSaveTime != null) {
            // get the client save time
            var clientSaveTime = new Date(event.clientSaveTime);

            if (clientSaveTime != null) {
                var clientSaveTimeString = clientSaveTime.toDateString() + " " + clientSaveTime.toLocaleTimeString();

                row[columnNameToNumber["Client Timestamp"]] = clientSaveTimeString;
            }
        }

        if (event.nodeId != null) {
            // set the node id
            row[columnNameToNumber["Node ID"]] = event.nodeId;
        }

        if (event.componentId != null) {
            // set the component id
            row[columnNameToNumber["Component ID"]] = event.componentId;
        }

        var stepTitle = this.ProjectService.getNodePositionAndTitleByNodeId(event.nodeId);

        if (stepTitle != null) {
            // set the step title
            row[columnNameToNumber["Step Title"]] = stepTitle;
        }

        // get the component part number
        var componentPartNumber = this.ProjectService.getComponentPositionByNodeIdAndComponentId(event.nodeId, event.componentId);

        if (componentPartNumber != -1) {
            // set the component part number
            row[columnNameToNumber["Component Part Number"]] = componentPartNumber + 1;
        }

        // get the component
        var component = this.ProjectService.getComponentByNodeIdAndComponentId(event.nodeId, event.componentId);

        if (component != null) {
            // set the component type
            row[columnNameToNumber["Component Type"]] = component.type;

            // get the prompt with the html tags removed
            var prompt = this.UtilService.removeHTMLTags(component.prompt);

            // replace " with ""
            prompt = prompt.replace(/"/g, '""');

            // set the prompt with the html tags removed
            row[columnNameToNumber["Component Prompt"]] = prompt;
        }

        // create the {{nodeId}}_{{componentId}} key to look up the component event count
        var nodeIdAndComponentId = event.nodeId + "_" + event.componentId;

        if (componentEventCount[nodeIdAndComponentId] == null) {
            // initialize the component event count for this component to 1 if there is no entry
            componentEventCount[nodeIdAndComponentId] = 1;
        }

        // get the revision counter
        var revisionCounter = componentEventCount[nodeIdAndComponentId];
        row[columnNameToNumber["Group Event Counter"]] = revisionCounter;

        // increment the revision counter
        componentEventCount[nodeIdAndComponentId] = revisionCounter + 1;

        // set the context
        if (event.context != null) {
            row[columnNameToNumber["Context"]] = event.context;
        }

        // set the category
        if (event.category != null) {
            row[columnNameToNumber["Category"]] = event.category;
        }

        // set the event
        if (event.event != null) {
            row[columnNameToNumber["Event"]] = event.event;
        }

        // set the event data JSON
        row[columnNameToNumber["Event Data"]] = event;

        return row;
    }

    /**
     * Export all events for this run in CSV format
     */
    exportEvents0() {

        this.TeacherDataService.getExport("events").then((result) => {
            if (result == null) {
                alert("Error retrieving result");
                return;
            }
            let onlyExportNodes = null;  // this varioable is used later when looping through all rows
            if (this.exportStepSelectionType !== "exportAllSteps") {
                // get the nodes that were selected
                onlyExportNodes = this.getSelectedNodesToExport();
            }

            let COLUMN_INDEX_NODE_ID = 1;
            let COLUMN_INDEX_COMPONENT_ID = 2;
            let COLUMN_INDEX_STEP_NUMBER = 4;
            let COLUMN_INDEX_STEP_TITLE = 5;
            let COLUMN_INDEX_COMPONENT_PART_NUMBER = 6;
            let COLUMN_INDEX_DATA = 12;
            let COLUMN_INDEX_WORKGROUP_ID = 15;
            let COLUMN_INDEX_WISE_IDS = 19;
            let COLUMN_INDEX_WISE_ID_1 = 19;
            let COLUMN_INDEX_WISE_ID_2 = 20;
            let COLUMN_INDEX_WISE_ID_3 = 21;
            let runId = this.ConfigService.getRunId();

            let exportFilename = "events_" + runId + ".csv";

            let csvString = "";  // resulting csv string

            for (let rowIndex = 0; rowIndex < result.length; rowIndex++) {

                let row = result[rowIndex];

                if (rowIndex === 0) {
                    // append additional header columns
                    row[COLUMN_INDEX_WISE_ID_1] = "WISE ID 1";
                    row[COLUMN_INDEX_WISE_ID_2] = "WISE ID 2";
                    row[COLUMN_INDEX_WISE_ID_3] = "WISE ID 3";
                } else {
                    // for all non-header rows, fill in step numbers, titles, and component part numbers.
                    let nodeId = row[COLUMN_INDEX_NODE_ID];
                    let componentId = row[COLUMN_INDEX_COMPONENT_ID];
                    if (this.exportStepSelectionType !== "exportAllSteps") {
                        // is user chose certain steps/components to export, see if we need to include this row or not in the export.
                        // get the nodes that were selected
                        if (nodeId != null && componentId != null) {
                            let searchString = nodeId + "-" + componentId;
                            if (onlyExportNodes != null && onlyExportNodes.length > 0) {
                                if (onlyExportNodes.indexOf(searchString) == -1) {
                                    continue;  // user didn't select this node to export, so ignore this row and keep looping
                                }
                            }
                        } else if (nodeId != null) {
                            // only looking for this specific node, not node+component
                            let searchString = nodeId;
                            if (onlyExportNodes != null && onlyExportNodes.length > 0) {
                                if (onlyExportNodes.indexOf(searchString) == -1) {
                                    continue;  // user didn't select this node to export, so ignore this row and keep looping
                                }
                            }
                        } else if (nodeId == null && componentId == null) {
                            continue;  // don't add general events to export
                        }
                    }
                    row[COLUMN_INDEX_STEP_NUMBER] = this.ProjectService.getNodePositionById(nodeId);
                    row[COLUMN_INDEX_STEP_TITLE] = this.ProjectService.getNodeTitleByNodeId(nodeId);
                    row[COLUMN_INDEX_COMPONENT_PART_NUMBER] = this.ProjectService.getComponentPositionByNodeIdAndComponentId(nodeId, componentId) + 1; // make it 1-indexed for researchers
                    let workgroupId = row[COLUMN_INDEX_WORKGROUP_ID];
                    let wiseIDs = row[COLUMN_INDEX_WISE_IDS];
                    let wiseIDsArray = wiseIDs.split(",");
                    row[COLUMN_INDEX_WISE_ID_1] = wiseIDsArray[0];
                    row[COLUMN_INDEX_WISE_ID_2] = wiseIDsArray[1] || "";
                    row[COLUMN_INDEX_WISE_ID_3] = wiseIDsArray[2] || "";
                }

                // append row to csvString
                for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
                    let cell = row[cellIndex];
                    if (typeof cell === "object") {
                        cell = "\"" + JSON.stringify(cell).replace(/"/g, '""') + "\"";
                    } else if (typeof cell === "string") {
                        cell = "\"" + cell + "\"";
                    }
                    csvString += cell + ",";
                }
                csvString += "\r\n";
            }

            let csvBlob = new Blob([csvString], {type: 'text/csv'});
            let csvUrl = URL.createObjectURL(csvBlob);
            let a = document.createElement("a");
            document.body.appendChild(a);
            a.href = csvUrl;
            a.download = exportFilename;
            a.click();

            // timeout is required for FF.
            window.setTimeout(() => {
                URL.revokeObjectURL(csvUrl);  // tell browser to release URL reference
            }, 3000);
        });
    }

    exportNotebookItems(exportType) {

        this.TeacherDataService.getExport(exportType).then((result) => {
            let runId = this.ConfigService.getRunId();
            let exportFilename = "";

            let csvString = "";  // resulting csv string

            exportFilename = "notebook_" + runId + ".csv";

            let COLUMN_INDEX_LOCAL_NOTEBOOK_ITEM_ID = 1;
            let COLUMN_INDEX_NODE_ID = 2;
            let COLUMN_INDEX_COMPONENT_ID = 3;
            let COLUMN_INDEX_STEP_NUMBER = 4;
            let COLUMN_INDEX_STEP_TITLE = 5;
            let COLUMN_INDEX_COMPONENT_PART_NUMBER = 6;
            let COLUMN_INDEX_TYPE = 9;
            let COLUMN_INDEX_STUDENT_DATA = 10;
            let COLUMN_INDEX_WORKGROUP_ID = 13;
            let COLUMN_INDEX_WISE_IDS = 17;
            let COLUMN_INDEX_WISE_ID_1 = 17;
            let COLUMN_INDEX_WISE_ID_2 = 18;
            let COLUMN_INDEX_WISE_ID_3 = 19;
            let COLUMN_INDEX_STUDENT_RESPONSE = 20;

            if (exportType === "latestNotebookItems") {
                let hash = {};  // store latestStudentWork. Assume that key = (localNotebookItemId)
                result = result.reverse().filter( (studentWorkRow) => {
                    let hashKey = studentWorkRow[COLUMN_INDEX_LOCAL_NOTEBOOK_ITEM_ID] + "_" + studentWorkRow[COLUMN_INDEX_WORKGROUP_ID];
                    if (!hash.hasOwnProperty(hashKey)) {
                        // remember in hash
                        hash[hashKey] = studentWorkRow;
                        return true;
                    } else {
                        // we already have the latest, so we can disregard this studentWorkRow.
                        return false;
                    }
                }).reverse();
                exportFilename = "latest_notebook_items_" + runId + ".csv";
            } else if (exportType === "allNotebookItems") {
                exportFilename = "all_notebook_items_" + runId + ".csv";
            }

            for (let rowIndex = 0; rowIndex < result.length; rowIndex++) {
                let row = result[rowIndex];

                if (rowIndex === 0) {
                    // append additional header columns
                    row[COLUMN_INDEX_WISE_ID_1] = "WISE ID 1";
                    row[COLUMN_INDEX_WISE_ID_2] = "WISE ID 2";
                    row[COLUMN_INDEX_WISE_ID_3] = "WISE ID 3";
                    row[COLUMN_INDEX_STUDENT_RESPONSE] = "response";
                } else {
                    // for all non-header rows, fill in step numbers, titles, and component part numbers.
                    let nodeId = row[COLUMN_INDEX_NODE_ID];
                    let componentId = row[COLUMN_INDEX_COMPONENT_ID];
                    row[COLUMN_INDEX_STEP_NUMBER] = this.ProjectService.getNodePositionById(nodeId);
                    row[COLUMN_INDEX_STEP_TITLE] = this.ProjectService.getNodeTitleByNodeId(nodeId);
                    row[COLUMN_INDEX_COMPONENT_PART_NUMBER] = this.ProjectService.getComponentPositionByNodeIdAndComponentId(nodeId, componentId) + 1; // make it 1-indexed for researchers
                    let wiseIDs = row[COLUMN_INDEX_WISE_IDS];
                    let wiseIDsArray = wiseIDs.split(",");
                    row[COLUMN_INDEX_WISE_ID_1] = wiseIDsArray[0];
                    row[COLUMN_INDEX_WISE_ID_2] = wiseIDsArray[1] || "";
                    row[COLUMN_INDEX_WISE_ID_3] = wiseIDsArray[2] || "";

                    // get the student data JSON and extract responses into its own column
                    let studentDataJSONCell = row[COLUMN_INDEX_STUDENT_DATA];
                    if (row[COLUMN_INDEX_TYPE] === "report") {
                        if (studentDataJSONCell.content != null) {
                            //row[COLUMN_INDEX_STUDENT_RESPONSE] = this.escapeContent(studentDataJSONCell.content);
                            row[COLUMN_INDEX_STUDENT_RESPONSE] = this.UtilService.removeHTMLTags(studentDataJSONCell.content);

                        } else {
                            row[COLUMN_INDEX_STUDENT_RESPONSE] = "";
                        }
                    } else if (row[COLUMN_INDEX_TYPE] === "note") {
                        if (studentDataJSONCell.text != null) {
                            //row[COLUMN_INDEX_STUDENT_RESPONSE] = this.escapeContent(studentDataJSONCell.text);
                            row[COLUMN_INDEX_STUDENT_RESPONSE] = this.UtilService.removeHTMLTags(studentDataJSONCell.text);
                        } else {
                            row[COLUMN_INDEX_STUDENT_RESPONSE] = "";
                        }
                    }
                }

                // append row to csvString
                for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
                    let cell = row[cellIndex];
                    if (typeof cell === "object") {
                        cell = "\"" + JSON.stringify(cell).replace(/"/g, '""') + "\"";
                    } else if (typeof cell === "string") {
                        cell = "\"" + cell + "\"";
                    }
                    csvString += cell + ",";
                }
                csvString += "\r\n";
            }

            let csvBlob = new Blob([csvString], {type: 'text/csv'});
            let csvUrl = URL.createObjectURL(csvBlob);
            let a = document.createElement("a");
            document.body.appendChild(a);
            a.href = csvUrl;
            a.download = exportFilename;
            a.click();

            // timeout is required for FF.
            window.setTimeout(() => {
                URL.revokeObjectURL(csvUrl);  // tell browser to release URL reference
            }, 3000);
        });
    }

    exportNotifications() {

        this.TeacherDataService.getExport("notifications").then((result) => {
            let runId = this.ConfigService.getRunId();
            let exportFilename = "";

            let csvString = "";  // resulting csv string

            exportFilename = "notifications_" + runId + ".csv";

            let COLUMN_INDEX_NODE_ID = 1;
            let COLUMN_INDEX_COMPONENT_ID = 2;
            let COLUMN_INDEX_STEP_NUMBER = 4;
            let COLUMN_INDEX_STEP_TITLE = 5;
            let COLUMN_INDEX_COMPONENT_PART_NUMBER = 6;
            let COLUMN_INDEX_TYPE = 10;
            let COLUMN_INDEX_WISE_IDS = 21;
            let COLUMN_INDEX_WISE_ID_1 = 21;
            let COLUMN_INDEX_WISE_ID_2 = 22;
            let COLUMN_INDEX_WISE_ID_3 = 23;

            for (let rowIndex = 0; rowIndex < result.length; rowIndex++) {
                let row = result[rowIndex];

                if (rowIndex === 0) {
                    // append additional header columns
                    row[COLUMN_INDEX_WISE_ID_1] = "WISE ID 1";
                    row[COLUMN_INDEX_WISE_ID_2] = "WISE ID 2";
                    row[COLUMN_INDEX_WISE_ID_3] = "WISE ID 3";
                } else {
                    // for all non-header rows, fill in step numbers, titles, and component part numbers.
                    let nodeId = row[COLUMN_INDEX_NODE_ID];
                    let componentId = row[COLUMN_INDEX_COMPONENT_ID];
                    row[COLUMN_INDEX_STEP_NUMBER] = this.ProjectService.getNodePositionById(nodeId);
                    row[COLUMN_INDEX_STEP_TITLE] = this.ProjectService.getNodeTitleByNodeId(nodeId);
                    row[COLUMN_INDEX_COMPONENT_PART_NUMBER] = this.ProjectService.getComponentPositionByNodeIdAndComponentId(nodeId, componentId) + 1; // make it 1-indexed for researchers
                    let wiseIDs = row[COLUMN_INDEX_WISE_IDS];
                    let wiseIDsArray = wiseIDs.split(",");
                    row[COLUMN_INDEX_WISE_ID_1] = wiseIDsArray[0];
                    row[COLUMN_INDEX_WISE_ID_2] = wiseIDsArray[1] || "";
                    row[COLUMN_INDEX_WISE_ID_3] = wiseIDsArray[2] || "";
                }

                // append row to csvString
                for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
                    let cell = row[cellIndex];
                    if (typeof cell === "object") {
                        cell = "\"" + JSON.stringify(cell).replace(/"/g, '""') + "\"";
                    } else if (typeof cell === "string") {
                        cell = "\"" + cell + "\"";
                    }
                    csvString += cell + ",";
                }
                csvString += "\r\n";
            }

            let csvBlob = new Blob([csvString], {type: 'text/csv'});
            let csvUrl = URL.createObjectURL(csvBlob);
            let a = document.createElement("a");
            document.body.appendChild(a);
            a.href = csvUrl;
            a.download = exportFilename;
            a.click();

            // timeout is required for FF.
            window.setTimeout(() => {
                URL.revokeObjectURL(csvUrl);  // tell browser to release URL reference
            }, 3000);
        });
    }

    /**
     * Get the selected nodes to export
     * @return an array of selected node and component ids that were selected.
     * ex: ["node1", "node1-abcde", "node1-fghij", "node2"], where abcde, fghij are components in node1
     * "node2" means just node2, not components in node2.
     */
    getSelectedNodesToExport() {
        let selectedNodes = [];

        // loop through all the import project items
        for (let n = 0; n < this.projectItems.length; n++) {
            let item = this.projectItems[n];
            if (item.node.type === "node") {
                let nodeId = item.node.id;
                if (item.checked) {
                    // this item is checked so we will add it to the array of nodes that we will export
                    selectedNodes.push(nodeId);
                }
                // also check the components
                if (item.node.components != null && item.node.components.length > 0) {
                    item.node.components.map((component) => {
                        if (component.checked) {
                            selectedNodes.push(nodeId + "-" + component.id);
                        }
                    });
                }
            }
        }

        return selectedNodes;
    }

    /**
     * Handle node item clicked
     */
    nodeItemClicked(nodeItem) {
        if (nodeItem.checked) {
            // if this node item is checked, make sure its components are also checked.
            if (nodeItem.node != null && nodeItem.node.components != null && nodeItem.node.components.length > 0) {
                nodeItem.node.components.map((componentItem) => { componentItem.checked = true; });
            }
        } else {
            // if this node item is checked, make sure its components are also unchecked.
            if (nodeItem.node != null && nodeItem.node.components != null && nodeItem.node.components.length > 0) {
                nodeItem.node.components.map((componentItem) => { componentItem.checked = false; });
            }
        }
    }

    /**
     * Handle select all items
     */
    selectAll(doSelect = true) {
        if (this.projectIdToOrder != null) {
            for (let nodeId in this.projectIdToOrder) {
                let projectItem = this.projectIdToOrder[nodeId];
                if (projectItem.order != 0 && projectItem.node.type != "group") {
                    projectItem.checked = doSelect;
                    // also check its components
                    if (projectItem.node != null && projectItem.node.components != null && projectItem.node.components.length > 0) {
                        projectItem.node.components.map((componentItem) => { componentItem.checked = doSelect; });
                    }
                }
            }
        }
    }

    /**
     * Handle deselect all items
     */
    deselectAll() {
        this.selectAll(false);
    }

    /**
     * Preview the project
     */
    previewProject() {
        let previewProjectURL = this.ConfigService.getConfigParam('previewProjectURL');
        // open the preview step in a new tab
        window.open(previewProjectURL);
    }

    /**
     * Preview the step
     * @param node
     */
    previewNode(node) {

        if (node != null) {

            // get the node id
            let nodeId = node.id;

            // get the preview project url
            let previewProjectURL = this.ConfigService.getConfigParam('previewProjectURL');

            // create the url to preview the step
            let previewStepURL  = previewProjectURL + "#/vle/" + nodeId;

            // open the preview step in a new tab
            window.open(previewStepURL);
        }
    }
}

DataExportController.$inject = [
    '$injector',
    '$rootScope',
    '$scope',
    '$state',
    'AnnotationService',
    'ConfigService',
    'ProjectService',
    'StudentStatusService',
    'TeacherDataService',
    'TeacherWebSocketService',
    'UtilService'
];

export default DataExportController;
