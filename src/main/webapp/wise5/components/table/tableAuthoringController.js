'use strict';

import TableController from "./tableController";
import html2canvas from 'html2canvas';

class TableAuthoringController extends TableController {
  constructor($anchorScroll,
              $filter,
              $location,
              $mdDialog,
              $q,
              $rootScope,
              $scope,
              AnnotationService,
              ConfigService,
              NodeService,
              NotebookService,
              ProjectService,
              StudentAssetService,
              StudentDataService,
              TableService,
              UtilService) {
    super($anchorScroll,
      $filter,
      $location,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      AnnotationService,
      ConfigService,
      NodeService,
      NotebookService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      TableService,
      UtilService);

    // the component types we are allowed to connect to
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

    /*
     * for the authoring view, get the cell sizes for each column if they
     * have been customized
     */
    this.columnCellSizes = this.parseColumnCellSizes(this.componentContent);

    $scope.$watch(function() {
      return this.authoringComponentContent;
    }.bind(this), function(newValue, oldValue) {

      /*
       * reset the values so that the preview is refreshed with
       * the new content
       */
      this.submitCounter = 0;
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
      this.columnCellSizes = this.parseColumnCellSizes(this.componentContent);
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.resetTable();
    }.bind(this), true);

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    this.$scope.$on('assetSelected', (event, args) => {

      if (args != null) {

        // make sure the event was fired for this component
        if (args.nodeId == this.nodeId && args.componentId == this.componentId) {
          // the asset was selected for this component
          var assetItem = args.assetItem;

          if (assetItem != null) {
            var fileName = assetItem.fileName;

            if (fileName != null) {
              /*
               * get the assets directory path
               * e.g.
               * /wise/curriculum/3/
               */
              var assetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
              var fullAssetPath = assetsDirectoryPath + '/' + fileName;

              var summernoteId = '';

              if (args.target == 'prompt') {
                // the target is the summernote prompt element
                summernoteId = 'summernotePrompt_' + this.nodeId + '_' + this.componentId;
              } else if (args.target == 'rubric') {
                // the target is the summernote rubric element
                summernoteId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;
              }

              if (summernoteId != '') {
                if (this.UtilService.isImage(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.restoreRange');
                  angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.focus');

                  // add the image html
                  angular.element(document.querySelector(`#${summernoteId}`)).summernote('insertImage', fullAssetPath, fileName);
                } else if (this.UtilService.isVideo(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.restoreRange');
                  angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.focus');

                  // insert the video element
                  var videoElement = document.createElement('video');
                  videoElement.controls = 'true';
                  videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
                  angular.element(document.querySelector(`#${summernoteId}`)).summernote('insertNode', videoElement);
                }
              }
            }
          }
        }
      }

      // close the popup
      this.$mdDialog.hide();
    });
  }

  /**
   * The author has changed the number of rows.
   * @param oldValue The previous number of rows.
   */
  authoringViewTableNumRowsChanged(oldValue) {
    if (this.authoringComponentContent.numRows < oldValue) {
      // the author is reducing the number of rows
      if (this.areRowsAfterEmpty(this.authoringComponentContent.numRows)) {
        // the rows that we will delete are empty so we will remove the rows
        this.authoringViewTableSizeChanged();
      } else {
        /*
         * the rows that we will delete are not empty so we will confirm that
         * they want to delete the rows
         */
        let answer = confirm(this.$translate('table.areYouSureYouWantToDecreaseTheNumberOfRows'));
        if (answer) {
          // author confirms yes, proceed with change
          this.authoringViewTableSizeChanged();
        } else {
          // author says no, so revert
          this.authoringComponentContent.numRows = oldValue;
        }
      }
    } else {
      // the author is increasing the number of rows
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
    let oldNumRows = this.authoringGetNumRowsInTableData();
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
    let tableData = this.authoringComponentContent.tableData;
    let row = tableData[rowIndex];
    for (let cell of row) {
      if (cell.text != null && cell.text != "") {
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
        /*
         * the columns that we will delete are not empty so we will confirm that
         * they want to delete the columns
         */
        let answer = confirm(this.$translate('table.areYouSureYouWantToDecreaseTheNumberOfColumns'));
        if (answer) {
          // author confirms yes, proceed with change
          this.authoringViewTableSizeChanged();
        } else {
          // author says no, so revert
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
    let oldNumColumns = this.authoringGetNumColumnsInTableData();
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
    let tableData = this.authoringComponentContent.tableData;
    for (let row of tableData) {
      // loop through all the rows and check the cell in the column
      let cell = row[columnIndex];
      if (cell.text != null && cell.text != "") {
        return false;
      }
    }
    return true;
  }

  /**
   * The table size has changed in the authoring view so we will update it
   */
  authoringViewTableSizeChanged() {

    // create a new table with the new size and populate it with the existing cells
    var newTable = this.getUpdatedTableSize(this.authoringComponentContent.numRows, this.authoringComponentContent.numColumns);

    // set the new table into the component content
    this.authoringComponentContent.tableData = newTable;

    // perform preview updating and project saving
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

    var newTable = [];

    // create the rows
    for (var r = 0; r < newNumRows; r++) {

      var newRow = [];

      // create the columns
      for (var c = 0; c < newNumColumns; c++) {

        // try to get the cell from the old table
        var cell = this.getCellObjectFromComponentContent(c, r);

        if (cell == null) {
          /*
           * the old table does not have a cell for the given
           * row/column location so we will create an empty cell
           */
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
    var cellObject = null;

    var tableData = this.authoringComponentContent.tableData;

    if (tableData != null) {

      // get the row
      var row = tableData[y];

      if (row != null) {

        // get the cell
        cellObject = row[x];
      }
    }

    return cellObject;
  }

  /**
   * Create an empty cell
   * @returns an empty cell object
   */
  createEmptyCell() {
    var cell = {};

    cell.text = '';
    cell.editable = true;
    cell.size = null;

    return cell;
  }

  /**
   * Insert a row into the table from the authoring view
   * @param y the row number to insert at
   */
  authoringViewInsertRow(y) {

    // get the table
    var tableData = this.authoringComponentContent.tableData;

    if (tableData != null) {

      // create the new row that we will insert
      var newRow = [];

      // get the number of columns
      var numColumns = this.authoringComponentContent.numColumns;

      // populate the new row with the correct number of cells
      for (var c = 0; c < numColumns; c++) {
        // create an empty cell
        var newCell = this.createEmptyCell();

        // get the column cell size
        var cellSize = this.columnCellSizes[c];

        if (cellSize != null) {
          // set the cell size
          newCell.size = cellSize;
        }

        newRow.push(newCell);
      }

      // insert the new row into the table
      tableData.splice(y, 0, newRow);

      // update the number of rows value
      this.authoringComponentContent.numRows++;
    }

    // save the project and update the preview
    this.authoringViewComponentChanged();
  }

  /**
   * Delete a row in the table from the authoring view
   * @param y the row number to delete
   */
  authoringViewDeleteRow(y) {

    var answer = confirm(this.$translate('table.areYouSureYouWantToDeleteThisRow'));

    if (answer) {
      // get the table
      var tableData = this.authoringComponentContent.tableData;

      if (tableData != null) {

        // remove the row
        tableData.splice(y, 1);

        // update the number of rows value
        this.authoringComponentContent.numRows--;
      }

      // save the project and update the preview
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Insert a column into the table from the authoring view
   * @param x the column number to insert at
   */
  authoringViewInsertColumn(x) {

    // get the table
    var tableData = this.authoringComponentContent.tableData;

    if (tableData != null) {

      var numRows = this.authoringComponentContent.numRows;

      // loop through all the rows
      for (var r = 0; r < numRows; r++) {

        // get a row
        var tempRow = tableData[r];

        if (tempRow != null) {

          // create an empty cell
          var newCell = this.createEmptyCell();

          // insert the cell into the row
          tempRow.splice(x, 0, newCell);
        }
      }

      // update the number of columns value
      this.authoringComponentContent.numColumns++;

      // update the column cell sizes model
      this.parseColumnCellSizes(this.authoringComponentContent);
    }

    // save the project and update the preview
    this.authoringViewComponentChanged();
  }

  /**
   * Delete a column in the table from the authoring view
   * @param x the column number to delete
   */
  authoringViewDeleteColumn(x) {

    var answer = confirm(this.$translate('table.areYouSureYouWantToDeleteThisColumn'));

    if (answer) {
      // get the table
      var tableData = this.authoringComponentContent.tableData;

      if (tableData != null) {

        var numRows = this.authoringComponentContent.numRows;

        // loop through all the rows
        for (var r = 0; r < numRows; r++) {

          // get a row
          var tempRow = tableData[r];

          if (tempRow != null) {

            // remove the cell from the row
            tempRow.splice(x, 1);
          }
        }

        // update the number of columns value
        this.authoringComponentContent.numColumns--;

        // update the column cell sizes model
        this.parseColumnCellSizes(this.authoringComponentContent);
      }

      // save the project and update the preview
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
    let tableData = this.authoringComponentContent.tableData;
    return tableData.length;
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
    let tableData = this.authoringComponentContent.tableData;
    if (tableData.length > 0) {
      // get the number of cells in the first row
      return tableData[0].length;
    }
    return 0;
  }

  /**
   * Make all the cells uneditable
   */
  makeAllCellsUneditable() {

    // get the table data
    var tableData = this.authoringComponentContent.tableData;

    if (tableData != null) {

      // loop through all the rows
      for (var r = 0; r < tableData.length; r++) {
        var row = tableData[r];

        if (row != null) {

          // loop through all the cells in the row
          for (var c = 0; c < row.length; c++) {

            // get a cell
            var cell = row[c];

            if (cell != null) {

              // make the cell uneditable
              cell.editable = false;
            }
          }
        }
      }
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Make all the cells edtiable
   */
  makeAllCellsEditable() {

    // get the table data
    var tableData = this.authoringComponentContent.tableData;

    if (tableData != null) {

      // loop through all the rows
      for (var r = 0; r < tableData.length; r++) {
        var row = tableData[r];

        if (row != null) {

          // loop through all the cells in the row
          for (var c = 0; c < row.length; c++) {

            // get a cell
            var cell = row[c];

            if (cell != null) {

              // make the cell editable
              cell.editable = true;
            }
          }
        }
      }
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Parse the column cell sizes. We will get the column cell sizes by looking
   * at size value of each column in the first row.
   * @param componentContent the component content
   */
  parseColumnCellSizes(componentContent) {

    var columnCellSizes = {};

    if (componentContent != null) {

      // get the table data
      var tableData = componentContent.tableData;

      if (tableData != null) {
        var firstRow = tableData[0];

        if (firstRow != null) {

          // loop through all the columns
          for (var x = 0; x < firstRow.length; x++) {

            // get the cell object
            var cell = firstRow[x];

            /*
             * get the cell size and set it into our mapping of
             * column to cell size
             */
            columnCellSizes[x] = cell.size;
          }
        }
      }
    }

    return columnCellSizes;
  }

  /**
   * One of the column cell sizes has changed
   */
  authoringViewColumnSizeChanged(index) {

    if (index != null) {
      var cellSize = this.columnCellSizes[index];

      if (cellSize == '') {
        cellSize = null;
      }

      // set the cell size for all the cells in the column
      this.authoringSetColumnCellSizes(index, cellSize);
    }
  }

  /**
   * Set the cell sizes for all the cells in a column
   * @param column the column number
   * @param size the cell size
   */
  authoringSetColumnCellSizes(column, size) {

    // get the table data
    var tableData = this.authoringComponentContent.tableData;

    if (tableData != null) {

      // loop through all the rows
      for (var r = 0; r < tableData.length; r++) {
        var row = tableData[r];

        if (row != null) {

          // get the cell in the column
          var cell = row[column];

          if (cell != null) {
            // set the cell size
            cell.size = size;
          }
        }
      }
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }
}

TableAuthoringController.$inject = [
  '$anchorScroll',
  '$filter',
  '$location',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$scope',
  'AnnotationService',
  'ConfigService',
  'NodeService',
  'NotebookService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'TableService',
  'UtilService'
];

export default TableAuthoringController;
