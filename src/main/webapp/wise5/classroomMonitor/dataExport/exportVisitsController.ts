'use strict';

import ClassroomMonitorProjectService from "../classroomMonitorProjectService";
import TeacherDataService from "../../services/teacherDataService";
import ExportController from "./exportController";
import ConfigService from "../../services/configService";
import UtilService from "../../services/utilService";

class ExportVisitsController extends ExportController {
  project: any;
  nodes: any[];
  checkedItems: string[] = [];
  columnNames: any[];
  columnNameToColumnNumber: any = {};
  idToChecked: any = {};
  idToNode: any = {};
  idToStepNumber: any = {};
  idToStepNumberAndTitle: any = {};
  rowCounter: number = 1;
  workgroupIdNodeIdToVisitCounter: any = {};
  canViewStudentNames: boolean = false;
  includeStudentNames: boolean = false;
  isShowColumnExplanations: boolean = false;
  columnExplanations: any[];

  static $inject = [
    '$filter',
    '$state',
    'ConfigService',
    'ProjectService',
    'FileSaver',
    'TeacherDataService',
    'UtilService'
  ];

  constructor(
    private $filter: any,
    private $state: any,
    private ConfigService: ConfigService,
    private ProjectService: ClassroomMonitorProjectService,
    FileSaver: any,
    private TeacherDataService: TeacherDataService,
    private UtilService: UtilService
  ) {
    super($filter, FileSaver);
    this.project = this.ProjectService.project;
    this.canViewStudentNames = this.ConfigService.getPermissions().canViewStudentNames;
    let nodeOrderOfProject = this.ProjectService.getNodeOrderOfProject(this.project);
    this.nodes = nodeOrderOfProject.nodes;
    this.initializeIdToChecked(this.nodes);
    this.initializeIdToNode(this.nodes);
    this.initializeIdToVisitCounter(this.nodes);
    this.initializeColumnNames();
    this.initializeColumnNameToColumnNumber();
    this.initializeColumnExplanations();
  }

  initializeIdToChecked(nodes: any[]) {
    for (const node of nodes) {
      this.idToChecked[node.node.id] = true;
    }
  }

  initializeIdToNode(nodes: any[]) {
    for (const node of nodes) {
      const nodeId = node.node.id;
      this.idToNode[nodeId] = node;
      this.idToStepNumber[nodeId] = this.ProjectService.getNodePositionById(nodeId);
      this.idToStepNumberAndTitle[nodeId] =
          this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
    }
  }

  initializeIdToVisitCounter(nodes: any[]) {
    const workgroupIds = this.ConfigService.getClassmateWorkgroupIds();
    for (const workgroupId of workgroupIds) {
      for (const node of nodes) {
        const key = this.getWorkgroupIdNodeIdKey(workgroupId, node.node.id);
        this.workgroupIdNodeIdToVisitCounter[key] = 0;
      }
    }
  }

  initializeColumnNames() {
    this.columnNames = [
      '#',
      'Workgroup ID',
      'WISE ID 1',
      'Student Name 1',
      'WISE ID 2',
      'Student Name 2',
      'WISE ID 3',
      'Student Name 3',
      'Run ID',
      'Project ID',
      'Project Name',
      'Period ID',
      'Period Name',
      'Start Date',
      'End Date',
      'Node ID',
      'Step Title',
      'Enter Time',
      'Exit Time',
      'Visit Duration (Seconds)',
      'Visit Counter',
      'Revisit Counter',
      'Previous Node ID',
      'Previous Step Title',
      'Steps Since Last Visit'
    ];
  }

  initializeColumnExplanations() {
    this.columnExplanations = [
      { name: '#', explanation: this.$translate('columnExplanationRowNumber') },
      { name: 'Workgroup ID', explanation: this.$translate('columnExplanationWorkgroupID') },
      { name: 'WISE ID 1', explanation: this.$translate('columnExplanationWISEID1') },
      { name: 'Student Name 1', explanation: this.$translate('columnExplanationStudentName1') },
      { name: 'WISE ID 2', explanation: this.$translate('columnExplanationWISEID2') },
      { name: 'Student Name 2', explanation: this.$translate('columnExplanationStudentName2') },
      { name: 'WISE ID 3', explanation: this.$translate('columnExplanationWISEID3') },
      { name: 'Student Name 3', explanation: this.$translate('columnExplanationStudentName3') },
      { name: 'Run ID', explanation: this.$translate('columnExplanationRunID') },
      { name: 'Project ID', explanation: this.$translate('columnExplanationProjectID') },
      { name: 'Project Name', explanation: this.$translate('columnExplanationProjectName') },
      { name: 'Period ID', explanation: this.$translate('columnExplanationPeriodID') },
      { name: 'Period Name', explanation: this.$translate('columnExplanationPeriodName') },
      { name: 'Start Date', explanation: this.$translate('columnExplanationStartDate') },
      { name: 'End Date', explanation: this.$translate('columnExplanationEndDate') },
      { name: 'Node ID', explanation: this.$translate('columnExplanationNodeID') },
      { name: 'Step Title', explanation: this.$translate('columnExplanationStepTitle') },
      { name: 'Enter Time', explanation: this.$translate('columnExplanationEnterTime') },
      { name: 'Exit Time', explanation: this.$translate('columnExplanationExitTime') },
      { name: 'Visit Duration (Seconds)',
          explanation: this.$translate('columnExplanationVisitDurationSeconds') },
      { name: 'Visit Counter', explanation: this.$translate('columnExplanationVisitCounter') },
      { name: 'Revisit Counter', explanation: this.$translate('columnExplanationRevisitCounter') },
      { name: 'Previous Node ID', explanation: this.$translate('columnExplanationPreviousNodeID') },
      { name: 'Previous Step Title',
          explanation: this.$translate('columnExplanationPreviousStepTitle') },
      { name: 'Steps Since Last Visit',
          explanation: this.$translate('columnExplanationStepsSinceLastVisit') }
    ];
  }

  getHeaderRow() {
    return this.columnNames;
  }

  initializeColumnNameToColumnNumber() {
    for (let c = 0; c < this.columnNames.length; c++) {
      this.columnNameToColumnNumber[this.columnNames[c]] = c;
    }
  }

  selectAll() {
    for (const node of this.nodes) {
      this.idToChecked[node.node.id] = true;
    }
  }

  deselectAll() {
    for (const node of this.nodes) {
      this.idToChecked[node.node.id] = false;
    }
  }

  nodeChecked(node: any) {
    if (node.type === 'group') {
      const isGroupChecked = this.idToChecked[node.id];
      for (const childId of node.ids) {
        this.idToChecked[childId] = isGroupChecked;
      }
    }
  }

  goBack() {
    this.$state.go('root.cm.export');
  }

  export() {
    this.rowCounter = 1;
    this.checkedItems = this.getCheckedItems();
    const includeStudentEvents = true;
    const includeTeacherEvents = false;
    this.TeacherDataService.retrieveEventsExport(
        includeStudentEvents, includeTeacherEvents, this.includeStudentNames).then((response) => {
      this.handleExportCallback(response);
    });
  }

  getCheckedItems() {
    const checkedItems = []
    for (const node of this.nodes) {
      if (this.idToChecked[node.node.id]) {
        checkedItems.push(node.node.id);
      }
    }
    return checkedItems;
  }

  handleExportCallback(response: any) {
    const events = this.sortEvents(response.events);
    this.initializeIdToVisitCounter(this.nodes);
    let previousEnteredEvent = null;
    let rows = [];
    for (const event of events) {
      if (this.isStepEnteredEvent(event)) {
        if (previousEnteredEvent != null) {
          rows.push(this.createVisit(previousEnteredEvent, null, rows));
        }
        previousEnteredEvent = event;
      } else if (this.isStepExitedEvent(event)) {
        if (previousEnteredEvent != null && this.isMatchingNodeId(previousEnteredEvent, event)) {
          rows.push(this.createVisit(previousEnteredEvent, event, rows));
        }
        previousEnteredEvent = null;
      }
    }
    if (previousEnteredEvent != null) {
      rows.push(this.createVisit(previousEnteredEvent, null, rows));
    }
    rows = this.filterRows(rows);
    rows.unshift(this.getHeaderRow());
    const fileName = `${this.ConfigService.getRunId()}_visits.csv`;
    this.generateCSVFile(rows, fileName);
  }

  filterRows(rows: any[]) {
    return rows.filter(row => this.checkedItems.includes(this.getCellInRow(row, 'Node ID')));
  }

  sortEvents(events: any[]) {
    return events.sort(this.sortEventsByWorkgroupIdAndClientSaveTime);
  }

  sortEventsByWorkgroupIdAndClientSaveTime(a: any, b: any) {
    if (a.workgroupId < b.workgroupId) {
      return -1;
    } else if (a.workgroupId > b.workgroupId) {
      return 1;
    } else {
      if (a.clientSaveTime < b.clientSaveTime) {
        return -1;
      } else if (a.clientSaveTime > b.clientSaveTime) {
        return 1;
      }
    }
  }

  isStepEnteredEvent(event: any) {
    return event.event === 'nodeEntered' && event.nodeId.startsWith('node');
  }

  isStepExitedEvent(event: any) {
    return event.event === 'nodeExited' && event.nodeId.startsWith('node');
  }

  isMatchingWorkgroupId(nodeEnteredEvent: any, nodeExitedEvent: any) {
    return nodeEnteredEvent.workgroupId === nodeExitedEvent.workgroupId;
  }

  isMatchingNodeId(nodeEnteredEvent: any, nodeExitedEvent: any) {
    return nodeEnteredEvent.nodeId === nodeExitedEvent.nodeId;
  }

  createVisit(nodeEnteredEvent: any, nodeExitedEvent: any, previousVisits: any[]) {
    const visit = this.createRowWithEmptyCells();
    const workgroupId = nodeEnteredEvent.workgroupId;
    const nodeId = nodeEnteredEvent.nodeId;
    this.incrementVisitCounter(workgroupId, nodeId);
    this.setCellInRow(visit, '#', this.getNextRowNumber());
    this.setCellInRow(visit, 'Workgroup ID', workgroupId);
    this.addUserCells(visit, workgroupId);
    this.setCellInRow(visit, 'Project ID', this.ConfigService.getProjectId());
    this.setCellInRow(visit, 'Run ID', this.ConfigService.getRunId());
    this.setCellInRow(visit, 'Project Name', this.ConfigService.getRunName());
    this.setCellInRow(visit, 'Period ID', this.getPeriodId(workgroupId));
    this.setCellInRow(visit, 'Period Name', this.getPeriodName(workgroupId));
    this.setCellInRow(visit, 'Start Date', this.ConfigService.getFormattedStartDate());
    this.setCellInRow(visit, 'End Date', this.ConfigService.getFormattedEndDate());
    this.setCellInRow(visit, 'Node ID', nodeId);
    this.setCellInRow(visit, 'Step Title', this.getStepNumberAndTitle(nodeId));
    this.setCellInRow(visit, 'Enter Time',
        this.UtilService.convertMillisecondsToFormattedDateTime(nodeEnteredEvent.clientSaveTime));
    if (nodeExitedEvent != null) {
      this.setCellInRow(visit, 'Exit Time',
          this.UtilService.convertMillisecondsToFormattedDateTime(nodeExitedEvent.clientSaveTime));
      this.setCellInRow(visit, 'Visit Duration (Seconds)',
          this.getVisitDuration(nodeEnteredEvent, nodeExitedEvent));
    }
    this.setCellInRow(visit, 'Visit Counter', this.getVisitCounter(workgroupId, nodeId));
    const revisitCounter = this.getRevisitCounter(workgroupId, nodeId);
    this.setCellInRow(visit, 'Revisit Counter', revisitCounter);
    const previousVisit = previousVisits[previousVisits.length - 1];
    if (previousVisit != null) {
      this.setCellInRow(
          visit, 'Previous Node ID', this.getCellInRow(previousVisit, 'Node ID'));
      this.setCellInRow(
          visit, 'Previous Step Title', this.getCellInRow(previousVisit, 'Step Title'));
    }
    if (revisitCounter > 0) {
      this.setCellInRow(visit, 'Steps Since Last Visit',
          this.getStepsBetweenLastVisit(nodeId, previousVisits));
    }
    this.incrementRowCounter();
    return visit;
  }

  createRowWithEmptyCells() {
    return new Array(this.columnNames.length);
  }

  getStepsBetweenLastVisit(nodeId: string, previousVisits: any[]) {
    const steps = [];
    for (let v = previousVisits.length - 1; v > 0; v--) {
      const previousVisit = previousVisits[v];
      const previousNodeId = this.getCellInRow(previousVisit, 'Node ID');
      if (nodeId === previousNodeId) {
        break;
      } else {
        steps.unshift(this.getStepNumber(previousNodeId));
      }
    }
    return steps.join(', ');
  }

  addUserCells(row: any[], workgroupId: number) {
    const userInfo = this.ConfigService.getUserInfoByWorkgroupId(workgroupId);
    if (userInfo.users[0] != null) {
      this.setCellInRow(row, 'WISE ID 1', userInfo.users[0].id);
      if (this.includeStudentNames) {
        this.setCellInRow(row, 'Student Name 1', userInfo.users[0].name);
      }
    }
    if (userInfo.users[1] != null) {
      this.setCellInRow(row, 'WISE ID 2', userInfo.users[1].id);
      if (this.includeStudentNames) {
        this.setCellInRow(row, 'Student Name 2', userInfo.users[1].name);
      }
    }
    if (userInfo.users[2] != null) {
      this.setCellInRow(row, 'WISE ID 3', userInfo.users[2].id);
      if (this.includeStudentNames) {
        this.setCellInRow(row, 'Student Name 3', userInfo.users[2].name);
      }
    }
  }

  getPeriodName(workgroupId: number) {
    return this.ConfigService.getUserInfoByWorkgroupId(workgroupId).periodName;
  }

  getPeriodId(workgroupId: number) {
    return this.ConfigService.getUserInfoByWorkgroupId(workgroupId).periodId;
  }

  getVisitDuration(nodeEnteredEvent: any, nodeExitedEvent: any) {
    return (nodeExitedEvent.clientSaveTime - nodeEnteredEvent.clientSaveTime) / 1000;
  }

  getColumnNumber(columnName: string) {
    return this.columnNameToColumnNumber[columnName];
  }
  
  getNextRowNumber() {
    return this.rowCounter;
  }

  incrementRowCounter() {
    this.rowCounter++;
  }

  getStepNumber(nodeId: string) {
    return this.idToStepNumber[nodeId];
  }

  getStepNumberAndTitle(nodeId: string) {
    return this.idToStepNumberAndTitle[nodeId];
  }

  getWorkgroupIdNodeIdKey(workgroupId: number, nodeId: string) {
    return `${workgroupId}-${nodeId}`;
  }

  incrementVisitCounter(workgroupId: number, nodeId: string) {
    this.workgroupIdNodeIdToVisitCounter[this.getWorkgroupIdNodeIdKey(workgroupId, nodeId)]++;
  }

  getVisitCounter(workgroupId: number, nodeId: string) {
    return this.workgroupIdNodeIdToVisitCounter[this.getWorkgroupIdNodeIdKey(workgroupId, nodeId)];
  }

  getRevisitCounter(workgroupId: number, nodeId: string) {
    const key = this.getWorkgroupIdNodeIdKey(workgroupId, nodeId);
    return this.workgroupIdNodeIdToVisitCounter[key] - 1;
  }

  setCellInRow(row: any[], columnName: string, value: any) {
    row[this.getColumnNumber(columnName)] = value;
  }

  getCellInRow(row: any[], columnName: string) {
    return row[this.getColumnNumber(columnName)];
  }

  toggleColumnExplanations() {
    this.isShowColumnExplanations = !this.isShowColumnExplanations;
  }

  backToTop() {
    window.document.querySelector('.top-content').scrollIntoView();
  }
}

export default ExportVisitsController;