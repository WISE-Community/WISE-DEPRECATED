'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _tableController = require('./tableController');

var _tableController2 = _interopRequireDefault(_tableController);

var _html2canvas = require('html2canvas');

var _html2canvas2 = _interopRequireDefault(_html2canvas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TableAuthoringController = function (_TableController) {
  _inherits(TableAuthoringController, _TableController);

  function TableAuthoringController($anchorScroll, $filter, $location, $mdDialog, $q, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, TableService, UtilService) {
    _classCallCheck(this, TableAuthoringController);

    // the options for when to update this component from a connected component
    var _this = _possibleConstructorReturn(this, (TableAuthoringController.__proto__ || Object.getPrototypeOf(TableAuthoringController)).call(this, $anchorScroll, $filter, $location, $mdDialog, $q, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, TableService, UtilService));

    _this.connectedComponentUpdateOnOptions = [{
      value: 'change',
      text: 'Change'
    }, {
      value: 'submit',
      text: 'Submit'
    }];

    // the component types we are allowed to connect to
    _this.allowedConnectedComponentTypes = [{
      type: 'Graph'
    }, {
      type: 'Table'
    }];

    /*
     * for the authoring view, get the cell sizes for each column if they
     * have been customized
     */
    _this.columnCellSizes = _this.parseColumnCellSizes(_this.componentContent);

    _this.isSaveButtonVisible = _this.componentContent.showSaveButton;
    _this.isSubmitButtonVisible = _this.componentContent.showSubmitButton;
    // generate the summernote rubric element id
    _this.summernoteRubricId = 'summernoteRubric_' + _this.nodeId + '_' + _this.componentId;

    // set the component rubric into the summernote rubric
    _this.summernoteRubricHTML = _this.componentContent.rubric;

    // the tooltip text for the insert WISE asset button
    var insertAssetString = _this.$translate('INSERT_ASSET');

    /*
     * create the custom button for inserting WISE assets into
     * summernote
     */
    var InsertAssetButton = _this.UtilService.createInsertAssetButton(_this, null, _this.nodeId, _this.componentId, 'rubric', insertAssetString);

    /*
     * the options that specifies the tools to display in the
     * summernote prompt
     */
    _this.summernoteRubricOptions = {
      toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['fontsize', ['fontsize']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertAssetButton']]],
      height: 300,
      disableDragAndDrop: true,
      buttons: {
        insertAssetButton: InsertAssetButton
      }
    };

    _this.updateAdvancedAuthoringView();

    $scope.$watch(function () {
      return this.authoringComponentContent;
    }.bind(_this), function (newValue, oldValue) {

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
    }.bind(_this), true);

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    _this.$scope.$on('assetSelected', function (event, args) {

      if (args != null) {

        // make sure the event was fired for this component
        if (args.nodeId == _this.nodeId && args.componentId == _this.componentId) {
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
              var assetsDirectoryPath = _this.ConfigService.getProjectAssetsDirectoryPath();
              var fullAssetPath = assetsDirectoryPath + '/' + fileName;

              var summernoteId = '';

              if (args.target == 'prompt') {
                // the target is the summernote prompt element
                summernoteId = 'summernotePrompt_' + _this.nodeId + '_' + _this.componentId;
              } else if (args.target == 'rubric') {
                // the target is the summernote rubric element
                summernoteId = 'summernoteRubric_' + _this.nodeId + '_' + _this.componentId;
              }

              if (summernoteId != '') {
                if (_this.UtilService.isImage(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus');

                  // add the image html
                  $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
                } else if (_this.UtilService.isVideo(fileName)) {
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
      _this.$mdDialog.hide();
    });

    /*
     * The advanced button for a component was clicked. If the button was
     * for this component, we will show the advanced authoring.
     */
    _this.$scope.$on('componentAdvancedButtonClicked', function (event, args) {
      if (args != null) {
        var componentId = args.componentId;
        if (_this.componentId === componentId) {
          _this.showAdvancedAuthoring = !_this.showAdvancedAuthoring;
        }
      }
    });
    return _this;
  }

  /**
   * The component has changed in the regular authoring view so we will save the project
   */


  _createClass(TableAuthoringController, [{
    key: 'authoringViewComponentChanged',
    value: function authoringViewComponentChanged() {
      // update the JSON string in the advanced authoring view textarea
      this.updateAdvancedAuthoringView();

      /*
       * notify the parent node that the content has changed which will save
       * the project to the server
       */
      this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
    }
  }, {
    key: 'advancedAuthoringViewComponentChanged',


    /**
     * The component has changed in the advanced authoring view so we will update
     * the component and save the project.
     */
    value: function advancedAuthoringViewComponentChanged() {

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
      } catch (e) {
        this.$scope.$parent.nodeAuthoringController.showSaveErrorAdvancedAuthoring();
      }
    }
  }, {
    key: 'updateAdvancedAuthoringView',


    /**
     * Update the component JSON string that will be displayed in the advanced authoring view textarea
     */
    value: function updateAdvancedAuthoringView() {
      this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
    }
  }, {
    key: 'authoringViewTableNumRowsChanged',


    /**
     * The author has changed the number of rows.
     * @param oldValue The previous number of rows.
     */
    value: function authoringViewTableNumRowsChanged(oldValue) {
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
          var answer = confirm(this.$translate('table.areYouSureYouWantToDecreaseTheNumberOfRows'));
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

  }, {
    key: 'areRowsAfterEmpty',
    value: function areRowsAfterEmpty(rowIndex) {
      var oldNumRows = this.authoringGetNumRowsInTableData();
      for (var r = rowIndex; r < oldNumRows; r++) {
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

  }, {
    key: 'isRowEmpty',
    value: function isRowEmpty(rowIndex) {
      var tableData = this.authoringComponentContent.tableData;
      var row = tableData[rowIndex];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = row[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var cell = _step.value;

          if (cell.text != null && cell.text != "") {
            return false;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return true;
    }

    /**
     * The author has changed the number of columns.
     * @param oldValue The previous number of columns.
     */

  }, {
    key: 'authoringViewTableNumColumnsChanged',
    value: function authoringViewTableNumColumnsChanged(oldValue) {
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
          var answer = confirm(this.$translate('table.areYouSureYouWantToDecreaseTheNumberOfColumns'));
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

  }, {
    key: 'areColumnsAfterEmpty',
    value: function areColumnsAfterEmpty(columnIndex) {
      var oldNumColumns = this.authoringGetNumColumnsInTableData();
      for (var c = columnIndex; c < oldNumColumns; c++) {
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

  }, {
    key: 'isColumnEmpty',
    value: function isColumnEmpty(columnIndex) {
      var tableData = this.authoringComponentContent.tableData;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = tableData[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var row = _step2.value;

          // loop through all the rows and check the cell in the column
          var cell = row[columnIndex];
          if (cell.text != null && cell.text != "") {
            return false;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return true;
    }

    /**
     * The table size has changed in the authoring view so we will update it
     */

  }, {
    key: 'authoringViewTableSizeChanged',
    value: function authoringViewTableSizeChanged() {

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

  }, {
    key: 'getUpdatedTableSize',
    value: function getUpdatedTableSize(newNumRows, newNumColumns) {

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

  }, {
    key: 'getCellObjectFromComponentContent',
    value: function getCellObjectFromComponentContent(x, y) {
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

  }, {
    key: 'createEmptyCell',
    value: function createEmptyCell() {
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

  }, {
    key: 'authoringViewInsertRow',
    value: function authoringViewInsertRow(y) {

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

  }, {
    key: 'authoringViewDeleteRow',
    value: function authoringViewDeleteRow(y) {

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

  }, {
    key: 'authoringViewInsertColumn',
    value: function authoringViewInsertColumn(x) {

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

  }, {
    key: 'authoringViewDeleteColumn',
    value: function authoringViewDeleteColumn(x) {

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

  }, {
    key: 'authoringGetNumRowsInTableData',
    value: function authoringGetNumRowsInTableData() {
      var tableData = this.authoringComponentContent.tableData;
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

  }, {
    key: 'authoringGetNumColumnsInTableData',
    value: function authoringGetNumColumnsInTableData() {
      var tableData = this.authoringComponentContent.tableData;
      if (tableData.length > 0) {
        // get the number of cells in the first row
        return tableData[0].length;
      }
      return 0;
    }

    /**
     * The author has changed the rubric
     */

  }, {
    key: 'summernoteRubricHTMLChanged',
    value: function summernoteRubricHTMLChanged() {

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

  }, {
    key: 'setShowSubmitButtonValue',
    value: function setShowSubmitButtonValue(show) {

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
      this.$scope.$emit('componentShowSubmitButtonValueChanged', { nodeId: this.nodeId, componentId: this.componentId, showSubmitButton: show });
    }

    /**
     * The showSubmitButton value has changed
     */

  }, {
    key: 'showSubmitButtonValueChanged',
    value: function showSubmitButtonValueChanged() {

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

  }, {
    key: 'makeAllCellsUneditable',
    value: function makeAllCellsUneditable() {

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

  }, {
    key: 'makeAllCellsEditable',
    value: function makeAllCellsEditable() {

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

  }, {
    key: 'parseColumnCellSizes',
    value: function parseColumnCellSizes(componentContent) {

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

  }, {
    key: 'authoringViewColumnSizeChanged',
    value: function authoringViewColumnSizeChanged(index) {

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

  }, {
    key: 'authoringSetColumnCellSizes',
    value: function authoringSetColumnCellSizes(column, size) {

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

  }, {
    key: 'authoringAddConnectedComponent',
    value: function authoringAddConnectedComponent() {

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

  }, {
    key: 'authoringAutomaticallySetConnectedComponentComponentIdIfPossible',
    value: function authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
      if (connectedComponent != null) {
        var components = this.getComponentsByNodeId(connectedComponent.nodeId);
        if (components != null) {
          var numberOfAllowedComponents = 0;
          var allowedComponent = null;
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = components[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var component = _step3.value;

              if (component != null) {
                if (this.isConnectedComponentTypeAllowed(component.type) && component.id != this.componentId) {
                  // we have found a viable component we can connect to
                  numberOfAllowedComponents += 1;
                  allowedComponent = component;
                }
              }
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
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

  }, {
    key: 'authoringDeleteConnectedComponent',
    value: function authoringDeleteConnectedComponent(index) {

      // ask the author if they are sure they want to delete the connected component
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisConnectedComponent'));

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

  }, {
    key: 'authoringGetConnectedComponentType',
    value: function authoringGetConnectedComponentType(connectedComponent) {

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

  }, {
    key: 'authoringConnectedComponentNodeIdChanged',
    value: function authoringConnectedComponentNodeIdChanged(connectedComponent) {
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

  }, {
    key: 'authoringConnectedComponentComponentIdChanged',
    value: function authoringConnectedComponentComponentIdChanged(connectedComponent) {

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

  }, {
    key: 'authoringConnectedComponentTypeChanged',
    value: function authoringConnectedComponentTypeChanged(connectedComponent) {

      if (connectedComponent != null) {

        if (connectedComponent.type == 'importWork') {
          /*
           * the type has changed to import work
           */
        } else if (connectedComponent.type == 'showWork') {}
        /*
         * the type has changed to show work
         */


        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Check if we are allowed to connect to this component type
     * @param componentType the component type
     * @return whether we can connect to the component type
     */

  }, {
    key: 'isConnectedComponentTypeAllowed',
    value: function isConnectedComponentTypeAllowed(componentType) {

      if (componentType != null) {

        var allowedConnectedComponentTypes = this.allowedConnectedComponentTypes;

        // loop through the allowed connected component types
        for (var a = 0; a < allowedConnectedComponentTypes.length; a++) {
          var allowedConnectedComponentType = allowedConnectedComponentTypes[a];

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

  }, {
    key: 'showJSONButtonClicked',
    value: function showJSONButtonClicked() {
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

  }, {
    key: 'authoringJSONChanged',
    value: function authoringJSONChanged() {
      this.jsonStringChanged = true;
    }
  }]);

  return TableAuthoringController;
}(_tableController2.default);

TableAuthoringController.$inject = ['$anchorScroll', '$filter', '$location', '$mdDialog', '$q', '$rootScope', '$scope', 'AnnotationService', 'ConfigService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'TableService', 'UtilService'];

exports.default = TableAuthoringController;
//# sourceMappingURL=tableAuthoringController.js.map
