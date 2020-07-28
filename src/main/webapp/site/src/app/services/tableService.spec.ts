import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from "@angular/core";
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
import { ExpectedConditions } from 'protractor';

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
  componentStateHasStudentWork();
  isRowFilled();
  isAtLeastOneCellFilledInrow();
  isAllCellsFilledInRow();
});

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
  it('should check if a component is completed when it has no editable cells', () => {
    const component = {
      tableData: [
        { text: 'Item', editable: false },
        { text: 'Count', editable: false }
      ]
    };
    expect(service.isCompleted(component, [], [], [], {})).toEqual(true);
  });
  it('should check if a component is completed is false when submit button is not showing', () => {
    const component = {
      tableData: [
        [
          { text: 'Item', editable: true },
          { text: 'Count', editable: true }
        ]
      ],
      showSaveButton: false,
      showSubmitButton: false
    };
    const node = {
      showSubmitButton: false
    };
    const componentStates = [];
    expect(service.isCompleted(component, componentStates, [], [], node)).toEqual(false);
  });
  it('should check if a component is completed is true when submit button is not showing', () => {
    const component = {
      tableData: [
        [
          { text: 'Item', editable: true },
          { text: 'Count', editable: true }
        ]
      ],
      showSaveButton: false,
      showSubmitButton: false
    };
    const node = {
      showSubmitButton: false
    };
    const componentStates = [
      {
        studentData: {
          tableData: []
        },
        isSubmit: false
      }
    ];
    expect(service.isCompleted(component, componentStates, [], [], node)).toEqual(true);
  });
  it('should check if a component is completed is false when submit button is showing', () => {
    const component = {
      tableData: [
        [
          { text: 'Item', editable: true },
          { text: 'Count', editable: true }
        ]
      ],
      showSaveButton: true,
      showSubmitButton: true
    };
    const node = {
      showSubmitButton: false
    };
    const componentStates = [
      {
        studentData: {
          tableData: []
        },
        isSubmit: false
      }
    ];
    expect(service.isCompleted(component, componentStates, [], [], node)).toEqual(false);
  });
  it('should check if a component is completed is true when submit button is showing', () => {
    const component = {
      tableData: [
        [
          { text: 'Item', editable: true },
          { text: 'Count', editable: true }
        ]
      ],
      showSaveButton: true,
      showSubmitButton: true
    };
    const node = {
      showSubmitButton: false
    };
    const componentStates = [
      {
        studentData: {
          tableData: []
        },
        isSubmit: true
      }
    ];
    expect(service.isCompleted(component, componentStates, [], [], node)).toEqual(true);
  });
}

function componentHasEditableCells() {
  it('should calculate if a component has editable cells when it is false', () => {
    const component = {
      tableData: [
        [
          { text: '', editable: false },
          { text: '', editable: false }
        ]
      ]
    };
    expect(service.componentHasEditableCells(component)).toEqual(false);
  });
  it('should calculate if a component has editable cells when it is true', () => {
    const component = {
      tableData: [
        [
          { text: '', editable: false },
          { text: '', editable: true }
        ]
      ]
    };
    expect(service.componentHasEditableCells(component)).toEqual(true);
  });
}

function componentStateHasStudentWork() {
  it('should check if component state has student work when it is false', () => {
    const componentContent = {
      tableData: [
        [
          { text: '' },
          { text: '' }
        ]      ]
    };
    const componentState = {
      studentData: {
        tableData: [
          [
            { text: '' },
            { text: '' }
          ]
        ]
      }
    };
    expect(service.componentStateHasStudentWork(componentState, componentContent)).toEqual(false);
  });
  it('should check if component state has student work when it is true', () => {
    const componentContent = {
      tableData: [
        [
          { text: '' },
          { text: '' }
        ]      ]
    };
    const componentState = {
      studentData: {
        tableData: [
          [
            { text: 'Hello World' },
            { text: '' }
          ]
        ]
      }
    };
    expect(service.componentStateHasStudentWork(componentState, componentContent)).toEqual(true);
  });
}

function getTableDataCellValue() {
  it('should get table data cell value', () => {
    const table = [
      [
        { text: 'Upper Left' },
        { text: 'Upper Right' }
      ],
      [
        { text: 'Bottom Left' },
        { text: 'Bottom Right' }
      ]
    ];
    expect(service.getTableDataCellValue(0, 0, table)).toEqual('Upper Left');
    expect(service.getTableDataCellValue(1, 0, table)).toEqual('Upper Right');
    expect(service.getTableDataCellValue(0, 1, table)).toEqual('Bottom Left');
    expect(service.getTableDataCellValue(1, 1, table)).toEqual('Bottom Right');
  });
}

function hasRequirednumberOfFilledRows() {
  it(`should check if student data has the required number of filled rows when all cells in row are 
      not required to be filled and returns false`, () => {
    const componentState = {
      studentData: {
        tableData: [
          [ { text: 'Object' }, { text: 'Count' } ],
          [ { text: 'Computer' }, { text: '' } ],
          [ { text: '' }, { text: '' } ],
        ]
      }
    };
    const requiredNumberOfFilledRows = 2;
    const tableHasHeaderRow = true;
    const requireAllCellsInARowToBeFilled = false;
    expect(service.hasRequiredNumberOfFilledRows(componentState, requiredNumberOfFilledRows,
        tableHasHeaderRow, requireAllCellsInARowToBeFilled)).toEqual(false);
  });
  it(`should check if student data has the required number of filled rows when all cells in row are 
      required to be filled and returns false`, () => {
    const componentState = {
      studentData: {
        tableData: [
          [ { text: 'Object' }, { text: 'Count' } ],
          [ { text: 'Computer' }, { text: '2' } ],
          [ { text: 'Computer' }, { text: '' } ],
        ]
      }
    };
    const requiredNumberOfFilledRows = 2;
    const tableHasHeaderRow = true;
    const requireAllCellsInARowToBeFilled = true;
    expect(service.hasRequiredNumberOfFilledRows(componentState, requiredNumberOfFilledRows,
        tableHasHeaderRow, requireAllCellsInARowToBeFilled)).toEqual(false);
  });
  it(`should check if student data has the required number of filled rows when all cells in row are 
      not required to be filled and returns true`, () => {
    const componentState = {
      studentData: {
        tableData: [
          [ { text: 'Object' }, { text: 'Count' } ],
          [ { text: 'Computer' }, { text: '' } ],
          [ { text: 'Phone' }, { text: '' } ],
        ]
      }
    };
    const requiredNumberOfFilledRows = 2;
    const tableHasHeaderRow = true;
    const requireAllCellsInARowToBeFilled = false;
    expect(service.hasRequiredNumberOfFilledRows(componentState, requiredNumberOfFilledRows,
        tableHasHeaderRow, requireAllCellsInARowToBeFilled)).toEqual(true);
  });
  it(`should check if student data has the required number of filled rows when all cells in row are 
      required to be filled and returns true`, () => {
    const componentState = {
      studentData: {
        tableData: [
          [ { text: 'Object' }, { text: 'Count' } ],
          [ { text: 'Computer' }, { text: '2' } ],
          [ { text: 'Phone' }, { text: '1' } ],
        ]
      }
    };
    const requiredNumberOfFilledRows = 2;
    const tableHasHeaderRow = true;
    const requireAllCellsInARowToBeFilled = true;
    expect(service.hasRequiredNumberOfFilledRows(componentState, requiredNumberOfFilledRows,
        tableHasHeaderRow, requireAllCellsInARowToBeFilled)).toEqual(true);
  });
}

function isRowFilled() {
  it('should check if row is filled when not all cells are required and returns false', () => {
    const row = [
      { text: '' },
      { text: '' }
    ];
    const requireAllCellsFilled = false;
    expect(service.isRowFilled(row, requireAllCellsFilled)).toEqual(false);
  });
  it('should check if row is filled when not all cells are required and returns true', () => {
    const row = [
      { text: '' },
      { text: 'Hello World' }
    ];
    const requireAllCellsFilled = false;
    expect(service.isRowFilled(row, requireAllCellsFilled)).toEqual(true);
  });
  it('should check if row is filled when all cells are required and returns false', () => {
    const row = [
      { text: '' },
      { text: 'Hello World' }
    ];
    const requireAllCellsFilled = true;
    expect(service.isRowFilled(row, requireAllCellsFilled)).toEqual(false);
  });
  it('should check if row is filled when all cells are required and returns true', () => {
    const row = [
      { text: 'Hello' },
      { text: 'World' }
    ];
    const requireAllCellsFilled = true;
    expect(service.isRowFilled(row, requireAllCellsFilled)).toEqual(true);
  });
}

function isAllCellsFilledInRow() {
  it('should check if all cells are filled in a row when it is false', () => {
    const row = [
      { text: '' },
      { text: 'Hello World' }
    ];
    expect(service.isAllCellsFilledInRow(row)).toEqual(false);
  });
  it('should check if all cells are filled in a row when it is true', () => {
    const row = [
      { text: 'Hello' },
      { text: 'World' }
    ];
    expect(service.isAllCellsFilledInRow(row)).toEqual(true);
  });
}

function isAtLeastOneCellFilledInrow() {
  it('should check if at least one cell is filled in a row when it is false', () => {
    const row = [
      { text: '' }
    ];
    expect(service.isAtLeastOneCellFilledInRow(row)).toEqual(false);
  });
  it('should check if at least one cell is filled in a row when it is true', () => {
    const row = [
      { text: 'Hello World' }
    ];
    expect(service.isAtLeastOneCellFilledInRow(row)).toEqual(true);
  });
}
