import { Component } from '@angular/core';
import { ComponentGrading } from '../../../classroomMonitor/classroomMonitorComponents/shared/component-grading.component';

@Component({
  selector: 'table-grading',
  templateUrl: 'table-grading.component.html',
  styleUrls: ['table-grading.component.scss']
})
export class TableGrading extends ComponentGrading {
  tableData: any[];
  cellSizeToPixelsMultiplier: number = 10;
  columnNames: string[] = [];
  xColumnIndex: number;

  ngOnInit(): void {
    super.ngOnInit();
    this.tableData = this.componentState.studentData.tableData;
    this.injectCellWidths(this.tableData);
    if (this.componentState.studentData.isDataExplorerEnabled) {
      this.xColumnIndex = this.calculateXColumnIndex(this.componentState);
      this.columnNames = this.calculateColumnNames(this.componentState);
    }
  }

  injectCellWidths(tableData: any[]): any[] {
    tableData.forEach((row: any) => {
      row.forEach((cell: any) => {
        cell.width = this.calculateCellWidth(cell);
      });
    });
    return tableData;
  }

  calculateCellWidth(cell: any): number {
    let size = this.componentContent.globalCellSize;
    if (cell.size != null) {
      size = cell.size;
    }
    return size * this.cellSizeToPixelsMultiplier;
  }

  calculateXColumnIndex(componentState: any): number {
    return componentState.studentData.dataExplorerSeries[0].xColumn;
  }

  calculateColumnNames(componentState: any): string[] {
    const tableData: any = componentState.studentData.tableData;
    const firstRow: any = tableData[0];
    const columnNames: string[] = [];
    for (const cell of firstRow) {
      columnNames.push(cell.text);
    }
    return columnNames;
  }
}
