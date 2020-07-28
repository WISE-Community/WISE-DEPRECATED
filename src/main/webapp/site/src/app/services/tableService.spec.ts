import { TestBed } from '@angular/core/testing';
import { TableService } from "../../../../wise5/components/table/tableService";
import { UpgradeModule } from '@angular/upgrade/static';
import { StudentAssetService } from '../../../../wise5/services/studentAssetService';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import ConfigService from '../../../../wise5/services/configService';
import { StudentDataService } from '../../../../wise5/services/studentDataService';
import { AnnotationService } from '../../../../wise5/services/annotationService';
import { ProjectService } from '../../../../wise5/services/projectService';
import { UtilService } from '../../../../wise5/services/utilService';
import { TagService } from '../../../../wise5/services/tagService';

let service: TableService;

describe('TableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, UpgradeModule ],
      providers: [
        AnnotationService,
        ConfigService,
        ProjectService,
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
  hasRequirednumberOfFilledRows();
  componentStateHasStudentWork();
  isRowFilled();
  isAtLeastOneCellFilledInrow();
  isAllCellsFilledInRow();
});

function createTableComponent(
    tableData: any[],
    showSaveButton: boolean,
    showSubmitButton: boolean) {
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
  const authoredTableData = [ [ createCell('Item'), createCell('Count') ] ];
  const componentNotShowingSaveOrSubmit = createTableComponent(authoredTableData, false, false);
  const componentShowingSaveAndSubmit = createTableComponent(authoredTableData, true, true);
  const studentData = createStudentData([]);
  const componentStateSubmitFalse = createComponentState(studentData, false);
  const componentStateSubmitTrue = createComponentState(studentData, true);
  it('should check if a component is completed when it has no editable cells', () => {
    const component = { tableData: [ createCell('Item', false), createCell('Count', false) ]
    };
    expect(service.isCompleted(component, [], [], [], {})).toEqual(true);
  });
  it('should check if a component is completed is false when submit button is not showing', () => {
    const component = componentNotShowingSaveOrSubmit;
    const componentStates = [];
    expect(service.isCompleted(component, componentStates, [], [], node)).toEqual(false);
  });
  it('should check if a component is completed is true when submit button is not showing', () => {
    const component = componentNotShowingSaveOrSubmit;
    const componentStates = [componentStateSubmitFalse];
    expect(service.isCompleted(component, componentStates, [], [], node)).toEqual(true);
  });
  it('should check if a component is completed is false when submit button is showing', () => {
    const component = componentShowingSaveAndSubmit;
    const componentStates = [componentStateSubmitFalse];
    expect(service.isCompleted(component, componentStates, [], [], node)).toEqual(false);
  });
  it('should check if a component is completed is true when submit button is showing', () => {
    const component = componentShowingSaveAndSubmit;
    const componentStates = [componentStateSubmitTrue];
    expect(service.isCompleted(component, componentStates, [], [], node)).toEqual(true);
  });
}

function componentHasEditableCells() {
  it('should calculate if a component has editable cells when it is false', () => {
    const authoredTableData = [ [ createCell('Item', false), createCell('Count', false) ] ];
    const component = createTableComponent(authoredTableData, false, false);
    expect(service.componentHasEditableCells(component)).toEqual(false);
  });
  it('should calculate if a component has editable cells when it is true', () => {
    const authoredTableData = [ [ createCell('Item', false), createCell('Count', true) ] ];
    const component = createTableComponent(authoredTableData, false, false);
    expect(service.componentHasEditableCells(component)).toEqual(true);
  });
}

function componentStateHasStudentWork() {
  const tableData = [ [ createCell(''), createCell('') ] ];
  const componentContent = createTableComponent(tableData, true, true);
  it('should check if component state has student work when it is false', () => {
    const studentData = { tableData: tableData };
    const componentState = createComponentState(studentData, false);
    expect(service.componentStateHasStudentWork(componentState, componentContent)).toEqual(false);
  });
  it('should check if component state has student work when it is true', () => {
    const studentData = { tableData: [ [ createCell('Hello World'), createCell('') ] ] };
    const componentState = createComponentState(studentData, false);
    expect(service.componentStateHasStudentWork(componentState, componentContent)).toEqual(true);
  });
}

function getTableDataCellValue() {
  it('should get table data cell value', () => {
    const table = [
      [ createCell('Upper Left'), createCell('Upper Right'), ],
      [ createCell('Bottom Left'), createCell('Bottom Right') ]
    ];
    expect(service.getTableDataCellValue(0, 0, table)).toEqual('Upper Left');
    expect(service.getTableDataCellValue(1, 0, table)).toEqual('Upper Right');
    expect(service.getTableDataCellValue(0, 1, table)).toEqual('Bottom Left');
    expect(service.getTableDataCellValue(1, 1, table)).toEqual('Bottom Right');
  });
}

function hasRequirednumberOfFilledRows() {
  const tableHasHeaderRow = true;
  const requiredNumberOfFilledRows = 2;
  it(`should check if student data has the required number of filled rows when all cells in row are 
      not required to be filled and returns false`, () => {
    const studentData = createStudentData([
      [ createCell('Object'), createCell('Count') ],
      [ createCell('Computer'), createCell('') ],
      [ createCell(''), createCell('') ]
    ]);
    const componentState = createComponentState(studentData, false);
    const requireAllCellsInARowToBeFilled = false;
    expect(service.hasRequiredNumberOfFilledRows(componentState, requiredNumberOfFilledRows,
        tableHasHeaderRow, requireAllCellsInARowToBeFilled)).toEqual(false);
  });
  it(`should check if student data has the required number of filled rows when all cells in row are 
      required to be filled and returns false`, () => {
    const studentData = createStudentData([
      [ createCell('Object'), createCell('Count') ],
      [ createCell('Computer'), createCell('2') ],
      [ createCell('Phone'), createCell('') ]
    ]);
    const componentState = createComponentState(studentData, false);
    const requireAllCellsInARowToBeFilled = true;
    expect(service.hasRequiredNumberOfFilledRows(componentState, requiredNumberOfFilledRows,
        tableHasHeaderRow, requireAllCellsInARowToBeFilled)).toEqual(false);
  });
  it(`should check if student data has the required number of filled rows when all cells in row are 
      not required to be filled and returns true`, () => {
    const studentData = createStudentData([
      [ createCell('Object'), createCell('Count') ],
      [ createCell('Computer'), createCell('') ],
      [ createCell('Phone'), createCell('') ]
    ]);
    const componentState = createComponentState(studentData, false);
    const requireAllCellsInARowToBeFilled = false;
    expect(service.hasRequiredNumberOfFilledRows(componentState, requiredNumberOfFilledRows,
        tableHasHeaderRow, requireAllCellsInARowToBeFilled)).toEqual(true);
  });
  it(`should check if student data has the required number of filled rows when all cells in row are 
      required to be filled and returns true`, () => {
    const studentData = createStudentData([
      [ createCell('Object'), createCell('Count') ],
      [ createCell('Computer'), createCell('2') ],
      [ createCell('Phone'), createCell('1') ]
    ]);
    const componentState = createComponentState(studentData, false);
    const requireAllCellsInARowToBeFilled = true;
    expect(service.hasRequiredNumberOfFilledRows(componentState, requiredNumberOfFilledRows,
        tableHasHeaderRow, requireAllCellsInARowToBeFilled)).toEqual(true);
  });
}

function isRowFilled() {
  it('should check if row is filled when not all cells are required and returns false', () => {
    const row = [ createCell(''), createCell('') ];
    const requireAllCellsFilled = false;
    expect(service.isRowFilled(row, requireAllCellsFilled)).toEqual(false);
  });
  it('should check if row is filled when not all cells are required and returns true', () => {
    const row = [ createCell(''), createCell('Hello World') ];
    const requireAllCellsFilled = false;
    expect(service.isRowFilled(row, requireAllCellsFilled)).toEqual(true);
  });
  it('should check if row is filled when all cells are required and returns false', () => {
    const row = [ createCell(''), createCell('Hello World') ];
    const requireAllCellsFilled = true;
    expect(service.isRowFilled(row, requireAllCellsFilled)).toEqual(false);
  });
  it('should check if row is filled when all cells are required and returns true', () => {
    const row = [ createCell('Hello'), createCell('World') ];
    const requireAllCellsFilled = true;
    expect(service.isRowFilled(row, requireAllCellsFilled)).toEqual(true);
  });
}

function isAllCellsFilledInRow() {
  it('should check if all cells are filled in a row when it is false', () => {
    const row = [ createCell(''), createCell('Hello World') ];
    expect(service.isAllCellsFilledInRow(row)).toEqual(false);
  });
  it('should check if all cells are filled in a row when it is true', () => {
    const row = [ createCell('Hello'), createCell('World') ];
    expect(service.isAllCellsFilledInRow(row)).toEqual(true);
  });
}

function isAtLeastOneCellFilledInrow() {
  it('should check if at least one cell is filled in a row when it is false', () => {
    const row = [ createCell(''), createCell('') ];
    expect(service.isAtLeastOneCellFilledInRow(row)).toEqual(false);
  });
  it('should check if at least one cell is filled in a row when it is true', () => {
    const row = [ createCell(''), createCell('Hello World') ];
    expect(service.isAtLeastOneCellFilledInRow(row)).toEqual(true);
  });
}
