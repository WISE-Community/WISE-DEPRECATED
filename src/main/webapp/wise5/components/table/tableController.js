'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _componentController = require('../componentController');

var _componentController2 = _interopRequireDefault(_componentController);

var _html2canvas = require('html2canvas');

var _html2canvas2 = _interopRequireDefault(_html2canvas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TableController = function (_ComponentController) {
  _inherits(TableController, _ComponentController);

  function TableController($anchorScroll, $filter, $location, $mdDialog, $q, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, TableService, UtilService) {
    _classCallCheck(this, TableController);

    var _this = _possibleConstructorReturn(this, (TableController.__proto__ || Object.getPrototypeOf(TableController)).call(this, $filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.$anchorScroll = $anchorScroll;
    _this.$location = $location;
    _this.$q = $q;
    _this.TableService = TableService;

    // holds the the table data
    _this.tableData = null;

    // the latest annotations
    _this.latestAnnotations = null;

    // whether the reset table button is shown or not
    _this.isResetTableButtonVisible = true;

    // the label for the notebook in thos project
    _this.notebookConfig = _this.NotebookService.getNotebookConfig();

    _this.latestConnectedComponentState = null;
    _this.latestConnectedComponentParams = null;

    _this.tableId = 'table_' + _this.nodeId + '_' + _this.componentId;

    if (_this.mode === 'student') {
      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = _this.componentContent.showSaveButton;
      _this.isSubmitButtonVisible = _this.componentContent.showSubmitButton;
      _this.isResetTableButtonVisible = true;
    } else if (_this.mode === 'grading' || _this.mode === 'gradingRevision') {
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isResetTableButtonVisible = false;
      _this.isDisabled = true;
    } else if (_this.mode === 'onlyShowWork') {
      _this.isPromptVisible = false;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isResetTableButtonVisible = false;
      _this.isDisabled = true;
    } else if (_this.mode === 'showPreviousWork') {
      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isResetTableButtonVisible = false;
      _this.isDisabled = true;
    }

    var componentState = null;

    // get the component state from the scope
    componentState = _this.$scope.componentState;

    if (_this.mode == 'student') {
      if (_this.UtilService.hasShowWorkConnectedComponent(_this.componentContent)) {
        // we will show work from another component
        _this.handleConnectedComponents();
      } else if (_this.TableService.componentStateHasStudentWork(componentState, _this.componentContent)) {
        /*
         * the student has work so we will populate the work into this
         * component
         */
        _this.setStudentWork(componentState);
      } else if (_this.UtilService.hasConnectedComponent(_this.componentContent)) {
        // we will import work from another component
        _this.handleConnectedComponents();
      } else if (componentState == null) {
        // check if we need to import work

        if (_this.UtilService.hasConnectedComponent(_this.componentContent)) {
          /*
           * the student does not have any work and there are connected
           * components so we will get the work from the connected
           * components
           */
          _this.handleConnectedComponents();
        }
      }
    } else {
      // populate the student work into this component
      _this.setStudentWork(componentState);
    }

    // set up the table
    _this.setupTable();

    // check if the student has used up all of their submits
    if (_this.componentContent.maxSubmitCount != null && _this.submitCounter >= _this.componentContent.maxSubmitCount) {
      /*
       * the student has used up all of their chances to submit so we
       * will disable the submit button
       */
      _this.isSubmitButtonDisabled = true;
    }

    _this.disableComponentIfNecessary();

    /**
     * A connected component has changed its student data so we will
     * perform any necessary changes to this component
     * @param connectedComponent the connected component
     * @param connectedComponentParams the connected component params
     * @param componentState the component state from the connected
     * component that has changed
     */
    _this.$scope.handleConnectedComponentStudentDataChanged = function (connectedComponent, connectedComponentParams, componentState) {

      if (connectedComponent != null && connectedComponentParams != null && componentState != null) {

        if (connectedComponentParams.updateOn === 'change') {}

        // get the component type that has changed
        var componentType = connectedComponent.type;

        /*
         * make a copy of the component state so we don't accidentally
         * change any values in the referenced object
         */
        componentState = this.UtilService.makeCopyOfJSONObject(componentState);

        if (componentType === 'Table') {

          // set the table data
          this.$scope.tableController.setStudentWork(componentState);

          // the table has changed
          this.$scope.tableController.isDirty = true;
        } else if (componentType === 'Graph') {

          // set the graph data into the table
          this.$scope.tableController.setGraphDataIntoTableData(componentState, connectedComponentParams);

          // the table has changed
          this.$scope.tableController.isDirty = true;
        } else if (componentType === 'Embedded') {

          // set the table data
          this.$scope.tableController.setStudentWork(componentState);

          // the table has changed
          this.$scope.tableController.isDirty = true;
        }
      }
    }.bind(_this);

    /**
     * Get the component state from this component. The parent node will
     * call this function to obtain the component state when it needs to
     * save student data.
     * @param isSubmit boolean whether the request is coming from a submit
     * action (optional; default is false)
     * @return a promise of a component state containing the student data
     */
    _this.$scope.getComponentState = function (isSubmit) {
      var deferred = this.$q.defer();
      var getState = false;
      var action = 'change';

      if (isSubmit) {
        if (this.$scope.tableController.isSubmitDirty) {
          getState = true;
          action = 'submit';
        }
      } else {
        if (this.$scope.tableController.isDirty) {
          getState = true;
          action = 'save';
        }
      }

      if (getState) {
        // create a component state populated with the student data
        this.$scope.tableController.createComponentState(action).then(function (componentState) {
          deferred.resolve(componentState);
        });
      } else {
        /*
         * the student does not have any unsaved changes in this component
         * so we don't need to save a component state for this component.
         * we will immediately resolve the promise here.
         */
        deferred.resolve();
      }

      return deferred.promise;
    }.bind(_this);

    /**
     * Listen for the 'exitNode' event which is fired when the student
     * exits the parent node. This will perform any necessary cleanup
     * when the student exits the parent node.
     */
    _this.$scope.$on('exitNode', angular.bind(_this, function (event, args) {}));

    _this.$scope.getNumber = function (num) {
      var array = new Array();

      // make sure num is a valid number
      if (num != null && !isNaN(num)) {
        array = new Array(parseInt(num));
      }

      return array;
    };

    _this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: _this.nodeId, componentId: _this.componentId });
    return _this;
  }

  _createClass(TableController, [{
    key: 'registerStudentWorkSavedToServerListener',
    value: function registerStudentWorkSavedToServerListener() {
      /**
       * Listen for the 'studentWorkSavedToServer' event which is fired when
       * we receive the response from saving a component state to the server
       */
      this.$scope.$on('studentWorkSavedToServer', angular.bind(this, function (event, args) {

        var componentState = args.studentWork;

        // check that the component state is for this component
        if (componentState && this.nodeId === componentState.nodeId && this.componentId === componentState.componentId) {

          // set isDirty to false because the component state was just saved and notify node
          this.isDirty = false;
          this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: false });

          var isAutoSave = componentState.isAutoSave;
          var isSubmit = componentState.isSubmit;
          var serverSaveTime = componentState.serverSaveTime;
          var clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);

          if (isSubmit) {
            this.setSubmittedMessage(clientSaveTime);
            this.lockIfNecessary();

            // set isSubmitDirty to false because the component state was just submitted and notify node
            this.isSubmitDirty = false;
            this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: false });
          } else if (isAutoSave) {
            this.setAutoSavedMessage(clientSaveTime);
          } else {
            this.setSavedMessage(clientSaveTime);
          }
        }

        // check if the component state is from a connected component
        if (this.ProjectService.isConnectedComponent(this.nodeId, this.componentId, componentState.componentId)) {

          // get the connected component params
          var connectedComponentParams = this.ProjectService.getConnectedComponentParams(this.componentContent, componentState.componentId);

          if (connectedComponentParams != null) {

            if (connectedComponentParams.updateOn === 'save' || connectedComponentParams.updateOn === 'submit' && componentState.isSubmit) {

              var performUpdate = false;

              /*
               * make a copy of the component state so we don't accidentally
               * change any values in the referenced object
               */
              componentState = this.UtilService.makeCopyOfJSONObject(componentState);

              /*
               * make sure the student hasn't entered any values into the
               * table so that we don't overwrite any of their work.
               */
              if (this.isTableEmpty() || this.isTableReset()) {
                /*
                 * the student has not entered any values into the table
                 * so we can update it
                 */
                performUpdate = true;
              } else {
                /*
                 * the student has entered values into the table so we
                 * will ask them if they want to update it
                 */
                /*
                var answer = confirm('Do you want to update the connected table?');
                 if (answer) {
                  // the student answered yes
                  performUpdate = true;
                }
                */
                performUpdate = true;
              }

              if (performUpdate) {
                // set the table data
                this.$scope.tableController.setStudentWork(componentState);

                // the table has changed
                this.$scope.tableController.isDirty = true;
                this.$scope.tableController.isSubmitDirty = true;
              }

              /*
               * remember the component state and connected component params
               * in case we need to use them again later
               */
              this.latestConnectedComponentState = componentState;
              this.latestConnectedComponentParams = connectedComponentParams;
            }
          }
        }
      }));
    }
  }, {
    key: 'handleNodeSubmit',
    value: function handleNodeSubmit() {
      this.submit('nodeSubmitButton');
    }

    /**
     * Get a copy of the table data
     * @param tableData the table data to copy
     * @return a copy of the table data
     */

  }, {
    key: 'getCopyOfTableData',
    value: function getCopyOfTableData(tableData) {
      var tableDataCopy = null;

      if (tableData != null) {
        // create a JSON string from the table data
        var tableDataJSONString = JSON.stringify(tableData);

        // create a JSON object from the table data string
        var tableDataJSON = JSON.parse(tableDataJSONString);

        tableDataCopy = tableDataJSON;
      }

      return tableDataCopy;
    }
  }, {
    key: 'setupTable',


    /**
     * Setup the table
     */
    value: function setupTable() {

      if (this.tableData == null) {
        /*
         * the student does not have any table data so we will use
         * the table data from the component content
         */
        this.tableData = this.getCopyOfTableData(this.componentContent.tableData);
      }
    }
  }, {
    key: 'resetTable',


    /**
     * Reset the table data to its initial state from the component content
     */
    value: function resetTable() {
      if (this.UtilService.hasConnectedComponent(this.componentContent)) {
        // this component imports work so we will import the work again
        this.handleConnectedComponents();
      } else {
        // get the original table from the step content
        this.tableData = this.getCopyOfTableData(this.componentContent.tableData);
        this.studentDataChanged();
      }
    }
  }, {
    key: 'getTableDataRows',


    /**
     * Get the rows of the table data
     */
    value: function getTableDataRows() {
      return this.tableData;
    }
  }, {
    key: 'setStudentWork',


    /**
     * Populate the student work into the component
     * @param componentState the component state to populate into the component
     */
    value: function setStudentWork(componentState) {

      if (componentState != null) {

        // get the student data from the component state
        var studentData = componentState.studentData;

        if (studentData != null) {
          // set the table into the controller
          this.tableData = studentData.tableData;

          var submitCounter = studentData.submitCounter;

          if (submitCounter != null) {
            // populate the submit counter
            this.submitCounter = submitCounter;
          }

          this.processLatestStudentWork();
        }
      }
    }

    /**
     * Create a new component state populated with the student data
     * @param action the action that is triggering creating of this component state
     * e.g. 'submit', 'save', 'change'
     * @return a promise that will return a component state
     */

  }, {
    key: 'createComponentState',
    value: function createComponentState(action) {

      var deferred = this.$q.defer();

      // create a new component state
      var componentState = this.NodeService.createNewComponentState();

      var studentData = {};

      // insert the table data
      studentData.tableData = this.getCopyOfTableData(this.tableData);

      // set the submit counter
      studentData.submitCounter = this.submitCounter;

      // set the flag for whether the student submitted this work
      componentState.isSubmit = this.isSubmit;

      // set the student data into the component state
      componentState.studentData = studentData;

      // set the component type
      componentState.componentType = 'Table';

      // set the node id
      componentState.nodeId = this.nodeId;

      // set the component id
      componentState.componentId = this.componentId;

      /*
       * reset the isSubmit value so that the next component state
       * doesn't maintain the same value
       */
      this.isSubmit = false;

      /*
       * perform any additional processing that is required before returning
       * the component state
       */
      this.createComponentStateAdditionalProcessing(deferred, componentState, action);

      return deferred.promise;
    }
  }, {
    key: 'createBlankComponentState',


    /**
     * Create a new component state with no student data
     * @return a component state with no student data
     */
    value: function createBlankComponentState() {

      // create a new component state
      var componentState = this.NodeService.createNewComponentState();

      if (componentState != null) {
        var studentData = {};

        // set the student data into the component state
        componentState.studentData = studentData;
      }

      return componentState;
    }
  }, {
    key: 'showResetTableButton',


    /**
     * Check whether we need to show the reset table button
     * @return whether to show the reset table button
     */
    value: function showResetTableButton() {
      return this.isResetTableButtonVisible;
    }
  }, {
    key: 'setGraphDataIntoTableData',


    /**
     * Set the graph data into the table data
     * @param componentState the component state to get the graph data from
     * @param params (optional) the params to specify what columns
     * and rows to overwrite in the table data
     */
    value: function setGraphDataIntoTableData(componentState, params) {

      var trialIndex = 0;
      var seriesIndex = 0;

      if (params != null) {

        if (params.trialIndex != null) {
          // get the trial index
          trialIndex = params.trialIndex;
        }

        if (params.seriesIndex != null) {
          // get the series index
          seriesIndex = params.seriesIndex;
        }

        if (params.showDataAtMouseX) {
          this.showDataAtMouseX(componentState, params);
          return;
        }
      }

      if (componentState != null && componentState.studentData != null) {

        // get the student data
        var studentData = componentState.studentData;

        // get the student data version
        var studentDataVersion = studentData.version;

        if (studentDataVersion == null || studentDataVersion == 1) {
          // this is the old student data format that can't contain trials

          // get the series
          var series = studentData.series;

          if (series != null && series.length > 0) {

            // get the series that we will get data from
            var tempSeries = series[seriesIndex];

            // set the series data into the table
            this.setSeriesIntoTable(tempSeries);
          }
        } else {
          // this is the new student data format that can contain trials

          // get all the trials
          var trials = studentData.trials;

          if (trials != null) {

            // get the specific trial we want
            var trial = trials[trialIndex];

            if (trial != null) {

              // get the series in the trial
              var multipleSeries = trial.series;

              if (multipleSeries != null) {

                // get the specific series we want
                var series = multipleSeries[seriesIndex];

                // set the series data into the table
                this.setSeriesIntoTable(series);
              }
            }
          }
        }
      }
    }
  }, {
    key: 'showDataAtMouseX',


    /**
     * Show the data at x for all the series.
     * @param componentState The Graph component state.
     * @param params The connected component params.
     */
    value: function showDataAtMouseX(componentState, params) {
      var studentData = componentState.studentData;
      var mouseOverPoints = studentData.mouseOverPoints;
      var x = null;

      // get the x value from the latest mouse over point
      if (mouseOverPoints != null && mouseOverPoints.length > 0) {
        var latestMouseOverPoint = mouseOverPoints[mouseOverPoints.length - 1];
        x = Math.round(latestMouseOverPoint[0]);
      }
      var xUnits = studentData.xAxis.units;
      var yUnits = studentData.yAxis.units;
      var xAxisTitle = studentData.xAxis.title.text;
      var yAxisTitle = studentData.yAxis.title.text;
      this.removeAllCellsFromTableData();
      this.addTableDataRow(this.createTableRow(['Series Name', xAxisTitle, yAxisTitle]));
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = studentData.trials[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var trial = _step.value;

          if (trial.show) {
            var multipleSeries = trial.series;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = multipleSeries[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var singleSeries = _step2.value;

                if (singleSeries.show !== false) {
                  var closestDataPoint = this.getClosestDataPoint(singleSeries.data, x);
                  if (closestDataPoint != null) {
                    this.addTableDataRow(this.createTableRow([singleSeries.name, Math.round(this.getXFromDataPoint(closestDataPoint)) + ' ' + xUnits, Math.round(this.getYFromDataPoint(closestDataPoint)) + ' ' + yUnits]));
                  }
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
    }

    /**
     * Remove all the rows and cells from the table data.
     */

  }, {
    key: 'removeAllCellsFromTableData',
    value: function removeAllCellsFromTableData() {
      this.tableData = [];
    }

    /**
     * Append a row to the table data.
     * @param row An array of objects. Each object represents a cell in the table.
     */

  }, {
    key: 'addTableDataRow',
    value: function addTableDataRow(row) {
      this.tableData.push(row);
    }

    /**
     * Create a cell object.
     * @param text The text to show in the cell.
     * @param editable Whether the student is allowed to edit the contents in the
     * cell.
     * @param size The with of the cell.
     * @return An object.
     */

  }, {
    key: 'createTableCell',
    value: function createTableCell() {
      var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var editable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var size = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      return { text: text, editable: editable, size: size };
    }

    /**
     * Create a row.
     * @param columns An array of strings or objects.
     * @return An array of objects.
     */

  }, {
    key: 'createTableRow',
    value: function createTableRow(columns) {
      var row = [];
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = columns[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var column = _step3.value;

          if (column.constructor.name == 'String') {
            row.push(this.createTableCell(column));
          } else if (column.constructor.name == 'Object') {
            row.push(this.createTableCell(column.text, column.editable, column.size));
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

      return row;
    }

    /**
     * Get the data point that has the closest x value to the given argument x.
     * @param dataPoints An array of data points. Each data point can be an object
     * or an array.
     * @param x The argument x.
     * @return A data point which can be an object or array.
     */

  }, {
    key: 'getClosestDataPoint',
    value: function getClosestDataPoint(dataPoints, x) {
      var closestDataPoint = null;
      var minNumericalXDifference = Infinity;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = dataPoints[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var dataPoint = _step4.value;

          var dataPointX = this.getXFromDataPoint(dataPoint);
          var numericalDifference = this.getNumericalAbsoluteDifference(x, dataPointX);
          if (numericalDifference < minNumericalXDifference) {
            // we have found a new data point that is closer to x
            closestDataPoint = dataPoint;
            minNumericalXDifference = numericalDifference;
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      return closestDataPoint;
    }

    /**
     * Get the absolute value of the difference between the two numbers.
     * @param x1 A number.
     * @param x2 A number.
     * @return The absolute value of the difference between the two numbers.
     */

  }, {
    key: 'getNumericalAbsoluteDifference',
    value: function getNumericalAbsoluteDifference(x1, x2) {
      return Math.abs(x1 - x2);
    }

    /**
     * Get the x value from the data point.
     * @param dataPoint An object or array.
     * @return The x value of the data point.
     */

  }, {
    key: 'getXFromDataPoint',
    value: function getXFromDataPoint(dataPoint) {
      if (dataPoint.constructor.name == 'Object') {
        return dataPoint.x;
      } else if (dataPoint.constructor.name == 'Array') {
        return dataPoint[0];
      }
    }

    /**
     * Get the y value from the data point.
     * @param dataPoint An object or array.
     * @return The y value of the data point.
     */

  }, {
    key: 'getYFromDataPoint',
    value: function getYFromDataPoint(dataPoint) {
      if (dataPoint.constructor.name == 'Object') {
        return dataPoint.y;
      } else if (dataPoint.constructor.name == 'Array') {
        return dataPoint[1];
      }
    }

    /**
     * Set the series data into the table
     * @param series an object that contains the data for a single series
     * @param params the parameters for where to place the points in the table
     */

  }, {
    key: 'setSeriesIntoTable',
    value: function setSeriesIntoTable(series, params) {

      /*
       * the default is set to not skip the first row and for the
       * x column to be the first column and the y column to be the
       * second column
       */
      var skipFirstRow = true;
      var xColumn = 0;
      var yColumn = 1;

      if (params != null) {

        if (params.skipFirstRow != null) {
          // determine whether to skip the first row
          skipFirstRow = params.skipFirstRow;
        }

        if (params.xColumn != null) {
          // get the x column
          xColumn = params.xColumn;
        }

        if (params.yColumn != null) {
          // get the y column
          yColumn = params.yColumn;
        }
      }

      if (series != null) {

        // get the table data rows
        var tableDataRows = this.getTableDataRows();

        // get the data from the series
        var data = series.data;

        if (data != null) {

          // our counter for traversing the data rows
          var dataRowCounter = 0;

          // loop through all the table data rows
          for (var r = 0; r < tableDataRows.length; r++) {

            if (skipFirstRow && r === 0) {
              // skip the first table data row
              continue;
            }

            var x = '';
            var y = '';

            // get the data row
            var dataRow = data[dataRowCounter];

            if (dataRow != null) {
              // get the x and y values from the data row
              x = dataRow[0];
              y = dataRow[1];
            }

            // set the x and y values into the table data
            this.setTableDataCellValue(xColumn, r, null, x);
            this.setTableDataCellValue(yColumn, r, null, y);

            // increment the data row counter
            dataRowCounter++;
          }
        }
      }
    }

    /**
     * Set the table data cell value
     * @param x the x index (0 indexed)
     * @param y the y index (0 indexed)
     * @param value the value to set in the cell
     */

  }, {
    key: 'setTableDataCellValue',
    value: function setTableDataCellValue(x, y, table, value) {

      var tableDataRows = table;

      if (table == null) {
        // get the table data rows
        tableDataRows = this.getTableDataRows();
      }

      if (tableDataRows != null) {

        // get the row we want
        var row = tableDataRows[y];

        if (row != null) {

          // get the cell we want
          var cell = row[x];

          if (cell != null) {

            // set the value into the cell
            cell.text = value;
          }
        }
      }
    }
  }, {
    key: 'getTableDataCellValue',


    /**
     * Get the value of a cell in the table
     * @param x the x coordinate
     * @param y the y coordinate
     * @param table (optional) table data to get the value from. this is used
     * when we want to look up the value in the default authored table
     * @returns the cell value (text or a number)
     */
    value: function getTableDataCellValue(x, y, table) {

      var cellValue = null;

      if (table == null) {
        // get the table data rows
        table = this.getTableDataRows();
      }

      if (table != null) {

        // get the row we want
        var row = table[y];

        if (row != null) {

          // get the cell we want
          var cell = row[x];

          if (cell != null) {

            // set the value into the cell
            cellValue = cell.text;
          }
        }
      }

      return cellValue;
    }

    /**
     * Get the number of rows in the table
     * @returns the number of rows in the table
     */

  }, {
    key: 'getNumRows',
    value: function getNumRows() {
      return this.componentContent.numRows;
    }

    /**
     * Get the number of columns in the table
     * @returns the number of columns in the table
     */

  }, {
    key: 'getNumColumns',
    value: function getNumColumns() {
      return this.componentContent.numColumns;
    }

    /**
     * Check if the table is empty. The table is empty if all the
     * cells are empty string.
     * @returns whether the table is empty
     */

  }, {
    key: 'isTableEmpty',
    value: function isTableEmpty() {
      var result = true;

      var numRows = this.getNumRows();
      var numColumns = this.getNumColumns();

      // loop through all the rows
      for (var r = 0; r < numRows; r++) {

        // loop through all the cells in the row
        for (var c = 0; c < numColumns; c++) {

          // get a cell value
          var cellValue = this.getTableDataCellValue(c, r);

          if (cellValue != null && cellValue != '') {
            // the cell is not empty so the table is not empty
            result = false;
            break;
          }
        }

        if (result == false) {
          break;
        }
      }

      return result;
    }

    /**
     * Check if the table is set to the default values. The table
     * is set to the default values if all the cells match the
     * values in the default authored table.
     * @returns whether the table is set to the default values
     */

  }, {
    key: 'isTableReset',
    value: function isTableReset() {
      var result = true;

      var numRows = this.getNumRows();
      var numColumns = this.getNumColumns();

      // get the default table
      var defaultTable = this.componentContent.tableData;

      // loop through all the rows
      for (var r = 0; r < numRows; r++) {

        // loop through all the cells in the row
        for (var c = 0; c < numColumns; c++) {

          // get the cell value from the student table
          var cellValue = this.getTableDataCellValue(c, r);

          // get the cell value from the default table
          var defaultCellValue = this.getTableDataCellValue(c, r, defaultTable);

          if (cellValue != defaultCellValue) {
            // the cell values do not match so the table is not set to the default values
            result = false;
            break;
          }
        }

        if (result == false) {
          break;
        }
      }

      return result;
    }

    /**
     * Snip the table by converting it to an image
     * @param $event the click event
     */

  }, {
    key: 'snipTable',
    value: function snipTable($event) {
      var _this2 = this;

      // get the table element. this will obtain an array.
      var tableElement = angular.element('#table_' + this.nodeId + '_' + this.componentId);

      if (tableElement != null && tableElement.length > 0) {
        // get the table element
        tableElement = tableElement[0];

        // convert the table element to a canvas element
        (0, _html2canvas2.default)(tableElement).then(function (canvas) {
          // get the canvas as a base64 string
          var img_b64 = canvas.toDataURL('image/png');

          // get the image object
          var imageObject = _this2.UtilService.getImageObjectFromBase64String(img_b64);

          // create a notebook item with the image populated into it
          _this2.NotebookService.addNote($event, imageObject);
        });
      }
    }

    /**
     * Copy the table data cell text from one component state to another
     * @param fromComponentState get the cell text values from this component state
     * @param toComponentState set the cell text values in this component state
     */

  }, {
    key: 'copyTableDataCellText',
    value: function copyTableDataCellText(fromComponentState, toComponentState) {

      if (fromComponentState != null && toComponentState != null) {
        var fromStudentData = fromComponentState.studentData;
        var toStudentData = toComponentState.studentData;

        if (fromStudentData != null && toStudentData != null) {
          var fromTableData = fromStudentData.tableData;
          var toTableData = toStudentData.tableData;

          if (fromTableData != null & toTableData != null) {

            // loop through all the rows
            for (var y = 0; y < this.getNumRows(); y++) {

              // loop through all the columns
              for (var x = 0; x < this.getNumColumns(); x++) {

                // get the cell value
                var cellValue = this.getTableDataCellValue(x, y, fromTableData);

                if (cellValue != null) {
                  // set the cell value
                  this.setTableDataCellValue(x, y, toTableData, cellValue);
                }
              }
            }
          }
        }
      }

      return toComponentState;
    }

    /**
     * Only merges the first component state
     * TODO: implement merging all component states
     * @param {array} componentStates
     * @return {object} merged component state
     */

  }, {
    key: 'createMergedComponentState',
    value: function createMergedComponentState(componentStates) {
      var defaultComponentState = this.createBlankComponentState();
      defaultComponentState.studentData.tableData = this.getCopyOfTableData(this.componentContent.tableData);
      return this.copyTableDataCellText(componentStates[0], defaultComponentState);
    }
  }]);

  return TableController;
}(_componentController2.default);

TableController.$inject = ['$anchorScroll', '$filter', '$location', '$mdDialog', '$q', '$rootScope', '$scope', 'AnnotationService', 'ConfigService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'TableService', 'UtilService'];

exports.default = TableController;
//# sourceMappingURL=tableController.js.map
