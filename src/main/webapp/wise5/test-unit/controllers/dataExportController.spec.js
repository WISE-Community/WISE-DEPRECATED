import classroomMonitorModule from '../../classroomMonitor/classroomMonitor';

let $controller;
let $rootScope;
let $scope;
let dataExportController;
let ConfigService;
let ProjectService;
let TeacherDataService;
let demoProjectJSON;
const demoProjectJSONOriginal = window.mocks['test-unit/sampleData/curriculum/DemoProject/project'];

describe('DataExportController', () => {
  beforeEach(angular.mock.module(classroomMonitorModule.name));
  beforeEach(inject((
    _ConfigService_,
    _ProjectService_,
    _TeacherDataService_,
    _$controller_,
    _$rootScope_
  ) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    ConfigService = _ConfigService_;
    ProjectService = _ProjectService_;
    TeacherDataService = _TeacherDataService_;
    spyOn(ConfigService, 'getPermissions').and.returnValue({ canViewStudentNames: true });
    spyOn(TeacherDataService, 'saveEvent').and.callFake(() => {});
    demoProjectJSON = JSON.parse(JSON.stringify(demoProjectJSONOriginal));
    ProjectService.setProject(demoProjectJSON);
    dataExportController = $controller('DataExportController', { $scope: $scope });
  }));
  shouldCreateColumnNameToNumberMapping();
  shouldCreateRow();
  shouldSetRowCounter();
  shouldCreateAStudentEventRow();
  shouldCreateAStudentRowWithShowingNames();
  shouldCreateAStudentEventRowWithoutShowingNames();
  shouldCreateATeacherEventRow();
  shouldCreateATeacherEventRowWithShowingNames();
  shouldCreateATeacherEventRowWithoutShowingNames();
});

function shouldCreateColumnNameToNumberMapping() {
  it('should create column name to number mapping', () => {
    const columnNames = ['#', 'Workgroup ID', 'User Type', 'Event'];
    const columnNameToNumber = dataExportController.getColumnNameToNumber(columnNames);
    expect(columnNameToNumber['#']).toEqual(0);
    expect(columnNameToNumber['Workgroup ID']).toEqual(1);
    expect(columnNameToNumber['User Type']).toEqual(2);
    expect(columnNameToNumber['Event']).toEqual(3);
  });
}

function shouldCreateRow() {
  it('should create row', () => {
    const row = dataExportController.createRow(5);
    expect(row.length).toEqual(5);
    expect(row[0]).toEqual('');
    expect(row[1]).toEqual('');
    expect(row[2]).toEqual('');
    expect(row[3]).toEqual('');
    expect(row[4]).toEqual('');
  });
}

function shouldSetRowCounter() {
  it('should set row counter', () => {
    const columnNames = ['#', 'Workgroup ID', 'User Type', 'Event'];
    const columnNameToNumber = dataExportController.getColumnNameToNumber(columnNames);
    const row = dataExportController.createRow(5);
    dataExportController.setRowCounter(row, columnNameToNumber, 1);
    expect(row[0]).toEqual(1);
  });
}

function shouldCreateAStudentEventRow() {
  it('should create a student event row', () => {
    const { row, columnNameToNumber } = createStudentEventExportRow();
    expect(row[columnNameToNumber['#']]).toEqual(10);
    expect(row[columnNameToNumber['Workgroup ID']]).toEqual(100);
    expect(row[columnNameToNumber['User Type']]).toEqual('Student');
    expect(row[columnNameToNumber['Student WISE ID 1']]).toEqual(1000);
    expect(row[columnNameToNumber['Event']]).toEqual('nodeEntered');
    expect(row[columnNameToNumber['Data']]).toEqual({ nodeId: 'node1' });
  });
}

function shouldCreateAStudentRowWithShowingNames() {
  it('should create a student event row with showing names', () => {
    dataExportController.includeNames = true;
    const { row, columnNameToNumber } = createStudentEventExportRow();
    expect(row[columnNameToNumber['Student Name 1']]).toEqual('Spongebob Squarepants');
  });
}

function shouldCreateAStudentEventRowWithoutShowingNames() {
  it('should create a student event row without showing names', () => {
    dataExportController.includeNames = false;
    const { row, columnNameToNumber } = createStudentEventExportRow();
    expect(row[columnNameToNumber['Student Name 1']]).toEqual('');
  });
}

function shouldCreateATeacherEventRow() {
  it('should create a teacher event row', () => {
    const { row, columnNameToNumber } = createTeacherEventExportRow();
    expect(row[columnNameToNumber['#']]).toEqual(10);
    expect(row[columnNameToNumber['Workgroup ID']]).toEqual(100);
    expect(row[columnNameToNumber['User Type']]).toEqual('Teacher');
    expect(row[columnNameToNumber['Teacher WISE ID']]).toEqual(1000);
    expect(row[columnNameToNumber['Event']]).toEqual('nodeGradingViewDisplayed');
    expect(row[columnNameToNumber['Data']]).toEqual({ nodeId: 'node1' });
  });
}

function shouldCreateATeacherEventRowWithShowingNames() {
  it('should create a teacher event row with showing names', () => {
    dataExportController.includeNames = true;
    const { row, columnNameToNumber } = createTeacherEventExportRow();
    expect(row[columnNameToNumber['Teacher Username']]).toEqual('Mrs. Puff');
  });
}

function shouldCreateATeacherEventRowWithoutShowingNames() {
  it('should create a teacher event row without showing names', () => {
    dataExportController.includeNames = false;
    const { row, columnNameToNumber } = createTeacherEventExportRow();
    expect(row[columnNameToNumber['Teacher Username']]).toEqual('');
  });
}

function createStudentEventExportRow() {
  const columnNames = dataExportController.getEventsColumnNames();
  const columnNameToNumber = dataExportController.getColumnNameToNumber(columnNames);
  const rowCounter = 10;
  const workgroupId = 100;
  const wiseId1 = 1000;
  const wiseId2 = null;
  const wiseId3 = null;
  const studentName1 = 'Spongebob Squarepants';
  const studentName2 = null;
  const studentName3 = null;
  const periodName = '5';
  const event = { event: 'nodeEntered', data: { nodeId: 'node1' } };
  const row = dataExportController.createStudentEventExportRow(columnNames, columnNameToNumber, rowCounter, workgroupId, wiseId1, wiseId2, wiseId3, studentName1, studentName2, studentName3, periodName, event);
  return { row, columnNameToNumber };
}

function createTeacherEventExportRow() {
  const columnNames = dataExportController.getEventsColumnNames();
  const columnNameToNumber = dataExportController.getColumnNameToNumber(columnNames);
  const rowCounter = 10;
  const workgroupId = 100;
  const wiseId = 1000;
  const username = 'Mrs. Puff';
  const event = { event: 'nodeGradingViewDisplayed', data: { nodeId: 'node1' } };
  const row = dataExportController.createTeacherEventExportRow(columnNames, columnNameToNumber, rowCounter, workgroupId, wiseId, username, event);
  return { row, columnNameToNumber };
}
