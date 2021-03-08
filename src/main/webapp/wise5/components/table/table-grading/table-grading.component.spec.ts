import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { configureTestSuite } from 'ng-bullet';
import { ConfigService } from '../../../services/configService';
import { ProjectService } from '../../../services/projectService';
import { SessionService } from '../../../services/sessionService';
import { UtilService } from '../../../services/utilService';
import { TableGrading } from './table-grading.component';

let fixture: ComponentFixture<TableGrading>;
let component: TableGrading;

describe('TableGrading', () => {
  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [TableGrading],
      providers: [ConfigService, ProjectService, SessionService, UpgradeModule, UtilService]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableGrading);
    const componentContent = {
      isDataExplorerEnabled: false
    };
    spyOn(TestBed.get(ProjectService), 'getComponentByNodeIdAndComponentId').and.returnValue(
      componentContent
    );
    component = fixture.componentInstance;
    component.componentContent = {};
    component.componentState = '{ "studentData": { "tableData": [] } }';
    fixture.detectChanges();
    component.componentContent = { globalCellSize: 10 };
  });

  injectCellWidths();
  calculateCellWidth();
  calculateColumnNames();
});

function createCell(text: string): any {
  return { text: text };
}

function createComponentState(tableData: any): any {
  return {
    studentData: {
      tableData: tableData
    }
  };
}

function injectCellWidths() {
  describe('injectCellWidths', () => {
    it('should inject cell widths', () => {
      const tableData: any[] = [
        [{}, {}],
        [{}, {}]
      ];
      const expectedWidth = 100;
      expect(tableData[0][0].width).toBeUndefined();
      expect(tableData[0][1].width).toBeUndefined();
      expect(tableData[1][0].width).toBeUndefined();
      expect(tableData[1][1].width).toBeUndefined();
      component.injectCellWidths(tableData);
      expect(tableData[0][0].width).toEqual(expectedWidth);
      expect(tableData[0][1].width).toEqual(expectedWidth);
      expect(tableData[1][0].width).toEqual(expectedWidth);
      expect(tableData[1][1].width).toEqual(expectedWidth);
    });
  });
}

function calculateCellWidth() {
  describe('calculateCellWidth', () => {
    it('should calculate cell width when it has none', () => {
      const cell = {};
      expect(component.calculateCellWidth(cell)).toEqual(100);
    });

    it('should calculate cell width when it cell has a size set', () => {
      const cell = { size: 20 };
      expect(component.calculateCellWidth(cell)).toEqual(200);
    });
  });
}

function calculateColumnNames() {
  describe('calculateColumnNames', () => {
    it('should calculate column names', () => {
      const columnName1 = 'Year';
      const columnName2 = 'Price';
      const tableData = [
        [createCell(columnName1), createCell(columnName2)],
        [createCell('2020'), createCell('100')]
      ];
      const componentState = createComponentState(tableData);
      const columnNames = component.calculateColumnNames(componentState);
      expect(columnNames.length).toEqual(2);
      expect(columnNames[0]).toEqual(columnName1);
      expect(columnNames[1]).toEqual(columnName2);
    });
  });
}
