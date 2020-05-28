import classroomMonitorModule from '../../../classroomMonitor/classroomMonitor';

let $controller;
let $q;
let $rootScope;
let $scope;
let exportVisitsController;
let ConfigService;
let ProjectService;
let TeacherDataService;
let demoProjectJSON;
const demoProjectJSONOriginal = window.mocks['test-unit/sampleData/curriculum/DemoProject/project'];

describe('ExportVisitsController', () => {
  beforeEach(angular.mock.module(classroomMonitorModule.name));
  beforeEach(inject((
    _ConfigService_,
    _ProjectService_,
    _TeacherDataService_,
    _$controller_,
    _$q_,
    _$rootScope_
  ) => {
    $controller = _$controller_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    ConfigService = _ConfigService_;
    ProjectService = _ProjectService_;
    TeacherDataService = _TeacherDataService_;
    spyOn(ConfigService, 'getPermissions').and.returnValue({ canViewStudentNames: true });
    spyOn(ConfigService, 'getClassmateWorkgroupIds').and.returnValue([100, 101]);
    spyOn(ConfigService, 'getProjectId').and.returnValue(1000);
    spyOn(ConfigService, 'getRunId').and.returnValue(2000);
    spyOn(ConfigService, 'getRunName').and.returnValue('Demo Project');
    spyOn(ConfigService, 'getFormattedStartDate').and.returnValue('Fri Apr 17 2020 6:22:14 PM');
    spyOn(ConfigService, 'getFormattedEndDate').and.returnValue('Thu May 21 2020 11:59:59 PM');
    const nodeOrderOfProject = createNodeOrderOfProject();
    spyOn(ProjectService, 'getNodeOrderOfProject').and.returnValue(nodeOrderOfProject);
    demoProjectJSON = JSON.parse(JSON.stringify(demoProjectJSONOriginal));
    ProjectService.setProject(demoProjectJSON);
    exportVisitsController = $controller('ExportVisitsController', { $scope: $scope });
    exportVisitsController.initializeWorkgroupIdNodeIdToVisitCounter(nodeOrderOfProject.nodes);
  }));
  initializeIdToChecked_ShouldSetMappingsToFalse();
  initializeIdToNode_ShouldSetMappings();
  initializeWorkgroupIdNodeIdToVisitCounter_ShouldSetCounters();
  getHeaderRow_ShouldGetArrayOfColumnNames();
  initializeColumnNameToColumnNumber_ShouldSetMappings();
  initializeIdToUserInfo_ShouldPopulateIdToUserInfo();
  selectAll_ShouldSetAllCheckedToTrue();
  selectAll_ShouldSetAllCheckedToFalse();
  nodeChecked_WhenSettingAGroupToTrue_ShouldSetAllChildrenToTrue();
  nodeChecked_WhenSettingAGroupToFalse_ShouldSetAllChildrenToFalse();
  getCheckedItems_ShouldGetAnArrayOfIds();
  export_ShouldRetrieveEvents();
  export_WhileIncludingStudentNames_ShouldRetrieveEventsWithStudentNames();
  handleExportCallback_WithMatchingEnterAndExitEvents_ShouldCreateRows();
  handleExportCallback_WithMissingExitEventAtBeginning_ShouldCreateRows();
  handleExportCallback_WithMissingExitEventAtEnd_ShouldCreateRows();
  getNodeEnteredAndExitedEvents_ShouldRemoveOtherEvents();
  getEventsWithActiveWorkgroups_ShouldRemoveEvents();
  getEventsThatAreNotErroneous_ShouldRemoveEvents();
  isErroneousExitedEvent_ShouldReturnTrue();
  isErroneousExitedEvent_ShouldReturnFalse();
  getDeletedSteps_ShouldReturnStepsNoLongerInProject();
  filterRows_ShouldTakeOutRowsThatAreNotSelected();
  filterRows_ShouldTakeOutRowsForDeletedSteps();
  filterRows_ShouldKeepRowsForDeletedSteps();
  sortEvents_ShouldOrderEventsByWorkgroupIdAndClientSaveTime();
  isStepEnteredEvent_WithNodeExitedEvent_ShouldReturnFalse();
  isStepEnteredEvent_WithGroupNode_ShouldReturnFalse();
  isStepEnteredEvent_WithStepNode_ShouldReturnTrue();
  isStepExitedEvent_WithNodeEnteredEvent_ShouldReturnFalse();
  isStepExitedEvent_WithAGroupNode_ShouldReturnFalse();
  isStepExitedEvent_WithAStepNode_ShouldReturnTrue();
  isMatchingWorkgroupId_WithNonMatchingWorkgroupIds_ShouldReturnFalse();
  isMatchingWorkgroupId_WithMatchingWorkgroupIds_ShouldReturnTrue();
  isMatchingNodeId_WithNonMatchingNodeIds_ShouldReturnFalse();
  isMatchingNodeId_WithMatchingNodeIds_ShouldReturnTrue();
  createVisit_WithEnterAndExitEvent_ShouldCreateAVisit();
  createVisit_WithNoPreviousVisits_ShouldCreateAVisit();
  createVisit_WithOnlyEnterEvent_ShouldCreateAVisit();
  getPreviousVisit_ShouldGetPreviousVisit();
  getPreviousVisit_ShouldReturnNullIfWorkgroupIdIsDifferent();
  createRowWithEmptyCells_ShouldReturnArrayWithEmptyValues();
  getNodeIdsBetweenLastVisit_ShouldReturnAStringOfStepNumbers();
  getStepNumbersBetweenLastVisit_ShouldReturnAStringOfStepNumbers();
  addUserCells_WithOneStudentNotIncludingNames_ShouldSetTheWISEID();
  addUserCells_WithOneStudentIncludingNames_ShouldSetTheWISEIDAndStudentName();
  addUserCells_WithMultipleStudentsIncludingNames_ShouldSetTheWISEIDAndStudentNames();
  getVisitDuration_ShouldGetTheTimeDifferenceBetweenEventsInSeconds();
  getColumnNumber_ShouldReturnTheColumnNumber();
  incrementRowCounter_ShouldIncrementRowCounterBy1();
  getStepNumber_ShouldGetAStringContainingStepNumber();
  getStepNumber_ShouldGetAStringForADeletedStep();
  getStepNumberAndTitle_ShouldGetAStringContainingStepNumberAndTitle();
  getStepNumberAndTitle_ShouldGetAStringForADeletedStep();
  getWorkgroupIdNodeIdKey_ShouldGetAStringContainingWorkgroupIdAndNodeId();
  getStepNumber_ShouldGetTheStepNumberString();
  incrementVisitCounter_ShouldIncreaseTheCounterBy1();
  getVisitCounter_ShouldGetTheVisitCount();
  getRevisitCounter_ShouldGetTheRevisitCount();
  setCellInRow_ShouldSetTheValueInTheCell();
  getCellInRow_ShouldGetTheValueInTheCell();
});

function createNodeOrderOfProject() {
  return {
    nodes: createNodes()
  };
}

function createNodes() {
  return [
    createNode('group0', 'group', 'Master', ''),
    createNode('group1', 'group', 'Master', '1', [
      'node1',
      'node2',
      'node3',
      'node4',
      'node5',
      'node6',
      'node7'
    ]),
    createNode('node1', 'node', 'HTML Step', '1.1'),
    createNode('node2', 'node', 'Open Response Step', '1.2'),
    createNode('node3', 'node', 'Graph Step', '1.3'),
    createNode('node4', 'node', 'Table Step', '1.4'),
    createNode('node5', 'node', 'Match Step', '1.5'),
    createNode('node6', 'node', 'Multiple Choice Step', '1.6'),
    createNode('node7', 'node', 'Draw Step', '1.7')
  ];
}

function createNode(id, type, title, stepNumber, childIds) {
  return {
    node: {
      id: id,
      title: title,
      type: type,
      ids: childIds
    },
    stepNumber: stepNumber
  };
}

function createRow(nodeId, stepTitle = '', workgroupId) {
  const row = exportVisitsController.createRowWithEmptyCells();
  exportVisitsController.setCellInRow(row, 'Node ID', nodeId);
  exportVisitsController.setCellInRow(row, 'Step Title', stepTitle);
  exportVisitsController.setCellInRow(row, 'Workgroup ID', workgroupId);
  return row;
}

function createEvent(type, nodeId, workgroupId, clientSaveTime) {
  return {
    event: type,
    nodeId: nodeId,
    workgroupId: workgroupId,
    clientSaveTime: clientSaveTime
  };
}

function expectIdsToCheckedToEqualValue(ids, value) {
  for (const id of ids) {
    expect(exportVisitsController.idToChecked[id]).toEqual(value);
  }
}

function expectVisitCountersToEqualValue(keys, value) {
  for (const key of keys) {
    expect(exportVisitsController.workgroupIdNodeIdToVisitCounter[key]).toEqual(value);
  }
}

function getColumnNameToNumberValue(columnName) {
  return exportVisitsController.columnNameToColumnNumber[columnName];
}

function createResolvedPromise() {
  const deferred = $q.defer();
  deferred.resolve({});
  return deferred.promise;
}

function initializeIdToChecked_ShouldSetMappingsToFalse() {
  it('initializeIdToChecked should set mappings to false', () => {
    exportVisitsController.initializeIdToChecked(exportVisitsController.nodes);
    expectIdsToCheckedToEqualValue(
      ['group0', 'group1', 'node1', 'node2', 'node3', 'node4', 'node5', 'node6', 'node7'],
      true
    );
  });
}

function initializeIdToNode_ShouldSetMappings() {
  it('initializeIdToNode should set mappings', () => {
    exportVisitsController.initializeIdToNode(exportVisitsController.nodes);
    expect(exportVisitsController.idToNode['group0']).toEqual(
      createNode('group0', 'group', 'Master', '')
    );
    expect(exportVisitsController.idToNode['group1']).toEqual(
      createNode('group1', 'group', 'Master', '1', [
        'node1',
        'node2',
        'node3',
        'node4',
        'node5',
        'node6',
        'node7'
      ])
    );
    expect(exportVisitsController.idToNode['node1']).toEqual(
      createNode('node1', 'node', 'HTML Step', '1.1')
    );
    expect(exportVisitsController.idToNode['node2']).toEqual(
      createNode('node2', 'node', 'Open Response Step', '1.2')
    );
    expect(exportVisitsController.idToNode['node3']).toEqual(
      createNode('node3', 'node', 'Graph Step', '1.3')
    );
    expect(exportVisitsController.idToNode['node4']).toEqual(
      createNode('node4', 'node', 'Table Step', '1.4')
    );
    expect(exportVisitsController.idToNode['node5']).toEqual(
      createNode('node5', 'node', 'Match Step', '1.5')
    );
    expect(exportVisitsController.idToNode['node6']).toEqual(
      createNode('node6', 'node', 'Multiple Choice Step', '1.6')
    );
    expect(exportVisitsController.idToNode['node7']).toEqual(
      createNode('node7', 'node', 'Draw Step', '1.7')
    );
  });
}

function initializeWorkgroupIdNodeIdToVisitCounter_ShouldSetCounters() {
  it('initializeWorkgroupIdNodeIdToVisitCounter should set counters', () => {
    exportVisitsController.initializeWorkgroupIdNodeIdToVisitCounter(exportVisitsController.nodes);
    expectVisitCountersToEqualValue(
      [
        '100-group0',
        '100-group1',
        '100-node1',
        '100-node2',
        '100-node3',
        '100-node4',
        '100-node5',
        '100-node6',
        '100-node7',
        '101-group0',
        '101-group1',
        '101-node1',
        '101-node2',
        '101-node3',
        '101-node4',
        '101-node5',
        '101-node6',
        '101-node7'
      ],
      0
    );
  });
}

function getHeaderRow_ShouldGetArrayOfColumnNames() {
  it('getHeaderRow should get array of column names', () => {
    const headerRow = exportVisitsController.getHeaderRow();
    expect(headerRow[0]).toEqual('#');
    expect(headerRow[1]).toEqual('Workgroup ID');
    expect(headerRow[2]).toEqual('WISE ID 1');
    expect(headerRow[3]).toEqual('Student Name 1');
    expect(headerRow[4]).toEqual('WISE ID 2');
    expect(headerRow[5]).toEqual('Student Name 2');
    expect(headerRow[6]).toEqual('WISE ID 3');
    expect(headerRow[7]).toEqual('Student Name 3');
    expect(headerRow[8]).toEqual('Run ID');
    expect(headerRow[9]).toEqual('Project ID');
    expect(headerRow[10]).toEqual('Project Name');
    expect(headerRow[11]).toEqual('Period ID');
    expect(headerRow[12]).toEqual('Period Name');
    expect(headerRow[13]).toEqual('Start Date');
    expect(headerRow[14]).toEqual('End Date');
    expect(headerRow[15]).toEqual('Node ID');
    expect(headerRow[16]).toEqual('Step Title');
    expect(headerRow[17]).toEqual('Enter Time');
    expect(headerRow[18]).toEqual('Exit Time');
    expect(headerRow[19]).toEqual('Visit Duration (Seconds)');
    expect(headerRow[20]).toEqual('Visit Counter');
    expect(headerRow[21]).toEqual('Revisit Counter');
    expect(headerRow[22]).toEqual('Previous Node ID');
    expect(headerRow[23]).toEqual('Previous Step Title');
    expect(headerRow[24]).toEqual('Node IDs Since Last Visit');
    expect(headerRow[25]).toEqual('Steps Since Last Visit');
  });
}

function initializeColumnNameToColumnNumber_ShouldSetMappings() {
  it('initializeColumnNameToColumnNumber should set mappings', () => {
    exportVisitsController.initializeColumnNameToColumnNumber();
    expect(getColumnNameToNumberValue('#')).toEqual(0);
    expect(getColumnNameToNumberValue('Workgroup ID')).toEqual(1);
    expect(getColumnNameToNumberValue('WISE ID 1')).toEqual(2);
    expect(getColumnNameToNumberValue('Student Name 1')).toEqual(3);
    expect(getColumnNameToNumberValue('WISE ID 2')).toEqual(4);
    expect(getColumnNameToNumberValue('Student Name 2')).toEqual(5);
    expect(getColumnNameToNumberValue('WISE ID 3')).toEqual(6);
    expect(getColumnNameToNumberValue('Student Name 3')).toEqual(7);
    expect(getColumnNameToNumberValue('Run ID')).toEqual(8);
    expect(getColumnNameToNumberValue('Project ID')).toEqual(9);
    expect(getColumnNameToNumberValue('Project Name')).toEqual(10);
    expect(getColumnNameToNumberValue('Period ID')).toEqual(11);
    expect(getColumnNameToNumberValue('Period Name')).toEqual(12);
    expect(getColumnNameToNumberValue('Start Date')).toEqual(13);
    expect(getColumnNameToNumberValue('End Date')).toEqual(14);
    expect(getColumnNameToNumberValue('Node ID')).toEqual(15);
    expect(getColumnNameToNumberValue('Step Title')).toEqual(16);
    expect(getColumnNameToNumberValue('Enter Time')).toEqual(17);
    expect(getColumnNameToNumberValue('Exit Time')).toEqual(18);
    expect(getColumnNameToNumberValue('Visit Duration (Seconds)')).toEqual(19);
    expect(getColumnNameToNumberValue('Visit Counter')).toEqual(20);
    expect(getColumnNameToNumberValue('Revisit Counter')).toEqual(21);
    expect(getColumnNameToNumberValue('Previous Node ID')).toEqual(22);
    expect(getColumnNameToNumberValue('Previous Step Title')).toEqual(23);
    expect(getColumnNameToNumberValue('Node IDs Since Last Visit')).toEqual(24);
    expect(getColumnNameToNumberValue('Steps Since Last Visit')).toEqual(25);
  });
}

function initializeIdToUserInfo_ShouldPopulateIdToUserInfo() {
  it('initializeIdToUserInfo should populate workgroupIdToUserInfo', () => {
    const userInfo1 = { users: [{ id: 100, name: 'Spongebob Squarepants' }] };
    const userInfo2 = { users: [{ id: 101, name: 'Patrick Star' }] };
    spyOn(ConfigService, 'getUserInfoByWorkgroupId').and.callFake(workgroupId => {
      if (workgroupId === 100) {
        return userInfo1;
      } else if (workgroupId === 101) {
        return userInfo2;
      }
    });
    exportVisitsController.initializeIdToUserInfo();
    expect(exportVisitsController.idToUserInfo[100]).toEqual(userInfo1);
    expect(exportVisitsController.idToUserInfo[101]).toEqual(userInfo2);
  });
}

function selectAll_ShouldSetAllCheckedToTrue() {
  it('selectAll should set all checked to true', () => {
    exportVisitsController.selectAll();
    expectIdsToCheckedToEqualValue(
      ['group0', 'group1', 'node1', 'node2', 'node3', 'node4', 'node5', 'node6', 'node7'],
      true
    );
  });
}

function selectAll_ShouldSetAllCheckedToFalse() {
  it('selectAll should set all checked to false', () => {
    exportVisitsController.deselectAll();
    expectIdsToCheckedToEqualValue(
      ['group0', 'group1', 'node1', 'node2', 'node3', 'node4', 'node5', 'node6', 'node7'],
      false
    );
  });
}

function nodeChecked_WhenSettingAGroupToTrue_ShouldSetAllChildrenToTrue() {
  it('nodeChecked when setting a group to true should set all children to true', () => {
    exportVisitsController.deselectAll();
    exportVisitsController.idToChecked['group1'] = true;
    exportVisitsController.nodeChecked(exportVisitsController.idToNode['group1'].node);
    expect(exportVisitsController.idToChecked['group0']).toEqual(false);
    expectIdsToCheckedToEqualValue(
      ['group1', 'node1', 'node2', 'node3', 'node4', 'node5', 'node6', 'node7'],
      true
    );
  });
}

function nodeChecked_WhenSettingAGroupToFalse_ShouldSetAllChildrenToFalse() {
  it('nodeChecked when setting a group to false should set all children to false', () => {
    exportVisitsController.deselectAll();
    exportVisitsController.idToChecked['node1'] = true;
    exportVisitsController.idToChecked['node2'] = true;
    exportVisitsController.idToChecked['node3'] = true;
    exportVisitsController.idToChecked['group1'] = false;
    exportVisitsController.nodeChecked(exportVisitsController.idToNode['group1'].node);
    expectIdsToCheckedToEqualValue(
      ['group0', 'group1', 'node1', 'node2', 'node3', 'node4', 'node5', 'node6', 'node7'],
      false
    );
  });
}

function getCheckedItems_ShouldGetAnArrayOfIds() {
  it('getCheckedItems should get an array of ids', () => {
    exportVisitsController.deselectAll();
    exportVisitsController.idToChecked['node1'] = true;
    exportVisitsController.idToChecked['node3'] = true;
    exportVisitsController.idToChecked['node5'] = true;
    const checkedItems = exportVisitsController.getCheckedItems();
    expect(checkedItems.length).toEqual(3);
    expect(checkedItems[0]).toEqual('node1');
    expect(checkedItems[1]).toEqual('node3');
    expect(checkedItems[2]).toEqual('node5');
  });
}

function export_ShouldRetrieveEvents() {
  it('export should retrieve events', () => {
    spyOn(TeacherDataService, 'retrieveEventsExport').and.callFake(() => {
      return createResolvedPromise();
    });
    exportVisitsController.export();
    const includeStudentEvents = true;
    const includeTeacherEvents = false;
    expect(TeacherDataService.retrieveEventsExport).toHaveBeenCalledWith(
      includeStudentEvents,
      includeTeacherEvents,
      exportVisitsController.includeStudentNames
    );
  });
}

function export_WhileIncludingStudentNames_ShouldRetrieveEventsWithStudentNames() {
  it('export should retrieve events', () => {
    spyOn(TeacherDataService, 'retrieveEventsExport').and.callFake(() => {
      return createResolvedPromise();
    });
    exportVisitsController.includeStudentNames = true;
    exportVisitsController.export();
    const includeStudentEvents = true;
    const includeTeacherEvents = false;
    expect(TeacherDataService.retrieveEventsExport).toHaveBeenCalledWith(
      includeStudentEvents,
      includeTeacherEvents,
      exportVisitsController.includeStudentNames
    );
  });
}

function handleExportCallback_WithMatchingEnterAndExitEvents_ShouldCreateRows() {
  it('handleExportCallback with matching enter and exit events should create rows', () => {
    spyOn(exportVisitsController, 'generateCSVFile').and.callFake(() => {});
    const userInfo = { users: [{ id: 100, name: 'Spongebob Squarepants' }] };
    spyOn(ConfigService, 'getUserInfoByWorkgroupId').and.returnValue(userInfo);
    exportVisitsController.idToUserInfo = { 100: userInfo };
    const enterEvent = createEvent('nodeEntered', 'node1', 100, 10000);
    const exitEvent = createEvent('nodeExited', 'node1', 100, 30000);
    const response = { events: [enterEvent, exitEvent] };
    exportVisitsController.checkedItems = ['node1'];
    exportVisitsController.handleExportCallback(response);
    exportVisitsController.rowCounter = 1;
    exportVisitsController.initializeWorkgroupIdNodeIdToVisitCounter(exportVisitsController.nodes);
    const rows = [
      exportVisitsController.getHeaderRow(),
      exportVisitsController.createVisit(enterEvent, exitEvent, [])
    ];
    const fileName = '2000_visits.csv';
    expect(exportVisitsController.generateCSVFile).toHaveBeenCalledWith(rows, fileName);
  });
}

function handleExportCallback_WithMissingExitEventAtBeginning_ShouldCreateRows() {
  it('handleExportCallback with missing exit event at beginning should create rows', () => {
    spyOn(exportVisitsController, 'generateCSVFile').and.callFake(() => {});
    const userInfo = { users: [{ id: 100, name: 'Spongebob Squarepants' }] };
    spyOn(ConfigService, 'getUserInfoByWorkgroupId').and.returnValue(userInfo);
    exportVisitsController.idToUserInfo = { 100: userInfo };
    const enterEvent1 = createEvent('nodeEntered', 'node1', 100, 10000);
    const enterEvent2 = createEvent('nodeEntered', 'node1', 100, 20000);
    const exitEvent = createEvent('nodeExited', 'node1', 100, 30000);
    const response = { events: [enterEvent1, enterEvent2, exitEvent] };
    exportVisitsController.checkedItems = ['node1'];
    exportVisitsController.handleExportCallback(response);
    exportVisitsController.rowCounter = 1;
    exportVisitsController.initializeWorkgroupIdNodeIdToVisitCounter(exportVisitsController.nodes);
    const visit1 = exportVisitsController.createVisit(enterEvent1, null, []);
    const visit2 = exportVisitsController.createVisit(enterEvent2, exitEvent, [visit1]);
    const rows = [exportVisitsController.getHeaderRow(), visit1, visit2];
    const fileName = '2000_visits.csv';
    expect(exportVisitsController.generateCSVFile).toHaveBeenCalledWith(rows, fileName);
  });
}

function handleExportCallback_WithMissingExitEventAtEnd_ShouldCreateRows() {
  it('handleExportCallback with missing exit event at end should create rows', () => {
    spyOn(exportVisitsController, 'generateCSVFile').and.callFake(() => {});
    const userInfo = { users: [{ id: 100, name: 'Spongebob Squarepants' }] };
    spyOn(ConfigService, 'getUserInfoByWorkgroupId').and.returnValue(userInfo);
    exportVisitsController.idToUserInfo = { 100: userInfo };
    const enterEvent1 = createEvent('nodeEntered', 'node1', 100, 10000);
    const exitEvent = createEvent('nodeExited', 'node1', 100, 20000);
    const enterEvent2 = createEvent('nodeEntered', 'node1', 100, 30000);
    const response = { events: [enterEvent1, exitEvent, enterEvent2] };
    exportVisitsController.checkedItems = ['node1'];
    exportVisitsController.handleExportCallback(response);
    exportVisitsController.rowCounter = 1;
    exportVisitsController.initializeWorkgroupIdNodeIdToVisitCounter(exportVisitsController.nodes);
    const visit1 = exportVisitsController.createVisit(enterEvent1, exitEvent, []);
    const visit2 = exportVisitsController.createVisit(enterEvent2, null, [visit1]);
    const rows = [exportVisitsController.getHeaderRow(), visit1, visit2];
    const fileName = '2000_visits.csv';
    expect(exportVisitsController.generateCSVFile).toHaveBeenCalledWith(rows, fileName);
  });
}

function getNodeEnteredAndExitedEvents_ShouldRemoveOtherEvents() {
  it('getNodeEnteredAndExitedEvents should remove other events', () => {
    const event1 = createEvent('nodeEntered', 'node1', 100, 1000);
    const event2 = createEvent('buttonClicked', 'node1', 100, 2000);
    const event3 = createEvent('nodeEntered', 'node1', 100, 3000);
    const events = [event1, event2, event3];
    const cleanedEvents = exportVisitsController.getNodeEnteredAndExitedEvents(events);
    expect(cleanedEvents.length).toEqual(2);
    expect(cleanedEvents[0]).toEqual(event1);
    expect(cleanedEvents[1]).toEqual(event3);
  });
}

function getEventsWithActiveWorkgroups_ShouldRemoveEvents() {
  it('getEventsWithActiveWorkgroups should remove events', () => {
    const event1 = createEvent('nodeEntered', 'node1', 100, 1000);
    const event2 = createEvent('nodeEntered', 'node1', 101, 2000);
    const event3 = createEvent('nodeEntered', 'node1', 102, 3000);
    const events = [event1, event2, event3];
    spyOn(exportVisitsController, 'isActiveWorkgroup').and.callFake(workgroupId => {
      return workgroupId === 100 || workgroupId === 101;
    });
    const cleanedEvents = exportVisitsController.getEventsWithActiveWorkgroups(events);
    expect(cleanedEvents.length).toEqual(2);
    expect(cleanedEvents[0]).toEqual(event1);
    expect(cleanedEvents[1]).toEqual(event2);
  });
}

function getEventsThatAreNotErroneous_ShouldRemoveEvents() {
  it('getEventsThatAreNotErroneous should remove events', () => {
    const event1 = createEvent('nodeEntered', 'node1', 100, 1000);
    const event2 = createEvent('nodeExited', 'node1', 100, 1000);
    const event3 = createEvent('nodeExited', 'node1', 100, 3000);
    const events = [event1, event2, event3];
    const cleanedEvents = exportVisitsController.getEventsThatAreNotErroneous(events);
    expect(cleanedEvents.length).toEqual(2);
    expect(cleanedEvents[0]).toEqual(event1);
    expect(cleanedEvents[1]).toEqual(event3);
  });
}

function isErroneousExitedEvent_ShouldReturnTrue() {
  it('isErroneousExitedEvent should return true', () => {
    const event1 = createEvent('nodeExited', 'node1', 100, 1000);
    const event2 = createEvent('nodeExited', 'node1', 100, 1000);
    expect(exportVisitsController.isErroneousExitedEvent(event1, event2)).toBe(true);
  });
}

function isErroneousExitedEvent_ShouldReturnFalse() {
  it('isErroneousExitedEvent should return false', () => {
    const event1 = createEvent('nodeExited', 'node1', 100, 1000);
    const event2 = createEvent('nodeEntered', 'node1', 100, 1000);
    expect(exportVisitsController.isErroneousExitedEvent(event1, event2)).toBe(false);
  });
}

function getDeletedSteps_ShouldReturnStepsNoLongerInProject() {
  it('getDeletedSteps should return steps no longer in project', () => {
    const event1 = createEvent('nodeEntered', 'node1', 100, 1000);
    const event2 = createEvent('nodeEntered', 'node10', 100, 2000);
    const events = [event1, event2];
    spyOn(ProjectService, 'getNodeById').and.callFake(nodeId => {
      if (nodeId === 'node1') {
        return { id: 'node1' };
      } else if (nodeId === 'node10') {
        return null;
      }
    });
    const deletedSteps = exportVisitsController.getDeletedSteps(events);
    expect(Object.keys(deletedSteps).length).toEqual(1);
    expect(deletedSteps['node1']).toBeUndefined();
    expect(deletedSteps['node10']).toEqual(true);
  });
}

function filterRows_ShouldTakeOutRowsThatAreNotSelected() {
  it('filterRows should take out rows that are not selected', () => {
    const row1 = createRow('node1');
    const row2 = createRow('node2');
    const row3 = createRow('node3');
    const row4 = createRow('node1');
    const row5 = createRow('node2');
    const rows = [row1, row2, row3, row4, row5];
    exportVisitsController.checkedItems = ['node1', 'node3'];
    const filteredRows = exportVisitsController.filterRows(rows);
    expect(filteredRows.length).toEqual(3);
    expect(filteredRows[0]).toEqual(row1);
    expect(filteredRows[1]).toEqual(row3);
    expect(filteredRows[2]).toEqual(row1);
  });
}

function filterRows_ShouldTakeOutRowsForDeletedSteps() {
  it('filterRows should take out rows for deleted steps', () => {
    exportVisitsController.includeDeletedSteps = false;
    exportVisitsController.deletedSteps['node2'] = true;
    const row1 = createRow('node1');
    const row2 = createRow('node2');
    const row3 = createRow('node3');
    const rows = [row1, row2, row3];
    exportVisitsController.checkedItems = ['node1', 'node3'];
    const filteredRows = exportVisitsController.filterRows(rows);
    expect(filteredRows.length).toEqual(2);
    expect(filteredRows[0]).toEqual(row1);
    expect(filteredRows[1]).toEqual(row3);
  });
}

function filterRows_ShouldKeepRowsForDeletedSteps() {
  it('filterRows should keep rows for deleted steps', () => {
    exportVisitsController.includeDeletedSteps = true;
    exportVisitsController.deletedSteps['node2'] = true;
    const row1 = createRow('node1');
    const row2 = createRow('node2');
    const row3 = createRow('node3');
    const rows = [row1, row2, row3];
    exportVisitsController.checkedItems = ['node1', 'node3'];
    const filteredRows = exportVisitsController.filterRows(rows);
    expect(filteredRows.length).toEqual(3);
    expect(filteredRows[0]).toEqual(row1);
    expect(filteredRows[1]).toEqual(row2);
    expect(filteredRows[2]).toEqual(row3);
  });
}

function sortEvents_ShouldOrderEventsByWorkgroupIdAndClientSaveTime() {
  it('sortEvents should order events by workgroup id and client save time', () => {
    const event1 = createEvent(null, null, 100, 1000);
    const event2 = createEvent(null, null, 100, 2000);
    const event3 = createEvent(null, null, 101, 4000);
    const event4 = createEvent(null, null, 100, 3000);
    const event5 = createEvent(null, null, 101, 5000);
    let events = [event1, event2, event3, event4, event5];
    events = exportVisitsController.sortEvents(events);
    expect(events.length).toEqual(5);
    expect(events[0]).toEqual(event1);
    expect(events[1]).toEqual(event2);
    expect(events[2]).toEqual(event4);
    expect(events[3]).toEqual(event3);
    expect(events[4]).toEqual(event5);
  });
}

function isStepEnteredEvent_WithNodeExitedEvent_ShouldReturnFalse() {
  it('isStepEnteredEvent with node exited event should return false', () => {
    const event = createEvent('nodeExited', 'node1');
    expect(exportVisitsController.isStepEnteredEvent(event)).toEqual(false);
  });
}

function isStepEnteredEvent_WithGroupNode_ShouldReturnFalse() {
  it('isStepEnteredEvent with group node should return false', () => {
    const event = createEvent('nodeEntered', 'group1');
    expect(exportVisitsController.isStepEnteredEvent(event)).toEqual(false);
  });
}

function isStepEnteredEvent_WithStepNode_ShouldReturnTrue() {
  it('isStepEnteredEvent with step node should return true', () => {
    const event = createEvent('nodeEntered', 'node1');
    expect(exportVisitsController.isStepEnteredEvent(event)).toEqual(true);
  });
}

function isStepExitedEvent_WithNodeEnteredEvent_ShouldReturnFalse() {
  it('isStepExitedEvent with node entered event should return false', () => {
    const event = createEvent('nodeEntered', 'node1');
    expect(exportVisitsController.isStepExitedEvent(event)).toEqual(false);
  });
}

function isStepExitedEvent_WithAGroupNode_ShouldReturnFalse() {
  it('isStepExitedEvent with a group node should return false', () => {
    const event = createEvent('nodeExited', 'group1');
    expect(exportVisitsController.isStepExitedEvent(event)).toEqual(false);
  });
}

function isStepExitedEvent_WithAStepNode_ShouldReturnTrue() {
  it('isStepExitedEvent with a step node should return true', () => {
    const event = createEvent('nodeExited', 'node1');
    expect(exportVisitsController.isStepExitedEvent(event)).toEqual(true);
  });
}

function isMatchingWorkgroupId_WithNonMatchingWorkgroupIds_ShouldReturnFalse() {
  it('isMatchingWorkgroupId with non matching workgroup ids should return false', () => {
    const event1 = createEvent('nodeEntered', null, 100);
    const event2 = createEvent('nodeEntered', null, 101);
    expect(exportVisitsController.isMatchingWorkgroupId(event1, event2)).toEqual(false);
  });
}

function isMatchingWorkgroupId_WithMatchingWorkgroupIds_ShouldReturnTrue() {
  it('isMatchingWorkgroupId with matching workgroup ids should return true', () => {
    const event1 = createEvent('nodeEntered', null, 100);
    const event2 = createEvent('nodeEntered', null, 100);
    expect(exportVisitsController.isMatchingWorkgroupId(event1, event2)).toEqual(true);
  });
}

function isMatchingNodeId_WithNonMatchingNodeIds_ShouldReturnFalse() {
  it('isMatchingNodeId with non matching node ids should return false', () => {
    const event1 = createEvent('nodeEntered', 'node1');
    const event2 = createEvent('nodeEntered', 'node2');
    expect(exportVisitsController.isMatchingNodeId(event1, event2)).toEqual(false);
  });
}

function isMatchingNodeId_WithMatchingNodeIds_ShouldReturnTrue() {
  it('isMatchingNodeI with matching node ids should return true', () => {
    const event1 = createEvent('nodeEntered', 'node1');
    const event2 = createEvent('nodeEntered', 'node1');
    expect(exportVisitsController.isMatchingNodeId(event1, event2)).toEqual(true);
  });
}

function createVisit_WithEnterAndExitEvent_ShouldCreateAVisit() {
  it('createVisit with enter and exit events should create visit', () => {
    const userInfo = {
      users: [{ id: 100, name: 'Spongebob Squarepants' }]
    };
    spyOn(ConfigService, 'getUserInfoByWorkgroupId').and.returnValue(userInfo);
    const enterEvent = createEvent('nodeEntered', 'node1', 100, 10000);
    const exitEvent = createEvent('nodeExited', 'node1', 100, 30000);
    const previousVisits = [
      createRow('node1', '1.1: HTML Step', 100),
      createRow('node2', '1.2: Open Response Step', 100),
      createRow('node3', '1.3: Graph Step', 100)
    ];
    exportVisitsController.incrementVisitCounter(100, 'node1');
    const visit = exportVisitsController.createVisit(enterEvent, exitEvent, previousVisits);
    expect(exportVisitsController.getCellInRow(visit, '#')).toEqual(1);
    expect(exportVisitsController.getCellInRow(visit, 'Node ID')).toEqual('node1');
    expect(exportVisitsController.getCellInRow(visit, 'Step Title')).toEqual('1.1: HTML Step');
    expect(exportVisitsController.getCellInRow(visit, 'Visit Duration (Seconds)')).toEqual(20);
    expect(exportVisitsController.getCellInRow(visit, 'Visit Counter')).toEqual(2);
    expect(exportVisitsController.getCellInRow(visit, 'Revisit Counter')).toEqual(1);
    expect(exportVisitsController.getCellInRow(visit, 'Previous Node ID')).toEqual('node3');
    expect(exportVisitsController.getCellInRow(visit, 'Previous Step Title')).toEqual(
      '1.3: Graph Step'
    );
    expect(exportVisitsController.getCellInRow(visit, 'Steps Since Last Visit')).toEqual(
      '1.2, 1.3'
    );
  });
}

function createVisit_WithNoPreviousVisits_ShouldCreateAVisit() {
  it('createVisit with enter and exit events should create visit', () => {
    const userInfo = { users: [{ id: 100, name: 'Spongebob Squarepants' }] };
    spyOn(ConfigService, 'getUserInfoByWorkgroupId').and.returnValue(userInfo);
    const enterEvent = createEvent('nodeEntered', 'node1', 100, 10000);
    const exitEvent = createEvent('nodeExited', 'node1', 100, 30000);
    const previousVisits = [];
    const visit = exportVisitsController.createVisit(enterEvent, exitEvent, previousVisits);
    expect(exportVisitsController.getCellInRow(visit, '#')).toEqual(1);
    expect(exportVisitsController.getCellInRow(visit, 'Node ID')).toEqual('node1');
    expect(exportVisitsController.getCellInRow(visit, 'Step Title')).toEqual('1.1: HTML Step');
    expect(exportVisitsController.getCellInRow(visit, 'Visit Duration (Seconds)')).toEqual(20);
    expect(exportVisitsController.getCellInRow(visit, 'Visit Counter')).toEqual(1);
    expect(exportVisitsController.getCellInRow(visit, 'Revisit Counter')).toEqual(0);
    expect(exportVisitsController.getCellInRow(visit, 'Previous Node ID')).toBeUndefined();
    expect(exportVisitsController.getCellInRow(visit, 'Previous Step Title')).toBeUndefined();
    expect(exportVisitsController.getCellInRow(visit, 'Steps Since Last Visit')).toBeUndefined();
  });
}

function createVisit_WithOnlyEnterEvent_ShouldCreateAVisit() {
  it('createVisit with only enter should create visit', () => {
    const userInfo = {
      users: [{ id: 100, name: 'Spongebob Squarepants' }]
    };
    spyOn(ConfigService, 'getUserInfoByWorkgroupId').and.returnValue(userInfo);
    const enterEvent = createEvent('nodeEntered', 'node1', 100, 10000);
    const exitEvent = null;
    const previousVisits = [
      createRow('node1', '1.1: HTML Step', 100),
      createRow('node2', '1.2: Open Response Step', 100),
      createRow('node3', '1.3: Graph Step', 100)
    ];
    exportVisitsController.incrementVisitCounter(100, 'node1');
    const visit = exportVisitsController.createVisit(enterEvent, exitEvent, previousVisits);
    expect(exportVisitsController.getCellInRow(visit, '#')).toEqual(1);
    expect(exportVisitsController.getCellInRow(visit, 'Node ID')).toEqual('node1');
    expect(exportVisitsController.getCellInRow(visit, 'Step Title')).toEqual('1.1: HTML Step');
    expect(exportVisitsController.getCellInRow(visit, 'Exit Time')).toEqual('(Unknown Exit Time)');
    expect(exportVisitsController.getCellInRow(visit, 'Visit Duration (Seconds)')).toEqual(
      '(Unknown Visit Duration)'
    );
    expect(exportVisitsController.getCellInRow(visit, 'Visit Counter')).toEqual(2);
    expect(exportVisitsController.getCellInRow(visit, 'Revisit Counter')).toEqual(1);
    expect(exportVisitsController.getCellInRow(visit, 'Previous Node ID')).toEqual('node3');
    expect(exportVisitsController.getCellInRow(visit, 'Previous Step Title')).toEqual(
      '1.3: Graph Step'
    );
    expect(exportVisitsController.getCellInRow(visit, 'Steps Since Last Visit')).toEqual(
      '1.2, 1.3'
    );
  });
}

function getPreviousVisit_ShouldGetPreviousVisit() {
  it('createRowWithEmptyCells should get previous visit', () => {
    const visit = exportVisitsController.createRowWithEmptyCells();
    const workgroupId = 100;
    exportVisitsController.setCellInRow(visit, 'Workgroup ID', workgroupId);
    const previousVisits = [visit];
    const previousVisit = exportVisitsController.getPreviousVisit(previousVisits, workgroupId);
    expect(previousVisit).toEqual(visit);
  });
}

function getPreviousVisit_ShouldReturnNullIfWorkgroupIdIsDifferent() {
  it('createRowWithEmptyCells should return null if workgroup id is different', () => {
    const visit = exportVisitsController.createRowWithEmptyCells();
    const workgroupId = 100;
    exportVisitsController.setCellInRow(visit, 'Workgroup ID', workgroupId);
    const previousVisits = [visit];
    const workgroupId2 = 101;
    const previousVisit = exportVisitsController.getPreviousVisit(previousVisits, workgroupId2);
    expect(previousVisit).toEqual(null);
  });
}

function createRowWithEmptyCells_ShouldReturnArrayWithEmptyValues() {
  it('createRowWithEmptyCells should return array with empty values', () => {
    const row = exportVisitsController.createRowWithEmptyCells();
    expect(row.length).toEqual(26);
    expect(row[0]).toBeUndefined();
    expect(row[1]).toBeUndefined();
    expect(row[24]).toBeUndefined();
    expect(row[25]).toBeUndefined();
  });
}

function getNodeIdsBetweenLastVisit_ShouldReturnAStringOfStepNumbers() {
  it('getNodeIdsBetweenLastVisit should return a string of step numbers', () => {
    const previousVisits = [
      createRow('node1'),
      createRow('node2'),
      createRow('node3'),
      createRow('node4'),
      createRow('node5'),
      createRow('node1'),
      createRow('node2'),
      createRow('node3'),
      createRow('node6'),
      createRow('node7')
    ];
    expect(exportVisitsController.getNodeIdsBetweenLastVisit('node3', previousVisits)).toEqual(
      'node6, node7'
    );
  });
}

function getStepNumbersBetweenLastVisit_ShouldReturnAStringOfStepNumbers() {
  it('getStepNumbersBetweenLastVisit should return a string of step numbers', () => {
    const previousVisits = [
      createRow('node1'),
      createRow('node2'),
      createRow('node3'),
      createRow('node4'),
      createRow('node5'),
      createRow('node1'),
      createRow('node2'),
      createRow('node3'),
      createRow('node6'),
      createRow('node7')
    ];
    expect(exportVisitsController.getStepNumbersBetweenLastVisit('node3', previousVisits)).toEqual(
      '1.6, 1.7'
    );
  });
}

function addUserCells_WithOneStudentNotIncludingNames_ShouldSetTheWISEID() {
  it('addUserCells with one student should set the wise id', () => {
    const userInfo = { users: [{ id: 100, name: 'Spongebob Squarepants' }] };
    spyOn(ConfigService, 'getUserInfoByWorkgroupId').and.returnValue(userInfo);
    exportVisitsController.includeStudentNames = false;
    const row = createRow('node1');
    exportVisitsController.addUserCells(row, 100);
    expect(exportVisitsController.getCellInRow(row, 'WISE ID 1')).toEqual(100);
    expect(exportVisitsController.getCellInRow(row, 'Student Name 1')).toBeUndefined();
  });
}

function addUserCells_WithOneStudentIncludingNames_ShouldSetTheWISEIDAndStudentName() {
  it('addUserCells with one student including names should set the wise id and student name', () => {
    const userInfo = { users: [{ id: 1000, name: 'Spongebob Squarepants' }] };
    spyOn(ConfigService, 'getUserInfoByWorkgroupId').and.returnValue(userInfo);
    exportVisitsController.includeStudentNames = true;
    const row = createRow('node1');
    exportVisitsController.addUserCells(row, 100);
    expect(exportVisitsController.getCellInRow(row, 'WISE ID 1')).toEqual(1000);
    expect(exportVisitsController.getCellInRow(row, 'Student Name 1')).toEqual(
      'Spongebob Squarepants'
    );
  });
}

function addUserCells_WithMultipleStudentsIncludingNames_ShouldSetTheWISEIDAndStudentNames() {
  it('addUserCells with multiple students including names should set the wise id and student names', () => {
    const userInfo = {
      users: [
        { id: 1000, name: 'Spongebob Squarepants' },
        { id: 1001, name: 'Patrick Star' }
      ]
    };
    spyOn(ConfigService, 'getUserInfoByWorkgroupId').and.returnValue(userInfo);
    exportVisitsController.includeStudentNames = true;
    const row = createRow('node1');
    exportVisitsController.addUserCells(row, 100);
    expect(exportVisitsController.getCellInRow(row, 'WISE ID 1')).toEqual(1000);
    expect(exportVisitsController.getCellInRow(row, 'Student Name 1')).toEqual(
      'Spongebob Squarepants'
    );
    expect(exportVisitsController.getCellInRow(row, 'WISE ID 2')).toEqual(1001);
    expect(exportVisitsController.getCellInRow(row, 'Student Name 2')).toEqual('Patrick Star');
  });
}

function getVisitDuration_ShouldGetTheTimeDifferenceBetweenEventsInSeconds() {
  it('getVisitDuration should get the time difference between events in seconds', () => {
    const event1 = createEvent(null, null, null, 1000);
    const event2 = createEvent(null, null, null, 3000);
    expect(exportVisitsController.getVisitDuration(event1, event2)).toEqual(2);
  });
}

function getColumnNumber_ShouldReturnTheColumnNumber() {
  it('getColumnNumber should return the column number', () => {
    expect(exportVisitsController.getColumnNumber('Node ID')).toEqual(15);
  });
}

function incrementRowCounter_ShouldIncrementRowCounterBy1() {
  it('incrementRowCounter should increment row counter by 1', () => {
    exportVisitsController.rowCounter = 0;
    exportVisitsController.incrementRowCounter();
    expect(exportVisitsController.rowCounter).toEqual(1);
  });
}

function getStepNumber_ShouldGetAStringContainingStepNumber() {
  it('getStepNumberAndTitle should get a string containing step number', () => {
    expect(exportVisitsController.getStepNumber('node1')).toEqual('1.1');
  });
}

function getStepNumber_ShouldGetAStringForADeletedStep() {
  it('getStepNumber should get a string for a deleted step', () => {
    exportVisitsController.deletedSteps['node10'] = true;
    expect(exportVisitsController.getStepNumber('node10')).toEqual('(Deleted Step)');
  });
}

function getStepNumberAndTitle_ShouldGetAStringContainingStepNumberAndTitle() {
  it('getStepNumberAndTitle should get a string containing step number and title', () => {
    expect(exportVisitsController.getStepNumberAndTitle('node1')).toEqual('1.1: HTML Step');
  });
}

function getStepNumberAndTitle_ShouldGetAStringForADeletedStep() {
  it('getStepNumberAndTitle should get a string for a deleted step', () => {
    exportVisitsController.deletedSteps['node10'] = true;
    expect(exportVisitsController.getStepNumberAndTitle('node10')).toEqual('(Deleted Step)');
  });
}

function getWorkgroupIdNodeIdKey_ShouldGetAStringContainingWorkgroupIdAndNodeId() {
  it('getWorkgroupIdNodeIdKey should get a string containing workgroup id and node id', () => {
    const workgroupId = 100;
    const nodeId = 'node1';
    expect(exportVisitsController.getWorkgroupIdNodeIdKey(workgroupId, nodeId)).toEqual(
      '100-node1'
    );
  });
}

function getStepNumber_ShouldGetTheStepNumberString() {
  it('getStepNumber should get the step number string', () => {
    expect(exportVisitsController.getStepNumber('node1')).toEqual('1.1');
  });
}

function incrementVisitCounter_ShouldIncreaseTheCounterBy1() {
  it('incrementVisitCounter should increase the counter by 1', () => {
    const workgroupId = 100;
    const nodeId = 'node1';
    const key = exportVisitsController.getWorkgroupIdNodeIdKey(workgroupId, nodeId);
    exportVisitsController.workgroupIdNodeIdToVisitCounter[key] = 0;
    exportVisitsController.incrementVisitCounter(workgroupId, nodeId);
    expect(exportVisitsController.workgroupIdNodeIdToVisitCounter[key]).toEqual(1);
  });
}

function getVisitCounter_ShouldGetTheVisitCount() {
  it('getVisitCounter should get the visit count', () => {
    const workgroupId = 100;
    const nodeId = 'node1';
    const key = exportVisitsController.getWorkgroupIdNodeIdKey(workgroupId, nodeId);
    exportVisitsController.workgroupIdNodeIdToVisitCounter[key] = 2;
    expect(exportVisitsController.getVisitCounter(workgroupId, nodeId)).toEqual(2);
  });
}

function getRevisitCounter_ShouldGetTheRevisitCount() {
  it('getRevisitCounter should get the revisit count', () => {
    const workgroupId = 100;
    const nodeId = 'node1';
    const key = exportVisitsController.getWorkgroupIdNodeIdKey(workgroupId, nodeId);
    exportVisitsController.workgroupIdNodeIdToVisitCounter[key] = 2;
    expect(exportVisitsController.getRevisitCounter(workgroupId, nodeId)).toEqual(1);
  });
}

function setCellInRow_ShouldSetTheValueInTheCell() {
  it('setCellInRow should set the value in the cell', () => {
    const row = createRow('node1');
    exportVisitsController.setCellInRow(row, 'Workgroup ID', 100);
    expect(row[1]).toEqual(100);
  });
}

function getCellInRow_ShouldGetTheValueInTheCell() {
  it('getCellInRow should get the value in the cell', () => {
    const row = createRow('node1');
    expect(exportVisitsController.getCellInRow(row, 'Node ID')).toEqual('node1');
  });
}
