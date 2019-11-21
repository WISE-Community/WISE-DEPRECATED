'use strict';

class DataExportController {

  constructor($filter,
        $injector,
        $mdDialog,
        $rootScope,
        $scope,
        $state,
        AnnotationService,
        ConfigService,
        FileSaver,
        MatchService,
        ProjectService,
        StudentStatusService,
        TeacherDataService,
        TeacherWebSocketService,
        UtilService) {

    this.$filter = $filter
    this.$injector = $injector;
    this.$mdDialog = $mdDialog;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.$state = $state;
    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
    this.FileSaver = FileSaver;
    this.MatchService = MatchService;
    this.ProjectService = ProjectService;
    this.StudentStatusService = StudentStatusService;
    this.TeacherDataService = TeacherDataService;
    this.TeacherWebSocketService = TeacherWebSocketService;
    this.UtilService = UtilService;
    this.exportStepSelectionType = "exportAllSteps";
    this.exportType = null;  // type of export: [latestWork, allWork, events]
    this.componentTypeToComponentService = {};
    this.canViewStudentNames = this.ConfigService.getPermissions().canViewStudentNames;
    this.$translate = this.$filter('translate');
    this.availableComponentDataExports = [
      'Discussion',
      'Match'
    ];

    this.setDefaultExportSettings();
    this.project = this.ProjectService.project;
    // create the mapping of node id to order
    let nodeOrderOfProject = this.ProjectService.getNodeOrderOfProject(this.project);
    this.projectIdToOrder = nodeOrderOfProject.idToOrder;
    this.projectItems = nodeOrderOfProject.nodes;

    // save event when data export view is displayed
    let context = "ClassroomMonitor", nodeId = null, componentId = null, componentType = null,
      category = "Navigation", event = "dataExportViewDisplayed", data = {};
    this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);
  }
  
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
    } else if (exportType === "studentAssets") {
      this.exportStudentAssets();
    } else if (exportType === "oneWorkgroupPerRow") {
      this.exportOneWorkgroupPerRow();
    }  else if (exportType === "rawData") {
      this.exportRawData();
    }
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
    this.showDownloadingExportMessage();
    var selectedNodes = null;
    var selectedNodesMap = null;

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
      } else {
        /*
         * the user has selected some steps/components so we will
         * generate a selected nodes map
         */
        selectedNodesMap = this.getSelectedNodesMap(selectedNodes);
      }
    }

    // request the student data from the server and then generate the export
    this.TeacherDataService.getExport("allStudentWork", selectedNodes).then((result) => {

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
        "Student Name 1",
        "WISE ID 2",
        "Student Name 2",
        "WISE ID 3",
        "Student Name 3",
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
            var extractedWISEIDsAndStudentNames = this.extractWISEIDsAndStudentNames(userInfo.users);

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
                    if (!this.isComponentSelected(selectedNodesMap, componentState.nodeId, componentState.componentId)) {
                      // the component state is for a step that is not selected
                      exportRow = false;
                    }
                  }

                  if (exportRow) {

                    // create the export row
                    var row = this.createStudentWorkExportRow(columnNames,
                      columnNameToNumber, rowCounter, workgroupId,
                      extractedWISEIDsAndStudentNames['wiseId1'],
                      extractedWISEIDsAndStudentNames['wiseId2'],
                      extractedWISEIDsAndStudentNames['wiseId3'],
                      extractedWISEIDsAndStudentNames['studentName1'],
                      extractedWISEIDsAndStudentNames['studentName2'],
                      extractedWISEIDsAndStudentNames['studentName3'],
                      periodName, componentRevisionCounter, componentState);

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
        fileName = runId + "_all_work.csv";
      } else if (exportType === "latestStudentWork") {
        fileName = runId + "_latest_work.csv";
      }

      // generate the csv file and have the client download it
      this.generateCSVFile(rows, fileName);
      this.hideDownloadingExportMessage();
    });
  }

  /**
   * @param users An array of user objects. Each user object contains an id and name.
   * @returns {object} An object that contains key/value pairs. The key is wiseIdX
   * or studentNameX where X is an integer. The values are the corresponding actual
   * values of wise id and student name.
   */
  extractWISEIDsAndStudentNames(users) {
    let extractedWISEIDsAndStudentNames = {};
    for (let u = 0; u < users.length; u++) {
    let user = users[u];
    extractedWISEIDsAndStudentNames['wiseId' + (u + 1)] = user.id;
    if (this.canViewStudentNames) {
      extractedWISEIDsAndStudentNames['studentName' + (u + 1)] = user.name;
    }
    }
    return extractedWISEIDsAndStudentNames;
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
  createStudentWorkExportRow(columnNames, columnNameToNumber, rowCounter, workgroupId, wiseId1, wiseId2, wiseId3, studentName1, studentName2, studentName3, periodName, componentRevisionCounter, componentState) {

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
    if (studentName1 != null && this.includeStudentNames) {
      row[columnNameToNumber["Student Name 1"]] = studentName1;
    }
    if (wiseId2 != null) {
      // set the WISE ID 2
      row[columnNameToNumber["WISE ID 2"]] = wiseId2;
    }
    if (studentName2 != null && this.includeStudentNames) {
      row[columnNameToNumber["Student Name 2"]] = studentName2;
    }
    if (wiseId3 != null) {
      // set the WISE ID 3
      row[columnNameToNumber["WISE ID 3"]] = wiseId3;
    }
    if (studentName3 != null && this.includeStudentNames) {
      row[columnNameToNumber["Student Name 3"]] = studentName3;
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

      // get the time stamp as a pretty printed date time string
      var formattedDateTime = this.UtilService.convertMillisecondsToFormattedDateTime(componentState.serverSaveTime);

      // set the time stamp string e.g. Wed Apr 06 2016 9:05:38 AM
      row[columnNameToNumber["Server Timestamp"]] = formattedDateTime;
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
    row[columnNameToNumber["Response"]] = this.getStudentDataString(componentState);

    let revisionCounter = this.getRevisionCounter(componentRevisionCounter, componentState.nodeId, componentState.componentId);

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

    this.incrementRevisionCounter(componentRevisionCounter, componentState.nodeId, componentState.componentId);

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
   * Get the plain text representation of the student work.
   * @param componentState {object} A component state that contains the student work.
   * @returns {string} A string that can be placed in a csv cell.
   */
  getStudentDataString(componentState) {
    /*
     * In Excel, if there is a cell with a long string and the cell to the
     * right of it is empty, the long string will overlap onto cells to the
     * right until the string ends or hits a cell that contains a value.
     * To prevent this from occurring, we will default empty cell values to
     * a string with a space in it. This way all values of cells are limited
     * to displaying only in its own cell.
     */
    let studentDataString = " ";
    let componentType = componentState.componentType;
    let componentService = this.getComponentService(componentType);
    if (componentService != null && componentService.getStudentDataString != null) {
    studentDataString = componentService.getStudentDataString(componentState);
    studentDataString = this.UtilService.removeHTMLTags(studentDataString);
    studentDataString = studentDataString.replace(/"/g, '""');
    } else {
    studentDataString = componentState.studentData;
    }
    return studentDataString;
  }

  /**
   * Get the revision number for the next component state revision.
   * @param componentRevisionCounter The mapping from component to revision
   * counter.
   * @param nodeId The node id the component is in.
   * @param componentId The component id of the component.
   */
  getRevisionCounter(componentRevisionCounter, nodeId, componentId) {
    // create the {{nodeId}}_{{componentId}} key to look up the component revision counter
    let nodeIdAndComponentId = nodeId + "_" + componentId;

    if (componentRevisionCounter[nodeIdAndComponentId] == null) {
      // initialize the component revision counter for this component to 1 if there is no entry
      componentRevisionCounter[nodeIdAndComponentId] = 1;
    }

    return componentRevisionCounter[nodeIdAndComponentId];
  }

  /**
   * Increment the revision counter for the given {{nodeId}}_{{componentId}}.
   * @param componentRevisionCounter The mapping from component to revision
   * counter.
   * @param nodeId The node id the component is in.
   * @param componentId The component id of the component.
   */
  incrementRevisionCounter(componentRevisionCounter, nodeId, componentId) {
    // create the {{nodeId}}_{{componentId}} key to look up the component revision counter
    let nodeIdAndComponentId = nodeId + "_" + componentId;

    if (componentRevisionCounter[nodeIdAndComponentId] == null) {
      // initialize the component revision counter for this component to 1 if there is no entry
      componentRevisionCounter[nodeIdAndComponentId] = 1;
    }

    // get the revision counter
    let revisionCounter = componentRevisionCounter[nodeIdAndComponentId];

    // increment the revision counter
    componentRevisionCounter[nodeIdAndComponentId] = revisionCounter + 1;
  }

  /**
   * Check if a component is selected
   * @param selectedNodesMap a map of node id and component id strings
   * to true
   * example
   * {
   *   "node1-38fj20egrj": true,
   *   "node1-20dbj2e0sf": true
   * }
   * @param nodeId the node id to check
   * @param componentId the component id to check
   * @return whether the component is selected
   */
  isComponentSelected(selectedNodesMap, nodeId, componentId) {
    var result = false;

    if (selectedNodesMap != null) {

      if (nodeId != null && componentId != null &&
        selectedNodesMap[nodeId + "-" + componentId] == true) {

        // the component is selected
        result = true;
      }
    }

    return result;
  }

  /**
   * Check if a component is selected
   * @param selectedNodesMap a map of node id to true
   * example
   * {
   *   "node1": true,
   *   "node2": true
   * }
   * @param nodeId the node id to check
   * @param componentId the component id to check
   * @return whether the node is selected
   */
  isNodeSelected(selectedNodesMap, nodeId) {
    var result = false;

    if (selectedNodesMap != null) {

      if (nodeId != null && selectedNodesMap[nodeId] == true) {
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

            if (cell == null || cell === '' || typeof cell === 'undefined') {
              cell = ' ';
            } else if (typeof cell === "object") {
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

    // generate a file and download it to the user's computer
    this.FileSaver.saveAs(csvBlob, fileName);
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
  exportEvents() {
    this.showDownloadingExportMessage();
    var selectedNodes = null;
    var selectedNodesMap = null;

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
      } else {
        /*
         * the user has selected some steps/components so we will
         * generate a selected nodes map
         */
        selectedNodesMap = this.getSelectedNodesMap(selectedNodes);
      }
    }

    // request the student data from the server and then generate the export
    this.TeacherDataService.getExport("events", selectedNodes).then((result) => {

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
        "Student Name 1",
        "WISE ID 2",
        "Student Name 2",
        "WISE ID 3",
        "Student Name 3",
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
        "Event Data",
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
            var extractedWISEIDsAndStudentNames = this.extractWISEIDsAndStudentNames(userInfo.users);

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

                      if (!this.isComponentSelected(selectedNodesMap, event.nodeId, event.componentId)) {
                        // the event is for a component that is not selected
                        exportRow = false;
                      }
                    } else if (event.nodeId != null) {
                      // this is a node event

                      if (!this.isNodeSelected(selectedNodesMap, event.nodeId)) {
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
                    var row = this.createEventExportRow(columnNames,
                      columnNameToNumber, rowCounter, workgroupId,
                      extractedWISEIDsAndStudentNames['wiseId1'],
                      extractedWISEIDsAndStudentNames['wiseId2'],
                      extractedWISEIDsAndStudentNames['wiseId3'],
                      extractedWISEIDsAndStudentNames['studentName1'],
                      extractedWISEIDsAndStudentNames['studentName2'],
                      extractedWISEIDsAndStudentNames['studentName3'],
                      periodName, componentEventCount, event);

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

      var fileName = runId + "_events.csv";

      // generate the csv file and have the client download it
      this.generateCSVFile(rows, fileName);
      this.hideDownloadingExportMessage();
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
  createEventExportRow(columnNames, columnNameToNumber, rowCounter, workgroupId, wiseId1, wiseId2, wiseId3,
      studentName1, studentName2, studentName3, periodName, componentEventCount, event) {

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
    if (studentName1 != null && this.includeStudentNames) {
      row[columnNameToNumber["Student Name 1"]] = studentName1;
    }
    if (wiseId2 != null) {
      // set the WISE ID 2
      row[columnNameToNumber["WISE ID 2"]] = wiseId2;
    }
    if (studentName2 != null && this.includeStudentNames) {
      row[columnNameToNumber["Student Name 2"]] = studentName2;
    }
    if (wiseId3 != null) {
      // set the WISE ID 3
      row[columnNameToNumber["WISE ID 3"]] = wiseId3;
    }
    if (studentName3 != null && this.includeStudentNames) {
      row[columnNameToNumber["Student Name 3"]] = studentName3;
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

    // get the pretty printed representation of the event
    var response = this.getEventResponse(event);

    // set the response
    row[columnNameToNumber["Response"]] = response;

    return row;
  }

  /**
   * Get the pretty printed representation of the event
   * @param event the event JSON object
   * @return the pretty printed representation of the event
   */
  getEventResponse(event) {

    var response = " ";

    if (event != null) {
      if (event.event == "branchPathTaken") {
        /*
         * this is a branch path taken event so we will show the title
         * of the first step in the branch path that was taken
         */
        if (event.data != null && event.data.toNodeId != null) {

          // get the toNodeId
          var toNodeId = event.data.toNodeId;

          // get the step number and title of the toNodeId
          var stepTitle = this.ProjectService.getNodePositionAndTitleByNodeId(toNodeId);

          response = stepTitle;
        }
      }
    }

    return response;
  }

  exportNotebookItems(exportType) {
    this.showDownloadingExportMessage();
    this.TeacherDataService.getExport(exportType).then((result) => {
      const notebookItems = result;
      const columnNames = [
        'ID',
        'Teacher Username',
        'Run ID',
        'Period ID',
        'Period Name',
        'Project ID',
        'Node ID',
        'Component ID',
        'Step Number',
        'Step Title',
        'Component Part Number',
        'Component Type',
        'Client Save Time',
        'Server Save Time',
        'Workgroup ID',
        'WISE ID 1',
        'WISE ID 2',
        'WISE ID 3',
        'Content',
        'Note Item ID',
        'Type',
        'Response'
      ];
      const columnNameToNumber = {};
      const headerRow = [];
      for (let c = 0; c < columnNames.length; c++) {
        const columnName = columnNames[c];
        columnNameToNumber[columnName] = c;
        headerRow.push(columnName);
      }
      const rows = [];
      rows.push(headerRow);
      for (const notebookItem of notebookItems) {
        rows.push(this.createExportNotebookItemRow(columnNames, columnNameToNumber,
            notebookItem));
      }
      const runId = this.ConfigService.getRunId();
      let fileName = '';
      if (exportType === 'latestNotebookItems') {
        fileName = `${runId}_latest_notebook_items.csv`;
      } else if (exportType === 'allNotebookItems') {
        fileName = `${runId}_all_notebook_items.csv`;
      }
      this.generateCSVFile(rows, fileName);
      this.hideDownloadingExportMessage();
    });
  }

  createExportNotebookItemRow(columnNames, columnNameToNumber, notebookItem) {
    const row = new Array(columnNames.length);
    row.fill(' ');
    row[columnNameToNumber['ID']] = notebookItem.id;
    row[columnNameToNumber['Note Item ID']] = notebookItem.localNotebookItemId;
    row[columnNameToNumber['Node ID']] = notebookItem.nodeId;
    row[columnNameToNumber['Component ID']] = notebookItem.componentId;
    const component = this.ProjectService.getComponentByNodeIdAndComponentId(
        notebookItem.nodeId, notebookItem.componentId);
    if (component != null) {
      row[columnNameToNumber['Component Type']] = component.type;
    }
    row[columnNameToNumber['Step Number']] =
        this.getNodePositionById(notebookItem.nodeId);
    row[columnNameToNumber['Step Title']] =
        this.getNodeTitleByNodeId(notebookItem.nodeId);
    const position = this.ProjectService.getComponentPositionByNodeIdAndComponentId(
        notebookItem.nodeId, notebookItem.componentId);
    if (position != -1) {
      row[columnNameToNumber['Component Part Number']] = position + 1;
    }
    row[columnNameToNumber['Client Save Time']] =
        this.UtilService.convertMillisecondsToFormattedDateTime(
        notebookItem.clientSaveTime);
    row[columnNameToNumber['Server Save Time']] =
        this.UtilService.convertMillisecondsToFormattedDateTime(
        notebookItem.serverSaveTime);
    row[columnNameToNumber['Type']] = notebookItem.type;
    row[columnNameToNumber['Content']] = JSON.parse(notebookItem.content);
    row[columnNameToNumber['Run ID']] = notebookItem.runId;
    row[columnNameToNumber['Workgroup ID']] = notebookItem.workgroupId;
    const userInfo =
        this.ConfigService.getUserInfoByWorkgroupId(notebookItem.workgroupId);
    if (notebookItem.localNotebookItemId !== 'teacherReport') {
      row[columnNameToNumber['Period ID']] = notebookItem.periodId;
      row[columnNameToNumber['Period Name']] = userInfo.periodName;
    }
    row[columnNameToNumber['Teacher Username']] =
        this.ConfigService.getTeacherUserInfo().username;
    row[columnNameToNumber['Project ID']] = this.ConfigService.getProjectId();
    if (notebookItem.localNotebookItemId !== 'teacherReport') {
      const student1 = userInfo.users[0];
      const student2 = userInfo.users[1];
      const student3 = userInfo.users[2];
      if (student1 != null) {
        row[columnNameToNumber['WISE ID 1']] = student1.id;
      }
      if (student2 != null) {
        row[columnNameToNumber['WISE ID 2']] = student2.id;
      }
      if (student3 != null) {
        row[columnNameToNumber['WISE ID 3']] = student3.id;
      }
    }
    const responseJSON = JSON.parse(notebookItem.content);
    if (notebookItem.type === 'report') {
      row[columnNameToNumber['Response']] =
          this.UtilService.removeHTMLTags(responseJSON.content);
    } else {
      row[columnNameToNumber['Response']] = responseJSON.text;
    }
    return row;
  }

  exportNotifications() {
    this.showDownloadingExportMessage();
    this.TeacherDataService.getExport('notifications').then((result) => {
      const notifications = result;
      const columnNames = [
        'ID',
        'Teacher Username',
        'Run ID',
        'Period ID',
        'Period Name',
        'Project ID',
        'Node ID',
        'Component ID',
        'Step Number',
        'Step Title',
        'Component Part Number',
        'Component Type',
        'Server Save Time',
        'Time Generated',
        'Time Dismissed',
        'From Workgroup ID',
        'To Workgroup ID',
        'WISE ID 1',
        'WISE ID 2',
        'WISE ID 3',
        'Data',
        'Group ID',
        'Type',
        'Message'
      ];
      const columnNameToNumber = {};
      const headerRow = [];
      for (let c = 0; c < columnNames.length; c++) {
        const columnName = columnNames[c];
        columnNameToNumber[columnName] = c;
        headerRow.push(columnName);
      }
      const rows = [];
      rows.push(headerRow);
      for (const notification of notifications) {
        rows.push(this.createExportNotificationRow(columnNames, columnNameToNumber,
            notification));
      }
      const runId = this.ConfigService.getRunId();
      const fileName = `${runId}_notifications.csv`;
      this.generateCSVFile(rows, fileName);
      this.hideDownloadingExportMessage();
    });
  }

  createExportNotificationRow(columnNames, columnNameToNumber, notification) {
    const row = new Array(columnNames.length);
    row.fill(' ');
    row[columnNameToNumber['ID']] = notification.id;
    row[columnNameToNumber['Node ID']] = notification.nodeId;
    row[columnNameToNumber['Component ID']] = notification.componentId;
    const component = this.ProjectService.getComponentByNodeIdAndComponentId(
        notification.nodeId, notification.componentId);
    if (component != null) {
      row[columnNameToNumber['Component Type']] = component.type;
    }
    row[columnNameToNumber['Step Number']] =
        this.getNodePositionById(notification.nodeId);
    row[columnNameToNumber['Step Title']] =
        this.getNodeTitleByNodeId(notification.nodeId);
    const componentPosition = this.ProjectService.getComponentPositionByNodeIdAndComponentId(
        notification.nodeId, notification.componentId);
    if (componentPosition != -1) {
      row[columnNameToNumber['Component Part Number']] = componentPosition + 1;
    }
    row[columnNameToNumber['Server Save Time']] =
        this.UtilService.convertMillisecondsToFormattedDateTime(
        notification.serverSaveTime);
    row[columnNameToNumber['Time Generated']] =
        this.UtilService.convertMillisecondsToFormattedDateTime(
        notification.timeGenerated);
    if (notification.timeDismissed != null) {
      row[columnNameToNumber['Time Dismissed']] =
          this.UtilService.convertMillisecondsToFormattedDateTime(
          notification.timeDismissed);
    }
    row[columnNameToNumber['Type']] = notification.type;
    if (notification.groupId != null) {
      row[columnNameToNumber['Group ID']] = notification.groupId;
    }
    row[columnNameToNumber['Message']] = notification.message;
    row[columnNameToNumber['Data']] = notification.data;
    row[columnNameToNumber['Period ID']] = notification.periodId;
    row[columnNameToNumber['Run ID']] = notification.runId;
    row[columnNameToNumber['From Workgroup ID']] = notification.fromWorkgroupId;
    row[columnNameToNumber['To Workgroup ID']] = notification.toWorkgroupId;
    const userInfo =
        this.ConfigService.getUserInfoByWorkgroupId(notification.toWorkgroupId);
    row[columnNameToNumber['Period Name']] = userInfo.periodName;
    row[columnNameToNumber['Teacher Username']] =
        this.ConfigService.getTeacherUserInfo().username;
    row[columnNameToNumber['Project ID']] = this.ConfigService.getProjectId();
    const student1 = userInfo.users[0];
    const student2 = userInfo.users[1];
    const student3 = userInfo.users[2];
    if (student1 != null) {
      row[columnNameToNumber['WISE ID 1']] = student1.id;
    }
    if (student2 != null) {
      row[columnNameToNumber['WISE ID 2']] = student2.id;
    }
    if (student3 != null) {
      row[columnNameToNumber['WISE ID 3']] = student3.id;
    }
    return row;
  }

  exportStudentAssets() {
    this.showDownloadingExportMessage();
    this.TeacherDataService.getExport("studentAssets").then(() => {
      this.hideDownloadingExportMessage();
    });
  }

  /**
   * Get the selected nodes to export
   * @return an array of objects that contain a nodeId field and maybe also
   * a componentId field
   * example
   * [
   *   {
   *     nodeId: "node1",
   *     componentId: "343b8aesf7"
   *   },
   *   {
   *     nodeId: "node2",
   *     componentId: "b34gaf0ug2"
   *   },
   *   {
   *     nodeId: "node3"
   *   }
   * ]
   * Note: "node3" means just node3, not components in node2.
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

          // create the object that contains the nodeId
          let selectedStep = {
            nodeId: nodeId
          };

          selectedNodes.push(selectedStep);
        }
        // also check the components
        if (item.node.components != null && item.node.components.length > 0) {
          item.node.components.map((component) => {
            if (component.checked) {
              // this item is checked so we will add it to the array of nodes that we will export

              // create the object that contains the nodeId and componentId
              let selectedComponent = {
                nodeId: nodeId,
                componentId: component.id
              };

              selectedNodes.push(selectedComponent);
            }
          });
        }
      }
    }

    return selectedNodes;
  }

  /**
   * Get a mapping of node/component id strings to true.
   * example if
   * selectedNodes = [
   *   {
   *     nodeId: "node1",
   *     componentId: "343b8aesf7"
   *   },
   *   {
   *     nodeId: "node2",
   *     componentId: "b34gaf0ug2"
   *   },
   *   {
   *     nodeId: "node3"
   *   }
   * ]
   *
   * this function will return
   * {
   *   "node1-343b8aesf7": true,
   *   "node2-b34gaf0ug2": true,
   *   "node3": true
   * }
   *
   * @param selectedNodes an array of objects that contain a nodeId field and maybe also
   * a componentId field
   * @return a mapping of node/component id strings to true
   */
  getSelectedNodesMap(selectedNodes) {

    var selectedNodesMap = {};

    if (selectedNodes != null) {

      // loop through all the selected nodes
      for (var sn = 0; sn < selectedNodes.length; sn++) {
        var selectedNode = selectedNodes[sn];

        if (selectedNode != null) {
          var nodeId = selectedNode.nodeId;
          var componentId = selectedNode.componentId;

          var selectedNodeString = "";

          if (nodeId != null && componentId != null) {
            // create the string like "node1-343b8aesf7"
            selectedNodeString = nodeId + "-" + componentId;
          } else if (nodeId != null) {
            // create the string like "node3"
            selectedNodeString = nodeId;
          }

          if (selectedNodeString != null && selectedNodeString != "") {
            // add the mapping
            selectedNodesMap[selectedNodeString] = true;
          }
        }
      }
    }

    return selectedNodesMap;
  }

  /**
   * Handle node item clicked
   * @param nodeItem the item object for a given activity or step
   */
  nodeItemClicked(nodeItem) {

    if (nodeItem != null) {

      if (nodeItem.node != null) {
        // the node item is a group or step

        // get the node
        var node = nodeItem.node;

        if (node.ids != null) {
          // this is a group node

          // loop through all the child node ids
          for (var n = 0; n < node.ids.length; n++) {

            // get a child step id
            var nodeId = node.ids[n];

            // get a child step item
            var childNodeItem = this.projectIdToOrder[nodeId];

            // set the checked value for the step item
            childNodeItem.checked = nodeItem.checked;

            // get all the components in the step
            var components = childNodeItem.node.components;

            if (components != null) {

              // loop through all the components in the step
              for (var c = 0; c < components.length; c++) {

                // set the checked value for the component item
                components[c].checked = nodeItem.checked;
              }
            }
          }
        } else if (node.components != null) {
          // this is a step node

          if (nodeItem.checked) {
            // if this node item is checked, make sure its components are also checked.
            if (nodeItem.node != null && nodeItem.node.components != null && nodeItem.node.components.length > 0) {
              nodeItem.node.components.map((componentItem) => { componentItem.checked = true; });
            }
          } else {
            // if this node item is unchecked, make sure its components are also unchecked.
            if (nodeItem.node != null && nodeItem.node.components != null && nodeItem.node.components.length > 0) {
              nodeItem.node.components.map((componentItem) => { componentItem.checked = false; });
            }
          }
        }
      }
    }
  }

  /**
   * Handle select all items
   */
  selectAll(doSelect = true) {
    if (this.projectIdToOrder != null) {

      // loop through all the group nodes and step nodes
      for (let nodeId in this.projectIdToOrder) {
        let projectItem = this.projectIdToOrder[nodeId];
        if (projectItem.order != 0) {

          projectItem.checked = doSelect;

          if (projectItem.node.type != "group") {
            // the project item is a step

            // also check its components
            if (projectItem.node != null && projectItem.node.components != null && projectItem.node.components.length > 0) {
              projectItem.node.components.map((componentItem) => { componentItem.checked = doSelect; });
            }
          }
        }
      }
    }
  }

  deselectAll() {
    this.selectAll(false);
  }

  previewProject() {
    window.open(`${this.ConfigService.getConfigParam('previewProjectURL')}#!/project/${this.ConfigService.getProjectId()}`);
  }

  previewNode(node) {
    window.open(`${this.ConfigService.getConfigParam('previewProjectURL')}#!/project/${this.ConfigService.getProjectId()}/${node.id}`);
  }

  /**
   * Create a csv export file with one workgroup per row
   */
  exportOneWorkgroupPerRow() {
    this.showDownloadingExportMessage();
    var selectedNodes = null;

    /*
     * holds the mappings from nodeid or nodeid-componentid to a boolean
     * value of whether the node was selected
     * example
     * selectedNodesMap["node3"] = true
     * selectedNodesMap["node4-wt38sdf1d3"] = true
     */
    var selectedNodesMap = null;

    if (this.exportStepSelectionType === "exportSelectSteps") {
      // get the steps that were selected
      selectedNodes = this.getSelectedNodesToExport();

      if (selectedNodes == null || selectedNodes.length == 0) {
        /*
         * the user did not select any steps to export so we will not
         * generate the export
         */
        alert('Please select a step to export.');
        return;
      } else {
        /*
         * the user has selected some steps/components so we will
         * generate a selected nodes map
         */
        selectedNodesMap = this.getSelectedNodesMap(selectedNodes);
      }
    }

    // request the student data from the server and then generate the export
    this.TeacherDataService.getExport("oneWorkgroupPerRow", selectedNodes).then((result) => {

      // the rows in the export
      var rows = [];

      // get the project id
      var projectId = this.ConfigService.getProjectId();

      // get the project title
      var projectTitle = this.ProjectService.getProjectTitle();

      // get the run id
      var runId = this.ConfigService.getRunId();

      var startDate = "";

      var endDate = "";

      // get the column ids that we will use for this export
      var columnIds = this.getColumnIdsForOneWorkgroupPerRow(selectedNodesMap);

      // get all the step node ids
      var nodeIds = this.ProjectService.getFlattenedProjectAsNodeIds();

      // the headers for the description row
      var descriptionRowHeaders = [
        "Workgroup ID",
        "WISE ID 1",
        "Student Name 1",
        "WISE ID 2",
        "Student Name 2",
        "WISE ID 3",
        "Student Name 3",
        "Class Period",
        "Project ID",
        "Project Name",
        "Run ID",
        "Start Date",
        "End Date"
      ];

      // generate the mapping from column id to column index
      var columnIdToColumnIndex = this.getColumnIdToColumnIndex(columnIds, descriptionRowHeaders);

      // generate the top rows that contain the header cells
      var topRows = this.getOneWorkgroupPerRowTopRows(columnIds, columnIdToColumnIndex, descriptionRowHeaders);

      // add the top rows
      rows = rows.concat(topRows);

      // get the workgroups in the class
      var workgroups = this.ConfigService.getClassmateUserInfosSortedByWorkgroupId();

      // loop through all the workgroups
      for (var w = 0; w < workgroups.length; w++) {

        // get a workgroup
        var workgroup = workgroups[w];

        if (workgroup != null) {

          /*
           * Create the row for the workgroup and fill each cell with
           * a space " ".
           * The array length will be equal to the number of
           * description header columns plus a column for the vertical
           * headers plus all the columns for the steps/components.
           */
          var workgroupRow = new Array(descriptionRowHeaders.length + 1 + columnIds.length);
          workgroupRow.fill(" ");

          // get the workgroup information
          var workgroupId = workgroup.workgroupId;
          var periodName = workgroup.periodName;
          var userInfo = this.ConfigService.getUserInfoByWorkgroupId(workgroupId);

          workgroupRow[columnIdToColumnIndex["Workgroup ID"]] = workgroupId;

          var extractedWISEIDsAndStudentNames = this.extractWISEIDsAndStudentNames(userInfo.users);
          var wiseId1 = extractedWISEIDsAndStudentNames["wiseId1"];
          var wiseId2 = extractedWISEIDsAndStudentNames["wiseId2"];
          var wiseId3 = extractedWISEIDsAndStudentNames["wiseId3"];
          var studentName1 = extractedWISEIDsAndStudentNames["studentName1"];
          var studentName2 = extractedWISEIDsAndStudentNames["studentName2"];
          var studentName3 = extractedWISEIDsAndStudentNames["studentName3"];

          if (wiseId1 != null) {
            workgroupRow[columnIdToColumnIndex["WISE ID 1"]] = wiseId1;
          }
          if (studentName1 != null && this.includeStudentNames) {
            workgroupRow[columnIdToColumnIndex["Student Name 1"]] = studentName1;
          }
          if (wiseId2 != null) {
            workgroupRow[columnIdToColumnIndex["WISE ID 2"]] = wiseId2;
          }
          if (studentName2 != null && this.includeStudentNames) {
            workgroupRow[columnIdToColumnIndex["Student Name 2"]] = studentName2;
          }
          if (wiseId3 != null) {
            workgroupRow[columnIdToColumnIndex["WISE ID 3"]] = wiseId3;
          }
          if (studentName3 != null && this.includeStudentNames) {
            workgroupRow[columnIdToColumnIndex["Student Name 3"]] = studentName3;
          }

          workgroupRow[columnIdToColumnIndex["Class Period"]] = periodName;
          workgroupRow[columnIdToColumnIndex["Project ID"]] = projectId;
          workgroupRow[columnIdToColumnIndex["Project Name"]] = projectTitle;
          workgroupRow[columnIdToColumnIndex["Run ID"]] = runId;
          workgroupRow[columnIdToColumnIndex["Start Date"]] = startDate;
          workgroupRow[columnIdToColumnIndex["End Date"]] = endDate;

          // loop through all the steps
          for (var n = 0; n < nodeIds.length; n++) {
            var nodeId = nodeIds[n];

            // get all the components in the step
            var components = this.ProjectService.getComponentsByNodeId(nodeId);

            if (components != null) {

              // loop through all the components
              for (var c = 0; c < components.length; c++) {
                var component = components[c];

                if (component != null) {
                  var componentId = component.id;

                  if (this.exportComponent(selectedNodesMap, nodeId, componentId)) {
                    // the researcher wants to export this component

                    // get the column prefix
                    var columnIdPrefix = nodeId + "-" + componentId;

                    // get the latest component state
                    var componentState = this.TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(workgroupId, nodeId, componentId);

                    if (componentState != null) {
                      if (this.includeStudentWorkIds) {
                        // we are exporting student work ids
                        workgroupRow[columnIdToColumnIndex[columnIdPrefix + "-studentWorkId"]] = componentState.id;
                      }

                      if (this.includeStudentWorkTimestamps) {
                        // we are exporting student work timestamps

                        if (componentState.serverSaveTime != null) {
                          // get the time stamp as a pretty printed date time string
                          var formattedDateTime = this.UtilService.convertMillisecondsToFormattedDateTime(componentState.serverSaveTime);

                          // set the time stamp string e.g. Wed Apr 06 2016 9:05:38 AM
                          workgroupRow[columnIdToColumnIndex[columnIdPrefix + "-studentWorkTimestamp"]] = formattedDateTime;
                        }
                      }

                      // set the student data string
                      workgroupRow[columnIdToColumnIndex[columnIdPrefix + "-studentWork"]] = this.getStudentDataString(componentState);

                      if (this.includeScores || this.includeComments) {
                        // we are exporting scores or comments

                        // get the latest score and comment annotation
                        var latestComponentAnnotations = this.AnnotationService.getLatestComponentAnnotations(nodeId, componentId, workgroupId);

                        if (latestComponentAnnotations != null) {
                          var scoreAnnotation = latestComponentAnnotations.score;
                          var commentAnnotation = latestComponentAnnotations.comment;

                          if (scoreAnnotation != null) {


                            if (this.includeScoreTimestamps) {
                              // we are exporting score timestamps

                              // get the score timestamp as a pretty printed date time
                              var scoreTimestamp = this.UtilService.convertMillisecondsToFormattedDateTime(scoreAnnotation.serverSaveTime);

                              // set the score timestamp
                              workgroupRow[columnIdToColumnIndex[columnIdPrefix + "-scoreTimestamp"]] = scoreTimestamp;
                            }

                            if (this.includeScores) {
                              // we are exporting scores

                              if (scoreAnnotation.data != null && scoreAnnotation.data.value != null) {

                                var scoreValue = scoreAnnotation.data.value;

                                // set the score
                                workgroupRow[columnIdToColumnIndex[columnIdPrefix + "-score"]] = scoreValue;
                              }
                            }
                          }

                          if (commentAnnotation != null) {

                            if (this.includeCommentTimestamps) {
                              // we are exporting comment timestamps

                              // get the comment timestamp as a pretty printed date time
                              var commentTimestamp = this.UtilService.convertMillisecondsToFormattedDateTime(commentAnnotation.serverSaveTime);

                              // set the comment timestamp
                              workgroupRow[columnIdToColumnIndex[columnIdPrefix + "-commentTimestamp"]] = commentTimestamp;
                            }

                            if (this.includeComments) {
                              // we are exporting comments

                              if (commentAnnotation.data != null && commentAnnotation.data.value != null) {
                                var commentValue = commentAnnotation.data.value;

                                // set the comment
                                workgroupRow[columnIdToColumnIndex[columnIdPrefix + "-comment"]] = commentValue;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }

            if (this.exportNode(selectedNodesMap, nodeId)) {
              // the researcher wants to export this step

              if (this.ProjectService.isBranchPoint(nodeId)) {
                // this step is a branch point

                var toNodeId = null;
                var stepTitle = null;

                var eventType = 'branchPathTaken';

                /*
                 * get the latest branchPathTaken event for this
                 * step
                 */
                var latestBranchPathTakenEvent = this.TeacherDataService.getLatestEventByWorkgroupIdAndNodeIdAndType(workgroupId, nodeId, eventType);

                if (latestBranchPathTakenEvent != null &&
                  latestBranchPathTakenEvent.data != null &&
                  latestBranchPathTakenEvent.data.toNodeId != null) {

                  // get the step that the student branched to
                  toNodeId = latestBranchPathTakenEvent.data.toNodeId;

                  // get the title of the step
                  stepTitle = this.ProjectService.getNodePositionAndTitleByNodeId(toNodeId);
                }

                if (this.includeBranchPathTakenNodeId) {
                  // we are exporting the branch path taken node ids

                  if (toNodeId != null) {
                    workgroupRow[columnIdToColumnIndex[nodeId + "-branchPathTakenNodeId"]] = toNodeId;
                  } else {
                    workgroupRow[columnIdToColumnIndex[nodeId + "-branchPathTakenNodeId"]] = " ";
                  }
                }

                if (this.includeBranchPathTaken) {
                  // we are exporting branch path taken

                  var branchLetter = this.ProjectService.getBranchLetter(toNodeId);

                  if (stepTitle != null) {
                    workgroupRow[columnIdToColumnIndex[nodeId + "-branchPathTaken"]] = branchLetter;
                  } else {
                    workgroupRow[columnIdToColumnIndex[nodeId + "-branchPathTaken"]] = " ";
                  }
                }

                if (this.includeBranchPathTakenStepTitle) {
                  // we are exporting branch path taken step titles

                  if (stepTitle != null) {
                    workgroupRow[columnIdToColumnIndex[nodeId + "-branchPathTakenStepTitle"]] = stepTitle;
                  } else {
                    workgroupRow[columnIdToColumnIndex[nodeId + "-branchPathTakenStepTitle"]] = " ";
                  }
                }
              }
            }
          }

          // add this workgroup's row to the array of all rows
          rows.push(workgroupRow);
        }
      }

      // create the file name
      var fileName = runId + "_one_workgroup_per_row.csv";

      // generate the csv file and have the client download it
      this.generateCSVFile(rows, fileName);
      this.hideDownloadingExportMessage();
    });
  }

  /**
   * Get the column ids for the One Workgroup Per Row export
   * @param selectedNodesMap the nodes that were selected
   * @return an array of column ids. the column ids will be in the format
   * nodeId-componentId-studentWork
   * nodeId-componentId-score
   * nodeId-componentId-comment
   */
  getColumnIdsForOneWorkgroupPerRow(selectedNodesMap) {
    var columnIds = [];

    // get all the step node ids in order
    var nodeIds = this.ProjectService.getFlattenedProjectAsNodeIds();

    if (nodeIds != null) {

      // loop through all the step node ids
      for (var n = 0; n < nodeIds.length; n++) {
        var nodeId = nodeIds[n];

        // get the components in the step
        var components = this.ProjectService.getComponentsByNodeId(nodeId);

        if (components != null) {

          // loop through all the components in the step
          for (var c = 0; c < components.length; c++) {
            var component = components[c];

            if (component != null) {
              var componentId = component.id;

              if (this.exportComponent(selectedNodesMap, nodeId, componentId)) {
                /*
                 * the component was selected so we will create column
                 * ids for it
                 */

                var columnIdPrefix = nodeId + "-" + componentId;

                if (this.includeStudentWorkIds) {
                  /*
                   * we are exporting student work ids so we
                   * will create the column id for the student
                   * work id
                   */
                  columnIds.push(columnIdPrefix + "-studentWorkId");
                }

                if (this.includeStudentWorkTimestamps) {
                  /*
                   * we are exporting timestamps so we will
                   * create the column id for the timestamp
                   */
                  columnIds.push(columnIdPrefix + "-studentWorkTimestamp");
                }

                if (this.includeStudentWork) {
                  // create the column id for the studentWork
                  columnIds.push(columnIdPrefix + "-studentWork");
                }

                if (this.includeScoreTimestamps) {
                  /*
                   * we are exporting score timestamps so we
                   * will create the column id for the score
                   * timestamp
                   */
                  columnIds.push(columnIdPrefix + "-scoreTimestamp");
                }

                if (this.includeScores) {
                  // we are exporting scores so we will create the column id for the score
                  columnIds.push(columnIdPrefix + "-score");
                }

                if (this.includeCommentTimestamps) {
                  /*
                   * we are exporting comment timestamps so we
                   * will create the column id for the comment
                   * timestamp
                   */
                  columnIds.push(columnIdPrefix + "-commentTimestamp");
                }

                if (this.includeComments) {
                  // we are exporting comments so we will create the column id for the comment
                  columnIds.push(columnIdPrefix + "-comment");
                }
              }
            }
          }
        }

        if (this.exportNode(selectedNodesMap, nodeId)) {
          // the step was selected

          if (this.ProjectService.isBranchPoint(nodeId)) {
            // the step is a branch point

            if (this.includeBranchPathTakenNodeId) {
              // we are exporting branch path taken node ids
              columnIds.push(nodeId + "-branchPathTakenNodeId");
            }

            if (this.includeBranchPathTaken) {
              // we are exporting branch path taken
              columnIds.push(nodeId + "-branchPathTaken");
            }

            if (this.includeBranchPathTakenStepTitle) {
              // we are exporting branch path taken step titles
              columnIds.push(nodeId + "-branchPathTakenStepTitle");
            }
          }
        }
      }
    }

    return columnIds;
  }

  /**
   * Create mappings from column id to column index so that we can easily
   * insert cell values into the correct column when we fill in the row
   * for a workgroup
   * @param columnIds an array of column ids in the order that the
   * associated columns will appear in the export
   * @param descriptionRowHeaders an array of headers in the description row
   * @return an object that contains mappings from column id to column index
   */
  getColumnIdToColumnIndex(columnIds, descriptionRowHeaders) {

    /*
     * the student work columns will start after the description header
     * columns and vertical headers column
     */
    var numberOfColumnsToShift = descriptionRowHeaders.length + 1;

    var columnIdToColumnIndex = {};

    /*
     * loop through all the description columns
     * Workgroup ID
     * WISE ID 1
     * WISE ID 2
     * WISE ID 3
     * Class Period
     * Project ID
     * Project Name
     * Run ID
     * Start Date
     * End Date
     */
    for (var d = 0; d < descriptionRowHeaders.length; d++) {
      // get the description column
      var descriptionRowHeader = descriptionRowHeaders[d];

      // set the column index for the description column
      columnIdToColumnIndex[descriptionRowHeader] = d;
    }

    // generate the header row by looping through all the column names
    for (var c = 0; c < columnIds.length; c++) {

      // get a column name
      var columnId = columnIds[c];

      if (columnId != null) {
        /*
         * Add a mapping from column name to column index. The columns
         * for the components will start after the blank columns and
         * after the column that contains the vertical headers for the
         * top rows. We need to add +1 for the vertical headers column
         * which contains the values Step Title, Component Part Number,
         * Component Type, Prompt, Node ID, Component ID, Description.
         */
        columnIdToColumnIndex[columnId] = numberOfColumnsToShift + c;
      }
    }

    return columnIdToColumnIndex;
  }

  /**
   * Get the top rows in the One Workgroup Per Row export
   * @param columnIds an array of column ids
   * @param columnIdToColumnIndex an object containing mappings from column id
   * to column index
   * @param descriptionRowHeaders an array containing the description row
   * headers
   * @return an array of of the top rows. each top row is also an array
   */
  getOneWorkgroupPerRowTopRows(columnIds, columnIdToColumnIndex, descriptionRowHeaders) {

    // get the total number of columns in a row
    var numColumns = descriptionRowHeaders.length + 1 + columnIds.length;

    // create the top rows
    var stepTitleRow = new Array(numColumns);
    var componentPartNumberRow = new Array(numColumns);
    var componentTypeRow = new Array(numColumns);
    var componentPromptRow = new Array(numColumns);
    var nodeIdRow = new Array(numColumns);
    var componentIdRow = new Array(numColumns);
    var columnIdRow = new Array(numColumns);
    var descriptionRow = new Array(numColumns);

    /*
     * populate the top rows with a space. we do this so that it makes it
     * easier to view in the export. for example if there is a cell with
     * text in it and a blank cell to the right of it, excel will display
     * the text overflow into the blank cell. if we have cells with " "
     * instead of "", this overflow will not occur.
     */
    stepTitleRow.fill(" ");
    componentPartNumberRow.fill(" ");
    componentTypeRow.fill(" ");
    componentPromptRow.fill(" ");
    nodeIdRow.fill(" ");
    componentIdRow.fill(" ");
    columnIdRow.fill(" ");
    descriptionRow.fill(" ");

    //  set the cell values for the vertical header column
    stepTitleRow[descriptionRowHeaders.length] = "Step Title";
    componentPartNumberRow[descriptionRowHeaders.length] = "Component Part Number";
    componentTypeRow[descriptionRowHeaders.length] = "Component Type";
    componentPromptRow[descriptionRowHeaders.length] = "Prompt";
    nodeIdRow[descriptionRowHeaders.length] = "Node ID";
    componentIdRow[descriptionRowHeaders.length] = "Component ID";
    columnIdRow[descriptionRowHeaders.length] = "Column ID";
    descriptionRow[descriptionRowHeaders.length] = "Description";

    // fill in the headers in the description row
    for (var d = 0; d < descriptionRowHeaders.length; d++) {
      descriptionRow[d] = descriptionRowHeaders[d];
    }

    // get all the step node ids in the order that they appear in the project
    var nodeIds = this.ProjectService.getFlattenedProjectAsNodeIds();

    if (nodeIds != null) {

      // loop through all the step node ids
      for (var n = 0; n < nodeIds.length; n++) {
        var nodeId = nodeIds[n];

        // get a step title
        var stepTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);

        // get the components in the step
        var components = this.ProjectService.getComponentsByNodeId(nodeId);

        if (components != null) {

          // loop through all the components in the step
          for (var c = 0; c < components.length; c++) {
            var component = components[c];

            if (component != null) {
              var componentId = component.id;

              // get the column prefix
              var columnIdPrefix = nodeId + "-" + componentId;

              // get the prompt with the html tags removed
              var prompt = this.UtilService.removeHTMLTags(component.prompt);

              // replace " with ""
              prompt = prompt.replace(/"/g, '""');

              if (prompt == "") {
                prompt = " ";
              }

              if (this.includeStudentWorkIds) {
                // we are exporting student work ids

                // fill in the top 7 cells in the column for this component score
                stepTitleRow[columnIdToColumnIndex[columnIdPrefix + "-studentWorkId"]] = stepTitle;
                componentPartNumberRow[columnIdToColumnIndex[columnIdPrefix + "-studentWorkId"]] = (c + 1);
                componentTypeRow[columnIdToColumnIndex[columnIdPrefix + "-studentWorkId"]] = component.type;
                componentPromptRow[columnIdToColumnIndex[columnIdPrefix + "-studentWorkId"]] = prompt;
                nodeIdRow[columnIdToColumnIndex[columnIdPrefix + "-studentWorkId"]] = nodeId;
                componentIdRow[columnIdToColumnIndex[columnIdPrefix + "-studentWorkId"]] = componentId;
                columnIdRow[columnIdToColumnIndex[columnIdPrefix + "-studentWorkId"]] = columnIdPrefix + "-studentWorkId";
                descriptionRow[columnIdToColumnIndex[columnIdPrefix + "-studentWorkId"]] = "Student Work ID";
              }

              if (this.includeStudentWorkTimestamps) {
                // we are exporting timestamps

                // fill in the top 7 cells in the column for this component score
                stepTitleRow[columnIdToColumnIndex[columnIdPrefix + "-studentWorkTimestamp"]] = stepTitle;
                componentPartNumberRow[columnIdToColumnIndex[columnIdPrefix + "-studentWorkTimestamp"]] = (c + 1);
                componentTypeRow[columnIdToColumnIndex[columnIdPrefix + "-studentWorkTimestamp"]] = component.type;
                componentPromptRow[columnIdToColumnIndex[columnIdPrefix + "-studentWorkTimestamp"]] = prompt;
                nodeIdRow[columnIdToColumnIndex[columnIdPrefix + "-studentWorkTimestamp"]] = nodeId;
                componentIdRow[columnIdToColumnIndex[columnIdPrefix + "-studentWorkTimestamp"]] = componentId;
                columnIdRow[columnIdToColumnIndex[columnIdPrefix + "-studentWorkTimestamp"]] = columnIdPrefix + "-studentWorkTimestamp";
                descriptionRow[columnIdToColumnIndex[columnIdPrefix + "-studentWorkTimestamp"]] = "Student Work Timestamp";
              }

              if (this.includeStudentWork) {
                // we are exporting student work

                // fill in the top 7 cells in the column for this component student work
                stepTitleRow[columnIdToColumnIndex[columnIdPrefix + "-studentWork"]] = stepTitle;
                componentPartNumberRow[columnIdToColumnIndex[columnIdPrefix + "-studentWork"]] = (c + 1);
                componentTypeRow[columnIdToColumnIndex[columnIdPrefix + "-studentWork"]] = component.type;
                componentPromptRow[columnIdToColumnIndex[columnIdPrefix + "-studentWork"]] = prompt;
                nodeIdRow[columnIdToColumnIndex[columnIdPrefix + "-studentWork"]] = nodeId;
                componentIdRow[columnIdToColumnIndex[columnIdPrefix + "-studentWork"]] = componentId;
                columnIdRow[columnIdToColumnIndex[columnIdPrefix + "-studentWork"]] = columnIdPrefix + "-studentWork";
                descriptionRow[columnIdToColumnIndex[columnIdPrefix + "-studentWork"]] = "Student Work";
              }

              if (this.includeScoreTimestamps) {
                // we are exporting score timestamps

                // fill in the top 7 cells in the column for this component score timestamp
                stepTitleRow[columnIdToColumnIndex[columnIdPrefix + "-scoreTimestamp"]] = stepTitle;
                componentPartNumberRow[columnIdToColumnIndex[columnIdPrefix + "-scoreTimestamp"]] = (c + 1);
                componentTypeRow[columnIdToColumnIndex[columnIdPrefix + "-scoreTimestamp"]] = component.type;
                componentPromptRow[columnIdToColumnIndex[columnIdPrefix + "-scoreTimestamp"]] = prompt;
                nodeIdRow[columnIdToColumnIndex[columnIdPrefix + "-scoreTimestamp"]] = nodeId;
                componentIdRow[columnIdToColumnIndex[columnIdPrefix + "-scoreTimestamp"]] = componentId;
                columnIdRow[columnIdToColumnIndex[columnIdPrefix + "-scoreTimestamp"]] = columnIdPrefix + "-scoreTimestamp";
                descriptionRow[columnIdToColumnIndex[columnIdPrefix + "-scoreTimestamp"]] = "Score Timestamp";
              }

              if (this.includeScores) {
                // we are exporting scores

                // fill in the top 7 cells in the column for this component score
                stepTitleRow[columnIdToColumnIndex[columnIdPrefix + "-score"]] = stepTitle;
                componentPartNumberRow[columnIdToColumnIndex[columnIdPrefix + "-score"]] = (c + 1);
                componentTypeRow[columnIdToColumnIndex[columnIdPrefix + "-score"]] = component.type;
                componentPromptRow[columnIdToColumnIndex[columnIdPrefix + "-score"]] = prompt;
                nodeIdRow[columnIdToColumnIndex[columnIdPrefix + "-score"]] = nodeId;
                componentIdRow[columnIdToColumnIndex[columnIdPrefix + "-score"]] = componentId;
                columnIdRow[columnIdToColumnIndex[columnIdPrefix + "-score"]] = columnIdPrefix + "-score";
                descriptionRow[columnIdToColumnIndex[columnIdPrefix + "-score"]] = "Score";
              }

              if (this.includeCommentTimestamps) {
                // we are exporting comment timestamps

                // fill in the top 7 cells in the column for this component comment timestamp
                stepTitleRow[columnIdToColumnIndex[columnIdPrefix + "-commentTimestamp"]] = stepTitle;
                componentPartNumberRow[columnIdToColumnIndex[columnIdPrefix + "-commentTimestamp"]] = (c + 1);
                componentTypeRow[columnIdToColumnIndex[columnIdPrefix + "-commentTimestamp"]] = component.type;
                componentPromptRow[columnIdToColumnIndex[columnIdPrefix + "-commentTimestamp"]] = prompt;
                nodeIdRow[columnIdToColumnIndex[columnIdPrefix + "-commentTimestamp"]] = nodeId;
                componentIdRow[columnIdToColumnIndex[columnIdPrefix + "-commentTimestamp"]] = componentId;
                columnIdRow[columnIdToColumnIndex[columnIdPrefix + "-commentTimestamp"]] = columnIdPrefix + "-commentTimestamp";
                descriptionRow[columnIdToColumnIndex[columnIdPrefix + "-commentTimestamp"]] = "Comment Timestamp";
              }

              if (this.includeComments) {
                // we are exporting comments

                // fill in the top 7 cells in the column for this component comment
                stepTitleRow[columnIdToColumnIndex[columnIdPrefix + "-comment"]] = stepTitle;
                componentPartNumberRow[columnIdToColumnIndex[columnIdPrefix + "-comment"]] = (c + 1);
                componentTypeRow[columnIdToColumnIndex[columnIdPrefix + "-comment"]] = component.type;
                componentPromptRow[columnIdToColumnIndex[columnIdPrefix + "-comment"]] = prompt;
                nodeIdRow[columnIdToColumnIndex[columnIdPrefix + "-comment"]] = nodeId;
                componentIdRow[columnIdToColumnIndex[columnIdPrefix + "-comment"]] = componentId;
                columnIdRow[columnIdToColumnIndex[columnIdPrefix + "-comment"]] = columnIdPrefix + "-comment";
                descriptionRow[columnIdToColumnIndex[columnIdPrefix + "-comment"]] = "Comment";
              }
            }
          }
        }

        if (this.includeBranchPathTakenNodeId) {
          // we are exporting branch path taken node ids

          if (this.ProjectService.isBranchPoint(nodeId)) {
            // this step is a branch point

            // fill in the top 7 cells in the column for this step branch path taken node id
            stepTitleRow[columnIdToColumnIndex[nodeId + "-branchPathTakenNodeId"]] = stepTitle;
            componentPartNumberRow[columnIdToColumnIndex[nodeId + "-branchPathTakenNodeId"]] = " ";
            componentTypeRow[columnIdToColumnIndex[nodeId + "-branchPathTakenNodeId"]] = " ";
            componentPromptRow[columnIdToColumnIndex[nodeId + "-branchPathTakenNodeId"]] = " ";
            nodeIdRow[columnIdToColumnIndex[nodeId + "-branchPathTakenNodeId"]] = nodeId;
            componentIdRow[columnIdToColumnIndex[nodeId + "-branchPathTakenNodeId"]] = " ";
            columnIdRow[columnIdToColumnIndex[nodeId + "-branchPathTakenNodeId"]] = nodeId + "-branchPathTakenNodeId";
            descriptionRow[columnIdToColumnIndex[nodeId + "-branchPathTakenNodeId"]] = "Branch Path Taken Node ID";
          }
        }

        if (this.includeBranchPathTaken) {
          // we are exporting the branch path taken

          if (this.ProjectService.isBranchPoint(nodeId)) {
            // this step is a branch point

            // fill in the top 7 cells in the column for this step branch path taken
            stepTitleRow[columnIdToColumnIndex[nodeId + "-branchPathTaken"]] = stepTitle;
            componentPartNumberRow[columnIdToColumnIndex[nodeId + "-branchPathTaken"]] = " ";
            componentTypeRow[columnIdToColumnIndex[nodeId + "-branchPathTaken"]] = " ";
            componentPromptRow[columnIdToColumnIndex[nodeId + "-branchPathTaken"]] = " ";
            nodeIdRow[columnIdToColumnIndex[nodeId + "-branchPathTaken"]] = nodeId;
            componentIdRow[columnIdToColumnIndex[nodeId + "-branchPathTaken"]] = " ";
            columnIdRow[columnIdToColumnIndex[nodeId + "-branchPathTaken"]] = nodeId + "-branchPathTaken";
            descriptionRow[columnIdToColumnIndex[nodeId + "-branchPathTaken"]] = "Branch Path Taken";
          }
        }

        if (this.includeBranchPathTakenStepTitle) {
          // we are exporting branch path taken step titles

          if (this.ProjectService.isBranchPoint(nodeId)) {
            // this step is a branch point

            // fill in the top 7 cells in the column for this step branch path taken step title
            stepTitleRow[columnIdToColumnIndex[nodeId + "-branchPathTakenStepTitle"]] = stepTitle;
            componentPartNumberRow[columnIdToColumnIndex[nodeId + "-branchPathTakenStepTitle"]] = " ";
            componentTypeRow[columnIdToColumnIndex[nodeId + "-branchPathTakenStepTitle"]] = " ";
            componentPromptRow[columnIdToColumnIndex[nodeId + "-branchPathTakenStepTitle"]] = " ";
            nodeIdRow[columnIdToColumnIndex[nodeId + "-branchPathTakenStepTitle"]] = nodeId;
            componentIdRow[columnIdToColumnIndex[nodeId + "-branchPathTakenStepTitle"]] = " ";
            columnIdRow[columnIdToColumnIndex[nodeId + "-branchPathTakenStepTitle"]] = nodeId + "-branchPathTakenStepTitle";
            descriptionRow[columnIdToColumnIndex[nodeId + "-branchPathTakenStepTitle"]] = "Branch Path Taken Step Title";
          }
        }
      }
    }

    var topRows = [];

    // add all the top rows
    topRows.push(stepTitleRow);
    topRows.push(componentPartNumberRow);
    topRows.push(componentTypeRow);
    topRows.push(componentPromptRow);
    topRows.push(nodeIdRow);
    topRows.push(componentIdRow);
    topRows.push(columnIdRow);
    topRows.push(descriptionRow);

    return topRows;
  }

  /**
   * Get the component service for a component type
   * @param componentType the component type
   * @return the component service or null if it doesn't exist
   */
  getComponentService(componentType) {

    var componentService = null;

    if (componentType != null) {

      /*
       * check our mapping of component type to component service to see
       * if we have already retrieved the component service before
       */
      componentService = this.componentTypeToComponentService[componentType];

      if (componentService == null) {
        /*
         * we have not retrieved this component service before so we
         * will get it
         */
        var componentService = this.$injector.get(componentType + 'Service');

        /*
         * save the component service to our mapping for easy retrieval
         * in the future
         */
        this.componentTypeToComponentService[componentType] = componentService;
      }
    }

    return componentService;
  }

  /**
   * Check if we want to export this node
   * @param selectedNodesMap a mapping of node id to boolean value of whether
   * the researcher has checked the node
   * @param nodeId the node id
   * @return whether the node was checked
   */
  exportNode(selectedNodesMap, nodeId) {
    if (selectedNodesMap == null || this.isNodeSelected(selectedNodesMap, nodeId)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Check if we want to export this component
   * @param selectedNodesMap a mapping of node id to boolean value of whether
   * the researcher has checked the node
   * @param nodeId the node id
   * @param componentId the component id
   * @return whether the component was checked
   */
  exportComponent(selectedNodesMap, nodeId, componentId) {
    if (selectedNodesMap == null || this.isComponentSelected(selectedNodesMap, nodeId, componentId)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * The "Export One Workgroup Per Row" button was clicked so we will display the
   * view for it
   */
  exportOneWorkgroupPerRowClicked() {

    // set the export type
    this.exportType = 'oneWorkgroupPerRow';
  }

  /**
   * Get the node position
   * @param nodeId the node id
   * @returns the node position
   */
  getNodePositionById(nodeId) {
    return this.ProjectService.getNodePositionById(nodeId);
  };

  /**
   * Get the node title for a node
   * @param nodeId the node id
   * @returns the node title
   */
  getNodeTitleByNodeId(nodeId) {
    return this.ProjectService.getNodeTitleByNodeId(nodeId);
  };

  /**
   * Check if a node id is for a group
   * @param nodeId
   * @returns whether the node is a group node
   */
  isGroupNode(nodeId) {
    return this.ProjectService.isGroupNode(nodeId);
  };

  /**
   * Check if the node is in any branch path
   * @param nodeId the node id of the node
   * @return whether the node is in any branch path
   */
  isNodeInAnyBranchPath(nodeId) {
    return this.ProjectService.isNodeInAnyBranchPath(nodeId);
  }

  /**
   * The default button was clicked
   */
  defaultClicked() {
    // set the default export settings
    this.setDefaultExportSettings();
  }

  /**
   * The everything button was clicked
   */
  everythingClicked() {
    // enable all the settings

    // settings for one workgroup per row export
    this.includeStudentWork = true;
    this.includeStudentWorkIds = true;
    this.includeStudentNames = true;
    this.includeStudentWorkTimestamps = true;
    this.includeBranchPathTaken = true;
    this.includeBranchPathTakenStepTitle = true;
    this.includeBranchPathTakenNodeId = true;
    this.includeScores = true;
    this.includeScoreTimestamps = true;
    this.includeComments = true;
    this.includeCommentTimestamps = true;
    this.exportStepSelectionType = 'exportAllSteps';

    // settings for raw data export
    this.includeAnnotations = true;
    this.includeEvents = true;
  }

  /**
   * Set the default export settings
   */
  setDefaultExportSettings() {
    // enable the default settings

    // settings for one workgroup per row export
    this.includeStudentWork = true;
    this.includeStudentWorkIds = false;
    if (this.canViewStudentNames) {
      this.includeStudentNames = true;
    } else {
      this.includeStudentNames = false;
    }
    this.includeStudentWorkTimestamps = false;
    this.includeBranchPathTaken = true;
    this.includeBranchPathTakenStepTitle = false;
    this.includeBranchPathTakenNodeId = false;
    this.includeScores = false;
    this.includeScoreTimestamps = false;
    this.includeComments = false;
    this.includeCommentTimestamps = false;
    this.exportStepSelectionType = 'exportAllSteps';

    // settings for raw data export
    this.includeAnnotations = false;
    this.includeEvents = false;

    /*
     * remove checked fields that may have been accidentally saved by the
     * authoring tool or grading tool
     */
    this.ProjectService.cleanupBeforeSave();
  }

  /**
   * The "Export Raw Data" button was clicked
   */
  rawDataExportClicked() {
    // set the export type
    this.exportType = 'rawData';
  }

  /**
   * Export the raw data
   */
  exportRawData() {
    this.showDownloadingExportMessage();
    var selectedNodes = null;

    /*
     * holds the mappings from nodeid or nodeid-componentid to a boolean
     * value of whether the node was selected
     * example
     * selectedNodesMap["node3"] = true
     * selectedNodesMap["node4-wt38sdf1d3"] = true
     */
    var selectedNodesMap = null;

    if (this.exportStepSelectionType === "exportSelectSteps") {
      // get the steps that were selected
      var selectedNodes = this.getSelectedNodesToExport();

      if (selectedNodes == null || selectedNodes.length == 0) {
        /*
         * the user did not select any steps to export so we will not
         * generate the export
         */
        alert('Please select a step to export.');
        return;
      } else {
        /*
         * the user has selected some steps/components so we will
         * generate a selected nodes map
         */
        selectedNodesMap = this.getSelectedNodesMap(selectedNodes);
      }
    }

    // request the student data from the server and then generate the export
    this.TeacherDataService.getExport("rawData", selectedNodes).then((result) => {

      // get the run id
      var runId = this.ConfigService.getRunId();

      var data = {};

      // get the workgroups in the class
      var workgroups = this.ConfigService.getClassmateUserInfosSortedByWorkgroupId();

      // make a copy of the workgroups array to prevent referencing issues
      workgroups = this.UtilService.makeCopyOfJSONObject(workgroups);

      // loop through all the workgroups
      for (var w = 0; w < workgroups.length; w++) {
        var workgroup = workgroups[w];

        if (workgroup != null) {
          if (!this.includeStudentNames) {
            this.removeNamesFromWorkgroup(workgroup);
          }

          // get the workgroup id
          var workgroupId = workgroup.workgroupId;

          if (this.includeStudentWork) {
            // the user wants to export the student work
            workgroup.studentWork = [];

            // get all the component states for the workgroup
            var componentStates = this.TeacherDataService.getComponentStatesByWorkgroupId(workgroupId);

            if (componentStates != null) {

              // loop through all the component states
              for (var c = 0; c < componentStates.length; c++) {
                var componentState = componentStates[c];

                if (componentState != null) {

                  // get the composite id. example 'node2-b34gaf0ug2'
                  var compositeId = this.getCompositeId(componentState);

                  if (selectedNodesMap == null || (compositeId != null && selectedNodesMap[compositeId] == true)) {
                    /*
                     * we are exporting all steps or the step was selected
                     * so we will add the component state
                     */
                    workgroup.studentWork.push(componentState);
                  }
                }
              }
            }
          }

          if (this.includeAnnotations) {
            // the user wants to export the annotations
            workgroup.annotations = [];

            // get all the annotations for the workgroup
            var annotations = this.TeacherDataService.getAnnotationsToWorkgroupId(workgroupId);

            if (annotations != null) {

              // loop through all the annotations for the workgroup
              for (var a = 0; a < annotations.length; a++) {
                var annotation = annotations[a];

                if (annotation != null) {

                  // get the composite id. example 'node2-b34gaf0ug2'
                  var compositeId = this.getCompositeId(annotation);

                  if (selectedNodesMap == null || (compositeId != null && selectedNodesMap[compositeId] == true)) {
                    /*
                     * we are exporting all steps or the step was selected
                     * so we will add the annotation
                     */
                    workgroup.annotations.push(annotation);
                  }
                }
              }
            }
          }

          if (this.includeEvents) {
            // the user wants to export the events
            workgroup.events = [];

            var events = [];

            // get all the events for the workgroup
            var events = this.TeacherDataService.getEventsByWorkgroupId(workgroupId);

            if (events != null) {

              // loop through all the events for the workgroup
              for (var e = 0; e < events.length; e++) {
                var event = events[e];

                if (event != null) {

                  // get the composite id. example 'node2-b34gaf0ug2'
                  var compositeId = this.getCompositeId(event);

                  if (selectedNodesMap == null || (compositeId != null && selectedNodesMap[compositeId] == true)) {
                    /*
                     * we are exporting all steps or the step was selected
                     * so we will add the event
                     */
                    workgroup.events.push(event);
                  }
                }
              }
            }
          }
        }
      }

      // add the workgroups to the data
      data.workgroups = workgroups;

      // get the data as a JSON string
      var dataJSONString = angular.toJson(data, 4);

      // get the data JSON string as a blob
      var blob = new Blob([dataJSONString]);

      // generate a file and download it to the user's computer
      this.FileSaver.saveAs(blob, runId + "_raw_data.json");
      this.hideDownloadingExportMessage();
    });
  }

  removeNamesFromWorkgroup(workgroup) {
    delete workgroup.username;
    delete workgroup.displayNames;
    for (let user of workgroup.users) {
    delete user.name;
    delete user.firstName;
    delete user.lastName;
    }
  }

  /**
   * Get the composite id for a given object
   * @param object a component state, annotation, or event
   * @return the composite id for the object
   * example
   * 'node3'
   * 'node4-wt38sdf1d3'
   */
  getCompositeId(object) {
    var compositeId = null;

    if (object.nodeId != null) {
      // the object has a node id
      compositeId = object.nodeId;
    }

    if (object.componentId != null) {
      // the object has a component id
      compositeId += '-' + object.componentId;
    }

    return compositeId;
  }

  /**
   * Check if a component type has a specific export implemented for it.
   * @param componentType The component type.
   * @return Whether the component type has a specific export.
   */
  canExportComponentDataType(componentType) {
    for (let tempComponentType of this.availableComponentDataExports) {
      if (componentType == tempComponentType) {
        return true;
      }
    }
    return false;
  }

  /**
   * Show the page where users can export work for a specific component.
   */
  showExportComponentDataPage() {
    this.workSelectionType = 'exportAllWork';
    this.includeCorrectnessColumns = true;
    this.includeOnlySubmits = false;
    this.exportType = 'componentData';
  }

  /**
   * Export the work for a specific component.
   * @param nodeId The node id.
   * @param component The component content object.
   */
  exportComponentClicked(nodeId, component) {
    if (component.type == 'Match') {
      this.exportMatchComponent(nodeId, component);
    } else if (component.type === 'Discussion') {
      this.exportDiscussionComponent(nodeId, component);
    }
  }

  /**
   * Generate an export for a specific Discussion component.
   * TODO: Move these Discussion export functions to the DiscussionService.
   * @param nodeId The node id.
   * @param component The component content object.
   */
  exportDiscussionComponent(nodeId, component) {
    this.showDownloadingExportMessage();
    this.TeacherDataService.getExport("allStudentWork").then((result) => {
      const columnNames = [];
      const columnNameToNumber = {};
      let rows = [this.generateDiscussionComponentHeaderRow(component, columnNames, columnNameToNumber)];
      rows = rows.concat(this.generateDiscussionComponentWorkRows(component, columnNames, columnNameToNumber, nodeId));
      const fileName = this.generateDiscussionExportFileName(nodeId, component.id);
      this.generateCSVFile(rows, fileName);
      this.hideDownloadingExportMessage();
    });
  }

  generateDiscussionComponentHeaderRow(component, columnNames, columnNameToNumber) {
    this.populateDiscussionColumnNames(component, columnNames, columnNameToNumber);
    const headerRow = [];
    for (let columnName of columnNames) {
      headerRow.push(columnName);
    }
    return headerRow;
  }

  populateDiscussionColumnNames(component, columnNames, columnNameToNumber) {
    const defaultDiscussionColumnNames = [
      "#",
      "Workgroup ID",
      "WISE ID 1",
      "Student Name 1",
      "WISE ID 2",
      "Student Name 2",
      "WISE ID 3",
      "Student Name 3",
      "Class Period",
      "Project ID",
      "Project Name",
      "Run ID",
      "Start Date",
      "End Date",
      "Server Timestamp",
      "Client Timestamp",
      "Node ID",
      "Component ID",
      "Component Part Number",
      "Step Title",
      "Component Type",
      "Component Prompt",
      "Student Data",
      "Thread ID",
      "Student Work ID",
      "Post Level",
      "Post Text"
    ];
    for (let c = 0; c < defaultDiscussionColumnNames.length; c++) {
      const defaultDiscussionColumnName = defaultDiscussionColumnNames[c];
      columnNameToNumber[defaultDiscussionColumnName] = c;
      columnNames.push(defaultDiscussionColumnName);
    }
  }

  generateDiscussionComponentWorkRows(component, columnNames, columnNameToNumber, nodeId) {
    const rows = [];
    const componentStates = this.TeacherDataService.getComponentStatesByComponentId(component.id);
    const structuredPosts = this.getStructuredPosts(componentStates);
    let rowCounter = 1;
    for (let threadId of Object.keys(structuredPosts)) {
      let topLevelPost = structuredPosts[threadId];
      rows.push(this.generateDiscussionComponentWorkRow(component, topLevelPost.workgroupId, columnNames,
          columnNameToNumber, nodeId, component.id, rowCounter, topLevelPost, threadId));
      rowCounter++;
      if (topLevelPost.replies != null) {
        for (let replyPost of topLevelPost.replies) {
          rows.push(this.generateDiscussionComponentWorkRow(component, replyPost.workgroupId, columnNames,
            columnNameToNumber, nodeId, component.id, rowCounter, replyPost, threadId));
          rowCounter++;
        }
      }
    }
    return rows;
  }

  generateDiscussionComponentWorkRow(component, workgroupId, columnNames, columnNameToNumber,
                     nodeId, componentId, rowCounter, componentState, threadId) {
    const row = new Array(columnNames.length);
    row.fill("");
    const userInfo = this.ConfigService.getUserInfoByWorkgroupId(workgroupId);
    if (userInfo != null) {
      if (userInfo.users[0] != null) {
      row[columnNameToNumber["WISE ID 1"]] = userInfo.users[0].id;
      }
      if (userInfo.users[1] != null) {
      row[columnNameToNumber["WISE ID 2"]] = userInfo.users[1].id;
      }
      if (userInfo.users[2] != null) {
      row[columnNameToNumber["WISE ID 3"]] = userInfo.users[2].id;
      }
      row[columnNameToNumber["Class Period"]] = userInfo.periodName;
    }

    row[columnNameToNumber["#"]] = rowCounter;
    row[columnNameToNumber["Project ID"]] = this.ConfigService.getProjectId();
    row[columnNameToNumber["Project Name"]] = this.ProjectService.getProjectTitle();
    row[columnNameToNumber["Run ID"]] = this.ConfigService.getRunId();

    if (componentState.serverSaveTime != null) {
      row[columnNameToNumber["Server Timestamp"]] =
          this.UtilService.convertMillisecondsToFormattedDateTime(componentState.serverSaveTime);
    }

    if (componentState.clientSaveTime != null) {
      const clientSaveTime = new Date(componentState.clientSaveTime);
      row[columnNameToNumber["Client Timestamp"]] =
          clientSaveTime.toDateString() + " " + clientSaveTime.toLocaleTimeString();
    }

    row[columnNameToNumber["Node ID"]] = nodeId;
    row[columnNameToNumber["Step Title"]] =
        this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
    row[columnNameToNumber["Component Part Number"]] =
        this.ProjectService.getComponentPositionByNodeIdAndComponentId(nodeId, componentId) + 1;
    row[columnNameToNumber["Component ID"]] = component.id;
    row[columnNameToNumber["Component Type"]] = component.type;
    row[columnNameToNumber["Component Prompt"]] = this.UtilService.removeHTMLTags(component.prompt);
    row[columnNameToNumber["Student Data"]] = componentState.studentData;
    row[columnNameToNumber["Student Work ID"]] = componentState.id;
    row[columnNameToNumber["Thread ID"]] = threadId;
    row[columnNameToNumber["Workgroup ID"]] = workgroupId;
    row[columnNameToNumber["Post Level"]] = this.getPostLevel(componentState);
    row[columnNameToNumber["Post Text"]] = this.UtilService.removeHTMLTags(componentState.studentData.response);

    return row;
  }

  getStructuredPosts(componentStates) {
    const structuredPosts = {};
    for (let componentState of componentStates) {
      if (this.isTopLevelPost(componentState)) {
        structuredPosts[componentState.id] = componentState;
      } else if (this.isReply(componentState)) {
        this.addReplyToTopLevelPost(structuredPosts, componentState);
      }
    }
    return structuredPosts;
  }

  isTopLevelPost(componentState) {
    return componentState.studentData.componentStateIdReplyingTo == null;
  }

  isReply(componentState) {
    return componentState.studentData.componentStateIdReplyingTo != null;
  }

  addReplyToTopLevelPost(structuredPosts, replyComponentState) {
    const parentComponentStateId = replyComponentState.studentData.componentStateIdReplyingTo;
    const parentPost = structuredPosts[parentComponentStateId];
    if (parentPost.replies == null) {
      parentPost.replies = [];
    }
    parentPost.replies.push(replyComponentState);
  }

  getPostLevel(componentState) {
    if (this.isTopLevelPost(componentState)) {
      return 1;
    } else if (this.isReply(componentState)) {
      return 2;
    }
  }

  generateDiscussionExportFileName(nodeId, componentId) {
    const runId = this.ConfigService.getRunId();
    const stepNumber = this.ProjectService.getNodePositionById(nodeId);
    const componentNumber =
        this.ProjectService.getComponentPositionByNodeIdAndComponentId(nodeId, componentId) + 1;
    return runId + '_step_' + stepNumber + '_component_' + componentNumber + '_discussion_work.csv';
  }

  /**
   * Generate an export for a specific match component.
   * TODO: Move these Match export functions to the MatchService.
   * @param nodeId The node id.
   * @param component The component content object.
   */
  exportMatchComponent(nodeId, component) {
    this.showDownloadingExportMessage();
    // request the student data from the server and then generate the export
    this.TeacherDataService.getExport("allStudentWork").then((result) => {
      // the column names in the header row
      let columnNames = [];

      // mapping from column name to column number
      let columnNameToNumber = {};

      // the rows that will be in the export
      let rows = [];

      // add the header row to the rows
      rows.push(this.generateMatchComponentHeaderRow(component, columnNames, columnNameToNumber));

      // add the student work rows
      rows = rows.concat(this.generateMatchComponentWorkRows(component, columnNames, columnNameToNumber, nodeId));

      // generate the file name of the csv file
      let fileName = "";
      let runId = this.ConfigService.getRunId();
      let stepNumber = this.ProjectService.getNodePositionById(nodeId);
      let componentNumber = this.ProjectService.getComponentPositionByNodeIdAndComponentId(nodeId, component.id) + 1;
      if (this.workSelectionType === 'exportAllWork') {
        fileName = runId + '_step_' + stepNumber + '_component_' + componentNumber + '_all_match_work.csv';
      } else if (this.workSelectionType === 'exportLatestWork') {
        fileName = runId + '_step_' + stepNumber + '_component_' + componentNumber + '_latest_match_work.csv';
      }

      // generate the csv file and have the client download it
      this.generateCSVFile(rows, fileName);
      this.hideDownloadingExportMessage();
    });
  }

  /**
   * Populate the array of header column names.
   * Populate the mappings of column name to column number.
   * @param component The component content object.
   * @param columnNames An array that we will populate with column names.
   * @param columnNameToNumber An object that we will populate with mappings
   * of column name to column number.
   */
  populateMatchColumnNames(component, columnNames, columnNameToNumber) {

    // an array of column names
    let defaultMatchColumnNames = [
      "#",
      "Workgroup ID",
      "WISE ID 1",
      "Student Name 1",
      "WISE ID 2",
      "Student Name 2",
      "WISE ID 3",
      "Student Name 3",
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
      "Step Title",
      "Component Type",
      "Component Prompt",
      "Student Data",
      "Component Revision Counter",
      "Is Submit",
      "Submit Count"
    ];

    /*
     * Add the default column names that contain the information about the
     * student, project, run, node, and component.
     */
    for (let c = 0; c < defaultMatchColumnNames.length; c++) {
      // get a column name
      let defaultMatchColumnName = defaultMatchColumnNames[c];

      // add a mapping from column name to column number
      columnNameToNumber[defaultMatchColumnName] = c;

      // add the column name to the header row
      columnNames.push(defaultMatchColumnName);
    }

    // Add the header cells for the choices
    for (let choice of component.choices) {
      columnNameToNumber[choice.id] = columnNames.length;
      columnNames.push(choice.value);
    }

    // Add the header cells for the choice correctness
    if (this.includeCorrectnessColumns &&
        this.MatchService.hasCorrectAnswer(component)) {
      for (let choice of component.choices) {
        columnNameToNumber[choice.id + '-boolean'] = columnNames.length;
        columnNames.push(choice.value);
      }
      columnNameToNumber['Is Correct'] = columnNames.length;
      columnNames.push('Is Correct');
    }
  }

  /**
   * Generate the header row.
   * @param component The component content object.
   * @param columnNames An array of column names.
   * @param columnNameToNumber An object containing the mappings from column
   * name to column number.
   */
  generateMatchComponentHeaderRow(component, columnNames, columnNameToNumber) {
    this.populateMatchColumnNames(component, columnNames, columnNameToNumber);
    let headerRow = [];

    // generate the header row by looping through all the column names
    for (let columnName of columnNames) {
      // add the column name to the header row
      headerRow.push(columnName);
    }

    return headerRow;
  }

  /**
   * Generate all the rows for all the workgroups.
   * @param component The component content object.
   * @param columnNames All the header column names.
   * @param columnNameToNumber The mapping from column name to column number.
   * @param nodeId The node id the component is in.
   * @return An array of rows.
   */
  generateMatchComponentWorkRows(component, columnNames, columnNameToNumber, nodeId) {
    let componentId = component.id;

    // get the workgroups in the class
    let workgroups = this.ConfigService.getClassmateUserInfosSortedByWorkgroupId();

    // the rows that will show up in the export
    let rows = [];

    let rowCounter = 1;

    for (let workgroup of workgroups) {
      let rowsForWorkgroup = this.generateMatchComponentWorkRowsForWorkgroup(component, workgroup, columnNames, columnNameToNumber, nodeId, componentId, rowCounter);
      rows = rows.concat(rowsForWorkgroup);
      rowCounter += rowsForWorkgroup.length;
    }

    return rows;
  }

  /**
   * Generate all the rows for a workgroup.
   * @param component The component content object.
   * @param workgroup The workgroup.
   * @param columnNames An array of column name headers.
   * @param columnNameToNumber The mapping from column name to column number.
   * @param nodeId The node the component is in.
   * @param componentId The component id.
   * @param rowCounter The current row number we will be creating.
   */
  generateMatchComponentWorkRowsForWorkgroup(component, workgroup, columnNames, columnNameToNumber, nodeId, componentId, rowCounter) {
    let rows = [];

    // get the workgroup information
    let workgroupId = workgroup.workgroupId;
    let periodName = workgroup.periodName;
    let userInfo = this.ConfigService.getUserInfoByWorkgroupId(workgroupId);
    let extractedWISEIDsAndStudentNames = this.extractWISEIDsAndStudentNames(userInfo.users);

    /*
     * a mapping from component to component revision counter.
     * the key will be {{nodeId}}_{{componentId}} and the
     * value will be a number.
     */
    let componentRevisionCounter = {};

    let matchComponentStates = this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(workgroupId, componentId);

    if (matchComponentStates != null) {
      for (let c = 0; c < matchComponentStates.length; c++) {
        let matchComponentState = matchComponentStates[c];
        let exportRow = true;

        if (this.includeOnlySubmits && !matchComponentState.isSubmit) {
          exportRow = false;
        } else if (this.workSelectionType == 'exportLatestWork' &&
            c != matchComponentStates.length - 1) {
          /*
           * We are only exporting the latest work and this component state
           * is not the last component state for this workgroup.
           */
          exportRow = false;
        }

        if (exportRow) {
          // add the row to the rows that will show up in the export
          rows.push(this.generateMatchComponentWorkRow(component,
            columnNames, columnNameToNumber, rowCounter, workgroupId,
            extractedWISEIDsAndStudentNames['wiseId1'],
            extractedWISEIDsAndStudentNames['wiseId2'],
            extractedWISEIDsAndStudentNames['wiseId3'],
            extractedWISEIDsAndStudentNames['studentName1'],
            extractedWISEIDsAndStudentNames['studentName2'],
            extractedWISEIDsAndStudentNames['studentName3'],
            periodName, componentRevisionCounter, matchComponentState));
          rowCounter++;
        } else {
          /*
           * We do not want to add this row in the export but
           * we still want to increment the revision counter.
           */
          this.incrementRevisionCounter(componentRevisionCounter, nodeId, componentId);
        }
      }
    }

    return rows;
  }

  /**
   * Generate the row for the component state.
   * @param component The component content object.
   * @param columnNames All the header column names.
   * @param columnNameToNumber The mapping from column name to column number.
   * @param rowCounter The current row number.
   * @param workgroupId The workgroup id.
   * @param wiseId1 The WISE ID 1.
   * @param wiseId2 The WISE ID 2.
   * @param wiseId3 The WISE ID 3.
   * @param periodName The period name.
   * @param componentRevisionCounter The mapping of component to revision counter.
   * @param matchComponentState The component state.
   * @return The row with the student work.
   */
  generateMatchComponentWorkRow(component, columnNames, columnNameToNumber, rowCounter, workgroupId, wiseId1, wiseId2, wiseId3, studentName1, studentName2, studentName3, periodName, componentRevisionCounter, matchComponentState) {

    /*
     * Populate the cells in the row that contain the information about the
     * student, project, run, step, and component.
     */
    let row = this.createStudentWorkExportRow(columnNames, columnNameToNumber, rowCounter, workgroupId, wiseId1, wiseId2, wiseId3, studentName1, studentName2, studentName3, periodName, componentRevisionCounter, matchComponentState);

    for (let bucket of matchComponentState.studentData.buckets) {

      // loop through all the choices that the student put in this bucket
      for (let item of bucket.items) {
        // put the bucket name in the column corresponding to the choice
        row[columnNameToNumber[item.id]] = bucket.value;

        if (this.includeCorrectnessColumns &&
            this.MatchService.hasCorrectAnswer(component)) {
          this.setCorrectnessValue(row, columnNameToNumber, item);
        }
      }
    }

    return row;
  }

  /**
   * Set the correctness boolean value into the cell.
   * @param row The row we are working on.
   * @param columnNameToNumber The mapping from column name to column number.
   * @param item The choice object.
   */
  setCorrectnessValue(row, columnNameToNumber, item) {
    let columnName = item.id + '-boolean';
    if (item.isCorrect == null) {
      /*
       * The item does not have an isCorrect field so we will not show
       * anything in the cell.
       */
    } else if (item.isCorrect) {
      // The student placed the choice in the correct bucket
      row[columnNameToNumber[columnName]] = 1;
    } else {
      if (item.isIncorrectPosition) {
        /*
         * The student placed the choice in the correct bucket but
         * in the wrong position.
         */
        row[columnNameToNumber[columnName]] = 2;
      } else {
        // The student placed the choice in the wrong bucket
        row[columnNameToNumber[columnName]] = 0;
      }
    }
  }

  showDownloadingExportMessage() {
    this.$mdDialog.show({
      template: `
        <div align="center">
          <div style="width: 200px; height: 100px; margin: 20px;">
            <span>{{ 'downloadingExport' | translate }}</span>
            <br/>
            <br/>
            <md-progress-circular md-mode="indeterminate"></md-progress-circular>
          </div>
        </div>
      `,
      clickOutsideToClose: false
    });
  }

  hideDownloadingExportMessage() {
    this.$mdDialog.hide();
  }
}

DataExportController.$inject = [
  '$filter',
  '$injector',
  '$mdDialog',
  '$rootScope',
  '$scope',
  '$state',
  'AnnotationService',
  'ConfigService',
  'FileSaver',
  'MatchService',
  'ProjectService',
  'StudentStatusService',
  'TeacherDataService',
  'TeacherWebSocketService',
  'UtilService'
];

export default DataExportController;
