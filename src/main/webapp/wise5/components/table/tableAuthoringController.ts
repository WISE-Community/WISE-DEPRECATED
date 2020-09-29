'use strict';

import { Project } from '../../../site/src/app/domain/project';
import { ProjectAssetService } from '../../../site/src/app/services/projectAssetService';
import TableController from './tableController';

class TableAuthoringController extends TableController {
  ProjectAssetService: ProjectAssetService;
  
  static $inject = [
    '$anchorScroll',
    '$filter',
    '$location',
    '$mdDialog',
    '$q',
    '$rootScope',
    '$scope',
    'AnnotationService',
    'AudioRecorderService',
    'ConfigService',
    'NodeService',
    'NotebookService',
    'NotificationService',
    'ProjectAssetService',
    'ProjectService',
    'StudentAssetService',
    'StudentDataService',
    'TableService',
    'UtilService'
  ];

  constructor(
    $anchorScroll,
    $filter,
    $location,
    $mdDialog,
    $q,
    $rootScope,
    $scope,
    AnnotationService,
    AudioRecorderService,
    ConfigService,
    NodeService,
    NotebookService,
    NotificationService,
    ProjectAssetService,
    ProjectService,
    StudentAssetService,
    StudentDataService,
    TableService,
    UtilService
  ) {
    super(
      $anchorScroll,
      $filter,
      $location,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      AnnotationService,
      AudioRecorderService,
      ConfigService,
      NodeService,
      NotebookService,
      NotificationService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      TableService,
      UtilService
    );
    this.ProjectAssetService = ProjectAssetService;
    this.allowedConnectedComponentTypes = [
      {
        type: 'Embedded'
      },
      {
        type: 'Graph'
      },
      {
        type: 'Table'
      }
    ];
    if (this.authoringComponentContent.isDataExplorerEnabled) {
      this.repopulateDataExplorerGraphTypes();
      this.initializeDataExplorerSeriesParams();
    }
    this.columnCellSizes = this.parseColumnCellSizes(this.componentContent);
    $scope.$watch(
      function() {
        return this.authoringComponentContent;
      }.bind(this),
      function(newValue, oldValue) {
        this.submitCounter = 0;
        this.componentContent = this.ProjectService.injectAssetPaths(newValue);
        this.columnCellSizes = this.parseColumnCellSizes(this.componentContent);
        this.isSaveButtonVisible = this.componentContent.showSaveButton;
        this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
        this.resetTable();
      }.bind(this),
      true
    );
  }

  openAssetChooser(params: any) {
    this.ProjectAssetService.openAssetChooser(params).then(
      (data: any) => { this.assetSelected(data) }
    );
  }

  assetSelected({ nodeId, componentId, assetItem, target }) {
    const fileName = assetItem.fileName;
    const fullFilePath = `${this.ConfigService.getProjectAssetsDirectoryPath()}/${fileName}`;
    if (target === 'rubric') {
      this.UtilService.insertFileInSummernoteEditor(
        `summernoteRubric_${this.nodeId}_${this.componentId}`,
        fullFilePath,
        fileName
      );
    }
  }

  initializeDataExplorerSeriesParams() {
    if (this.authoringComponentContent.dataExplorerSeriesParams == null) {
      this.authoringComponentContent.dataExplorerSeriesParams = [];
      for (let s = 0; s < this.authoringComponentContent.numDataExplorerSeries; s++) {
        this.authoringComponentContent.dataExplorerSeriesParams.push({});
      }
    }
  }

  authoringViewTableNumRowsChanged(oldValue) {
    if (this.authoringComponentContent.numRows < oldValue) {
      if (this.areRowsAfterEmpty(this.authoringComponentContent.numRows)) {
        this.authoringViewTableSizeChanged();
      } else {
        if (confirm(this.$translate('table.areYouSureYouWantToDecreaseTheNumberOfRows'))) {
          this.authoringViewTableSizeChanged();
        } else {
          this.authoringComponentContent.numRows = oldValue;
        }
      }
    } else {
      this.authoringViewTableSizeChanged();
    }
  }

  /**
   * Determine if the rows after the given index are empty.
   * @param rowIndex The index of the row to start checking at. This value is zero indexed.
   * @return {boolean} True if the row at the given index and all the rows after are empty.
   * False if the row at the given index or any row after the row index is not empty.
   */
  areRowsAfterEmpty(rowIndex) {
    const oldNumRows = this.authoringGetNumRowsInTableData();
    for (let r = rowIndex; r < oldNumRows; r++) {
      if (!this.isRowEmpty(r)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Determine if a row has cells that are all empty string.
   * @param rowIndex The row index. This value is zero indexed.
   * @returns {boolean} True if the text in all the cells in the row are empty string.
   * False if the text in any cell in the row is not empty string.
   */
  isRowEmpty(rowIndex) {
    const tableData = this.authoringComponentContent.tableData;
    for (const cell of tableData[rowIndex]) {
      if (cell.text != null && cell.text != '') {
        return false;
      }
    }
    return true;
  }

  /**
   * The author has changed the number of columns.
   * @param oldValue The previous number of columns.
   */
  authoringViewTableNumColumnsChanged(oldValue) {
    if (this.authoringComponentContent.numColumns < oldValue) {
      // the author is reducing the number of columns
      if (this.areColumnsAfterEmpty(this.authoringComponentContent.numColumns)) {
        // the columns that we will delete are empty so we will remove the columns
        this.authoringViewTableSizeChanged();
      } else {
        if (confirm(this.$translate('table.areYouSureYouWantToDecreaseTheNumberOfColumns'))) {
          this.authoringViewTableSizeChanged();
        } else {
          this.authoringComponentContent.numColumns = oldValue;
        }
      }
    } else {
      // the author is increasing the number of columns
      this.authoringViewTableSizeChanged();
    }
  }

  /**
   * Determine if the columns after the given index are empty.
   * @param columnIndex The index of the column to start checking at. This value is zero indexed.
   * @return {boolean} True if the column at the given index and all the columns after are empty.
   * False if the column at the given index or any column after the column index is not empty.
   */
  areColumnsAfterEmpty(columnIndex) {
    const oldNumColumns = this.authoringGetNumColumnsInTableData();
    for (let c = columnIndex; c < oldNumColumns; c++) {
      if (!this.isColumnEmpty(c)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Determine if a column has cells that are all empty string.
   * @param columnIndex The column index. This value is zero indexed.
   * @returns {boolean} True if the text in all the cells in the column are empty string.
   * False if the text in any cell in the column is not empty string.
   */
  isColumnEmpty(columnIndex) {
    for (const row of this.authoringComponentContent.tableData) {
      const cell = row[columnIndex];
      if (cell.text != null && cell.text != '') {
        return false;
      }
    }
    return true;
  }

  /**
   * The table size has changed in the authoring view so we will update it
   */
  authoringViewTableSizeChanged() {
    this.authoringComponentContent.tableData = this.getUpdatedTableSize(
      this.authoringComponentContent.numRows,
      this.authoringComponentContent.numColumns
    );
    this.authoringViewComponentChanged();
  }

  /**
   * Create a table with the given dimensions. Populate the cells with
   * the cells from the old table.
   * @param newNumRows the number of rows in the new table
   * @param newNumColumns the number of columns in the new table
   * @returns a new table
   */
  getUpdatedTableSize(newNumRows, newNumColumns) {
    const newTable = [];
    for (let r = 0; r < newNumRows; r++) {
      const newRow = [];
      for (let c = 0; c < newNumColumns; c++) {
        let cell = this.getCellObjectFromComponentContent(c, r);
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
  getCellObjectFromComponentContent(x, y) {
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

  createEmptyCell() {
    return {
      text: '',
      editable: true,
      size: null
    };
  }

  /**
   * Insert a row into the table from the authoring view
   * @param y the row number to insert at
   */
  authoringViewInsertRow(y) {
    const tableData = this.authoringComponentContent.tableData;
    if (tableData != null) {
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
      tableData.splice(y, 0, newRow);
      this.authoringComponentContent.numRows++;
    }
    this.authoringViewComponentChanged();
  }

  /**
   * Delete a row in the table from the authoring view
   * @param y the row number to delete
   */
  authoringViewDeleteRow(y) {
    if (confirm(this.$translate('table.areYouSureYouWantToDeleteThisRow'))) {
      const tableData = this.authoringComponentContent.tableData;
      if (tableData != null) {
        tableData.splice(y, 1);
        this.authoringComponentContent.numRows--;
      }
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Insert a column into the table from the authoring view
   * @param x the column number to insert at
   */
  authoringViewInsertColumn(x) {
    const tableData = this.authoringComponentContent.tableData;
    if (tableData != null) {
      const numRows = this.authoringComponentContent.numRows;
      for (let r = 0; r < numRows; r++) {
        const tempRow = tableData[r];
        if (tempRow != null) {
          const newCell = this.createEmptyCell();
          tempRow.splice(x, 0, newCell);
        }
      }
      this.authoringComponentContent.numColumns++;
      this.parseColumnCellSizes(this.authoringComponentContent);
    }
    this.authoringViewComponentChanged();
  }

  /**
   * Delete a column in the table from the authoring view
   * @param x the column number to delete
   */
  authoringViewDeleteColumn(x) {
    if (confirm(this.$translate('table.areYouSureYouWantToDeleteThisColumn'))) {
      const tableData = this.authoringComponentContent.tableData;
      if (tableData != null) {
        const numRows = this.authoringComponentContent.numRows;
        for (let r = 0; r < numRows; r++) {
          const tempRow = tableData[r];
          if (tempRow != null) {
            tempRow.splice(x, 1);
          }
        }
        this.authoringComponentContent.numColumns--;
        this.parseColumnCellSizes(this.authoringComponentContent);
      }
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Get the number of rows in the table data. This is slightly different from
   * just getting the numRows field in the component content. Usually the
   * number of rows will be the same. In some cases it can be different
   * such as during authoring immediately after the author changes the number
   * of rows using the number of rows input.
   * @return {number} The number of rows in the table data.
   */
  authoringGetNumRowsInTableData() {
    return this.authoringComponentContent.tableData.length;
  }

  /**
   * Get the number of columns in the table data. This is slightly different from
   * just getting the numColumns field in the component content. Usually the
   * number of columns will be the same. In some cases it can be different
   * such as during authoring immediately after the author changes the number
   * of columns using the number of columns input.
   * @return {number} The number of columns in the table data.
   */
  authoringGetNumColumnsInTableData() {
    const tableData = this.authoringComponentContent.tableData;
    if (tableData.length > 0) {
      return tableData[0].length;
    }
    return 0;
  }

  makeAllCellsUneditable() {
    const tableData = this.authoringComponentContent.tableData;
    if (tableData != null) {
      for (let r = 0; r < tableData.length; r++) {
        const row = tableData[r];
        if (row != null) {
          for (let c = 0; c < row.length; c++) {
            const cell = row[c];
            if (cell != null) {
              cell.editable = false;
            }
          }
        }
      }
    }
    this.authoringViewComponentChanged();
  }

  makeAllCellsEditable() {
    const tableData = this.authoringComponentContent.tableData;
    if (tableData != null) {
      for (let r = 0; r < tableData.length; r++) {
        const row = tableData[r];
        if (row != null) {
          for (let c = 0; c < row.length; c++) {
            const cell = row[c];
            if (cell != null) {
              cell.editable = true;
            }
          }
        }
      }
    }
    this.authoringViewComponentChanged();
  }

  /**
   * Parse the column cell sizes. We will get the column cell sizes by looking
   * at size value of each column in the first row.
   * @param componentContent the component content
   */
  parseColumnCellSizes(componentContent) {
    const columnCellSizes = {};
    const tableData = componentContent.tableData;
    if (tableData != null) {
      const firstRow = tableData[0];
      if (firstRow != null) {
        for (let x = 0; x < firstRow.length; x++) {
          const cell = firstRow[x];
          columnCellSizes[x] = cell.size;
        }
      }
    }
    return columnCellSizes;
  }

  authoringViewColumnSizeChanged(index) {
    if (index != null) {
      let cellSize = this.columnCellSizes[index];
      if (cellSize == '') {
        cellSize = null;
      }
      this.authoringSetColumnCellSizes(index, cellSize);
    }
  }

  /**
   * Set the cell sizes for all the cells in a column
   * @param column the column number
   * @param size the cell size
   */
  authoringSetColumnCellSizes(column, size) {
    const tableData = this.authoringComponentContent.tableData;
    if (tableData != null) {
      for (let r = 0; r < tableData.length; r++) {
        const row = tableData[r];
        if (row != null) {
          const cell = row[column];
          if (cell != null) {
            cell.size = size;
          }
        }
      }
    }
    this.authoringViewComponentChanged();
  }

  authoringToggleDataExplorer() {
    if (this.authoringComponentContent.isDataExplorerEnabled) {
      if (this.authoringComponentContent.dataExplorerGraphTypes == null) {
        this.initializeDataExplorerGraphTypes();
        this.repopulateDataExplorerGraphTypes();
      }
      if (this.authoringComponentContent.numDataExplorerSeries == null) {
        this.authoringComponentContent.numDataExplorerSeries = 1;
      }
      if (this.authoringComponentContent.numDataExplorerYAxis == null) {
        this.authoringComponentContent.numDataExplorerYAxis = 1;
      }
      if (this.authoringComponentContent.isDataExplorerAxisLabelsEditable == null) {
        this.authoringComponentContent.isDataExplorerAxisLabelsEditable = false;
      }
      if (this.authoringComponentContent.dataExplorerSeriesParams == null) {
        this.authoringComponentContent.dataExplorerSeriesParams = [{}];
      }
    }
    this.authoringViewComponentChanged();
  }

  dataExplorerToggleScatterPlot() {
    this.dataExplorerToggleGraphType('Scatter Plot', 'scatter');
  }

  dataExplorerToggleLineGraph() {
    this.dataExplorerToggleGraphType('Line Graph', 'line');
  }

  dataExplorerToggleBarGraph() {
    this.dataExplorerToggleGraphType('Bar Graph', 'column');
  }

  dataExplorerToggleGraphType(name, value) {
    const graphTypes = this.authoringComponentContent.dataExplorerGraphTypes;
    for (let index = 0; index < graphTypes.length; index++) {
      if (graphTypes[index].value === value) {
        graphTypes.splice(index, 1);
        this.authoringViewComponentChanged();
        return;
      }
    }
    graphTypes.push(this.createGraphTypeObject(name, value));
    this.authoringViewComponentChanged();
  }

  createGraphTypeObject(name, value) {
    return { name: name, value: value };
  }

  initializeDataExplorerGraphTypes() {
    this.authoringComponentContent.dataExplorerGraphTypes = [];
    this.authoringComponentContent.dataExplorerGraphTypes.push(
      this.createGraphTypeObject('Scatter Plot', 'scatter')
    );
  }

  repopulateDataExplorerGraphTypes() {
    this.isDataExplorerScatterPlotEnabled = false;
    this.isDataExplorerLineGraphEnabled = false;
    this.isDataExplorerBarGraphEnabled = false;
    for (const graphType of this.authoringComponentContent.dataExplorerGraphTypes) {
      if (graphType.value === 'scatter') {
        this.isDataExplorerScatterPlotEnabled = true;
      } else if (graphType.value === 'line') {
        this.isDataExplorerLineGraphEnabled = true;
      } else if (graphType.value === 'column') {
        this.isDataExplorerBarGraphEnabled = true;
      }
    }
  }

  numDataExplorerSeriesChanged() {
    const count = this.authoringComponentContent.numDataExplorerSeries;
    if (this.authoringComponentContent.dataExplorerSeriesParams.length < count) {
      this.increaseNumDataExplorerSeries(count);
    } else if (this.authoringComponentContent.dataExplorerSeriesParams.length > count) {
      this.decreaseNumDataExplorerSeries(count);
    }
    this.authoringViewComponentChanged();
  }

  increaseNumDataExplorerSeries(count) {
    const numToAdd = count - this.authoringComponentContent.dataExplorerSeriesParams.length;
    for (let s = 0; s < numToAdd; s++) {
      this.authoringComponentContent.dataExplorerSeriesParams.push({});
    }
  }

  decreaseNumDataExplorerSeries(count) {
    this.authoringComponentContent.dataExplorerSeriesParams = this.authoringComponentContent.dataExplorerSeriesParams.slice(
      0,
      count
    );
  }

  numDataExplorerYAxisChanged() {
    this.updateDataExplorerSeriesParamsYAxis();
    this.authoringViewComponentChanged();
  }

  updateDataExplorerSeriesParamsYAxis() {
    for (const params of this.authoringComponentContent.dataExplorerSeriesParams) {
      if (params.yAxis >= this.authoringComponentContent.numDataExplorerYAxis) {
        params.yAxis = 0;
      }
    }
  }
}

export default TableAuthoringController;
