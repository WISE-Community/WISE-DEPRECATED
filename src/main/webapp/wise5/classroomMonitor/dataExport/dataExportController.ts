'use strict';

import { AnnotationService } from '../../services/annotationService';
import { ConfigService } from '../../services/configService';
import { MatchService } from '../../components/match/matchService';
import { TeacherDataService } from '../../services/teacherDataService';
import { UtilService } from '../../services/utilService';
import * as angular from 'angular';
import { TeacherProjectService } from '../../services/teacherProjectService';

class DataExportController {
  $translate: any;
  availableComponentAllRevisionsDataExports = ['Discussion', 'Match'];
  availableComponentLatestRevisionsDataExports = ['Match'];
  componentExportTooltips = {};
  canViewStudentNames: boolean = false;
  componentTypeToComponentService: any = {};
  exportStepSelectionType: string = 'exportAllSteps';
  exportType: string = null; // type of export: [latestWork, allWork, events]
  includeAnnotations: boolean;
  includeBranchPathTaken: boolean;
  includeBranchPathTakenNodeId: boolean;
  includeBranchPathTakenStepTitle: boolean;
  includeComments: boolean;
  includeCommentTimestamps: boolean;
  includeCorrectnessColumns: boolean;
  includeEvents: boolean;
  includeOnlySubmits: boolean;
  includeNames: boolean;
  includeScores: boolean;
  includeScoreTimestamps: boolean;
  includeStudentNames: boolean;
  includeStudentEvents: boolean;
  includeTeacherEvents: boolean;
  includeStudentWork: boolean;
  includeStudentWorkIds: boolean;
  includeStudentWorkTimestamps: boolean;
  project: any;
  projectIdToOrder: any;
  projectItems: any;
  workSelectionType: string;

  static $inject = [
    '$filter',
    '$injector',
    '$mdDialog',
    '$state',
    'AnnotationService',
    'ConfigService',
    'FileSaver',
    'MatchService',
    'ProjectService',
    'TeacherDataService',
    'UtilService'
  ];

  constructor(
    $filter: any,
    private $injector: any,
    private $mdDialog: any,
    private $state: any,
    private AnnotationService: AnnotationService,
    private ConfigService: ConfigService,
    private FileSaver: any,
    private MatchService: MatchService,
    private ProjectService: TeacherProjectService,
    private TeacherDataService: TeacherDataService,
    private UtilService: UtilService
  ) {
    this.canViewStudentNames = this.ConfigService.getPermissions().canViewStudentNames;
    this.$translate = $filter('translate');
    this.componentExportTooltips['Match'] = this.$translate('matchCorrectnessColumnKey');
    this.setDefaultExportSettings();
    this.project = this.ProjectService.project;
    let nodeOrderOfProject = this.ProjectService.getNodeOrderOfProject(this.project);
    this.projectIdToOrder = nodeOrderOfProject.idToOrder;
    this.projectItems = nodeOrderOfProject.nodes;
    const context = 'ClassroomMonitor',
      nodeId = null,
      componentId = null,
      componentType = null,
      category = 'Navigation',
      event = 'dataExportViewDisplayed',
      data = {};
    this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      event,
      data
    );
  }

  /**
   * Export all or latest work for this run in CSV format
   * latestWork, allWork, and events will call this function with a null exportType.
   */
  export(exportType = this.exportType) {
    const context = 'ClassroomMonitor',
      nodeId = null,
      componentId = null,
      componentType = null,
      category = 'UserInteraction',
      event = 'exportRequested',
      data = { exportType: exportType };
    this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      event,
      data
    );
    if (exportType === 'allStudentWork') {
      this.exportAllStudentWork();
    } else if (exportType === 'latestStudentWork') {
      this.exportLatestStudentWork();
    } else if (exportType === 'events') {
      this.exportEvents();
    } else if (exportType === 'latestNotebookItems' || exportType === 'allNotebookItems') {
      this.exportNotebookItems(exportType);
    } else if (exportType === 'notifications') {
      this.exportNotifications();
    } else if (exportType === 'studentAssets') {
      this.exportStudentAssets();
    } else if (exportType === 'oneWorkgroupPerRow') {
      this.exportOneWorkgroupPerRow();
    } else if (exportType === 'rawData') {
      this.exportRawData();
    }
  }

  exportAllStudentWork() {
    this.exportStudentWork('allStudentWork');
  }

  exportLatestStudentWork() {
    this.exportStudentWork('latestStudentWork');
  }

  /**
   * Export all the student work
   * @param exportType the export type e.g. "allStudentWork" or "latestStudentWork"
   */
  exportStudentWork(exportType) {
    this.showDownloadingExportMessage();
    var selectedNodes = null;
    var selectedNodesMap = null;
    if (this.exportStepSelectionType === 'exportSelectSteps') {
      selectedNodes = this.getSelectedNodesToExport();
      if (selectedNodes == null || selectedNodes.length == 0) {
        alert('Please select a step to export.');
        return;
      } else {
        selectedNodesMap = this.getSelectedNodesMap(selectedNodes);
      }
    }
    this.TeacherDataService.getExport('allStudentWork', selectedNodes).then((result) => {
      var workgroups = this.ConfigService.getClassmateUserInfosSortedByWorkgroupId();
      var runId = this.ConfigService.getRunId();
      var rows = [];
      var rowCounter = 1;
      var columnNameToNumber = {};
      var columnNames = [
        '#',
        'Workgroup ID',
        'WISE ID 1',
        'Student Name 1',
        'WISE ID 2',
        'Student Name 2',
        'WISE ID 3',
        'Student Name 3',
        'Class Period',
        'Project ID',
        'Project Name',
        'Run ID',
        'Start Date',
        'End Date',
        'Student Work ID',
        'Server Timestamp',
        'Client Timestamp',
        'Node ID',
        'Component ID',
        'Component Part Number',
        'Teacher Score Server Timestamp',
        'Teacher Score Client Timestamp',
        'Teacher Score',
        'Max Teacher Score',
        'Teacher Comment Server Timestamp',
        'Teacher Comment Client Timestamp',
        'Teacher Comment',
        'Auto Score Server Timestamp',
        'Auto Score Client Timestamp',
        'Auto Score',
        'Max Auto Score',
        'Auto Comment Server Timestamp',
        'Auto Comment Client Timestamp',
        'Auto Comment',
        'Step Title',
        'Component Type',
        'Component Prompt',
        'Student Data',
        'Component Revision Counter',
        'Is Correct',
        'Is Submit',
        'Submit Count',
        'Response'
      ];
      var headerRow = [];
      for (var c = 0; c < columnNames.length; c++) {
        var columnName = columnNames[c];
        if (columnName != null) {
          columnNameToNumber[columnName] = c;
        }
        headerRow.push(columnName);
      }
      rows.push(headerRow);
      if (workgroups != null) {
        for (var w = 0; w < workgroups.length; w++) {
          var workgroup = workgroups[w];
          if (workgroup != null) {
            var workgroupId = workgroup.workgroupId;
            var periodName = workgroup.periodName;
            var userInfo = this.ConfigService.getUserInfoByWorkgroupId(workgroupId);
            var extractedWISEIDsAndStudentNames = this.extractWISEIDsAndStudentNames(
              userInfo.users
            );
            /*
             * a mapping from component to component revision counter.
             * the key will be {{nodeId}}_{{componentId}} and the
             * value will be a number.
             */
            var componentRevisionCounter = {};
            let componentStates = [];
            if (exportType === 'allStudentWork') {
              componentStates = this.TeacherDataService.getComponentStatesByWorkgroupId(
                workgroupId
              );
            } else if (exportType === 'latestStudentWork') {
              this.TeacherDataService.injectRevisionCounterIntoComponentStates(
                this.TeacherDataService.getComponentStatesByWorkgroupId(workgroupId)
              );
              componentStates = this.TeacherDataService.getLatestComponentStatesByWorkgroupId(
                workgroupId
              );
            }
            if (componentStates != null) {
              for (var c = 0; c < componentStates.length; c++) {
                var componentState = componentStates[c];
                if (componentState != null) {
                  var exportRow = true;
                  if (this.exportStepSelectionType === 'exportSelectSteps') {
                    if (
                      !this.isComponentSelected(
                        selectedNodesMap,
                        componentState.nodeId,
                        componentState.componentId
                      )
                    ) {
                      exportRow = false;
                    }
                  }
                  if (exportRow) {
                    var row = this.createStudentWorkExportRow(
                      columnNames,
                      columnNameToNumber,
                      rowCounter,
                      workgroupId,
                      extractedWISEIDsAndStudentNames['wiseId1'],
                      extractedWISEIDsAndStudentNames['wiseId2'],
                      extractedWISEIDsAndStudentNames['wiseId3'],
                      extractedWISEIDsAndStudentNames['studentName1'],
                      extractedWISEIDsAndStudentNames['studentName2'],
                      extractedWISEIDsAndStudentNames['studentName3'],
                      periodName,
                      componentRevisionCounter,
                      componentState
                    );
                    rows.push(row);
                    rowCounter++;
                  }
                }
              }
            }
          }
        }
      }
      var fileName = '';
      if (exportType === 'allStudentWork') {
        fileName = runId + '_all_work.csv';
      } else if (exportType === 'latestStudentWork') {
        fileName = runId + '_latest_work.csv';
      }
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
    const extractedWISEIDsAndStudentNames = {};
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
  createStudentWorkExportRow(
    columnNames,
    columnNameToNumber,
    rowCounter,
    workgroupId,
    wiseId1,
    wiseId2,
    wiseId3,
    studentName1,
    studentName2,
    studentName3,
    periodName,
    componentRevisionCounter,
    componentState
  ) {
    var row = new Array(columnNames.length);
    row.fill('');
    row[columnNameToNumber['#']] = rowCounter;
    row[columnNameToNumber['Workgroup ID']] = workgroupId;
    this.setStudentIDsAndNames(
      row,
      columnNameToNumber,
      wiseId1,
      studentName1,
      wiseId2,
      studentName2,
      wiseId3,
      studentName3
    );
    row[columnNameToNumber['Class Period']] = periodName;
    row[columnNameToNumber['Project ID']] = this.ConfigService.getProjectId();
    row[columnNameToNumber['Project Name']] = this.ProjectService.getProjectTitle();
    row[columnNameToNumber['Run ID']] = this.ConfigService.getRunId();
    row[columnNameToNumber['Student Work ID']] = componentState.id;
    if (componentState.serverSaveTime != null) {
      var formattedDateTime = this.UtilService.convertMillisecondsToFormattedDateTime(
        componentState.serverSaveTime
      );
      row[columnNameToNumber['Server Timestamp']] = formattedDateTime;
    }
    if (componentState.clientSaveTime != null) {
      const clientSaveTime = new Date(componentState.clientSaveTime);
      if (clientSaveTime != null) {
        var clientSaveTimeString =
          clientSaveTime.toDateString() + ' ' + clientSaveTime.toLocaleTimeString();
        row[columnNameToNumber['Client Timestamp']] = clientSaveTimeString;
      }
    }
    row[columnNameToNumber['Node ID']] = componentState.nodeId;
    row[columnNameToNumber['Component ID']] = componentState.componentId;
    row[columnNameToNumber['Step Title']] = this.ProjectService.getNodePositionAndTitleByNodeId(
      componentState.nodeId
    );
    var componentPartNumber =
      this.ProjectService.getComponentPositionByNodeIdAndComponentId(
        componentState.nodeId,
        componentState.componentId
      ) + 1;
    row[columnNameToNumber['Component Part Number']] = componentPartNumber;
    var component = this.ProjectService.getComponentByNodeIdAndComponentId(
      componentState.nodeId,
      componentState.componentId
    );
    if (component != null) {
      row[columnNameToNumber['Component Type']] = component.type;
      if (component.prompt != null) {
        var prompt = this.UtilService.removeHTMLTags(component.prompt);
        prompt = prompt.replace(/"/g, '""');
        row[columnNameToNumber['Component Prompt']] = prompt;
      }
    }
    var teacherScoreAnnotation = this.AnnotationService.getLatestTeacherScoreAnnotationByStudentWorkId(
      componentState.id
    );
    var teacherCommentAnnotation = this.AnnotationService.getLatestTeacherCommentAnnotationByStudentWorkId(
      componentState.id
    );
    var autoScoreAnnotation = this.AnnotationService.getLatestAutoScoreAnnotationByStudentWorkId(
      componentState.id
    );
    var autoCommentAnnotation = this.AnnotationService.getLatestAutoCommentAnnotationByStudentWorkId(
      componentState.id
    );
    if (teacherScoreAnnotation != null) {
      if (teacherScoreAnnotation.serverSaveTime != null) {
        var teacherScoreServerSaveTime = new Date(teacherScoreAnnotation.serverSaveTime);
        if (teacherScoreServerSaveTime != null) {
          var teacherScoreServerSaveTimeString =
            teacherScoreServerSaveTime.toDateString() +
            ' ' +
            teacherScoreServerSaveTime.toLocaleTimeString();
          row[
            columnNameToNumber['Teacher Score Server Timestamp']
          ] = teacherScoreServerSaveTimeString;
        }
      }
      if (teacherScoreAnnotation.clientSaveTime != null) {
        var teacherScoreClientSaveTime = new Date(teacherScoreAnnotation.clientSaveTime);
        if (teacherScoreClientSaveTime != null) {
          var teacherScoreClientSaveTimeString =
            teacherScoreClientSaveTime.toDateString() +
            ' ' +
            teacherScoreClientSaveTime.toLocaleTimeString();
          row[
            columnNameToNumber['Teacher Score Client Timestamp']
          ] = teacherScoreClientSaveTimeString;
        }
      }
      var data = teacherScoreAnnotation.data;
      if (data != null) {
        var score = data.value;
        if (score != null) {
          row[columnNameToNumber['Teacher Score']] = score;
        }
        var maxScore = this.ProjectService.getMaxScoreForComponent(
          componentState.nodeId,
          componentState.componentId
        );
        if (maxScore != null) {
          row[columnNameToNumber['Max Teacher Score']] = maxScore;
        }
      }
    }
    if (teacherCommentAnnotation != null) {
      if (teacherCommentAnnotation.serverSaveTime != null) {
        var teacherCommentServerSaveTime = new Date(teacherCommentAnnotation.serverSaveTime);
        if (teacherCommentServerSaveTime != null) {
          var teacherCommentServerSaveTimeString =
            teacherCommentServerSaveTime.toDateString() +
            ' ' +
            teacherCommentServerSaveTime.toLocaleTimeString();
          row[
            columnNameToNumber['Teacher Comment Server Timestamp']
          ] = teacherCommentServerSaveTimeString;
        }
      }
      if (teacherCommentAnnotation.clientSaveTime != null) {
        var teacherCommentClientSaveTime = new Date(teacherCommentAnnotation.clientSaveTime);
        if (teacherCommentClientSaveTime != null) {
          var teacherCommentClientSaveTimeString =
            teacherCommentClientSaveTime.toDateString() +
            ' ' +
            teacherCommentClientSaveTime.toLocaleTimeString();
          row[
            columnNameToNumber['Teacher Comment Client Timestamp']
          ] = teacherCommentClientSaveTimeString;
        }
      }
      var data = teacherCommentAnnotation.data;
      if (data != null) {
        var comment = data.value;
        if (comment != null) {
          row[columnNameToNumber['Teacher Comment']] = comment;
        }
      }
    }
    if (autoScoreAnnotation != null) {
      if (autoScoreAnnotation.serverSaveTime != null) {
        var autoScoreServerSaveTime = new Date(autoScoreAnnotation.serverSaveTime);
        if (autoScoreServerSaveTime != null) {
          // get the auto score server timestamp e.g. Wed Apr 06 2016 9:05:38 AM
          var autoScoreServerSaveTimeString =
            autoScoreServerSaveTime.toDateString() +
            ' ' +
            autoScoreServerSaveTime.toLocaleTimeString();
          row[columnNameToNumber['Auto Score Server Timestamp']] = autoScoreServerSaveTimeString;
        }
      }
      if (autoScoreAnnotation.clientSaveTime != null) {
        var autoScoreClientSaveTime = new Date(autoScoreAnnotation.clientSaveTime);
        if (autoScoreClientSaveTime != null) {
          var autoScoreClientSaveTimeString =
            autoScoreClientSaveTime.toDateString() +
            ' ' +
            autoScoreClientSaveTime.toLocaleTimeString();
          row[columnNameToNumber['Auto Score Client Timestamp']] = autoScoreClientSaveTimeString;
        }
      }
      var data = autoScoreAnnotation.data;
      if (data != null) {
        var autoScore = data.value;
        if (autoScore != null) {
          row[columnNameToNumber['Auto Score']] = autoScore;
        }
        var maxAutoScore = data.maxAutoScore;
        if (maxAutoScore != null) {
          row[columnNameToNumber['Max Auto Score']] = maxAutoScore;
        }
      }
    }
    if (autoCommentAnnotation != null) {
      if (autoCommentAnnotation.serverSaveTime != null) {
        var autoCommentServerSaveTime = new Date(autoCommentAnnotation.serverSaveTime);
        if (autoCommentServerSaveTime != null) {
          var autoCommentServerSaveTimeString =
            autoCommentServerSaveTime.toDateString() +
            ' ' +
            autoCommentServerSaveTime.toLocaleTimeString();
          row[
            columnNameToNumber['Auto Comment Server Timestamp']
          ] = autoCommentServerSaveTimeString;
        }
      }
      if (autoCommentAnnotation.clientSaveTime != null) {
        var autoCommentClientSaveTime = new Date(autoCommentAnnotation.clientSaveTime);
        if (autoCommentClientSaveTime != null) {
          var autoCommentClientSaveTimeString =
            autoCommentClientSaveTime.toDateString() +
            ' ' +
            autoCommentClientSaveTime.toLocaleTimeString();
          row[
            columnNameToNumber['Auto Comment Client Timestamp']
          ] = autoCommentClientSaveTimeString;
        }
      }
      var data = autoCommentAnnotation.data;
      if (data != null) {
        var autoComment = data.value;
        if (autoComment != null) {
          row[columnNameToNumber['Auto Comment']] = this.UtilService.removeHTMLTags(autoComment);
        }
      }
    }
    var studentData = componentState.studentData;
    if (studentData != null) {
      row[columnNameToNumber['Student Data']] = studentData;
      var isCorrect = studentData.isCorrect;
      if (isCorrect != null) {
        if (isCorrect) {
          row[columnNameToNumber['Is Correct']] = 1;
        } else {
          row[columnNameToNumber['Is Correct']] = 0;
        }
      }
    }
    row[columnNameToNumber['Response']] = this.getStudentDataString(componentState);
    let revisionCounter = this.getRevisionCounter(
      componentRevisionCounter,
      componentState.nodeId,
      componentState.componentId
    );
    if (componentState.revisionCounter == null) {
      /*
       * use the revision counter obtained from the componentRevisionCounter
       * mapping. this case will happen when we are exporting all student
       * work.
       */
      row[columnNameToNumber['Component Revision Counter']] = revisionCounter;
    } else {
      /*
       * use the revision counter from the value in the component state.
       * this case will happen when we are exporting latest student work
       * because the revision counter needs to be previously calculated
       * and then set into the component state
       */
      row[columnNameToNumber['Component Revision Counter']] = componentState.revisionCounter;
    }
    this.incrementRevisionCounter(
      componentRevisionCounter,
      componentState.nodeId,
      componentState.componentId
    );
    var isSubmit = componentState.isSubmit;
    if (isSubmit) {
      row[columnNameToNumber['Is Submit']] = 1;
      if (studentData != null) {
        var submitCounter = studentData.submitCounter;
        if (submitCounter != null) {
          row[columnNameToNumber['Submit Count']] = submitCounter;
        }
      }
    } else {
      row[columnNameToNumber['Is Submit']] = 0;
    }
    return row;
  }

  setStudentIDsAndNames(
    row: any[],
    columnNameToNumber: any,
    wiseId1: number,
    studentName1: string,
    wiseId2: number,
    studentName2: string,
    wiseId3: number,
    studentName3: string
  ) {
    if (wiseId1 != null) {
      row[columnNameToNumber['WISE ID 1']] = wiseId1;
    }
    if (studentName1 != null && this.includeStudentNames) {
      row[columnNameToNumber['Student Name 1']] = studentName1;
    }
    if (wiseId2 != null) {
      row[columnNameToNumber['WISE ID 2']] = wiseId2;
    }
    if (studentName2 != null && this.includeStudentNames) {
      row[columnNameToNumber['Student Name 2']] = studentName2;
    }
    if (wiseId3 != null) {
      row[columnNameToNumber['WISE ID 3']] = wiseId3;
    }
    if (studentName3 != null && this.includeStudentNames) {
      row[columnNameToNumber['Student Name 3']] = studentName3;
    }
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
    let studentDataString = ' ';
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
    let nodeIdAndComponentId = nodeId + '_' + componentId;
    if (componentRevisionCounter[nodeIdAndComponentId] == null) {
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
    let nodeIdAndComponentId = nodeId + '_' + componentId;
    if (componentRevisionCounter[nodeIdAndComponentId] == null) {
      componentRevisionCounter[nodeIdAndComponentId] = 1;
    }
    let revisionCounter = componentRevisionCounter[nodeIdAndComponentId];
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
      if (
        nodeId != null &&
        componentId != null &&
        selectedNodesMap[nodeId + '-' + componentId] == true
      ) {
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
    var csvString = '';
    if (rows != null) {
      for (var r = 0; r < rows.length; r++) {
        var row = rows[r];
        if (row != null) {
          for (var c = 0; c < row.length; c++) {
            var cell = row[c];
            if (cell == null || cell === '' || typeof cell === 'undefined') {
              cell = ' ';
            } else if (typeof cell === 'object') {
              /*
               * the cell value is an object so we will obtain the
               * string representation of the object and wrap it
               * in quotes
               */
              cell = JSON.stringify(cell);
              cell = cell.replace(/"/g, '""');
              if (cell != null && cell.length >= 32767) {
                /*
                 * the cell value is larger than the allowable
                 * excel cell size so we will display the string
                 * "Data Too Large" instead
                 */
                cell = 'Data Too Large';
              }
              cell = '"' + cell + '"';
            } else if (typeof cell === 'string') {
              if (cell != null && cell.length >= 32767) {
                /*
                 * the cell value is larger than the allowable
                 * excel cell size so we will display the string
                 * "Data Too Large" instead
                 */
                cell = 'Data Too Large';
              }
              cell = '"' + cell + '"';
            }
            csvString += cell + ',';
          }
          csvString += '\r\n';
        }
      }
    }
    const csvBlob = new Blob([csvString], { type: 'text/csv; charset=utf-8' });
    this.FileSaver.saveAs(csvBlob, fileName);
  }

  escapeContent(str) {
    return str.replace(/[\n]/g, '\\n').replace(/[\r]/g, '\\r').replace(/[\t]/g, '\\t');
  }

  exportEvents() {
    this.showDownloadingExportMessage();
    this.TeacherDataService.retrieveEventsExport(
      this.includeStudentEvents,
      this.includeTeacherEvents,
      this.includeStudentNames
    ).then(() => {
      this.handleExportEventsCallback();
    });
  }

  handleExportEventsCallback() {
    const rows = [];
    const columnNames = this.getEventsColumnNames();
    const columnNameToNumber = this.getColumnNameToNumber(columnNames);
    rows.push(this.createHeaderRow(columnNames));
    let rowCounter = 1;
    if (this.includeStudentEvents) {
      rowCounter = this.addStudentEvents(rows, rowCounter, columnNames, columnNameToNumber);
    }
    if (this.includeTeacherEvents) {
      rowCounter = this.addTeacherEvents(rows, rowCounter, columnNames, columnNameToNumber);
    }
    const fileName = this.ConfigService.getRunId() + '_events.csv';
    this.generateCSVFile(rows, fileName);
    this.hideDownloadingExportMessage();
  }

  getEventsColumnNames() {
    return [
      '#',
      'Workgroup ID',
      'User Type',
      'Student WISE ID 1',
      'Student Name 1',
      'Student WISE ID 2',
      'Student Name 2',
      'Student WISE ID 3',
      'Student Name 3',
      'Teacher WISE ID',
      'Teacher Username',
      'Class Period',
      'Project ID',
      'Project Name',
      'Run ID',
      'Start Date',
      'End Date',
      'Event ID',
      'Server Timestamp',
      'Client Timestamp',
      'Node ID',
      'Component ID',
      'Component Part Number',
      'Step Title',
      'Component Type',
      'Component Prompt',
      'JSON',
      'Context',
      'Category',
      'Event',
      'Data'
    ];
  }

  getColumnNameToNumber(columnNames) {
    const columnNameToNumber = {};
    for (let c = 0; c < columnNames.length; c++) {
      columnNameToNumber[columnNames[c]] = c;
    }
    return columnNameToNumber;
  }

  createHeaderRow(columnNames) {
    const headerRow = [];
    for (const columnName of columnNames) {
      headerRow.push(columnName);
    }
    return headerRow;
  }

  addStudentEvents(rows, rowCounter, columnNames, columnNameToNumber) {
    const workgroups = this.ConfigService.getClassmateUserInfosSortedByWorkgroupId();
    for (const workgroup of workgroups) {
      const workgroupId = workgroup.workgroupId;
      const periodName = workgroup.periodName;
      const userInfo = this.ConfigService.getUserInfoByWorkgroupId(workgroupId);
      const extractedWISEIDsAndStudentNames = this.extractWISEIDsAndStudentNames(userInfo.users);
      const events = this.TeacherDataService.getEventsByWorkgroupId(workgroupId);
      for (const event of events) {
        const row = this.createStudentEventExportRow(
          columnNames,
          columnNameToNumber,
          rowCounter,
          workgroupId,
          extractedWISEIDsAndStudentNames['wiseId1'],
          extractedWISEIDsAndStudentNames['wiseId2'],
          extractedWISEIDsAndStudentNames['wiseId3'],
          extractedWISEIDsAndStudentNames['studentName1'],
          extractedWISEIDsAndStudentNames['studentName2'],
          extractedWISEIDsAndStudentNames['studentName3'],
          periodName,
          event
        );
        rows.push(row);
        rowCounter++;
      }
    }
    return rowCounter;
  }

  addTeacherEvents(rows, rowCounter, columnNames, columnNameToNumber) {
    const userInfo = this.ConfigService.getTeacherUserInfo();
    const username = this.getTeacherUsername(userInfo);
    const workgroupId = userInfo.workgroupId;
    const events = this.TeacherDataService.getEventsByWorkgroupId(workgroupId);
    for (const event of events) {
      const row = this.createTeacherEventExportRow(
        columnNames,
        columnNameToNumber,
        rowCounter,
        userInfo.workgroupId,
        userInfo.wiseId,
        username,
        event
      );
      rows.push(row);
      rowCounter++;
    }
    return rowCounter;
  }

  getTeacherUsername(userInfo) {
    let username = '';
    if (this.includeNames) {
      username = userInfo.username;
    }
    return username;
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
  createStudentEventExportRow(
    columnNames,
    columnNameToNumber,
    rowCounter,
    workgroupId,
    wiseId1,
    wiseId2,
    wiseId3,
    studentName1,
    studentName2,
    studentName3,
    periodName,
    event
  ) {
    const row = this.createRow(columnNames.length);
    this.setRowCounter(row, columnNameToNumber, rowCounter);
    this.setWorkgroupId(row, columnNameToNumber, workgroupId);
    this.setUserType(row, columnNameToNumber, 'Student');
    this.setStudentIDs(row, columnNameToNumber, wiseId1, wiseId2, wiseId3);
    this.setStudentNames(row, columnNameToNumber, studentName1, studentName2, studentName3);
    this.setPeriodName(row, columnNameToNumber, periodName);
    this.setProjectId(row, columnNameToNumber);
    this.setProjectName(row, columnNameToNumber);
    this.setRunId(row, columnNameToNumber);
    this.setEventId(row, columnNameToNumber, event);
    this.setServerSaveTime(row, columnNameToNumber, event);
    this.setClientSaveTime(row, columnNameToNumber, event);
    this.setNodeId(row, columnNameToNumber, event);
    this.setRowComponentId(row, columnNameToNumber, event);
    this.setTitle(row, columnNameToNumber, event);
    this.setComponentPartNumber(row, columnNameToNumber, event);
    this.setComponentTypeAndPrompt(row, columnNameToNumber, event);
    this.setEventJSON(row, columnNameToNumber, event);
    this.setContext(row, columnNameToNumber, event);
    this.setCategory(row, columnNameToNumber, event);
    this.setEvent(row, columnNameToNumber, event);
    this.setEventData(row, columnNameToNumber, event);
    this.setResponse(row, columnNameToNumber, event);
    return row;
  }

  createRow(length) {
    const row = new Array(length);
    row.fill('');
    return row;
  }

  setRowCounter(row, columnNameToNumber, rowCounter) {
    row[columnNameToNumber['#']] = rowCounter;
  }

  setWorkgroupId(row, columnNameToNumber, workgroupId) {
    row[columnNameToNumber['Workgroup ID']] = workgroupId;
  }

  setUserType(row, columnNameToNumber, userType) {
    row[columnNameToNumber['User Type']] = userType;
  }

  setPeriodName(row, columnNameToNumber, periodName) {
    row[columnNameToNumber['Class Period']] = periodName;
  }

  setProjectId(row, columnNameToNumber) {
    row[columnNameToNumber['Project ID']] = this.ConfigService.getProjectId();
  }

  setProjectName(row, columnNameToNumber) {
    row[columnNameToNumber['Project Name']] = this.ProjectService.getProjectTitle();
  }

  setRunId(row, columnNameToNumber) {
    row[columnNameToNumber['Run ID']] = this.ConfigService.getRunId();
  }

  setEventId(row, columnNameToNumber, data) {
    row[columnNameToNumber['Event ID']] = data.id;
  }

  setStudentIDs(row, columnNameToNumber, wiseId1, wiseId2, wiseId3) {
    if (wiseId1 != null) {
      row[columnNameToNumber['Student WISE ID 1']] = wiseId1;
    }
    if (wiseId2 != null) {
      row[columnNameToNumber['Student WISE ID 2']] = wiseId2;
    }
    if (wiseId3 != null) {
      row[columnNameToNumber['Student WISE ID 3']] = wiseId3;
    }
  }

  setStudentNames(row, columnNameToNumber, studentName1, studentName2, studentName3) {
    if (studentName1 != null && this.includeNames) {
      row[columnNameToNumber['Student Name 1']] = studentName1;
    }
    if (studentName2 != null && this.includeNames) {
      row[columnNameToNumber['Student Name 2']] = studentName2;
    }
    if (studentName3 != null && this.includeNames) {
      row[columnNameToNumber['Student Name 3']] = studentName3;
    }
  }

  setServerSaveTime(row, columnNameToNumber, data) {
    row[
      columnNameToNumber['Server Timestamp']
    ] = this.UtilService.convertMillisecondsToFormattedDateTime(data.serverSaveTime);
  }

  setClientSaveTime(row, columnNameToNumber, data) {
    row[
      columnNameToNumber['Client Timestamp']
    ] = this.UtilService.convertMillisecondsToFormattedDateTime(data.clientSaveTime);
  }

  setNodeId(row, columnNameToNumber, data) {
    if (data.nodeId != null) {
      row[columnNameToNumber['Node ID']] = data.nodeId;
    }
  }

  setRowComponentId(row, columnNameToNumber, data) {
    if (data.componentId != null) {
      row[columnNameToNumber['Component ID']] = data.componentId;
    }
  }

  setTitle(row, columnNameToNumber, data) {
    const stepTitle = this.ProjectService.getNodePositionAndTitleByNodeId(data.nodeId);
    if (stepTitle != null) {
      row[columnNameToNumber['Step Title']] = stepTitle;
    }
  }

  setComponentPartNumber(row, columnNameToNumber, data) {
    const componentPartNumber = this.ProjectService.getComponentPositionByNodeIdAndComponentId(
      data.nodeId,
      data.componentId
    );
    if (componentPartNumber != -1) {
      row[columnNameToNumber['Component Part Number']] = componentPartNumber + 1;
    }
  }

  setComponentTypeAndPrompt(row, columnNameToNumber, data) {
    const nodeId = data.nodeId;
    const componentId = data.componentId;
    if (nodeId != null && componentId != null) {
      const component = this.ProjectService.getComponentByNodeIdAndComponentId(
        data.nodeId,
        data.componentId
      );
      this.setComponentType(row, columnNameToNumber, component);
      this.setComponentPrompt(row, columnNameToNumber, component);
    }
  }

  setComponentType(row, columnNameToNumber, component) {
    if (component != null) {
      row[columnNameToNumber['Component Type']] = component.type;
    }
  }

  setComponentPrompt(row, columnNameToNumber, component) {
    if (component != null) {
      let prompt = this.UtilService.removeHTMLTags(component.prompt);
      prompt = prompt.replace(/"/g, '""');
      row[columnNameToNumber['Component Prompt']] = prompt;
    }
  }

  setEventJSON(row, columnNameToNumber, data) {
    row[columnNameToNumber['JSON']] = data;
  }

  setContext(row, columnNameToNumber, data) {
    if (data.context != null) {
      row[columnNameToNumber['Context']] = data.context;
    }
  }

  setCategory(row, columnNameToNumber, data) {
    if (data.category != null) {
      row[columnNameToNumber['Category']] = data.category;
    }
  }

  setEvent(row, columnNameToNumber, data) {
    if (data.event != null) {
      row[columnNameToNumber['Event']] = data.event;
    }
  }

  setEventData(row, columnNameToNumber, data) {
    row[columnNameToNumber['Data']] = data.data;
  }

  setResponse(row, columnNameToNumber, data) {
    const response = this.getEventResponse(event);
    row[columnNameToNumber['Response']] = response;
  }

  createTeacherEventExportRow(
    columnNames,
    columnNameToNumber,
    rowCounter,
    workgroupId,
    wiseId,
    username,
    event
  ) {
    const row = this.createRow(columnNames.length);
    this.setRowCounter(row, columnNameToNumber, rowCounter);
    this.setWorkgroupId(row, columnNameToNumber, workgroupId);
    this.setUserType(row, columnNameToNumber, 'Teacher');
    this.setTeacherWISEId(row, columnNameToNumber, wiseId);
    this.setTeacherUsername(row, columnNameToNumber, username);
    this.setProjectId(row, columnNameToNumber);
    this.setProjectName(row, columnNameToNumber);
    this.setRunId(row, columnNameToNumber);
    this.setEventId(row, columnNameToNumber, event);
    this.setServerSaveTime(row, columnNameToNumber, event);
    this.setClientSaveTime(row, columnNameToNumber, event);
    this.setEventJSON(row, columnNameToNumber, event);
    this.setContext(row, columnNameToNumber, event);
    this.setCategory(row, columnNameToNumber, event);
    this.setEvent(row, columnNameToNumber, event);
    this.setEventData(row, columnNameToNumber, event);
    this.setResponse(row, columnNameToNumber, event);
    return row;
  }

  setTeacherWISEId(row, columnNameToNumber, wiseId) {
    row[columnNameToNumber['Teacher WISE ID']] = wiseId;
  }

  setTeacherUsername(row, columnNameToNumber, username) {
    if (this.includeNames) {
      row[columnNameToNumber['Teacher Username']] = username;
    }
  }

  /**
   * Get the pretty printed representation of the event
   * @param event the event JSON object
   * @return the pretty printed representation of the event
   */
  getEventResponse(event) {
    var response = ' ';
    if (event != null) {
      if (event.event == 'branchPathTaken') {
        /*
         * this is a branch path taken event so we will show the title
         * of the first step in the branch path that was taken
         */
        if (event.data != null && event.data.toNodeId != null) {
          var toNodeId = event.data.toNodeId;
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
        rows.push(this.createExportNotebookItemRow(columnNames, columnNameToNumber, notebookItem));
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
      notebookItem.nodeId,
      notebookItem.componentId
    );
    if (component != null) {
      row[columnNameToNumber['Component Type']] = component.type;
    }
    row[columnNameToNumber['Step Number']] = this.getNodePositionById(notebookItem.nodeId);
    row[columnNameToNumber['Step Title']] = this.getNodeTitleByNodeId(notebookItem.nodeId);
    const position = this.ProjectService.getComponentPositionByNodeIdAndComponentId(
      notebookItem.nodeId,
      notebookItem.componentId
    );
    if (position != -1) {
      row[columnNameToNumber['Component Part Number']] = position + 1;
    }
    row[
      columnNameToNumber['Client Save Time']
    ] = this.UtilService.convertMillisecondsToFormattedDateTime(notebookItem.clientSaveTime);
    row[
      columnNameToNumber['Server Save Time']
    ] = this.UtilService.convertMillisecondsToFormattedDateTime(notebookItem.serverSaveTime);
    row[columnNameToNumber['Type']] = notebookItem.type;
    row[columnNameToNumber['Content']] = JSON.parse(notebookItem.content);
    row[columnNameToNumber['Run ID']] = notebookItem.runId;
    row[columnNameToNumber['Workgroup ID']] = notebookItem.workgroupId;
    const userInfo = this.ConfigService.getUserInfoByWorkgroupId(notebookItem.workgroupId);
    if (notebookItem.localNotebookItemId !== 'teacherReport') {
      row[columnNameToNumber['Period ID']] = notebookItem.periodId;
      row[columnNameToNumber['Period Name']] = userInfo.periodName;
    }
    row[columnNameToNumber['Teacher Username']] = this.ConfigService.getTeacherUserInfo().username;
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
      row[columnNameToNumber['Response']] = this.UtilService.removeHTMLTags(responseJSON.content);
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
        rows.push(this.createExportNotificationRow(columnNames, columnNameToNumber, notification));
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
      notification.nodeId,
      notification.componentId
    );
    if (component != null) {
      row[columnNameToNumber['Component Type']] = component.type;
    }
    row[columnNameToNumber['Step Number']] = this.getNodePositionById(notification.nodeId);
    row[columnNameToNumber['Step Title']] = this.getNodeTitleByNodeId(notification.nodeId);
    const componentPosition = this.ProjectService.getComponentPositionByNodeIdAndComponentId(
      notification.nodeId,
      notification.componentId
    );
    if (componentPosition != -1) {
      row[columnNameToNumber['Component Part Number']] = componentPosition + 1;
    }
    row[
      columnNameToNumber['Server Save Time']
    ] = this.UtilService.convertMillisecondsToFormattedDateTime(notification.serverSaveTime);
    row[
      columnNameToNumber['Time Generated']
    ] = this.UtilService.convertMillisecondsToFormattedDateTime(notification.timeGenerated);
    if (notification.timeDismissed != null) {
      row[
        columnNameToNumber['Time Dismissed']
      ] = this.UtilService.convertMillisecondsToFormattedDateTime(notification.timeDismissed);
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
    const userInfo = this.ConfigService.getUserInfoByWorkgroupId(notification.toWorkgroupId);
    row[columnNameToNumber['Period Name']] = userInfo.periodName;
    row[columnNameToNumber['Teacher Username']] = this.ConfigService.getTeacherUserInfo().username;
    row[columnNameToNumber['Project ID']] = this.ConfigService.getProjectId();
    if (userInfo.users != null) {
      this.addStudentWISEIDsToNotificationRow(row, columnNameToNumber, userInfo);
    }
    return row;
  }

  addStudentWISEIDsToNotificationRow(row: any, columnNameToNumber: any, userInfo: any) {
    for (let i = 0; i <= 2; i++) {
      const student = userInfo.users[i];
      if (student != null) {
        row[columnNameToNumber[`WISE ID ${i + 1}`]] = student.id;
      }
    }
    return row;
  }

  exportStudentAssets() {
    this.showDownloadingExportMessage();
    this.TeacherDataService.getExport('studentAssets').then(() => {
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
    const selectedNodes = [];
    for (let n = 0; n < this.projectItems.length; n++) {
      let item = this.projectItems[n];
      if (item.node.type === 'node') {
        let nodeId = item.node.id;
        if (item.checked) {
          const selectedStep = {
            nodeId: nodeId
          };
          selectedNodes.push(selectedStep);
        }
        if (item.node.components != null && item.node.components.length > 0) {
          item.node.components.map((component) => {
            if (component.checked) {
              const selectedComponent = {
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
  getSelectedNodesMap(selectedNodes = []) {
    const selectedNodesMap = {};
    for (var sn = 0; sn < selectedNodes.length; sn++) {
      var selectedNode = selectedNodes[sn];
      if (selectedNode != null) {
        var nodeId = selectedNode.nodeId;
        var componentId = selectedNode.componentId;
        var selectedNodeString = '';
        if (nodeId != null && componentId != null) {
          selectedNodeString = nodeId + '-' + componentId;
        } else if (nodeId != null) {
          selectedNodeString = nodeId;
        }
        if (selectedNodeString != null && selectedNodeString != '') {
          selectedNodesMap[selectedNodeString] = true;
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
    if (nodeItem.node != null) {
      var node = nodeItem.node;
      if (node.ids != null) {
        for (var n = 0; n < node.ids.length; n++) {
          var nodeId = node.ids[n];
          var childNodeItem = this.projectIdToOrder[nodeId];
          childNodeItem.checked = nodeItem.checked;
          var components = childNodeItem.node.components;
          if (components != null) {
            for (var c = 0; c < components.length; c++) {
              components[c].checked = nodeItem.checked;
            }
          }
        }
      } else if (node.components != null) {
        if (nodeItem.checked) {
          if (
            nodeItem.node != null &&
            nodeItem.node.components != null &&
            nodeItem.node.components.length > 0
          ) {
            nodeItem.node.components.map((componentItem) => {
              componentItem.checked = true;
            });
          }
        } else {
          if (
            nodeItem.node != null &&
            nodeItem.node.components != null &&
            nodeItem.node.components.length > 0
          ) {
            nodeItem.node.components.map((componentItem) => {
              componentItem.checked = false;
            });
          }
        }
      }
    }
  }

  selectAll(doSelect = true) {
    if (this.projectIdToOrder != null) {
      for (let nodeId in this.projectIdToOrder) {
        let projectItem = this.projectIdToOrder[nodeId];
        if (projectItem.order != 0) {
          projectItem.checked = doSelect;
          if (projectItem.node.type != 'group') {
            if (
              projectItem.node != null &&
              projectItem.node.components != null &&
              projectItem.node.components.length > 0
            ) {
              projectItem.node.components.map((componentItem) => {
                componentItem.checked = doSelect;
              });
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
    window.open(`${this.ConfigService.getConfigParam('previewProjectURL')}`);
  }

  previewNode(node) {
    window.open(`${this.ConfigService.getConfigParam('previewProjectURL')}/${node.id}`);
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
    if (this.exportStepSelectionType === 'exportSelectSteps') {
      selectedNodes = this.getSelectedNodesToExport();
      if (selectedNodes == null || selectedNodes.length == 0) {
        alert('Please select a step to export.');
        return;
      } else {
        selectedNodesMap = this.getSelectedNodesMap(selectedNodes);
      }
    }

    this.TeacherDataService.getExport('oneWorkgroupPerRow', selectedNodes).then((result) => {
      var rows = [];
      var projectId = this.ConfigService.getProjectId();
      var projectTitle = this.ProjectService.getProjectTitle();
      var runId = this.ConfigService.getRunId();
      var startDate = '';
      var endDate = '';
      var columnIds = this.getColumnIdsForOneWorkgroupPerRow(selectedNodesMap);
      var nodeIds = this.ProjectService.getFlattenedProjectAsNodeIds();
      var descriptionRowHeaders = [
        'Workgroup ID',
        'WISE ID 1',
        'Student Name 1',
        'WISE ID 2',
        'Student Name 2',
        'WISE ID 3',
        'Student Name 3',
        'Class Period',
        'Project ID',
        'Project Name',
        'Run ID',
        'Start Date',
        'End Date'
      ];
      var columnIdToColumnIndex = this.getColumnIdToColumnIndex(columnIds, descriptionRowHeaders);
      var topRows = this.getOneWorkgroupPerRowTopRows(
        columnIds,
        columnIdToColumnIndex,
        descriptionRowHeaders
      );
      rows = rows.concat(topRows);
      var workgroups = this.ConfigService.getClassmateUserInfosSortedByWorkgroupId();
      for (var w = 0; w < workgroups.length; w++) {
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
          workgroupRow.fill(' ');
          var workgroupId = workgroup.workgroupId;
          var periodName = workgroup.periodName;
          var userInfo = this.ConfigService.getUserInfoByWorkgroupId(workgroupId);
          workgroupRow[columnIdToColumnIndex['Workgroup ID']] = workgroupId;
          var extractedWISEIDsAndStudentNames = this.extractWISEIDsAndStudentNames(userInfo.users);
          var wiseId1 = extractedWISEIDsAndStudentNames['wiseId1'];
          var wiseId2 = extractedWISEIDsAndStudentNames['wiseId2'];
          var wiseId3 = extractedWISEIDsAndStudentNames['wiseId3'];
          var studentName1 = extractedWISEIDsAndStudentNames['studentName1'];
          var studentName2 = extractedWISEIDsAndStudentNames['studentName2'];
          var studentName3 = extractedWISEIDsAndStudentNames['studentName3'];
          if (wiseId1 != null) {
            workgroupRow[columnIdToColumnIndex['WISE ID 1']] = wiseId1;
          }
          if (studentName1 != null && this.includeStudentNames) {
            workgroupRow[columnIdToColumnIndex['Student Name 1']] = studentName1;
          }
          if (wiseId2 != null) {
            workgroupRow[columnIdToColumnIndex['WISE ID 2']] = wiseId2;
          }
          if (studentName2 != null && this.includeStudentNames) {
            workgroupRow[columnIdToColumnIndex['Student Name 2']] = studentName2;
          }
          if (wiseId3 != null) {
            workgroupRow[columnIdToColumnIndex['WISE ID 3']] = wiseId3;
          }
          if (studentName3 != null && this.includeStudentNames) {
            workgroupRow[columnIdToColumnIndex['Student Name 3']] = studentName3;
          }
          workgroupRow[columnIdToColumnIndex['Class Period']] = periodName;
          workgroupRow[columnIdToColumnIndex['Project ID']] = projectId;
          workgroupRow[columnIdToColumnIndex['Project Name']] = projectTitle;
          workgroupRow[columnIdToColumnIndex['Run ID']] = runId;
          workgroupRow[columnIdToColumnIndex['Start Date']] = startDate;
          workgroupRow[columnIdToColumnIndex['End Date']] = endDate;
          for (var n = 0; n < nodeIds.length; n++) {
            var nodeId = nodeIds[n];
            var components = this.ProjectService.getComponentsByNodeId(nodeId);
            if (components != null) {
              for (var c = 0; c < components.length; c++) {
                var component = components[c];
                if (component != null) {
                  var componentId = component.id;
                  if (this.exportComponent(selectedNodesMap, nodeId, componentId)) {
                    var columnIdPrefix = nodeId + '-' + componentId;
                    var componentState = this.TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(
                      workgroupId,
                      nodeId,
                      componentId
                    );
                    if (componentState != null) {
                      if (this.includeStudentWorkIds) {
                        workgroupRow[columnIdToColumnIndex[columnIdPrefix + '-studentWorkId']] =
                          componentState.id;
                      }
                      if (this.includeStudentWorkTimestamps) {
                        if (componentState.serverSaveTime != null) {
                          var formattedDateTime = this.UtilService.convertMillisecondsToFormattedDateTime(
                            componentState.serverSaveTime
                          );
                          workgroupRow[
                            columnIdToColumnIndex[columnIdPrefix + '-studentWorkTimestamp']
                          ] = formattedDateTime;
                        }
                      }
                      workgroupRow[
                        columnIdToColumnIndex[columnIdPrefix + '-studentWork']
                      ] = this.getStudentDataString(componentState);
                      if (this.includeScores || this.includeComments) {
                        var latestComponentAnnotations = this.AnnotationService.getLatestComponentAnnotations(
                          nodeId,
                          componentId,
                          workgroupId
                        );
                        if (latestComponentAnnotations != null) {
                          var scoreAnnotation = latestComponentAnnotations.score;
                          var commentAnnotation = latestComponentAnnotations.comment;
                          if (scoreAnnotation != null) {
                            if (this.includeScoreTimestamps) {
                              var scoreTimestamp = this.UtilService.convertMillisecondsToFormattedDateTime(
                                scoreAnnotation.serverSaveTime
                              );
                              workgroupRow[
                                columnIdToColumnIndex[columnIdPrefix + '-scoreTimestamp']
                              ] = scoreTimestamp;
                            }
                            if (this.includeScores) {
                              if (
                                scoreAnnotation.data != null &&
                                scoreAnnotation.data.value != null
                              ) {
                                var scoreValue = scoreAnnotation.data.value;
                                workgroupRow[
                                  columnIdToColumnIndex[columnIdPrefix + '-score']
                                ] = scoreValue;
                              }
                            }
                          }
                          if (commentAnnotation != null) {
                            if (this.includeCommentTimestamps) {
                              var commentTimestamp = this.UtilService.convertMillisecondsToFormattedDateTime(
                                commentAnnotation.serverSaveTime
                              );
                              workgroupRow[
                                columnIdToColumnIndex[columnIdPrefix + '-commentTimestamp']
                              ] = commentTimestamp;
                            }
                            if (this.includeComments) {
                              if (
                                commentAnnotation.data != null &&
                                commentAnnotation.data.value != null
                              ) {
                                var commentValue = commentAnnotation.data.value;
                                workgroupRow[
                                  columnIdToColumnIndex[columnIdPrefix + '-comment']
                                ] = commentValue;
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
              if (this.ProjectService.isBranchPoint(nodeId)) {
                var toNodeId = null;
                var stepTitle = null;
                var eventType = 'branchPathTaken';
                var latestBranchPathTakenEvent = this.TeacherDataService.getLatestEventByWorkgroupIdAndNodeIdAndType(
                  workgroupId,
                  nodeId,
                  eventType
                );
                if (
                  latestBranchPathTakenEvent != null &&
                  latestBranchPathTakenEvent.data != null &&
                  latestBranchPathTakenEvent.data.toNodeId != null
                ) {
                  toNodeId = latestBranchPathTakenEvent.data.toNodeId;
                  stepTitle = this.ProjectService.getNodePositionAndTitleByNodeId(toNodeId);
                }
                if (this.includeBranchPathTakenNodeId) {
                  if (toNodeId != null) {
                    workgroupRow[
                      columnIdToColumnIndex[nodeId + '-branchPathTakenNodeId']
                    ] = toNodeId;
                  } else {
                    workgroupRow[columnIdToColumnIndex[nodeId + '-branchPathTakenNodeId']] = ' ';
                  }
                }
                if (this.includeBranchPathTaken) {
                  var branchLetter = this.ProjectService.getBranchLetter(toNodeId);
                  if (stepTitle != null) {
                    workgroupRow[columnIdToColumnIndex[nodeId + '-branchPathTaken']] = branchLetter;
                  } else {
                    workgroupRow[columnIdToColumnIndex[nodeId + '-branchPathTaken']] = ' ';
                  }
                }
                if (this.includeBranchPathTakenStepTitle) {
                  if (stepTitle != null) {
                    workgroupRow[
                      columnIdToColumnIndex[nodeId + '-branchPathTakenStepTitle']
                    ] = stepTitle;
                  } else {
                    workgroupRow[columnIdToColumnIndex[nodeId + '-branchPathTakenStepTitle']] = ' ';
                  }
                }
              }
            }
          }
          rows.push(workgroupRow);
        }
      }
      var fileName = runId + '_one_workgroup_per_row.csv';
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
    var nodeIds = this.ProjectService.getFlattenedProjectAsNodeIds();
    if (nodeIds != null) {
      for (var n = 0; n < nodeIds.length; n++) {
        var nodeId = nodeIds[n];
        var components = this.ProjectService.getComponentsByNodeId(nodeId);
        if (components != null) {
          for (var c = 0; c < components.length; c++) {
            var component = components[c];
            if (component != null) {
              var componentId = component.id;
              if (this.exportComponent(selectedNodesMap, nodeId, componentId)) {
                var columnIdPrefix = nodeId + '-' + componentId;
                if (this.includeStudentWorkIds) {
                  columnIds.push(columnIdPrefix + '-studentWorkId');
                }
                if (this.includeStudentWorkTimestamps) {
                  columnIds.push(columnIdPrefix + '-studentWorkTimestamp');
                }
                if (this.includeStudentWork) {
                  columnIds.push(columnIdPrefix + '-studentWork');
                }
                if (this.includeScoreTimestamps) {
                  columnIds.push(columnIdPrefix + '-scoreTimestamp');
                }
                if (this.includeScores) {
                  columnIds.push(columnIdPrefix + '-score');
                }
                if (this.includeCommentTimestamps) {
                  columnIds.push(columnIdPrefix + '-commentTimestamp');
                }
                if (this.includeComments) {
                  columnIds.push(columnIdPrefix + '-comment');
                }
              }
            }
          }
        }
        if (this.exportNode(selectedNodesMap, nodeId)) {
          if (this.ProjectService.isBranchPoint(nodeId)) {
            if (this.includeBranchPathTakenNodeId) {
              columnIds.push(nodeId + '-branchPathTakenNodeId');
            }
            if (this.includeBranchPathTaken) {
              columnIds.push(nodeId + '-branchPathTaken');
            }
            if (this.includeBranchPathTakenStepTitle) {
              columnIds.push(nodeId + '-branchPathTakenStepTitle');
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
      var descriptionRowHeader = descriptionRowHeaders[d];
      columnIdToColumnIndex[descriptionRowHeader] = d;
    }

    // generate the header row by looping through all the column names
    for (var c = 0; c < columnIds.length; c++) {
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
    var numColumns = descriptionRowHeaders.length + 1 + columnIds.length;
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
    stepTitleRow.fill(' ');
    componentPartNumberRow.fill(' ');
    componentTypeRow.fill(' ');
    componentPromptRow.fill(' ');
    nodeIdRow.fill(' ');
    componentIdRow.fill(' ');
    columnIdRow.fill(' ');
    descriptionRow.fill(' ');
    stepTitleRow[descriptionRowHeaders.length] = 'Step Title';
    componentPartNumberRow[descriptionRowHeaders.length] = 'Component Part Number';
    componentTypeRow[descriptionRowHeaders.length] = 'Component Type';
    componentPromptRow[descriptionRowHeaders.length] = 'Prompt';
    nodeIdRow[descriptionRowHeaders.length] = 'Node ID';
    componentIdRow[descriptionRowHeaders.length] = 'Component ID';
    columnIdRow[descriptionRowHeaders.length] = 'Column ID';
    descriptionRow[descriptionRowHeaders.length] = 'Description';
    for (var d = 0; d < descriptionRowHeaders.length; d++) {
      descriptionRow[d] = descriptionRowHeaders[d];
    }
    var nodeIds = this.ProjectService.getFlattenedProjectAsNodeIds();
    if (nodeIds != null) {
      for (var n = 0; n < nodeIds.length; n++) {
        var nodeId = nodeIds[n];
        var stepTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
        var components = this.ProjectService.getComponentsByNodeId(nodeId);
        if (components != null) {
          for (var c = 0; c < components.length; c++) {
            var component = components[c];
            if (component != null) {
              var componentId = component.id;
              var columnIdPrefix = nodeId + '-' + componentId;
              var prompt = this.UtilService.removeHTMLTags(component.prompt);
              prompt = prompt.replace(/"/g, '""');
              if (prompt == '') {
                prompt = ' ';
              }
              if (this.includeStudentWorkIds) {
                stepTitleRow[columnIdToColumnIndex[columnIdPrefix + '-studentWorkId']] = stepTitle;
                componentPartNumberRow[columnIdToColumnIndex[columnIdPrefix + '-studentWorkId']] =
                  c + 1;
                componentTypeRow[columnIdToColumnIndex[columnIdPrefix + '-studentWorkId']] =
                  component.type;
                componentPromptRow[
                  columnIdToColumnIndex[columnIdPrefix + '-studentWorkId']
                ] = prompt;
                nodeIdRow[columnIdToColumnIndex[columnIdPrefix + '-studentWorkId']] = nodeId;
                componentIdRow[
                  columnIdToColumnIndex[columnIdPrefix + '-studentWorkId']
                ] = componentId;
                columnIdRow[columnIdToColumnIndex[columnIdPrefix + '-studentWorkId']] =
                  columnIdPrefix + '-studentWorkId';
                descriptionRow[columnIdToColumnIndex[columnIdPrefix + '-studentWorkId']] =
                  'Student Work ID';
              }
              if (this.includeStudentWorkTimestamps) {
                stepTitleRow[
                  columnIdToColumnIndex[columnIdPrefix + '-studentWorkTimestamp']
                ] = stepTitle;
                componentPartNumberRow[
                  columnIdToColumnIndex[columnIdPrefix + '-studentWorkTimestamp']
                ] = c + 1;
                componentTypeRow[columnIdToColumnIndex[columnIdPrefix + '-studentWorkTimestamp']] =
                  component.type;
                componentPromptRow[
                  columnIdToColumnIndex[columnIdPrefix + '-studentWorkTimestamp']
                ] = prompt;
                nodeIdRow[columnIdToColumnIndex[columnIdPrefix + '-studentWorkTimestamp']] = nodeId;
                componentIdRow[
                  columnIdToColumnIndex[columnIdPrefix + '-studentWorkTimestamp']
                ] = componentId;
                columnIdRow[columnIdToColumnIndex[columnIdPrefix + '-studentWorkTimestamp']] =
                  columnIdPrefix + '-studentWorkTimestamp';
                descriptionRow[columnIdToColumnIndex[columnIdPrefix + '-studentWorkTimestamp']] =
                  'Student Work Timestamp';
              }
              if (this.includeStudentWork) {
                stepTitleRow[columnIdToColumnIndex[columnIdPrefix + '-studentWork']] = stepTitle;
                componentPartNumberRow[columnIdToColumnIndex[columnIdPrefix + '-studentWork']] =
                  c + 1;
                componentTypeRow[columnIdToColumnIndex[columnIdPrefix + '-studentWork']] =
                  component.type;
                componentPromptRow[columnIdToColumnIndex[columnIdPrefix + '-studentWork']] = prompt;
                nodeIdRow[columnIdToColumnIndex[columnIdPrefix + '-studentWork']] = nodeId;
                componentIdRow[
                  columnIdToColumnIndex[columnIdPrefix + '-studentWork']
                ] = componentId;
                columnIdRow[columnIdToColumnIndex[columnIdPrefix + '-studentWork']] =
                  columnIdPrefix + '-studentWork';
                descriptionRow[columnIdToColumnIndex[columnIdPrefix + '-studentWork']] =
                  'Student Work';
              }

              if (this.includeScoreTimestamps) {
                stepTitleRow[columnIdToColumnIndex[columnIdPrefix + '-scoreTimestamp']] = stepTitle;
                componentPartNumberRow[columnIdToColumnIndex[columnIdPrefix + '-scoreTimestamp']] =
                  c + 1;
                componentTypeRow[columnIdToColumnIndex[columnIdPrefix + '-scoreTimestamp']] =
                  component.type;
                componentPromptRow[
                  columnIdToColumnIndex[columnIdPrefix + '-scoreTimestamp']
                ] = prompt;
                nodeIdRow[columnIdToColumnIndex[columnIdPrefix + '-scoreTimestamp']] = nodeId;
                componentIdRow[
                  columnIdToColumnIndex[columnIdPrefix + '-scoreTimestamp']
                ] = componentId;
                columnIdRow[columnIdToColumnIndex[columnIdPrefix + '-scoreTimestamp']] =
                  columnIdPrefix + '-scoreTimestamp';
                descriptionRow[columnIdToColumnIndex[columnIdPrefix + '-scoreTimestamp']] =
                  'Score Timestamp';
              }
              if (this.includeScores) {
                stepTitleRow[columnIdToColumnIndex[columnIdPrefix + '-score']] = stepTitle;
                componentPartNumberRow[columnIdToColumnIndex[columnIdPrefix + '-score']] = c + 1;
                componentTypeRow[columnIdToColumnIndex[columnIdPrefix + '-score']] = component.type;
                componentPromptRow[columnIdToColumnIndex[columnIdPrefix + '-score']] = prompt;
                nodeIdRow[columnIdToColumnIndex[columnIdPrefix + '-score']] = nodeId;
                componentIdRow[columnIdToColumnIndex[columnIdPrefix + '-score']] = componentId;
                columnIdRow[columnIdToColumnIndex[columnIdPrefix + '-score']] =
                  columnIdPrefix + '-score';
                descriptionRow[columnIdToColumnIndex[columnIdPrefix + '-score']] = 'Score';
              }
              if (this.includeCommentTimestamps) {
                stepTitleRow[
                  columnIdToColumnIndex[columnIdPrefix + '-commentTimestamp']
                ] = stepTitle;
                componentPartNumberRow[
                  columnIdToColumnIndex[columnIdPrefix + '-commentTimestamp']
                ] = c + 1;
                componentTypeRow[columnIdToColumnIndex[columnIdPrefix + '-commentTimestamp']] =
                  component.type;
                componentPromptRow[
                  columnIdToColumnIndex[columnIdPrefix + '-commentTimestamp']
                ] = prompt;
                nodeIdRow[columnIdToColumnIndex[columnIdPrefix + '-commentTimestamp']] = nodeId;
                componentIdRow[
                  columnIdToColumnIndex[columnIdPrefix + '-commentTimestamp']
                ] = componentId;
                columnIdRow[columnIdToColumnIndex[columnIdPrefix + '-commentTimestamp']] =
                  columnIdPrefix + '-commentTimestamp';
                descriptionRow[columnIdToColumnIndex[columnIdPrefix + '-commentTimestamp']] =
                  'Comment Timestamp';
              }
              if (this.includeComments) {
                stepTitleRow[columnIdToColumnIndex[columnIdPrefix + '-comment']] = stepTitle;
                componentPartNumberRow[columnIdToColumnIndex[columnIdPrefix + '-comment']] = c + 1;
                componentTypeRow[columnIdToColumnIndex[columnIdPrefix + '-comment']] =
                  component.type;
                componentPromptRow[columnIdToColumnIndex[columnIdPrefix + '-comment']] = prompt;
                nodeIdRow[columnIdToColumnIndex[columnIdPrefix + '-comment']] = nodeId;
                componentIdRow[columnIdToColumnIndex[columnIdPrefix + '-comment']] = componentId;
                columnIdRow[columnIdToColumnIndex[columnIdPrefix + '-comment']] =
                  columnIdPrefix + '-comment';
                descriptionRow[columnIdToColumnIndex[columnIdPrefix + '-comment']] = 'Comment';
              }
            }
          }
        }
        if (this.includeBranchPathTakenNodeId) {
          if (this.ProjectService.isBranchPoint(nodeId)) {
            stepTitleRow[columnIdToColumnIndex[nodeId + '-branchPathTakenNodeId']] = stepTitle;
            componentPartNumberRow[columnIdToColumnIndex[nodeId + '-branchPathTakenNodeId']] = ' ';
            componentTypeRow[columnIdToColumnIndex[nodeId + '-branchPathTakenNodeId']] = ' ';
            componentPromptRow[columnIdToColumnIndex[nodeId + '-branchPathTakenNodeId']] = ' ';
            nodeIdRow[columnIdToColumnIndex[nodeId + '-branchPathTakenNodeId']] = nodeId;
            componentIdRow[columnIdToColumnIndex[nodeId + '-branchPathTakenNodeId']] = ' ';
            columnIdRow[columnIdToColumnIndex[nodeId + '-branchPathTakenNodeId']] =
              nodeId + '-branchPathTakenNodeId';
            descriptionRow[columnIdToColumnIndex[nodeId + '-branchPathTakenNodeId']] =
              'Branch Path Taken Node ID';
          }
        }
        if (this.includeBranchPathTaken) {
          if (this.ProjectService.isBranchPoint(nodeId)) {
            stepTitleRow[columnIdToColumnIndex[nodeId + '-branchPathTaken']] = stepTitle;
            componentPartNumberRow[columnIdToColumnIndex[nodeId + '-branchPathTaken']] = ' ';
            componentTypeRow[columnIdToColumnIndex[nodeId + '-branchPathTaken']] = ' ';
            componentPromptRow[columnIdToColumnIndex[nodeId + '-branchPathTaken']] = ' ';
            nodeIdRow[columnIdToColumnIndex[nodeId + '-branchPathTaken']] = nodeId;
            componentIdRow[columnIdToColumnIndex[nodeId + '-branchPathTaken']] = ' ';
            columnIdRow[columnIdToColumnIndex[nodeId + '-branchPathTaken']] =
              nodeId + '-branchPathTaken';
            descriptionRow[columnIdToColumnIndex[nodeId + '-branchPathTaken']] =
              'Branch Path Taken';
          }
        }
        if (this.includeBranchPathTakenStepTitle) {
          if (this.ProjectService.isBranchPoint(nodeId)) {
            stepTitleRow[columnIdToColumnIndex[nodeId + '-branchPathTakenStepTitle']] = stepTitle;
            componentPartNumberRow[columnIdToColumnIndex[nodeId + '-branchPathTakenStepTitle']] =
              ' ';
            componentTypeRow[columnIdToColumnIndex[nodeId + '-branchPathTakenStepTitle']] = ' ';
            componentPromptRow[columnIdToColumnIndex[nodeId + '-branchPathTakenStepTitle']] = ' ';
            nodeIdRow[columnIdToColumnIndex[nodeId + '-branchPathTakenStepTitle']] = nodeId;
            componentIdRow[columnIdToColumnIndex[nodeId + '-branchPathTakenStepTitle']] = ' ';
            columnIdRow[columnIdToColumnIndex[nodeId + '-branchPathTakenStepTitle']] =
              nodeId + '-branchPathTakenStepTitle';
            descriptionRow[columnIdToColumnIndex[nodeId + '-branchPathTakenStepTitle']] =
              'Branch Path Taken Step Title';
          }
        }
      }
    }
    const topRows = [];
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
    let componentService = null;
    if (componentType != null) {
      componentService = this.componentTypeToComponentService[componentType];
      if (componentService == null) {
        componentService = this.$injector.get(componentType + 'Service');
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
    if (
      selectedNodesMap == null ||
      this.isComponentSelected(selectedNodesMap, nodeId, componentId)
    ) {
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
    this.exportType = 'oneWorkgroupPerRow';
  }

  /**
   * Get the node position
   * @param nodeId the node id
   * @returns the node position
   */
  getNodePositionById(nodeId) {
    return this.ProjectService.getNodePositionById(nodeId);
  }

  /**
   * Get the node title for a node
   * @param nodeId the node id
   * @returns the node title
   */
  getNodeTitleByNodeId(nodeId) {
    return this.ProjectService.getNodeTitleByNodeId(nodeId);
  }

  /**
   * Check if a node id is for a group
   * @param nodeId
   * @returns whether the node is a group node
   */
  isGroupNode(nodeId) {
    return this.ProjectService.isGroupNode(nodeId);
  }

  /**
   * Check if the node is in any branch path
   * @param nodeId the node id of the node
   * @return whether the node is in any branch path
   */
  isNodeInAnyBranchPath(nodeId) {
    return this.ProjectService.isNodeInAnyBranchPath(nodeId);
  }

  defaultClicked() {
    this.setDefaultExportSettings();
  }

  everythingClicked() {
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
    this.includeAnnotations = true;
    this.includeEvents = true;
  }

  setDefaultExportSettings() {
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
    this.includeStudentEvents = true;
    this.includeTeacherEvents = true;
    this.includeNames = false;
    this.exportStepSelectionType = 'exportAllSteps';
    this.includeAnnotations = false;
    this.includeEvents = false;

    /*
     * remove checked fields that may have been accidentally saved by the
     * authoring tool or grading tool
     */
    this.ProjectService.cleanupBeforeSave();
  }

  rawDataExportClicked() {
    this.exportType = 'rawData';
  }

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
    if (this.exportStepSelectionType === 'exportSelectSteps') {
      selectedNodes = this.getSelectedNodesToExport();
      if (selectedNodes == null || selectedNodes.length == 0) {
        alert('Please select a step to export.');
        return;
      } else {
        selectedNodesMap = this.getSelectedNodesMap(selectedNodes);
      }
    }
    this.TeacherDataService.getExport('rawData', selectedNodes).then((result) => {
      var runId = this.ConfigService.getRunId();
      var data: any = {};
      var workgroups = this.ConfigService.getClassmateUserInfosSortedByWorkgroupId();
      workgroups = this.UtilService.makeCopyOfJSONObject(workgroups);
      for (var w = 0; w < workgroups.length; w++) {
        var workgroup = workgroups[w];
        if (workgroup != null) {
          if (!this.includeStudentNames) {
            this.removeNamesFromWorkgroup(workgroup);
          }
          var workgroupId = workgroup.workgroupId;
          if (this.includeStudentWork) {
            workgroup.studentWork = [];
            var componentStates = this.TeacherDataService.getComponentStatesByWorkgroupId(
              workgroupId
            );
            if (componentStates != null) {
              for (var c = 0; c < componentStates.length; c++) {
                var componentState = componentStates[c];
                if (componentState != null) {
                  var compositeId = this.getCompositeId(componentState);
                  if (
                    selectedNodesMap == null ||
                    (compositeId != null && selectedNodesMap[compositeId] == true)
                  ) {
                    workgroup.studentWork.push(componentState);
                  }
                }
              }
            }
          }
          if (this.includeAnnotations) {
            workgroup.annotations = [];
            var annotations = this.TeacherDataService.getAnnotationsToWorkgroupId(workgroupId);
            if (annotations != null) {
              for (var a = 0; a < annotations.length; a++) {
                var annotation = annotations[a];
                if (annotation != null) {
                  var compositeId = this.getCompositeId(annotation);
                  if (
                    selectedNodesMap == null ||
                    (compositeId != null && selectedNodesMap[compositeId] == true)
                  ) {
                    workgroup.annotations.push(annotation);
                  }
                }
              }
            }
          }
          if (this.includeEvents) {
            workgroup.events = [];
            var events = this.TeacherDataService.getEventsByWorkgroupId(workgroupId);
            if (events != null) {
              for (var e = 0; e < events.length; e++) {
                var event = events[e];
                if (event != null) {
                  var compositeId = this.getCompositeId(event);
                  if (
                    selectedNodesMap == null ||
                    (compositeId != null && selectedNodesMap[compositeId] == true)
                  ) {
                    workgroup.events.push(event);
                  }
                }
              }
            }
          }
        }
      }
      data.workgroups = workgroups;
      const dataJSONString = angular.toJson(data, 4);
      const blob = new Blob([dataJSONString]);
      this.FileSaver.saveAs(blob, runId + '_raw_data.json');
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
      compositeId = object.nodeId;
    }
    if (object.componentId != null) {
      compositeId += '-' + object.componentId;
    }
    return compositeId;
  }

  /**
   * Check if a component type has a specific export implemented for it.
   * @param componentType The component type.
   * @return Whether the component type has a specific export.
   */
  canExportAllRevisionsForComponentDataType(componentType: string) {
    for (const allowedComponentType of this.availableComponentAllRevisionsDataExports) {
      if (componentType === allowedComponentType) {
        return true;
      }
    }
    return false;
  }

  canExportLatestRevisionsForComponentDataType(componentType: string) {
    for (const allowedComponentType of this.availableComponentLatestRevisionsDataExports) {
      if (componentType === allowedComponentType) {
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
   * Export all the work for each student for  a specific component.
   * @param nodeId The node id.
   * @param component The component content object.
   */
  exportComponentAllRevisions(nodeId: string, component: any) {
    if (component.type === 'Match') {
      this.exportMatchComponentAllRevisions(nodeId, component);
    } else if (component.type === 'Discussion') {
      this.exportDiscussionComponent(nodeId, component);
    }
  }

  /**
   * Export the latest work for each student for a given component.
   * @param nodeId The node id.
   * @param component The component content object.
   */
  exportComponentLatestRevisions(nodeId: string, component: any) {
    if (component.type === 'Match') {
      this.exportMatchComponentLatestRevisions(nodeId, component);
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
    const components = this.getComponentsParam(nodeId, component.id);
    this.TeacherDataService.getExport('allStudentWork', components).then((result) => {
      const columnNames = [];
      const columnNameToNumber = {};
      let rows = [
        this.generateDiscussionComponentHeaderRow(component, columnNames, columnNameToNumber)
      ];
      rows = rows.concat(
        this.generateDiscussionComponentWorkRows(component, columnNames, columnNameToNumber, nodeId)
      );
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
      '#',
      'Workgroup ID',
      'WISE ID 1',
      'Student Name 1',
      'WISE ID 2',
      'Student Name 2',
      'WISE ID 3',
      'Student Name 3',
      'Class Period',
      'Project ID',
      'Project Name',
      'Run ID',
      'Start Date',
      'End Date',
      'Server Timestamp',
      'Client Timestamp',
      'Node ID',
      'Component ID',
      'Component Part Number',
      'Step Title',
      'Component Type',
      'Component Prompt',
      'Student Data',
      'Thread ID',
      'Student Work ID',
      'Post Level',
      'Post Text'
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
      rows.push(
        this.generateDiscussionComponentWorkRow(
          component,
          topLevelPost.workgroupId,
          columnNames,
          columnNameToNumber,
          nodeId,
          component.id,
          rowCounter,
          topLevelPost,
          threadId
        )
      );
      rowCounter++;
      if (topLevelPost.replies != null) {
        for (let replyPost of topLevelPost.replies) {
          rows.push(
            this.generateDiscussionComponentWorkRow(
              component,
              replyPost.workgroupId,
              columnNames,
              columnNameToNumber,
              nodeId,
              component.id,
              rowCounter,
              replyPost,
              threadId
            )
          );
          rowCounter++;
        }
      }
    }
    return rows;
  }

  generateDiscussionComponentWorkRow(
    component,
    workgroupId,
    columnNames,
    columnNameToNumber,
    nodeId,
    componentId,
    rowCounter,
    componentState,
    threadId
  ) {
    const row = new Array(columnNames.length);
    row.fill('');
    const userInfo = this.ConfigService.getUserInfoByWorkgroupId(workgroupId);
    if (userInfo != null) {
      let wiseId1 = null;
      let wiseId2 = null;
      let wiseId3 = null;
      let studentName1 = null;
      let studentName2 = null;
      let studentName3 = null;
      if (userInfo.users[0] != null) {
        wiseId1 = userInfo.users[0].id;
        studentName1 = userInfo.users[0].name;
      }
      if (userInfo.users[1] != null) {
        wiseId2 = userInfo.users[1].id;
        studentName2 = userInfo.users[1].name;
      }
      if (userInfo.users[2] != null) {
        wiseId3 = userInfo.users[2].id;
        studentName3 = userInfo.users[2].name;
      }
      this.setStudentIDsAndNames(
        row,
        columnNameToNumber,
        wiseId1,
        studentName1,
        wiseId2,
        studentName2,
        wiseId3,
        studentName3
      );
      row[columnNameToNumber['Class Period']] = userInfo.periodName;
    }

    row[columnNameToNumber['#']] = rowCounter;
    row[columnNameToNumber['Project ID']] = this.ConfigService.getProjectId();
    row[columnNameToNumber['Project Name']] = this.ProjectService.getProjectTitle();
    row[columnNameToNumber['Run ID']] = this.ConfigService.getRunId();

    if (componentState.serverSaveTime != null) {
      row[
        columnNameToNumber['Server Timestamp']
      ] = this.UtilService.convertMillisecondsToFormattedDateTime(componentState.serverSaveTime);
    }

    if (componentState.clientSaveTime != null) {
      const clientSaveTime = new Date(componentState.clientSaveTime);
      row[columnNameToNumber['Client Timestamp']] =
        clientSaveTime.toDateString() + ' ' + clientSaveTime.toLocaleTimeString();
    }

    row[columnNameToNumber['Node ID']] = nodeId;
    row[columnNameToNumber['Step Title']] = this.ProjectService.getNodePositionAndTitleByNodeId(
      nodeId
    );
    row[columnNameToNumber['Component Part Number']] =
      this.ProjectService.getComponentPositionByNodeIdAndComponentId(nodeId, componentId) + 1;
    row[columnNameToNumber['Component ID']] = component.id;
    row[columnNameToNumber['Component Type']] = component.type;
    row[columnNameToNumber['Component Prompt']] = this.UtilService.removeHTMLTags(component.prompt);
    row[columnNameToNumber['Student Data']] = componentState.studentData;
    row[columnNameToNumber['Student Work ID']] = componentState.id;
    row[columnNameToNumber['Thread ID']] = threadId;
    row[columnNameToNumber['Workgroup ID']] = workgroupId;
    row[columnNameToNumber['Post Level']] = this.getPostLevel(componentState);
    row[columnNameToNumber['Post Text']] = this.UtilService.removeHTMLTags(
      componentState.studentData.response
    );
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

  exportMatchComponentAllRevisions(nodeId: string, component: any) {
    this.workSelectionType = 'exportAllWork';
    this.exportMatchComponent(nodeId, component);
  }

  exportMatchComponentLatestRevisions(nodeId: string, component: any) {
    this.workSelectionType = 'exportLatestWork';
    this.exportMatchComponent(nodeId, component);
  }

  /**
   * Generate an export for a specific match component.
   * TODO: Move these Match export functions to the MatchService.
   * @param nodeId The node id.
   * @param component The component content object.
   */
  exportMatchComponent(nodeId: string, component: any) {
    const components = this.getComponentsParam(nodeId, component.id);
    this.TeacherDataService.getExport('allStudentWork', components).then((result: any) => {
      this.generateMatchComponentExport(nodeId, component);
    });
  }

  generateMatchComponentExport(nodeId: string, component: any) {
    const runId = this.ConfigService.getRunId();
    const stepNumber = this.ProjectService.getNodePositionById(nodeId);
    const componentNumber =
      this.ProjectService.getComponentPositionByNodeIdAndComponentId(nodeId, component.id) + 1;
    const fileName = this.getMatchExportFileName(
      runId,
      stepNumber,
      componentNumber,
      this.workSelectionType
    );
    const rows = this.getExportMatchComponentRows(nodeId, component);
    this.generateCSVFile(rows, fileName);
    this.hideDownloadingExportMessage();
  }

  getExportMatchComponentRows(nodeId: string, component: any) {
    const columnNames = [];
    const columnNameToNumber = {};
    let rows = [];
    rows.push(this.generateMatchComponentHeaderRow(component, columnNames, columnNameToNumber));
    rows = rows.concat(
      this.generateMatchComponentWorkRows(component, columnNames, columnNameToNumber, nodeId)
    );
    return rows;
  }

  getMatchExportFileName(
    runId: number,
    stepNumber: number,
    componentNumber: number,
    workSelectionType: string
  ) {
    let allOrLatest = '';
    if (workSelectionType === 'exportAllWork') {
      allOrLatest = 'all';
    } else if (workSelectionType === 'exportLatestWork') {
      allOrLatest = 'latest';
    }
    return `${runId}_step_${stepNumber}_component_${componentNumber}_${allOrLatest}_match_work.csv`;
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
    let defaultMatchColumnNames = [
      '#',
      'Workgroup ID',
      'WISE ID 1',
      'Student Name 1',
      'WISE ID 2',
      'Student Name 2',
      'WISE ID 3',
      'Student Name 3',
      'Class Period',
      'Project ID',
      'Project Name',
      'Run ID',
      'Start Date',
      'End Date',
      'Student Work ID',
      'Server Timestamp',
      'Client Timestamp',
      'Node ID',
      'Component ID',
      'Component Part Number',
      'Step Title',
      'Component Type',
      'Component Prompt',
      'Student Data',
      'Component Revision Counter',
      'Is Submit',
      'Submit Count'
    ];

    /*
     * Add the default column names that contain the information about the
     * student, project, run, node, and component.
     */
    for (let c = 0; c < defaultMatchColumnNames.length; c++) {
      let defaultMatchColumnName = defaultMatchColumnNames[c];
      columnNameToNumber[defaultMatchColumnName] = c;
      columnNames.push(defaultMatchColumnName);
    }
    for (let choice of component.choices) {
      columnNameToNumber[choice.id] = columnNames.length;
      columnNames.push(choice.value);
    }
    if (this.includeCorrectnessColumns && this.MatchService.hasCorrectAnswer(component)) {
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
    const headerRow = [];
    for (const columnName of columnNames) {
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
    let workgroups = this.ConfigService.getClassmateUserInfosSortedByWorkgroupId();
    let rows = [];
    let rowCounter = 1;
    for (const workgroup of workgroups) {
      let rowsForWorkgroup = this.generateMatchComponentWorkRowsForWorkgroup(
        component,
        workgroup,
        columnNames,
        columnNameToNumber,
        nodeId,
        componentId,
        rowCounter
      );
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
  generateMatchComponentWorkRowsForWorkgroup(
    component,
    workgroup,
    columnNames,
    columnNameToNumber,
    nodeId,
    componentId,
    rowCounter
  ) {
    let rows = [];
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
    let matchComponentStates = this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(
      workgroupId,
      componentId
    );
    if (matchComponentStates != null) {
      for (let c = 0; c < matchComponentStates.length; c++) {
        let matchComponentState = matchComponentStates[c];
        let exportRow = true;
        if (this.includeOnlySubmits && !matchComponentState.isSubmit) {
          exportRow = false;
        } else if (
          this.workSelectionType == 'exportLatestWork' &&
          c != matchComponentStates.length - 1
        ) {
          exportRow = false;
        }

        if (exportRow) {
          rows.push(
            this.generateMatchComponentWorkRow(
              component,
              columnNames,
              columnNameToNumber,
              rowCounter,
              workgroupId,
              extractedWISEIDsAndStudentNames['wiseId1'],
              extractedWISEIDsAndStudentNames['wiseId2'],
              extractedWISEIDsAndStudentNames['wiseId3'],
              extractedWISEIDsAndStudentNames['studentName1'],
              extractedWISEIDsAndStudentNames['studentName2'],
              extractedWISEIDsAndStudentNames['studentName3'],
              periodName,
              componentRevisionCounter,
              matchComponentState
            )
          );
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
  generateMatchComponentWorkRow(
    component,
    columnNames,
    columnNameToNumber,
    rowCounter,
    workgroupId,
    wiseId1,
    wiseId2,
    wiseId3,
    studentName1,
    studentName2,
    studentName3,
    periodName,
    componentRevisionCounter,
    matchComponentState
  ) {
    /*
     * Populate the cells in the row that contain the information about the
     * student, project, run, step, and component.
     */
    let row = this.createStudentWorkExportRow(
      columnNames,
      columnNameToNumber,
      rowCounter,
      workgroupId,
      wiseId1,
      wiseId2,
      wiseId3,
      studentName1,
      studentName2,
      studentName3,
      periodName,
      componentRevisionCounter,
      matchComponentState
    );
    for (const bucket of matchComponentState.studentData.buckets) {
      for (const item of bucket.items) {
        row[columnNameToNumber[item.id]] = bucket.value;
        if (this.includeCorrectnessColumns && this.MatchService.hasCorrectAnswer(component)) {
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
    const columnName = item.id + '-boolean';
    if (item.isCorrect == null) {
      /*
       * The item does not have an isCorrect field so we will not show
       * anything in the cell.
       */
    } else if (item.isCorrect) {
      row[columnNameToNumber[columnName]] = 1;
    } else {
      if (item.isIncorrectPosition) {
        row[columnNameToNumber[columnName]] = 2;
      } else {
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

  exportVisitsClicked() {
    this.$state.go('root.cm.exportVisits');
  }

  getComponentsParam(nodeId: string, componentId: string) {
    return [{ nodeId: nodeId, componentId: componentId }];
  }
}

export default DataExportController;
