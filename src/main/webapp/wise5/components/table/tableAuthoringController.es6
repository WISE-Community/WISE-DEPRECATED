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

    // the options for when to update this component from a connected component
    this.connectedComponentUpdateOnOptions = [
      {
        value: 'change',
        text: 'Change'
      },
      {
        value: 'submit',
        text: 'Submit'
      }
    ];

    // the component types we are allowed to connect to
    this.allowedConnectedComponentTypes = [
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

    this.isSaveButtonVisible = this.componentContent.showSaveButton;
    this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
    // generate the summernote rubric element id
    this.summernoteRubricId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;

    // set the component rubric into the summernote rubric
    this.summernoteRubricHTML = this.componentContent.rubric;

    // the tooltip text for the insert WISE asset button
    var insertAssetString = this.$translate('INSERT_ASSET');

    /*
     * create the custom button for inserting WISE assets into
     * summernote
     */
    var InsertAssetButton = this.UtilService.createInsertAssetButton(this, null, this.nodeId, this.componentId, 'rubric', insertAssetString);

    /*
     * the options that specifies the tools to display in the
     * summernote prompt
     */
    this.summernoteRubricOptions = {
      toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link', 'video']],
        ['view', ['fullscreen', 'codeview', 'help']],
        ['customButton', ['insertAssetButton']]
      ],
      height: 300,
      disableDragAndDrop: true,
      buttons: {
        insertAssetButton: InsertAssetButton
      }
    };

    this.updateAdvancedAuthoringView();

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
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus');

                  // add the image html
                  $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
                } else if (this.UtilService.isVideo(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus');

                  // insert the video element
                  var videoElement = document.createElement('video');
                  videoElement.controls = 'true';
                  videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
                  $('#' + summernoteId).summernote('insertNode', videoElement);
                }
              }
            }
          }
        }
      }

      // close the popup
      this.$mdDialog.hide();
    });

    /*
     * The advanced button for a component was clicked. If the button was
     * for this component, we will show the advanced authoring.
     */
    this.$scope.$on('componentAdvancedButtonClicked', (event, args) => {
      if (args != null) {
        let componentId = args.componentId;
        if (this.componentId === componentId) {
          this.showAdvancedAuthoring = !this.showAdvancedAuthoring;
        }
      }
    });
  }

  /**
   * The component has changed in the regular authoring view so we will save the project
   */
  authoringViewComponentChanged() {
    // update the JSON string in the advanced authoring view textarea
    this.updateAdvancedAuthoringView();

    /*
     * notify the parent node that the content has changed which will save
     * the project to the server
     */
    this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
  };

  /**
   * The component has changed in the advanced authoring view so we will update
   * the component and save the project.
   */
  advancedAuthoringViewComponentChanged() {

    try {
      /*
       * create a new component by converting the JSON string in the advanced
       * authoring view into a JSON object
       */
      var authoringComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

      // replace the component in the project
      this.ProjectService.replaceComponent(this.nodeId, this.componentId, authoringComponentContent);

      this.authoringComponentContent = authoringComponentContent;

      // set the new component into the controller
      this.componentContent = this.ProjectService.injectAssetPaths(authoringComponentContent);

      /*
       * notify the parent node that the content has changed which will save
       * the project to the server
       */
      this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
    } catch(e) {
      this.$scope.$parent.nodeAuthoringController.showSaveErrorAdvancedAuthoring();
    }
  };

  /**
   * Update the component JSON string that will be displayed in the advanced authoring view textarea
   */
  updateAdvancedAuthoringView() {
    this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
  };

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
   * The author has changed the rubric
   */
  summernoteRubricHTMLChanged() {

    // get the summernote rubric html
    var html = this.summernoteRubricHTML;

    /*
     * remove the absolute asset paths
     * e.g.
     * <img src='https://wise.berkeley.edu/curriculum/3/assets/sun.png'/>
     * will be changed to
     * <img src='sun.png'/>
     */
    html = this.ConfigService.removeAbsoluteAssetPaths(html);

    /*
     * replace <a> and <button> elements with <wiselink> elements when
     * applicable
     */
    html = this.UtilService.insertWISELinks(html);

    // update the component rubric
    this.authoringComponentContent.rubric = html;

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Set the show submit button value
   * @param show whether to show the submit button
   */
  setShowSubmitButtonValue(show) {

    if (show == null || show == false) {
      // we are hiding the submit button
      this.authoringComponentContent.showSaveButton = false;
      this.authoringComponentContent.showSubmitButton = false;
    } else {
      // we are showing the submit button
      this.authoringComponentContent.showSaveButton = true;
      this.authoringComponentContent.showSubmitButton = true;
    }

    /*
     * notify the parent node that this component is changing its
     * showSubmitButton value so that it can show save buttons on the
     * step or sibling components accordingly
     */
    this.$scope.$emit('componentShowSubmitButtonValueChanged', {nodeId: this.nodeId, componentId: this.componentId, showSubmitButton: show});
  }

  /**
   * The showSubmitButton value has changed
   */
  showSubmitButtonValueChanged() {

    /*
     * perform additional processing for when we change the showSubmitButton
     * value
     */
    this.setShowSubmitButtonValue(this.authoringComponentContent.showSubmitButton);

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
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

  /**
   * Add a connected component
   */
  authoringAddConnectedComponent() {

    /*
     * create the new connected component object that will contain a
     * node id and component id
     */
    var newConnectedComponent = {};
    newConnectedComponent.nodeId = this.nodeId;
    newConnectedComponent.componentId = null;
    newConnectedComponent.type = null;
    this.authoringAutomaticallySetConnectedComponentComponentIdIfPossible(newConnectedComponent);

    // initialize the array of connected components if it does not exist yet
    if (this.authoringComponentContent.connectedComponents == null) {
      this.authoringComponentContent.connectedComponents = [];
    }

    // add the connected component
    this.authoringComponentContent.connectedComponents.push(newConnectedComponent);

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Automatically set the component id for the connected component if there
   * is only one viable option.
   * @param connectedComponent the connected component object we are authoring
   */
  authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
    if (connectedComponent != null) {
      let components = this.getComponentsByNodeId(connectedComponent.nodeId);
      if (components != null) {
        let numberOfAllowedComponents = 0;
        let allowedComponent = null;
        for (let component of components) {
          if (component != null) {
            if (this.isConnectedComponentTypeAllowed(component.type) &&
              component.id != this.componentId) {
              // we have found a viable component we can connect to
              numberOfAllowedComponents += 1;
              allowedComponent = component;
            }
          }
        }

        if (numberOfAllowedComponents == 1) {
          /*
           * there is only one viable component to connect to so we
           * will use it
           */
          connectedComponent.componentId = allowedComponent.id;
          connectedComponent.type = 'importWork';
        }
      }
    }
  }

  /**
   * Delete a connected component
   * @param index the index of the component to delete
   */
  authoringDeleteConnectedComponent(index) {

    // ask the author if they are sure they want to delete the connected component
    let answer = confirm(this.$translate('areYouSureYouWantToDeleteThisConnectedComponent'));

    if (answer) {
      // the author answered yes to delete

      if (this.authoringComponentContent.connectedComponents != null) {
        this.authoringComponentContent.connectedComponents.splice(index, 1);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Get the connected component type
   * @param connectedComponent get the component type of this connected component
   * @return the connected component type
   */
  authoringGetConnectedComponentType(connectedComponent) {

    var connectedComponentType = null;

    if (connectedComponent != null) {

      // get the node id and component id of the connected component
      var nodeId = connectedComponent.nodeId;
      var componentId = connectedComponent.componentId;

      // get the component
      var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);

      if (component != null) {
        // get the component type
        connectedComponentType = component.type;
      }
    }

    return connectedComponentType;
  }

  /**
   * The connected component node id has changed
   * @param connectedComponent the connected component that has changed
   */
  authoringConnectedComponentNodeIdChanged(connectedComponent) {
    if (connectedComponent != null) {
      connectedComponent.componentId = null;
      connectedComponent.type = null;
      this.authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent);

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * The connected component component id has changed
   * @param connectedComponent the connected component that has changed
   */
  authoringConnectedComponentComponentIdChanged(connectedComponent) {

    if (connectedComponent != null) {

      // default the type to import work
      connectedComponent.type = 'importWork';

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * The connected component type has changed
   * @param connectedComponent the connected component that changed
   */
  authoringConnectedComponentTypeChanged(connectedComponent) {

    if (connectedComponent != null) {

      if (connectedComponent.type == 'importWork') {
        /*
         * the type has changed to import work
         */
      } else if (connectedComponent.type == 'showWork') {
        /*
         * the type has changed to show work
         */
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Check if we are allowed to connect to this component type
   * @param componentType the component type
   * @return whether we can connect to the component type
   */
  isConnectedComponentTypeAllowed(componentType) {

    if (componentType != null) {

      let allowedConnectedComponentTypes = this.allowedConnectedComponentTypes;

      // loop through the allowed connected component types
      for (let a = 0; a < allowedConnectedComponentTypes.length; a++) {
        let allowedConnectedComponentType = allowedConnectedComponentTypes[a];

        if (allowedConnectedComponentType != null) {
          if (componentType == allowedConnectedComponentType.type) {
            // the component type is allowed
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * The show JSON button was clicked to show or hide the JSON authoring
   */
  showJSONButtonClicked() {
    // toggle the JSON authoring textarea
    this.showJSONAuthoring = !this.showJSONAuthoring;

    if (this.jsonStringChanged && !this.showJSONAuthoring) {
      /*
       * the author has changed the JSON and has just closed the JSON
       * authoring view so we will save the component
       */
      this.advancedAuthoringViewComponentChanged();

      // scroll to the top of the component
      this.$rootScope.$broadcast('scrollToComponent', { componentId: this.componentId });

      this.jsonStringChanged = false;
    }
  }

  /**
   * The author has changed the JSON manually in the advanced view
   */
  authoringJSONChanged() {
    this.jsonStringChanged = true;
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
