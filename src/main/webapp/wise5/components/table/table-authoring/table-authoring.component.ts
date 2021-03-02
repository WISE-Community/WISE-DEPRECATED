'use strict';

import { Component } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProjectAssetService } from '../../../../site/src/app/services/projectAssetService';
import { ComponentAuthoring } from '../../../authoringTool/components/component-authoring.component';
import { ConfigService } from '../../../services/configService';
import { NodeService } from '../../../services/nodeService';
import { TeacherProjectService } from '../../../services/teacherProjectService';

@Component({
  selector: 'table-authoring',
  templateUrl: 'table-authoring.component.html',
  styleUrls: ['table-authoring.component.scss']
})
export class TableAuthoring extends ComponentAuthoring {
  columnCellSizes: any;

  numColumnsChange: Subject<number> = new Subject<number>();
  numRowsChange: Subject<number> = new Subject<number>();
  globalCellSizeChange: Subject<number> = new Subject<number>();
  inputChange: Subject<string> = new Subject<string>();

  numColumnsChangeSubscription: Subscription;
  numRowsChangeSubscription: Subscription;
  globalCellSizeChangeSubscription: Subscription;
  inputChangeSubscription: Subscription;

  constructor(
    protected ConfigService: ConfigService,
    protected NodeService: NodeService,
    protected ProjectAssetService: ProjectAssetService,
    protected ProjectService: TeacherProjectService
  ) {
    super(ConfigService, NodeService, ProjectAssetService, ProjectService);
    this.numColumnsChangeSubscription = this.numColumnsChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.tableNumColumnsChanged();
      });
    this.numRowsChangeSubscription = this.numRowsChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.tableNumRowsChanged();
      });
    this.globalCellSizeChangeSubscription = this.globalCellSizeChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.componentChanged();
      });
    this.inputChangeSubscription = this.inputChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.componentChanged();
      });
  }

  ngOnInit() {
    super.ngOnInit();
    this.columnCellSizes = this.parseColumnCellSizes(this.componentContent);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.numColumnsChangeSubscription.unsubscribe();
    this.numRowsChangeSubscription.unsubscribe();
    this.globalCellSizeChangeSubscription.unsubscribe();
    this.inputChangeSubscription.unsubscribe();
  }

  tableNumRowsChanged(): void {
    const oldValue = this.getNumRowsInTableData();
    const newValue = this.authoringComponentContent.numRows;
    if (newValue < oldValue) {
      if (this.areRowsAfterEmpty(newValue)) {
        this.tableSizeChanged();
      } else {
        if (confirm($localize`Are you sure you want to decrease the number of rows?`)) {
          this.tableSizeChanged();
        } else {
          this.authoringComponentContent.numRows = oldValue;
        }
      }
    } else {
      this.tableSizeChanged();
    }
  }

  areRowsAfterEmpty(rowIndex: number): boolean {
    const oldNumRows = this.getNumRowsInTableData();
    for (let r = rowIndex; r < oldNumRows; r++) {
      if (!this.isRowEmpty(r)) {
        return false;
      }
    }
    return true;
  }

  isRowEmpty(rowIndex: number): boolean {
    const tableData = this.authoringComponentContent.tableData;
    for (const cell of tableData[rowIndex]) {
      if (!this.isEmpty(cell.text)) {
        return false;
      }
    }
    return true;
  }

  tableNumColumnsChanged(): void {
    const oldValue = this.getNumColumnsInTableData();
    const newValue = this.authoringComponentContent.numColumns;
    if (newValue < oldValue) {
      if (this.areColumnsAfterEmpty(newValue)) {
        this.tableSizeChanged();
      } else {
        if (confirm($localize`Are you sure you want to decrease the number of columns?`)) {
          this.tableSizeChanged();
        } else {
          this.authoringComponentContent.numColumns = oldValue;
        }
      }
    } else {
      this.tableSizeChanged();
    }
  }

  areColumnsAfterEmpty(columnIndex: number): boolean {
    const oldNumColumns = this.getNumColumnsInTableData();
    for (let c = columnIndex; c < oldNumColumns; c++) {
      if (!this.isColumnEmpty(c)) {
        return false;
      }
    }
    return true;
  }

  isColumnEmpty(columnIndex: number): boolean {
    for (const row of this.authoringComponentContent.tableData) {
      const cell = row[columnIndex];
      if (!this.isEmpty(cell.text)) {
        return false;
      }
    }
    return true;
  }

  isEmpty(txt: string): boolean {
    return txt == null || txt == '';
  }

  tableSizeChanged(): void {
    this.authoringComponentContent.tableData = this.getUpdatedTable(
      this.authoringComponentContent.numRows,
      this.authoringComponentContent.numColumns
    );
    this.componentChanged();
  }

  /**
   * Create a table with the given dimensions. Populate the cells with the cells from the old table.
   * @param newNumRows the number of rows in the new table
   * @param newNumColumns the number of columns in the new table
   * @returns a new table
   */
  getUpdatedTable(newNumRows: number, newNumColumns: number): any {
    const newTable = [];
    for (let r = 0; r < newNumRows; r++) {
      const newRow = [];
      for (let c = 0; c < newNumColumns; c++) {
        let cell = this.getCellObjectFromTableData(c, r);
        if (cell == null) {
          cell = this.createEmptyCell();
        }
        newRow.push(cell);
      }
      newTable.push(newRow);
    }
    return newTable;
  }

  /**
   * Get the cell object at the given x, y location
   * @param x the column number (zero indexed)
   * @param y the row number (zero indexed)
   * @returns the cell at the given x, y location or null if there is none
   */
  getCellObjectFromTableData(x: number, y: number): any {
    let cellObject = null;
    const tableData = this.authoringComponentContent.tableData;
    if (tableData != null) {
      const row = tableData[y];
      if (row != null) {
        cellObject = row[x];
      }
    }
    return cellObject;
  }

  createEmptyCell(): any {
    return {
      text: '',
      editable: true,
      size: null
    };
  }

  insertRow(rowIndex: number): void {
    const tableData = this.authoringComponentContent.tableData;
    const newRow = [];
    const numColumns = this.authoringComponentContent.numColumns;
    for (let c = 0; c < numColumns; c++) {
      const newCell = this.createEmptyCell();
      const cellSize = this.columnCellSizes[c];
      if (cellSize != null) {
        newCell.size = cellSize;
      }
      newRow.push(newCell);
    }
    tableData.splice(rowIndex, 0, newRow);
    this.authoringComponentContent.numRows++;
    this.componentChanged();
  }

  deleteRow(rowIndex: number): void {
    if (confirm($localize`Are you sure you want to delete this row?`)) {
      const tableData = this.authoringComponentContent.tableData;
      if (tableData != null) {
        tableData.splice(rowIndex, 1);
        this.authoringComponentContent.numRows--;
      }
      this.componentChanged();
    }
  }

  insertColumn(columnIndex: number): void {
    const tableData = this.authoringComponentContent.tableData;
    const numRows = this.authoringComponentContent.numRows;
    for (let r = 0; r < numRows; r++) {
      const row = tableData[r];
      const newCell = this.createEmptyCell();
      row.splice(columnIndex, 0, newCell);
    }
    this.authoringComponentContent.numColumns++;
    this.parseColumnCellSizes(this.authoringComponentContent);
    this.componentChanged();
  }

  deleteColumn(columnIndex: number): void {
    if (confirm($localize`Are you sure you want to delete this column?`)) {
      const tableData = this.authoringComponentContent.tableData;
      const numRows = this.authoringComponentContent.numRows;
      for (let r = 0; r < numRows; r++) {
        const row = tableData[r];
        row.splice(columnIndex, 1);
      }
      this.authoringComponentContent.numColumns--;
      this.parseColumnCellSizes(this.authoringComponentContent);
      this.componentChanged();
    }
  }

  /**
   * Get the number of rows in the table data. This is slightly different from just getting the
   * numRows field in the component content. Usually the number of rows will be the same. In some
   * cases it can be different such as during authoring immediately after the author changes the
   * number of rows using the number of rows input.
   * @return {number} The number of rows in the table data.
   */
  getNumRowsInTableData(): number {
    return this.authoringComponentContent.tableData.length;
  }

  /**
   * Get the number of columns in the table data. This is slightly different from just getting the
   * numColumns field in the component content. Usually the number of columns will be the same. In
   * some cases it can be different such as during authoring immediately after the author changes
   * the number of columns using the number of columns input.
   * @return {number} The number of columns in the table data.
   */
  getNumColumnsInTableData(): number {
    const tableData = this.authoringComponentContent.tableData;
    if (tableData.length > 0) {
      return tableData[0].length;
    }
    return 0;
  }

  setAllCellsUneditable(): void {
    this.setAllCellsIsEditable(false);
    this.componentChanged();
  }

  setAllCellsEditable(): void {
    this.setAllCellsIsEditable(true);
    this.componentChanged();
  }

  setAllCellsIsEditable(isEditable: boolean): void {
    for (const row of this.authoringComponentContent.tableData) {
      for (const cell of row) {
        cell.editable = isEditable;
      }
    }
  }

  /**
   * Parse the column cell sizes. We will get the column cell sizes by looking at the size value of
   * each cell in the first row.
   * @param componentContent the component content
   */
  parseColumnCellSizes(componentContent: any): any {
    const columnCellSizes = {};
    const tableData = componentContent.tableData;
    const firstRow = tableData[0];
    if (firstRow != null) {
      for (let x = 0; x < firstRow.length; x++) {
        const cell = firstRow[x];
        columnCellSizes[x] = cell.size;
      }
    }
    return columnCellSizes;
  }

  columnSizeChanged(index: number): void {
    let cellSize = this.columnCellSizes[index];
    if (cellSize == '') {
      cellSize = null;
    }
    this.setColumnCellSizes(index, cellSize);
  }

  setColumnCellSizes(column: number, size: number): void {
    const tableData = this.authoringComponentContent.tableData;
    for (let r = 0; r < tableData.length; r++) {
      const row = tableData[r];
      const cell = row[column];
      if (cell != null) {
        cell.size = size;
      }
    }
    this.componentChanged();
  }

  automaticallySetConnectedComponentFieldsIfPossible(connectedComponent) {
    if (connectedComponent.type === 'importWork' && connectedComponent.action == null) {
      connectedComponent.action = 'merge';
    } else if (connectedComponent.type === 'showWork') {
      connectedComponent.action = null;
    }
  }

  connectedComponentTypeChanged(connectedComponent) {
    this.automaticallySetConnectedComponentFieldsIfPossible(connectedComponent);
    this.componentChanged();
  }
}
