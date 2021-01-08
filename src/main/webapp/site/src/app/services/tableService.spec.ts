import { TestBed } from '@angular/core/testing';
import { TableService } from '../../../../wise5/components/table/tableService';
import { UpgradeModule } from '@angular/upgrade/static';
import { StudentAssetService } from '../../../../wise5/services/studentAssetService';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigService } from '../../../../wise5/services/configService';
import { StudentDataService } from '../../../../wise5/services/studentDataService';
import { AnnotationService } from '../../../../wise5/services/annotationService';
import { ProjectService } from '../../../../wise5/services/projectService';
import { UtilService } from '../../../../wise5/services/utilService';
import { TagService } from '../../../../wise5/services/tagService';
import { SessionService } from '../../../../wise5/services/sessionService';

let service: TableService;

describe('TableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [
        AnnotationService,
        ConfigService,
        ProjectService,
        SessionService,
        StudentAssetService,
        StudentDataService,
        TableService,
        TagService,
        UtilService
      ]
    });
    service = TestBed.get(TableService);
  });
  createComponent();
  isCompleted();
  componentHasEditableCells();
  getTableDataCellValue();
  hasRequiredNumberOfFilledRows();
  componentStateHasStudentWork();
  isRowFilled();
  isAtLeastOneCellFilledInrow();
  isAllCellsFilledInRow();
});

function createTableComponent(
  tableData: any[],
  showSaveButton: boolean,
  showSubmitButton: boolean
) {
  return {
    tableData: tableData,
    showSaveButton: showSaveButton,
    showSubmitButton: showSubmitButton
  };
}

function createNode(showSubmitButton: boolean) {
  return {
    showSubmitButton: showSubmitButton
  };
}

function createStudentData(tableData: any) {
  return {
    tableData: tableData
  };
}

function createComponentState(studentData: any, isSubmit: boolean) {
  return {
    studentData: studentData,
    isSubmit: isSubmit
  };
}

function createCell(text: string, isEditable: boolean = true) {
  return { text: text, editable: isEditable };
}

function createComponent() {
  it('should create a component', () => {
    const component = service.createComponent();
    expect(component.type).toEqual('Table');
    expect(component.numRows).toEqual(3);
    expect(component.numColumns).toEqual(3);
    expect(component.globalCellSize).toEqual(10);
    expect(component.tableData.length).toEqual(3);
  });
}

function isCompleted() {
  const node = createNode(false);
  const authoredTableData = [[createCell('Item'), createCell('Count')]];
  const componentNotShowingSaveOrSubmit = createTableComponent(authoredTableData, false, false);
  const componentShowingSaveAndSubmit = createTableComponent(authoredTableData, true, true);
  const studentData = createStudentData([]);
  const componentStateSubmitFalse = createComponentState(studentData, false);
  const componentStateSubmitTrue = createComponentState(studentData, true);
  function expectIsCompleted(component: any, componentStates: any, expectedResult: boolean) {
    expect(service.isCompleted(component, componentStates, [], [], node)).toEqual(expectedResult);
  }
  it('should check if a component is completed when it has no editable cells', () => {
    const component = { tableData: [createCell('Item', false), createCell('Count', false)] };
    expectIsCompleted(component, [], true);
  });
  it('should check if a component is completed is false when submit button is not showing', () => {
    expectIsCompleted(componentNotShowingSaveOrSubmit, [], false);
  });
  it('should check if a component is completed is true when submit button is not showing', () => {
    expectIsCompleted(componentNotShowingSaveOrSubmit, [componentStateSubmitFalse], true);
  });
  it('should check if a component is completed is false when submit button is showing', () => {
    expectIsCompleted(componentShowingSaveAndSubmit, [componentStateSubmitFalse], false);
  });
  it('should check if a component is completed is true when submit button is showing', () => {
    expectIsCompleted(componentShowingSaveAndSubmit, [componentStateSubmitTrue], true);
  });
}

function componentHasEditableCells() {
  let component: any;
  beforeEach(() => {
    const authoredTableData = [[createCell('Item', false), createCell('Count', false)]];
    component = createTableComponent(authoredTableData, false, false);
  });
  it('should calculate if a component has editable cells when it is false', () => {
    expect(service.componentHasEditableCells(component)).toEqual(false);
  });
  it('should calculate if a component has editable cells when it is true', () => {
    component.tableData[0][1].editable = true;
    expect(service.componentHasEditableCells(component)).toEqual(true);
  });
}

function componentStateHasStudentWork() {
  let componentState;
  let componentContent;
  beforeEach(() => {
    const studentData = { tableData: [[createCell(''), createCell('')]] };
    componentState = createComponentState(studentData, false);
    const tableData = [[createCell(''), createCell('')]];
    componentContent = createTableComponent(tableData, true, true);
  });
  it('should check if component state has student work when it is false', () => {
    expect(service.componentStateHasStudentWork(componentState, componentContent)).toEqual(false);
  });
  it('should check if component state has student work when it is true', () => {
    componentState.studentData.tableData[0][0].text = 'Hello World';
    expect(service.componentStateHasStudentWork(componentState, componentContent)).toEqual(true);
  });
}

function getTableDataCellValue() {
  it('should get table data cell value', () => {
    const table = [
      [createCell('Upper Left'), createCell('Upper Right')],
      [createCell('Bottom Left'), createCell('Bottom Right')]
    ];
    expect(service.getTableDataCellValue(0, 0, table)).toEqual('Upper Left');
    expect(service.getTableDataCellValue(1, 0, table)).toEqual('Upper Right');
    expect(service.getTableDataCellValue(0, 1, table)).toEqual('Bottom Left');
    expect(service.getTableDataCellValue(1, 1, table)).toEqual('Bottom Right');
  });
}

function hasRequiredNumberOfFilledRows() {
  let componentState: any;
  beforeEach(() => {
    const studentData = createStudentData([
      [createCell('Object'), createCell('Count')],
      [createCell('Computer'), createCell('')],
      [createCell(''), createCell('')]
    ]);
    componentState = createComponentState(studentData, false);
  });
  function expectHasRequiredNumberOfFilledRows(
    componentState: any,
    requiredNumberOfFilledRows: number,
    tableHasHeaderRow: boolean,
    requireAllCellsInARowToBeFilled: boolean,
    expectedResult: boolean
  ) {
    expect(
      service.hasRequiredNumberOfFilledRows(
        componentState,
        requiredNumberOfFilledRows,
        tableHasHeaderRow,
        requireAllCellsInARowToBeFilled
      )
    ).toEqual(expectedResult);
  }
  it(`should check if student data has the required number of filled rows when all cells in a row
      are not required to be filled and returns false`, () => {
    expectHasRequiredNumberOfFilledRows(componentState, 2, true, false, false);
  });
  it(`should check if student data has the required number of filled rows when all cells in a row
      are required to be filled and returns false`, () => {
    componentState.studentData.tableData[1][1].text = '2';
    expectHasRequiredNumberOfFilledRows(componentState, 2, true, true, false);
  });
  it(`should check if student data has the required number of filled rows when all cells in a row
      are not required to be filled and returns true`, () => {
    componentState.studentData.tableData[2][0].text = 'Phone';
    expectHasRequiredNumberOfFilledRows(componentState, 2, true, false, true);
  });
  it(`should check if student data has the required number of filled rows when all cells in a row
      are required to be filled and returns true`, () => {
    componentState.studentData.tableData[1][1].text = '2';
    componentState.studentData.tableData[2][0].text = 'Phone';
    componentState.studentData.tableData[2][1].text = '1';
    expectHasRequiredNumberOfFilledRows(componentState, 2, true, true, true);
  });
}

function isRowFilled() {
  let row;
  beforeEach(() => {
    row = [createCell(''), createCell('')];
  });
  it('should check if row is filled when not all cells are required and returns false', () => {
    expect(service.isRowFilled(row, false)).toEqual(false);
  });
  it('should check if row is filled when not all cells are required and returns true', () => {
    row[1].text = 'Hello World';
    expect(service.isRowFilled(row, false)).toEqual(true);
  });
  it('should check if row is filled when all cells are required and returns false', () => {
    row[1].text = 'Hello World';
    expect(service.isRowFilled(row, true)).toEqual(false);
  });
  it('should check if row is filled when all cells are required and returns true', () => {
    row[0].text = 'Hello';
    row[1].text = 'World';
    expect(service.isRowFilled(row, true)).toEqual(true);
  });
}

function isAllCellsFilledInRow() {
  let row;
  beforeEach(() => {
    row = [createCell(''), createCell('')];
  });
  it('should check if all cells are filled in a row when it is false', () => {
    row[1].text = 'Hello World';
    expect(service.isAllCellsFilledInRow(row)).toEqual(false);
  });
  it('should check if all cells are filled in a row when it is true', () => {
    row[0].text = 'Hello';
    row[1].text = 'World';
    expect(service.isAllCellsFilledInRow(row)).toEqual(true);
  });
}

function isAtLeastOneCellFilledInrow() {
  let row;
  beforeEach(() => {
    row = [createCell(''), createCell('')];
  });
  it('should check if at least one cell is filled in a row when it is false', () => {
    expect(service.isAtLeastOneCellFilledInRow(row)).toEqual(false);
  });
  it('should check if at least one cell is filled in a row when it is true', () => {
    row[1].text = 'Hello World';
    expect(service.isAtLeastOneCellFilledInRow(row)).toEqual(true);
  });
}
