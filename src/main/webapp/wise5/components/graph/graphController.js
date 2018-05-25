'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _componentController = require('../componentController');

var _componentController2 = _interopRequireDefault(_componentController);

var _html2canvas = require('html2canvas');

var _html2canvas2 = _interopRequireDefault(_html2canvas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GraphController = function (_ComponentController) {
  _inherits(GraphController, _ComponentController);

  function GraphController($filter, $mdDialog, $q, $rootScope, $scope, $timeout, AnnotationService, ConfigService, GraphService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, GraphController);

    var _this = _possibleConstructorReturn(this, (GraphController.__proto__ || Object.getPrototypeOf(GraphController)).call(this, $filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.$q = $q;
    _this.$timeout = $timeout;
    _this.GraphService = GraphService;

    // the graph type
    _this.graphType = null;

    // holds all the series
    _this.series = [];

    // which color the series will be in
    _this.seriesColors = ['blue', 'red', 'green', 'orange', 'purple', 'black'];

    // series marker options
    _this.seriesMarkers = ['circle', 'square', 'diamond', 'triangle', 'triangle-down', 'circle'];

    // will hold the active series
    _this.activeSeries = null;

    // the latest annotations
    _this.latestAnnotations = null;

    // whether the reset graph button is shown or not
    _this.isResetGraphButtonVisible = false;

    // whether the select series input is shown or not
    _this.isSelectSeriesVisible = false;

    // whether the snip drawing button is shown or not
    _this.isSnipDrawingButtonVisible = true;

    // the label for the notebook in the project
    _this.notebookConfig = _this.NotebookService.getNotebookConfig();

    // whether to only show the new trial when a new trial is created
    _this.hideAllTrialsOnNewTrial = true;

    // whether to show the undo button
    _this.showUndoButton = false;

    _this.legendEnabled = true;

    _this.hasCustomLegendBeenSet = false;

    _this.showTrialSelect = true;

    // the id of the chart element
    _this.chartId = 'chart1';

    // the available graph types
    _this.availableGraphTypes = [{
      value: 'line',
      text: _this.$translate('graph.linePlot')
    }, {
      value: 'column',
      text: _this.$translate('graph.columnPlot')
    }, {
      value: 'scatter',
      text: _this.$translate('graph.scatterPlot')
    }];

    // the options for rounding data point values
    _this.availableRoundingOptions = [{
      value: null,
      text: _this.$translate('graph.noRounding')
    }, {
      value: 'integer',
      text: _this.$translate('graph.roundToInteger')
    }, {
      value: 'tenth',
      text: _this.$translate('graph.roundToTenth')
    }, {
      value: 'hundredth',
      text: _this.$translate('graph.roundToHundredth')
    }];

    // the options for data point symbols
    _this.availableSymbols = [{
      value: 'circle',
      text: _this.$translate('graph.circle')
    }, {
      value: 'square',
      text: _this.$translate('graph.square')
    }, {
      value: 'triangle',
      text: _this.$translate('graph.triangle')
    }, {
      value: 'triangle-down',
      text: _this.$translate('graph.triangleDown')
    }, {
      value: 'diamond',
      text: _this.$translate('graph.diamond')
    }];

    // the options for line types
    _this.availableLineTypes = [{
      value: 'Solid',
      text: _this.$translate('graph.solid')
    }, {
      value: 'Dash',
      text: _this.$translate('graph.dash')
    }, {
      value: 'Dot',
      text: _this.$translate('graph.dot')
    }, {
      value: 'ShortDash',
      text: _this.$translate('graph.shortDash')
    }, {
      value: 'ShortDot',
      text: _this.$translate('graph.shortDot')
    }];

    // the options for the x axis types
    _this.availableXAxisTypes = [{
      value: 'limits',
      text: 'Limits'
    }, {
      value: 'categories',
      text: 'Categories'
    }];

    // the width of the graph
    _this.width = null;

    // the height of the graph
    _this.height = null;

    // the options for when to update this component from a connected component
    _this.connectedComponentUpdateOnOptions = [{
      value: 'change',
      text: _this.$translate('change')
    }, {
      value: 'save',
      text: _this.$translate('SAVE')
    }, {
      value: 'submit',
      text: _this.$translate('SUBMIT')
    }];

    // the component types we are allowed to connect to
    _this.allowedConnectedComponentTypes = [{ type: 'Animation' }, { type: 'ConceptMap' }, { type: 'Draw' }, { type: 'Embedded' }, { type: 'Graph' }, { type: 'Label' }, { type: 'Table' }];

    /*
     * get the original component content. this is used when showing
     * previous work from another component.
     */
    _this.originalComponentContent = _this.$scope.originalComponentContent;

    _this.trials = [];
    _this.activeTrial = null;
    _this.trialIdsToShow = [];
    _this.selectedTrialsText = '';

    _this.studentDataVersion = 2;

    _this.canCreateNewTrials = false;
    _this.canDeleteTrials = false;

    _this.uploadedFileName = null;

    _this.backgroundImage = null;

    /*
     * An array to store the component states for the student to undo.
     * The undoStack will contain the component states from the current
     * visit except for the current component state.
     */
    _this.undoStack = [];

    // used to hold the component state that is loaded when this component loads
    _this.initialComponentState = null;

    /*
     * whether to add the next component state created in
     * studentDataChanged() to the undoStack
     */
    _this.addNextComponentStateToUndoStack = false;

    _this.mouseOverPoints = [];

    // set the chart id
    _this.chartId = 'chart_' + _this.componentId;

    // get the graph type
    _this.graphType = _this.componentContent.graphType;

    if (_this.graphType == null) {
      // there is no graph type so we will default to line plot
      _this.graphType = 'line';
    }

    if (_this.componentContent.canCreateNewTrials) {
      _this.canCreateNewTrials = _this.componentContent.canCreateNewTrials;
    }

    if (_this.componentContent.canDeleteTrials) {
      _this.canDeleteTrials = _this.componentContent.canDeleteTrials;
    }

    if (_this.componentContent.hideAllTrialsOnNewTrial === false) {
      _this.hideAllTrialsOnNewTrial = false;
    }

    if (_this.mode === 'student') {
      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = _this.componentContent.showSaveButton;
      _this.isSubmitButtonVisible = _this.componentContent.showSubmitButton;
      _this.isResetSeriesButtonVisible = true;
      _this.isSelectSeriesVisible = true;

      // get the latest annotations
      // TODO: watch for new annotations and update accordingly
      _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.workgroupId);
      _this.backgroundImage = _this.componentContent.backgroundImage;
    } else if (_this.mode === 'grading' || _this.mode === 'gradingRevision') {
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      //this.isResetGraphButtonVisible = false;
      _this.isResetSeriesButtonVisible = false;
      _this.isSelectSeriesVisible = false;
      _this.isDisabled = true;
      _this.isSnipDrawingButtonVisible = false;

      // get the component state from the scope
      var _componentState = _this.$scope.componentState;

      if (_componentState != null) {
        // create a unique id for the chart element using this component state
        _this.chartId = 'chart_' + _componentState.id;
        if (_this.mode === 'gradingRevision') {
          _this.chartId = 'chart_gradingRevision_' + _componentState.id;
        }
      }

      if (_this.mode === 'grading') {
        // get the latest annotations
        _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.workgroupId);
      }
    } else if (_this.mode === 'onlyShowWork') {
      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isResetGraphButtonVisible = false;
      _this.isResetSeriesButtonVisible = false;
      _this.isSelectSeriesVisible = false;
      _this.isDisabled = true;
      _this.isSnipDrawingButtonVisible = false;
      _this.backgroundImage = _this.componentContent.backgroundImage;
    } else if (_this.mode === 'showPreviousWork') {
      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isDisabled = true;
      _this.backgroundImage = _this.componentContent.backgroundImage;
    } else if (_this.mode === 'authoring') {
      _this.isSaveButtonVisible = _this.componentContent.showSaveButton;
      _this.isSubmitButtonVisible = _this.componentContent.showSubmitButton;
      _this.isResetSeriesButtonVisible = true;
      _this.isSelectSeriesVisible = true;

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

      _this.backgroundImage = _this.componentContent.backgroundImage;
      _this.updateAdvancedAuthoringView();

      $scope.$watch(function () {
        return this.authoringComponentContent;
      }.bind(_this), function (newValue, oldValue) {
        this.componentContent = this.ProjectService.injectAssetPaths(newValue);
        this.series = null;
        this.xAxis = null;
        this.yAxis = null;
        this.submitCounter = 0;
        this.backgroundImage = this.componentContent.backgroundImage;
        this.isSaveButtonVisible = this.componentContent.showSaveButton;
        this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
        this.graphType = this.componentContent.graphType;
        this.isResetSeriesButtonVisible = true;
        this.isSelectSeriesVisible = true;
        this.legendEnabled = !this.componentContent.hideLegend;
        this.showTrialSelect = !this.componentContent.hideTrialSelect;
        this.setSeries(this.UtilService.makeCopyOfJSONObject(this.componentContent.series));
        this.setDefaultActiveSeries();
        this.trials = [];
        this.newTrial();
        this.clearPlotLines();
        this.setupGraph();
      }.bind(_this), true);
    }

    // get the component state from the scope
    var componentState = _this.$scope.componentState;

    // set whether studentAttachment is enabled
    _this.isStudentAttachmentEnabled = _this.componentContent.isStudentAttachmentEnabled;

    if (_this.mode == 'student') {
      if (!_this.GraphService.componentStateHasStudentWork(componentState, _this.componentContent)) {
        _this.newTrial();
      }
      if (_this.UtilService.hasConnectedComponentAlwaysField(_this.componentContent)) {
        /*
         * This component has a connected component that we always want to look at for
         * merging student data.
         */
        _this.handleConnectedComponents();
      } else if (_this.GraphService.componentStateHasStudentWork(componentState, _this.componentContent)) {
        // this student has previous work so we will load it
        _this.setStudentWork(componentState);
      } else if (_this.UtilService.hasConnectedComponent(_this.componentContent)) {
        /*
         * This student doesn't have any previous work but this component has connected components
         * so we will get the work from the connected component.
         */
        _this.handleConnectedComponents();
      }
    } else {
      // populate the student work into this component
      _this.setStudentWork(componentState);
    }

    if (componentState != null) {
      // there is an initial component state so we will remember it
      _this.initialComponentState = componentState;

      /*
       * remember this component state as the previous component
       * state for undo purposes
       */
      _this.previousComponentState = componentState;
    }

    // check if the student has used up all of their submits
    if (_this.componentContent.maxSubmitCount != null && _this.submitCounter >= _this.componentContent.maxSubmitCount) {
      /*
       * the student has used up all of their chances to submit so we
       * will disable the submit button
       */
      _this.isSubmitButtonDisabled = true;
    }

    if (_this.componentContent.hideLegend) {
      _this.legendEnabled = false;
    }

    if (_this.componentContent.hideTrialSelect) {
      _this.showTrialSelect = false;
    }

    _this.disableComponentIfNecessary();

    // setup the graph
    _this.setupGraph().then(function () {
      _this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: _this.nodeId, componentId: _this.componentId });
    });

    if (_this.$scope.$parent.nodeController != null) {
      // register this component with the parent node
      _this.$scope.$parent.nodeController.registerComponentController(_this.$scope, _this.componentContent);
    }

    /**
     * A connected component has changed its student data so we will
     * perform any necessary changes to this component
     * @param connectedComponent the connected component
     * @param connectedComponentParams the connected component params
     * @param componentState the student data from the connected
     * component that has changed
     */
    _this.$scope.handleConnectedComponentStudentDataChanged = function (connectedComponent, connectedComponentParams, componentState) {

      if (connectedComponent != null && componentState != null) {

        // get the component type that has changed
        var componentType = connectedComponent.type;

        if (componentType === 'Table') {

          // convert the table data to series data
          if (componentState != null) {

            // get the student data
            var studentData = componentState.studentData;

            if (studentData != null && studentData.tableData != null) {

              // get the rows in the table
              var rows = studentData.tableData;

              var data = this.$scope.graphController.convertRowDataToSeriesData(rows, connectedComponentParams);

              // get the index of the series that we will put the data into
              var seriesIndex = connectedComponentParams.seriesIndex;

              if (seriesIndex == null) {
                seriesIndex = 0;
              }

              var studentDataVersion = this.$scope.graphController.studentDataVersion;

              if (studentDataVersion == null || studentDataVersion == 1) {
                // the student data is version 1 which has no trials

                // get the series
                var series = this.$scope.graphController.series[seriesIndex];

                if (series == null) {
                  // the series is null so we will create a series
                  series = {};
                  this.$scope.graphController.series[seriesIndex] = series;
                }

                // set the data into the series
                series.data = data;
              } else {
                // the student data is the newer version that has trials

                // get the active trial
                var trial = this.$scope.graphController.activeTrial;

                if (trial != null && trial.series != null) {

                  // get the series
                  var series = trial.series[seriesIndex];

                  if (series == null) {
                    // the series is null so we will create a series
                    series = {};
                    this.$scope.graphController.series[seriesIndex] = series;
                  }

                  // set the data into the series
                  series.data = data;
                }
              }

              // render the graph
              this.$scope.graphController.setupGraph();

              // the graph has changed
              this.$scope.graphController.isDirty = true;
            }
          }
        } else if (componentType == 'Embedded') {
          // convert the embedded data to series data
          if (componentState != null) {
            /*
             * make a copy of the component state so that we don't
             * reference the exact component state object from the
             * other component in case field values change.
             */
            componentState = this.UtilService.makeCopyOfJSONObject(componentState);
            var _studentData = componentState.studentData;
            this.processConnectedComponentStudentData(_studentData, connectedComponentParams);
            this.studentDataChanged();
          }
        } else if (componentType == 'Animation') {

          if (componentState != null && componentState.t != null) {

            // set the vertical plot line to show where t is
            this.setVerticalPlotLine(componentState.t);

            // redraw the graph so that the plot line displays
            this.setupGraph();
          }
        }
      }
    }.bind(_this);

    /**
     * Get the component state from this component. The parent node will
     * call this function to obtain the component state when it needs to
     * save student data.
     * @param isSubmit boolean whether the request is coming from a submit
     * action (optional; default is false)
     * @return a component state containing the student data
     */
    _this.$scope.getComponentState = function (isSubmit) {
      var deferred = this.$q.defer();
      var getState = false;
      var action = 'change';

      if (isSubmit) {
        if (this.$scope.graphController.isSubmitDirty) {
          getState = true;
          action = 'submit';
        }
      } else {
        if (this.$scope.graphController.isDirty) {
          getState = true;
          action = 'save';
        }
      }

      if (getState) {
        // create a component state populated with the student data
        this.$scope.graphController.createComponentState(action).then(function (componentState) {
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
     * The parent node submit button was clicked
     */
    _this.$scope.$on('nodeSubmitClicked', angular.bind(_this, function (event, args) {

      // get the node id of the node
      var nodeId = args.nodeId;

      // make sure the node id matches our parent node
      if (this.nodeId === nodeId) {

        // trigger the submit
        var submitTriggeredBy = 'nodeSubmitButton';
        this.submit(submitTriggeredBy);
      }
    }));

    /**
     * Listen for the 'studentWorkSavedToServer' event which is fired when
     * we receive the response from saving a component state to the server
     */
    _this.$scope.$on('studentWorkSavedToServer', angular.bind(_this, function (event, args) {

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

        // set save message
        if (isSubmit) {
          this.setSaveMessage(this.$translate('SUBMITTED'), clientSaveTime);

          this.lockIfNecessary();

          // set isSubmitDirty to false because the component state was just submitted and notify node
          this.isSubmitDirty = false;
          this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: false });
        } else if (isAutoSave) {
          this.setSaveMessage(this.$translate('AUTO_SAVED'), clientSaveTime);
        } else {
          this.setSaveMessage(this.$translate('SAVED'), clientSaveTime);
        }
      }
    }));

    /*
     * Handle the delete key pressed event
     */
    _this.deleteKeyPressedListenerDestroyer = _this.$scope.$on('deleteKeyPressed', function () {
      _this.handleDeleteKeyPressed();
    });

    /**
     * Listen for the 'annotationSavedToServer' event which is fired when
     * we receive the response from saving an annotation to the server
     */
    _this.$scope.$on('annotationSavedToServer', function (event, args) {

      if (args != null) {

        // get the annotation that was saved to the server
        var annotation = args.annotation;

        if (annotation != null) {

          // get the node id and component id of the annotation
          var annotationNodeId = annotation.nodeId;
          var annotationComponentId = annotation.componentId;

          // make sure the annotation was for this component
          if (_this.nodeId === annotationNodeId && _this.componentId === annotationComponentId) {

            // get latest score and comment annotations for this component
            _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.workgroupId);
          }
        }
      }
    });

    /**
     * Listen for the 'exitNode' event which is fired when the student
     * exits the parent node. This will perform any necessary cleanup
     * when the student exits the parent node.
     */
    _this.$scope.$on('exitNode', angular.bind(_this, function (event, args) {
      // destroy the delete key pressed listener
      this.deleteKeyPressedListenerDestroyer();
    }));

    /**
     * The student has changed the file input
     * @param element the file input element
     */
    _this.$scope.fileUploadChanged = function (element) {

      var overwrite = true;

      // check if the active series already has data
      if (this.graphController != null && this.graphController.activeSeries != null && this.graphController.activeSeries.data != null) {

        var activeSeriesData = this.graphController.activeSeries.data;

        if (activeSeriesData.length > 0) {
          /*
           * the active series already has data so we will ask the
           * student if they want to overwrite the data
           */
          var answer = confirm(this.graphController.$translate('graph.areYouSureYouWantToOverwriteTheCurrentLineData'));
          if (!answer) {
            // the student does not want to overwrite the data
            overwrite = false;
          }
        }
      }

      if (overwrite) {
        // obtain the file content and overwrite the data in the graph

        // get the files from the file input element
        var files = element.files;

        if (files != null && files.length > 0) {

          var reader = new FileReader();

          // this is the callback function for reader.readAsText()
          reader.onload = function () {

            // get the file contente
            var fileContent = reader.result;

            /*
             * read the csv file content and load the data into
             * the active series
             */
            this.scope.graphController.readCSV(fileContent);

            // remember the file name
            this.scope.graphController.setUploadedFileName(this.fileName);
            this.scope.graphController.studentDataChanged();
          };

          /*
           * save a reference to this scope in the reader so that we
           * have access to the scope and graphController in the
           * reader.onload() function
           */
          reader.scope = this;

          // remember the file name
          reader.fileName = files[0].name;

          // read the text from the file
          reader.readAsText(files[0]);

          // upload the file to the studentuploads folder
          this.graphController.StudentAssetService.uploadAsset(files[0]);
        }
      }

      /*
       * clear the file input element value so that onchange() will be
       * called again if the student wants to upload the same file again
       */
      element.value = null;
    };

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
              } else if (args.target == 'background') {
                // the target is the background image

                // set the background file name
                _this.authoringComponentContent.backgroundImage = fileName;

                // the authoring component content has changed so we will save the project
                _this.authoringViewComponentChanged();
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
   * Set up the mouse over listener which will be used to draw plot lines at the
   * mouse position.
   */


  _createClass(GraphController, [{
    key: 'setupMouseMoveListener',
    value: function setupMouseMoveListener() {
      var _this2 = this;

      // Make sure we only add the listeners once.
      if (!this.setupMouseMoveListenerDone) {

        /*
         * Remove all existing listeners on the chart div to make sure we don't
         * bind a listener multiple times.
         */
        $('#' + this.chartId).unbind();

        $('#' + this.chartId).bind('mousedown', function (e) {
          _this2.mouseDown = true;
          _this2.mouseDownEventOccurred(e);
        });

        $('#' + this.chartId).bind('mouseup', function (e) {
          _this2.mouseDown = false;
        });

        $('#' + this.chartId).bind('mousemove', function (e) {
          if (_this2.mouseDown) {
            _this2.mouseDownEventOccurred(e);
          }
        });

        $('#' + this.chartId).bind('mouseleave', function (e) {
          _this2.mouseDown = false;
        });

        this.setupMouseMoveListenerDone = true;
      }
    }

    /**
     * The student has moved the mouse while holding the mouse button down.
     * @param e The mouse event.
     */

  }, {
    key: 'mouseDownEventOccurred',
    value: function mouseDownEventOccurred(e) {
      /*
       * Firefox displays abnormal behavior when the student drags the plot line.
       * In Firefox, when the mouse is on top of the plot line, the event will
       * contain offset values relative to the plot line instead of relative to
       * the graph container. We always want the offset values relative to the
       * graph container so we will ignore events where the offset values are
       * relative to the plot line.
       */
      if (e.offsetX < 10 || e.offsetY < 10) {
        return;
      }

      var chart = $('#' + this.chartId).highcharts();

      // handle the x position of the mouse
      var chartXAxis = chart.xAxis[0];
      var x = chartXAxis.toValue(e.offsetX, false);
      x = this.makeSureXIsWithinXMinMaxLimits(x);
      if (this.componentContent.showMouseXPlotLine) {
        this.showXPlotLine(x);
      }

      // handle the y position of the mouse
      var chartYAxis = chart.yAxis[0];
      var y = chartYAxis.toValue(e.offsetY, false);
      y = this.makeSureYIsWithinYMinMaxLimits(y);
      if (this.componentContent.showMouseYPlotLine) {
        this.showYPlotLine(y);
      }

      if (this.componentContent.saveMouseOverPoints) {
        /*
         * Make sure we aren't saving the points too frequently. We want to avoid
         * saving too many unnecessary data points.
         */
        var currentTimestamp = new Date().getTime();

        /*
         * Make sure this many milliseconds has passed before saving another mouse
         * over point.
         */
        var timeBetweenSendingMouseOverPoints = 200;

        if (this.lastSavedMouseMoveTimestamp == null || currentTimestamp - this.lastSavedMouseMoveTimestamp > timeBetweenSendingMouseOverPoints) {
          this.addMouseOverPoint(x, y);
          this.studentDataChanged();
          this.lastSavedMouseMoveTimestamp = currentTimestamp;
        }
      }
    }

    /**
     * Show the vertical plot line at the given x.
     * @param x The x value to show the vertical line at.
     * @param text The text to show on the plot line.
     */

  }, {
    key: 'showXPlotLine',
    value: function showXPlotLine(x, text) {
      var chart = $('#' + this.chartId).highcharts();
      var chartXAxis = chart.xAxis[0];
      chartXAxis.removePlotLine('plot-line-x');
      var plotLine = {
        value: x,
        color: 'red',
        width: 4,
        id: 'plot-line-x'
      };
      if (text != null && text != '') {
        plotLine.label = {
          text: text,
          verticalAlign: 'top'
        };
      }
      chartXAxis.addPlotLine(plotLine);

      if (this.componentContent.highlightXRangeFromZero) {
        this.drawRangeRectangle(0, x, chart.yAxis[0].min, chart.yAxis[0].max);
      }
    }

    /**
     * Draw a rectangle on the graph. This is used for highlighting a range.
     * @param xMin The left x value in the graph x axis units.
     * @param xMax The right x value in the graph x axis units.
     * @param yMin The bottom y value in the graph y axis units.
     * @param yMax The top y value in the graph y axis units.
     * @param strokeColor The color of the border.
     * @param strokeWidth The width of the border.
     * @param fillColor The color inside the rectangle.
     * @param fillOpacity The opacity of the color inside the rectangle.
     */

  }, {
    key: 'drawRangeRectangle',
    value: function drawRangeRectangle(xMin, xMax, yMin, yMax) {
      var strokeColor = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'black';
      var strokeWidth = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '.5';
      var fillColor = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 'black';
      var fillOpacity = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : '.1';


      var chart = $('#' + this.chartId).highcharts();

      // convert the x and y values to pixel values
      xMin = chart.xAxis[0].translate(xMin);
      xMax = chart.xAxis[0].translate(xMax);
      yMin = chart.yAxis[0].translate(yMin);
      yMax = chart.yAxis[0].translate(yMax);

      // create the rectangle if it hasn't been created before
      if (this.rectangle == null) {
        this.rectangle = chart.renderer.rect(0, 0, 0, 0, 0).css({
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          fill: fillColor,
          fillOpacity: fillOpacity
        }).add();
      }

      // update the rectangle position and size
      this.rectangle.attr({
        x: xMin + chart.plotLeft,
        y: chart.plotHeight + chart.plotTop - yMax,
        width: xMax - xMin,
        height: yMax - yMin
      });
    }

    /**
     * Show the horizontal plot line at the given y.
     * @param y The y value to show the horizontal line at.
     * @param text The text to show on the plot line.
     */

  }, {
    key: 'showYPlotLine',
    value: function showYPlotLine(y, text) {
      var chart = $('#' + this.chartId).highcharts();
      var chartYAxis = chart.yAxis[0];
      chartYAxis.removePlotLine('plot-line-y');
      var plotLine = {
        value: y,
        color: 'red',
        width: 2,
        id: 'plot-line-y'
      };
      if (text != null && text != '') {
        plotLine.label = {
          text: text,
          align: 'right'
        };
      }
      chartYAxis.addPlotLine(plotLine);
    }

    /**
     * Clear the x and y plot lines on the graph.
     */

  }, {
    key: 'clearPlotLines',
    value: function clearPlotLines() {
      var chart = Highcharts.charts[0];
      var chartXAxis = chart.xAxis[0];
      chartXAxis.removePlotLine('plot-line-x');
      var chartYAxis = chart.yAxis[0];
      chartYAxis.removePlotLine('plot-line-y');
    }

    /**
     * If the x value is not within the x min and max limits, we will modify the
     * x value to be at the limit.
     * @param x the x value
     * @return an x value between the x min and max limits
     */

  }, {
    key: 'makeSureXIsWithinXMinMaxLimits',
    value: function makeSureXIsWithinXMinMaxLimits(x) {
      if (x < this.xAxis.min) {
        x = this.xAxis.min;
      }

      if (x > this.xAxis.max) {
        x = this.xAxis.max;
      }

      return x;
    }

    /**
     * If the y value is not within the y min and max limits, we will modify the
     * y value to be at the limit.
     * @param y the y value
     * @return a y value between the y min and max limits
     */

  }, {
    key: 'makeSureYIsWithinYMinMaxLimits',
    value: function makeSureYIsWithinYMinMaxLimits(y) {
      if (y < this.yAxis.min) {
        y = this.yAxis.min;
      }

      if (y > this.yAxis.max) {
        y = this.yAxis.max;
      }

      return y;
    }

    /**
     * Add a mouse over point to the array of student mouse over points.
     * @param x the x value in graph units
     * @param y the y value in graph units
     */

  }, {
    key: 'addMouseOverPoint',
    value: function addMouseOverPoint(x, y) {
      var mouseOverPoint = [x, y];
      this.mouseOverPoints.push(mouseOverPoint);
    }

    /**
     * Setup the graph
     * @param useTimeout whether to call the setupGraphHelper() function in
     * a timeout callback
     */

  }, {
    key: 'setupGraph',
    value: function setupGraph(useTimeout) {
      var _this3 = this;

      var deferred = this.$q.defer();

      if (useTimeout) {
        // call the setup graph helper after a timeout

        /*
         * clear the chart config so that the graph is completely refreshed.
         * we need to do this otherwise all the series will react to
         * mouseover but we only want the active series to react to
         * mouseover.
         */
        this.chartConfig = {
          chart: {
            options: {
              chart: {}
            }
          }
        };

        /*
         * call the setup graph helper after a timeout. this is required
         * so that the graph is completely refreshed so that only the
         * active series will react to mouseover.
         */
        this.$timeout(function () {
          _this3.setupGraphHelper(deferred);
        });
      } else {
        // call the setup graph helper immediately
        this.setupGraphHelper(deferred);
      }

      return deferred.promise;
    }

    /**
     * The helper function for setting up the graph.
     * @param deferred A promise that should be resolved after the graph is done
     * rendering.
     */

  }, {
    key: 'setupGraphHelper',
    value: function setupGraphHelper(deferred) {
      var _this4 = this;

      // get the title
      var title = this.componentContent.title;

      // get the x and y axis attributes from the student data
      var xAxis = this.xAxis;
      var yAxis = this.yAxis;

      if (this.xAxis == null && this.componentContent.xAxis != null) {
        /*
         * the student does not have x axis data so we will use the
         * x axis from the component content
         */
        xAxis = this.UtilService.makeCopyOfJSONObject(this.componentContent.xAxis);
        this.xAxis = xAxis;
      }

      if (this.xAxis != null) {
        // do not display decimals on the x axis
        this.xAxis.allowDecimals = false;

        this.xAxis.plotBands = null;
        if (this.componentContent.xAxis != null && this.componentContent.xAxis.plotBands != null) {
          // Get the authored plot bands.
          this.xAxis.plotBands = this.componentContent.xAxis.plotBands;
        }
      }

      if (this.yAxis == null && this.componentContent.yAxis != null) {
        /*
         * the student does not have y axis data so we will use the
         * y axis from the component content
         */
        yAxis = this.UtilService.makeCopyOfJSONObject(this.componentContent.yAxis);
        this.yAxis = yAxis;
      }

      if (this.yAxis != null) {
        // do not display decimals on the y axis
        this.yAxis.allowDecimals = false;
      }

      if (this.componentContent.width != null) {
        // set the width of the graph
        this.width = this.componentContent.width;
      }

      if (this.componentContent.height != null) {
        // set the height of the graph
        this.height = this.componentContent.height;
      }

      // set the width of the span between the student x min and x max inputs
      if (this.width > 100) {
        this.xAxisLimitSpacerWidth = this.width - 100;
      } else {
        this.xAxisLimitSpacerWidth = 0;
      }

      /*
       * remember this graph controller so we can access it in the click
       * event for the graph
       */
      var thisGraphController = this;

      // get all the series from the student data
      var series = this.getSeries();

      var trialPlotBands = [];

      if (this.componentContent.enableTrials) {
        /*
         * trials are enabled so we will show the ones the student
         * has checked
         */
        series = [];

        var trials = this.trials;

        // loop through all the trials
        for (var t = 0; t < trials.length; t++) {
          var trial = trials[t];

          if (trial != null) {

            if (trial.show) {
              /*
               * we want to show this trial so we will append the
               * series from it
               */
              var tempSeries = trial.series;
              series = series.concat(tempSeries);

              if (trial.xAxis != null && trial.xAxis.plotBands != null) {
                /*
                 * Accumulate the plot bands from the trials that
                 * we are showing.
                 */
                trialPlotBands = trialPlotBands.concat(trial.xAxis.plotBands);
              }
            }
          }
        }
      }

      if (trialPlotBands.length > 0) {
        if (xAxis.plotBands == null) {
          xAxis.plotBands = [];
        }
        // Add the student plot bands to the x axis.
        xAxis.plotBands = xAxis.plotBands.concat(trialPlotBands);
      }

      if ((series == null || series.length === 0) && this.componentContent.series != null) {
        /*
         * use the series from the component content if the student does not
         * have any series data
         */
        series = this.UtilService.makeCopyOfJSONObject(this.componentContent.series);
        this.setSeries(series);
      }

      // add the event that will remove a point when clicked
      //this.addClickToRemovePointEvent(series);

      this.setDefaultActiveSeries();

      this.showUndoButton = false;

      // loop through all the series and
      for (var s = 0; s < series.length; s++) {
        var tempSeries = series[s];

        // check if the series should have a regression line generated for it
        if (tempSeries != null) {

          if (tempSeries.regression) {
            if (tempSeries.regressionSettings == null) {
              // initialize the regression settings object if necessary
              tempSeries.regressionSettings = {};
            }

            // get the regression settings object
            var regressionSettings = tempSeries.regressionSettings;

            // add these regression settings
            regressionSettings.xMin = xAxis.min;
            regressionSettings.xMax = xAxis.max;
            regressionSettings.numberOfPoints = 100;
          }

          if (tempSeries.canEdit && this.isActiveSeries(tempSeries)) {
            // the series is the active one so we will allow the student to interact with it
            // set the fields to allow points to be draggable
            if (this.graphType === 'line' || this.graphType === 'scatter') {
              // students can drag points horizontally on line and scatter plots
              tempSeries.draggableX = true;
            } else if (this.graphType === 'column') {
              // students can not drag points horizontally on column plots
              tempSeries.draggableX = false;
            }
            tempSeries.draggableY = true;
            tempSeries.cursor = 'move';
            tempSeries.stickyTracking = false;
            tempSeries.shared = false;
            tempSeries.allowPointSelect = true;
            tempSeries.enableMouseTracking = true;
            this.showUndoButton = true;
          } else {
            // the series is not active so we will not allow the student to interact with it
            tempSeries.draggableX = false;
            tempSeries.draggableY = false;
            tempSeries.stickyTracking = false;
            tempSeries.shared = false;
            tempSeries.allowPointSelect = false;
            tempSeries.enableMouseTracking = false;
          }

          // a series can be customized to allow mousing over points even when not the active series
          if (tempSeries.allowPointMouseOver === true) {
            tempSeries.allowPointSelect = true;
            tempSeries.enableMouseTracking = true;
          }

          if (this.isMousePlotLineOn()) {
            tempSeries.enableMouseTracking = true;
          }
        }
      }

      /*
       * generate an array of regression series for the series that
       * requrie a regression line
       */
      //var regressionSeries = this.GraphService.generateRegressionSeries(series);
      var regressionSeries = [];
      this.regressionSeries = regressionSeries;

      /*
       * create an array that will contain all the regular series and all
       * the regression series
       */
      var allSeries = [];
      allSeries = allSeries.concat(series);

      //regressionSeries[0].id = 'series-2';
      //regressionSeries[1].id = 'series-3';
      //this.setSeriesIds(regressionSeries);
      allSeries = allSeries.concat(regressionSeries);

      // clear all the series ids
      this.clearSeriesIds(allSeries);

      // give all series ids
      this.setSeriesIds(allSeries);

      /*
       * update the min and max x and y values if necessary so that all
       * points are visible
       */
      this.updateMinMaxAxisValues(allSeries, xAxis, yAxis);
      var timeout = this.$timeout;

      if (this.plotLines != null) {
        // set the plot lines
        xAxis.plotLines = this.plotLines;
      }

      // let user zoom the graph in the grading tool by clicking and dragging with mouse
      // TODO: provide authoring option to allow zooming for students?
      var zoomType = this.mode === 'grading' || this.mode === 'gradingRevision' ? 'xy' : null;

      var legendEnabled = this.legendEnabled;

      this.chartConfig = {
        options: {
          legend: {
            enabled: legendEnabled
          },
          tooltip: {
            formatter: function formatter() {
              if (this.series != null) {
                var text = '';

                var xText = '';
                var yText = '';

                var xAxisUnits = '';
                var yAxisUnits = '';

                if (this.series.xAxis != null && this.series.xAxis.userOptions != null && this.series.xAxis.userOptions.units != null) {

                  // get the x axis units
                  xAxisUnits = this.series.xAxis.userOptions.units;
                }
                if (this.series.yAxis != null && this.series.yAxis.userOptions != null && this.series.yAxis.userOptions.units != null) {

                  // get the y axis units
                  yAxisUnits = this.series.yAxis.userOptions.units;
                }

                if (thisGraphController.xAxis.type == null || thisGraphController.xAxis.type === '' || thisGraphController.xAxis.type === 'limits') {

                  var seriesName = this.series.name;

                  // get the x and y values
                  var x = thisGraphController.performRounding(this.x);
                  var y = thisGraphController.performRounding(this.y);

                  if (seriesName != null && seriesName != '') {
                    // add the series name
                    text += '<b>' + seriesName + '</b><br/>';
                  }

                  if (x != null && x != '') {

                    // get the x value
                    xText += x;

                    if (xAxisUnits != null && xAxisUnits != '') {
                      // add the x units
                      xText += ' ' + xAxisUnits;
                    }
                  }

                  if (y != null && y != '') {

                    // get the y value
                    yText += y;

                    if (yAxisUnits != null && yAxisUnits != '') {

                      // add the y units
                      yText += ' ' + yAxisUnits;
                    }
                  }

                  if (xText != null && xText != '') {

                    // add the x text
                    text += xText;
                  }

                  if (yText != null && yText != '') {

                    if (xText != null && xText != '') {
                      // separate the xText and the yText with a comma
                      text += ', ';
                    }

                    // add the y text
                    text += yText;
                  }
                } else if (thisGraphController.xAxis.type === 'categories') {

                  var text = '';
                  var seriesName = this.series.name;

                  // get the x and y values
                  var x = thisGraphController.performRounding(this.x);
                  var y = thisGraphController.performRounding(this.y);
                  var category = thisGraphController.getCategoryByIndex(this.point.index);

                  if (seriesName != null && seriesName != '') {
                    // add the series name
                    text += '<b>' + seriesName + '</b><br/>';
                  }

                  if (category != null) {
                    xText = category;
                  } else if (x != null && x != '') {
                    // get the x value
                    xText += x;
                  }

                  if (y != null && y != '') {
                    // get the y value
                    yText += y;
                  }

                  // add the x and y text
                  text += xText + ' ' + yText;
                }

                if (this.point.tooltip != null && this.point.tooltip != '') {
                  // this point has a custom tooltip so we will display it
                  text += '<br/>' + this.point.tooltip;
                }

                return text;
              }
            }
          },
          chart: {
            width: this.width,
            height: this.height,
            type: this.graphType,
            zoomType: zoomType,
            plotBackgroundImage: this.backgroundImage,
            events: {
              load: function load() {
                deferred.resolve(this);
              },
              click: function click(e) {
                if (thisGraphController.graphType == 'line' || thisGraphController.graphType == 'scatter') {
                  // only attempt to add a new point if the graph type is line or scatter

                  // get the current time
                  var currentTime = new Date().getTime();

                  // check if a drop event recently occurred
                  if (thisGraphController.lastDropTime != null) {

                    // check if the last drop event was not within the last 100 milliseconds
                    if (currentTime - thisGraphController.lastDropTime < 100) {
                      /*
                       * the last drop event was within the last 100 milliseconds so we
                       * will not register this click. we need to do this because when
                       * students drag points, a click event is fired when they release
                       * the mouse button. we don't want that click event to create a new
                       * point so we need to ignore it.
                       */
                      return;
                    }
                  }

                  //check if the student can change the graph
                  if (!thisGraphController.isDisabled) {

                    // get the active series
                    var activeSeries = thisGraphController.activeSeries;

                    // check if the student is allowed to edit the active series
                    if (activeSeries != null && thisGraphController.canEdit(activeSeries)) {

                      // make sure the series is visible

                      // get the active series id
                      var activeSeriesId = activeSeries.id;

                      // loop through all the series
                      for (var s = 0; s < this.series.length; s++) {
                        var tempSeries = this.series[s];

                        if (tempSeries != null) {
                          if (activeSeriesId == tempSeries.options.id) {
                            // we have found the active series

                            if (!tempSeries.visible) {
                              // the series is not visible so we will not add the point
                              alert(thisGraphController.$translate('graph.studentAddingPointToHiddenSeriesMessage'));
                              return;
                            }
                          }
                        }
                      }

                      /*
                       * get the x and y positions that were clicked and round
                       * them to the nearest tenth
                       */
                      var x = thisGraphController.performRounding(e.xAxis[0].value);
                      var y = thisGraphController.performRounding(e.yAxis[0].value);

                      // add the point to the series
                      thisGraphController.addPointToSeries(activeSeries, x, y);

                      /*
                       * add the next component state created in studentDataChanged() to the
                       * undo stack
                       */
                      thisGraphController.addNextComponentStateToUndoStack = true;
                      thisGraphController.studentDataChanged();
                    } else {
                      if (thisGraphController.isMousePlotLineOn()) {
                        // do nothing
                      } else {
                        /*
                         * the student is trying to add a point to a series
                         * that can't be edited
                         */
                        alert(thisGraphController.$translate('graph.youCanNotEditThisSeriesPleaseChooseASeriesThatCanBeEdited'));
                      }
                    }
                  }
                }
              }
            }
          },
          plotOptions: {
            series: {
              dragSensitivity: 10,
              stickyTracking: false,
              events: {
                legendItemClick: function legendItemClick(event) {
                  // the student clicked on a series in the legend

                  if (thisGraphController.componentContent.canStudentHideSeriesOnLegendClick != null) {
                    if (thisGraphController.componentContent.canStudentHideSeriesOnLegendClick) {
                      /*
                       * Update the show field in all the series depending on
                       * whether each line is active in the legend.
                       */
                      var _iteratorNormalCompletion = true;
                      var _didIteratorError = false;
                      var _iteratorError = undefined;

                      try {
                        for (var _iterator = this.yAxis.series[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                          var yAxisSeries = _step.value;

                          var _series = thisGraphController.getSeriesById(yAxisSeries.userOptions.id);
                          if (this.userOptions.id == _series.id) {
                            _series.show = !yAxisSeries.visible;
                          } else {
                            _series.show = yAxisSeries.visible;
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

                      thisGraphController.studentDataChanged();
                    }

                    // the value has been authored so we will use it
                    return thisGraphController.componentContent.canStudentHideSeriesOnLegendClick;
                  } else {
                    // if this has not been authored, we will default to not hiding the series
                    return false;
                  }
                }
              },
              point: {
                events: {
                  drag: function drag(e) {
                    // the student has started dragging a point

                    //check if the student can change the graph
                    if (!thisGraphController.isDisabled) {

                      // get the active series
                      var activeSeries = thisGraphController.activeSeries;

                      if (activeSeries != null) {
                        // check if the student is allowed to edit the active series
                        if (activeSeries != null && thisGraphController.canEdit(activeSeries)) {
                          // set a flag to note that the student is dragging a point
                          thisGraphController.dragging = true;
                        }
                      }
                    }
                  },
                  drop: function drop(e) {
                    // the student has stopped dragging the point and dropped the point

                    //check if the student can change the graph and that they were previously dragging a point
                    if (!thisGraphController.isDisabled && thisGraphController.dragging) {

                      // get the active series
                      var activeSeries = thisGraphController.activeSeries;

                      if (activeSeries != null) {
                        // set the dragging flag off
                        thisGraphController.dragging = false;

                        // remember this drop time
                        thisGraphController.lastDropTime = new Date().getTime();

                        // get the current target
                        var target = e.target;

                        if (target != null) {

                          /*
                           * get the x and y positions where the point was dropped and round
                           * them to the nearest tenth
                           */
                          var x = thisGraphController.performRounding(target.x);
                          var y = thisGraphController.performRounding(target.y);

                          // get the index of the point
                          var index = target.index;

                          // get the series data
                          var data = activeSeries.data;

                          if (data != null) {
                            // update the point
                            if (thisGraphController.xAxis.type == null || thisGraphController.xAxis.type === '' || thisGraphController.xAxis.type === 'limits') {

                              data[index] = [x, y];
                            } else if (thisGraphController.xAxis.type == 'categories') {
                              data[index] = y;
                            }

                            /*
                             * add the next component state created in studentDataChanged() to the
                             * undo stack
                             */
                            thisGraphController.addNextComponentStateToUndoStack = true;
                            thisGraphController.studentDataChanged();
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        series: allSeries,
        title: {
          text: title
        },
        xAxis: xAxis,
        yAxis: yAxis,
        loading: false,
        func: function func(chart) {
          timeout(function () {
            thisGraphController.showXPlotLineIfOn('Drag Me');
            thisGraphController.showYPlotLineIfOn('Drag Me');

            if (thisGraphController.isMouseXPlotLineOn() || thisGraphController.isMouseYPlotLineOn() || thisGraphController.isSaveMouseOverPoints()) {
              thisGraphController.setupMouseMoveListener();
            }
            chart.reflow();
          }, 1000);
        }
      };

      if (this.componentContent.useCustomLegend) {
        /*
         * Use a timeout so the graph has a chance to render before we set the
         * custom legend.
         */
        this.$timeout(function () {
          _this4.setCustomLegend();
        });
      }

      return deferred.promise;
    }
  }, {
    key: 'setCustomLegend',


    /**
     * Overwrite the existing legend with the custom authored legend.
     */
    value: function setCustomLegend() {
      if (!this.hasCustomLegendBeenSet) {
        if ($('.highcharts-legend').length > 0) {
          // move the legend to the very left by setting the x position to 0

          var userAgent = navigator.userAgent;
          if (userAgent.indexOf('Firefox') != -1) {
            var currentTransform = $('.highcharts-legend').attr('transform');

            /*
             * Regex to split the transform string into three groups. We will use
             * this to replace the x value of the translate.
             * Example
             * "translate(227, 294)"
             * The regex will create three groups
             * group 1 = "translate("
             * group 2 = "227"
             * group 3 = ", 294)"
             * The x value of the translate is captured in group 2.
             */
            var matrixRegEx = /(translate\()(\d*)(,\s*\d*\))/;

            // run the regex on the current transform
            var results = matrixRegEx.exec(currentTransform);

            // replace the second group with 0
            var newTransform = currentTransform.replace(matrixRegEx, '$10$3');

            // update the transform
            $('.highcharts-legend').attr('transform', newTransform);
          } else {
            var _currentTransform = $('.highcharts-legend').css('transform');

            /*
             * Regex to split the transform string into three groups. We will use
             * this to replace the x value of the matrix.
             * Example
             * "matrix(1, 0, 0, 1, 227, 294)"
             * The regex will create three groups
             * group 1 = "matrix(1, 0, 0, 1, "
             * group 2 = "227"
             * group 3 = ", 294)"
             * The x value of the matrix is captured in group 2.
             */
            var _matrixRegEx = /(matrix\(\d*,\s*\d*,\s*\d*,\s*\d*,\s*)(\d*)(,\s*\d*\))/;

            // run the regex on the current transform
            var _results = _matrixRegEx.exec(_currentTransform);

            // replace the second group with 0
            var _newTransform = _currentTransform.replace(_matrixRegEx, '$10$3');

            // update the transform
            $('.highcharts-legend').css('transform', _newTransform);
          }

          // replace the legend with the custom legend
          $('.highcharts-legend').html(this.componentContent.customLegend);
        }

        this.hasCustomLegendBeenSet = true;
      }
    }

    /**
     * Add a point to a series. The point will be inserted into the series
     * in the appropriate position that will keep the series data sorted.
     * @param series the series
     * @param x the x value
     * @param y the y value
     */

  }, {
    key: 'addPointToSeries0',
    value: function addPointToSeries0(series, x, y) {
      if (series != null && x != null && y != null) {

        // get the data points from the series
        var data = series.data;

        if (data != null) {
          var pointAdded = false;

          // loop through the data points
          for (var d = 0; d < data.length; d++) {
            var tempPoint = data[d];

            if (tempPoint != null) {
              // get the x value of the temp point
              var tempDataXValue = tempPoint[0];

              /*
               * check if the x value of the point we want to add is
               * less than the x value of the temp point
               */
              if (x < tempDataXValue) {
                /*
                 * the x value is less so we will insert the point
                 * before this current temp point
                 */
                data.splice(d, 0, [x, y]);
                pointAdded = true;
                break;
              }
            }
          }

          /*
           * add the point to the end of the series if we haven't
           * already added the point to the series
           */
          if (!pointAdded) {
            data.push([x, y]);
          }
        }
      }
    }
  }, {
    key: 'addPointToSeries',


    /**
     * Add a point to a series. The point will be inserted at the end of
     * the series.
     * @param series the series
     * @param x the x value
     * @param y the y value
     */
    value: function addPointToSeries(series, x, y) {
      if (series != null && x != null && y != null) {

        // get the data points from the series
        var data = series.data;

        if (data != null) {
          if (this.componentContent.xAxis.type == 'categories') {
            data[x] = y;
          } else {
            // the x axis type is limits
            data.push([x, y]);
          }
        }
      }
    }
  }, {
    key: 'removePointFromSeries',


    /**
     * Remove a point from a series. We will remove all points that
     * have the given x value.
     * @param series the series to remove the point from
     * @param x the x value of the point to remove
     */
    value: function removePointFromSeries(series, x) {
      if (series != null && x != null) {
        var data = series.data;

        if (data != null) {

          // loop through all the points
          for (var d = 0; d < data.length; d++) {
            var tempData = data[d];

            if (tempData != null) {
              // get the x value of the point
              var tempDataXValue = tempData[0];

              if (x == tempDataXValue) {
                // the x value matches the one we want

                // remove the point from the data
                data.splice(d, 1);

                /*
                 * move the counter back one since we have just
                 * removed an element from the data array
                 */
                d--;
              }
            }
          }
        }
      }
    }
  }, {
    key: 'addClickToRemovePointEvent',


    /**
     * Check if we need to add the click to remove event to the series
     * @param series an array of series
     */
    value: function addClickToRemovePointEvent(series) {

      if (!this.isDisabled) {
        /*
         * the student can click to add a point so we will also allow
         * them to click to remove a point
         */

        if (series != null) {
          var thisGraphController = this;

          // loop through all the series
          for (var s = 0; s < series.length; s++) {

            var tempSeries = series[s];

            if (this.canEdit(tempSeries)) {
              /*
               * create a point click event to remove a point when
               * it is clicked
               */
              var point = {
                events: {
                  click: function click(e) {

                    /*
                     * make sure the point that was clicked is from the active series.
                     * if it isn't from the active series we will not do anything.
                     */

                    // get the series that was clicked
                    var series = this.series;

                    if (series != null && series.userOptions != null) {

                      // get the id of the series that was clicked
                      var seriesId = series.userOptions.id;

                      // get the active series
                      var activeSeries = thisGraphController.activeSeries;

                      if (activeSeries != null) {

                        // get the active series id
                        var activeSeriesId = activeSeries.id;

                        // check if the series that was clicked is the active series
                        if (seriesId == activeSeriesId) {

                          // get the data from the active series
                          var data = activeSeries.data;

                          if (data != null) {

                            // get the index of the point
                            var index = this.index;

                            // remove the element at the given index
                            data.splice(index, 1);
                            thisGraphController.studentDataChanged();
                          }
                        }
                      }
                    }
                  }
                }
              };

              // set this point event into the series
              tempSeries.point = point;
            }
          }
        }
      }
    }
  }, {
    key: 'canEdit',


    /**
     * Check whether the student is allowed to edit a given series
     * @param series the series to check
     * @return whether the student can edit the series
     */
    value: function canEdit(series) {
      var result = false;

      if (series != null && series.canEdit) {
        result = true;
      }

      return result;
    }
  }, {
    key: 'setSeries',


    /**
     * Set all the series
     * @param series an array of series
     */
    value: function setSeries(series) {
      this.series = series;
    }
  }, {
    key: 'getSeries',


    /**
     * Get all the series
     * @returns an array of series
     */
    value: function getSeries() {
      return this.series;
    }
  }, {
    key: 'setSeriesByIndex',


    /**
     * Set the series at the given index
     * @param series the series object
     * @param index the index the series will be placed in
     */
    value: function setSeriesByIndex(series, index) {

      if (series != null && index != null) {
        // set the series in the array of series
        this.series[index] = series;
      }
    }

    /**
     * Get the series at the given index
     * @param index the index to get the series at
     * @returns the series at the given index
     */

  }, {
    key: 'getSeriesByIndex',
    value: function getSeriesByIndex(index) {
      return this.series[index];
    }

    /**
     * Set the trials
     * @param trials the trials
     */

  }, {
    key: 'setTrials',
    value: function setTrials(trials) {
      this.trials = trials;
    }

    /**
     * Get the trials
     * @return the trials
     */

  }, {
    key: 'getTrials',
    value: function getTrials() {
      return this.trials;
    }

    /**
     * Get the index of the trial
     * @param trial the trial object
     * @return the index of the trial within the trials array
     */

  }, {
    key: 'getTrialIndex',
    value: function getTrialIndex(trial) {

      var index = -1;

      if (trial != null) {

        // loop through all the trials
        for (var t = 0; t < this.trials.length; t++) {
          var tempTrial = this.trials[t];

          if (trial == tempTrial) {
            // we have found the trial we are looking for
            index = t;
            break;
          }
        }
      }

      return index;
    }

    /**
     * Set the active trial
     * @param index the index of the trial to make active
     */

  }, {
    key: 'setActiveTrialByIndex',
    value: function setActiveTrialByIndex(index) {

      if (index != null) {

        // get the trial
        var trial = this.trials[index];

        if (trial != null) {
          // make the trial the active trial
          this.activeTrial = trial;
        }
      }
    }

    /**
     * Check whether the student is allowed to edit a given trial
     * @param trial the trial object to check
     * @return boolean whether the student can edit the trial
     */

  }, {
    key: 'canEditTrial',
    value: function canEditTrial(trial) {
      var result = false;
      var series = trial.series;

      for (var i = 0; i < series.length; i++) {
        var currentSeries = series[i];
        if (currentSeries.canEdit) {
          // at least one series in this trial is editable
          result = true;
          break;
        }
      }

      return result;
    }
  }, {
    key: 'showSelectActiveTrials',


    /**
     * Set whether to show the active trial select menu
     * @return whether to show the active trial select menu
     */
    value: function showSelectActiveTrials() {
      var result = false;
      var editableTrials = 0;
      for (var i = 0; i < this.trials.length; i++) {
        var trial = this.trials[i];
        if (this.canEditTrial(trial) && trial.show) {
          editableTrials++;
          if (editableTrials > 1) {
            // there are more than one editable trials, so show the menu
            result = true;
            break;
          }
        }
      }

      return result;
    }
  }, {
    key: 'setXAxis',


    /**
     * Set the xAxis object
     * @param xAxis the xAxis object that can be used to render the graph
     */
    value: function setXAxis(xAxis) {
      this.xAxis = this.UtilService.makeCopyOfJSONObject(xAxis);
    }
  }, {
    key: 'getXAxis',


    /**
     * Get the xAxis object
     * @return the xAxis object that can be used to render the graph
     */
    value: function getXAxis() {
      return this.xAxis;
    }
  }, {
    key: 'setYAxis',


    /**
     * Set the yAxis object
     * @param yAxis the yAxis object that can be used to render the graph
     */
    value: function setYAxis(yAxis) {
      this.yAxis = this.UtilService.makeCopyOfJSONObject(yAxis);
    }
  }, {
    key: 'getYAxis',


    /**
     * Get the yAxis object
     * @return the yAxis object that can be used to render the graph
     */
    value: function getYAxis() {
      return this.yAxis;
    }
  }, {
    key: 'setActiveSeries',


    /**
     * Set the active series
     * @param series the series
     */
    value: function setActiveSeries(series) {
      this.activeSeries = series;
    }
  }, {
    key: 'setActiveSeriesByIndex',


    /**
     * Set the active series by the index
     * @param index the index
     */
    value: function setActiveSeriesByIndex(index) {

      if (index == null) {
        // the index is null so we will set the active series to null
        this.setActiveSeries(null);
      } else {
        // get the series at the index
        var series = this.getSeriesByIndex(index);

        if (series == null) {
          this.setActiveSeries(null);
        } else {
          this.setActiveSeries(series);
        }
      }
    }
  }, {
    key: 'resetGraph',


    /**
     * Reset the table data to its initial state from the component content
     */
    value: function resetGraph() {

      // reset the series and parameters of the graph
      this.resetGraphHelper();

      /*
       * set the flag to add the next component state created in
       * studentDataChanged() to the undo stack
       */
      this.addNextComponentStateToUndoStack = true;
      this.studentDataChanged();
    }
  }, {
    key: 'resetGraphHelper',


    /**
     * Reset the series and parameters of the graph
     */
    value: function resetGraphHelper() {

      // get the original series from the component content
      this.setSeries(this.UtilService.makeCopyOfJSONObject(this.componentContent.series));

      if (this.componentContent.xAxis != null) {
        this.setXAxis(this.componentContent.xAxis);
      }

      if (this.componentContent.yAxis != null) {
        this.setYAxis(this.componentContent.yAxis);
      }

      // set the active series to null so that the default series will become selected later
      this.setActiveSeries(null);

      // set the background image
      this.backgroundImage = this.componentContent.backgroundImage;
    }

    /**
     * Reset the active series
     */

  }, {
    key: 'resetSeries',
    value: function resetSeries() {

      var confirmMessage = '';

      // get the series name
      var seriesName = this.activeSeries.name;

      if (seriesName == null || seriesName == '') {
        confirmMessage = this.$translate('graph.areYouSureYouWantToResetTheSeries');
      } else {
        confirmMessage = this.$translate('graph.areYouSureYouWantToResetTheNamedSeries', { seriesName: seriesName });
      }

      // ask the student if they are sure they want to reset the series
      var answer = confirm(confirmMessage);

      if (answer) {
        // the student answer yes to reset the series

        // reset the active series
        this.resetSeriesHelper();
      }
    }

    /**
     * Reset the active series
     */

  }, {
    key: 'resetSeriesHelper',
    value: function resetSeriesHelper() {

      if (this.UtilService.hasConnectedComponent(this.componentContent)) {
        /*
         * There are connected components so we will get the work from them.
         * This will actually reset all the series and not just the active
         * one.
         */
        this.newTrial();
        this.handleConnectedComponents();
      } else {
        // get the index of the active series
        var activeSeriesIndex = this.getSeriesIndex(this.activeSeries);

        if (activeSeriesIndex != null) {

          // get the original series from the component content
          var originalSeries = this.componentContent.series[activeSeriesIndex];

          if (originalSeries != null) {

            // make a copy of the series
            originalSeries = this.UtilService.makeCopyOfJSONObject(originalSeries);

            // set the series
            this.setSeriesByIndex(originalSeries, activeSeriesIndex);

            /*
             * set the active series index so that the the active series
             * is the same as before.
             */
            this.setActiveSeriesByIndex(activeSeriesIndex);

            if (this.componentContent.xAxis != null) {
              // reset the x axis
              this.setXAxis(this.componentContent.xAxis);
            }

            if (this.componentContent.yAxis != null) {
              // reset the y axis
              this.setYAxis(this.componentContent.yAxis);
            }

            // reset the background image
            this.backgroundImage = this.componentContent.backgroundImage;

            /*
             * set the flag to add the next component state created in
             * studentDataChanged() to the undo stack
             */
            this.addNextComponentStateToUndoStack = true;
            this.studentDataChanged();
          }
        }
      }
    }

    /**
     * Populate the student work into the component
     * @param componentState the component state to populate into the component
     */

  }, {
    key: 'setStudentWork',
    value: function setStudentWork(componentState) {

      if (componentState != null) {

        // get the student data from the component state
        var studentData = componentState.studentData;

        if (studentData != null) {

          if (studentData.version == null || studentData.version == 1) {
            // the student data is version 1 which has no trials
            this.studentDataVersion = 1;

            // populate the student data into the component
            this.setSeries(this.UtilService.makeCopyOfJSONObject(studentData.series));
          } else {
            // the student data is the newer version that has trials

            this.studentDataVersion = studentData.version;

            if (studentData.trials != null && studentData.trials.length > 0) {

              // make a copy of the trials
              var trialsCopy = this.UtilService.makeCopyOfJSONObject(studentData.trials);

              // remember the trials
              this.setTrials(trialsCopy);

              // get the trial to show
              var activeTrialIndex = studentData.activeTrialIndex;

              if (activeTrialIndex == null) {
                /*
                 * there is no active trial index so we will show the
                 * last trial
                 */

                if (trialsCopy.length > 0) {
                  //make the last trial the active trial to show
                  this.setActiveTrialByIndex(studentData.trials.length - 1);
                }
              } else {
                // there is an active trial index
                this.setActiveTrialByIndex(activeTrialIndex);
              }

              if (this.activeTrial != null && this.activeTrial.series != null) {
                // set the active trial series to be the series to display
                this.series = this.activeTrial.series;
              }
            }
          }

          this.setTrialIdsToShow();

          if (studentData.xAxis != null) {
            this.setXAxis(studentData.xAxis);
          }

          if (studentData.yAxis != null) {
            this.setYAxis(studentData.yAxis);
          }

          this.setActiveSeriesByIndex(studentData.activeSeriesIndex);

          if (studentData.backgroundImage != null) {
            // set the background from the student data
            this.backgroundImage = studentData.backgroundImage;
          }

          var submitCounter = studentData.submitCounter;

          if (submitCounter != null) {
            // populate the submit counter
            this.submitCounter = submitCounter;
          }

          if (studentData.mouseOverPoints != null && studentData.mouseOverPoints.length > 0) {
            this.mouseOverPoints = studentData.mouseOverPoints;
          }

          this.processLatestSubmit();
        }
      }
    }
  }, {
    key: 'processLatestSubmit',


    /**
     * Check if latest component state is a submission and set isSubmitDirty accordingly
     */
    value: function processLatestSubmit() {
      var latestState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

      if (latestState) {
        var serverSaveTime = latestState.serverSaveTime;
        var clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
        if (latestState.isSubmit) {
          // latest state is a submission, so set isSubmitDirty to false and notify node
          this.isSubmitDirty = false;
          this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: false });
          // set save message
          this.setSaveMessage(this.$translate('LAST_SUBMITTED'), clientSaveTime);
        } else {
          // latest state is not a submission, so set isSubmitDirty to true and notify node
          this.isSubmitDirty = true;
          this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });
          // set save message
          this.setSaveMessage(this.$translate('LAST_SAVED'), clientSaveTime);
        }
      }
    }
  }, {
    key: 'submit',


    /**
     * A submit was triggered by the component submit button or node submit button
     * @param submitTriggeredBy what triggered the submit
     * e.g. 'componentSubmitButton' or 'nodeSubmitButton'
     */
    value: function submit(submitTriggeredBy) {

      if (this.isSubmitDirty) {
        // the student has unsubmitted work

        var performSubmit = true;

        if (this.componentContent.maxSubmitCount != null) {
          // there is a max submit count

          // calculate the number of submits this student has left
          var numberOfSubmitsLeft = this.componentContent.maxSubmitCount - this.submitCounter;

          var message = '';

          if (numberOfSubmitsLeft <= 0) {
            // the student does not have any more chances to submit
            performSubmit = false;
          } else if (numberOfSubmitsLeft == 1) {
            /*
             * the student has one more chance to submit left so maybe
             * we should ask the student if they are sure they want to submit
             */
          } else if (numberOfSubmitsLeft > 1) {
            /*
             * the student has more than one chance to submit left so maybe
             * we should ask the student if they are sure they want to submit
             */
          }
        }

        if (performSubmit) {

          /*
           * set isSubmit to true so that when the component state is
           * created, it will know that is a submit component state
           * instead of just a save component state
           */
          this.isSubmit = true;
          this.incrementSubmitCounter();

          // check if the student has used up all of their submits
          if (this.componentContent.maxSubmitCount != null && this.submitCounter >= this.componentContent.maxSubmitCount) {
            /*
             * the student has used up all of their submits so we will
             * disable the submit button
             */
            this.isSubmitButtonDisabled = true;
          }

          if (this.mode === 'authoring') {
            /*
             * we are in authoring mode so we will set values appropriately
             * here because the 'componentSubmitTriggered' event won't
             * work in authoring mode
             */
            this.isDirty = false;
            this.isSubmitDirty = false;
            this.createComponentState('submit');
          }

          if (submitTriggeredBy == null || submitTriggeredBy === 'componentSubmitButton') {
            // tell the parent node that this component wants to submit
            this.$scope.$emit('componentSubmitTriggered', { nodeId: this.nodeId, componentId: this.componentId });
          } else if (submitTriggeredBy === 'nodeSubmitButton') {
            // nothing extra needs to be performed
          }
        } else {
          /*
           * the student has cancelled the submit so if a component state
           * is created, it will just be a regular save and not submit
           */
          this.isSubmit = false;
        }
      }
    }

    /**
     * The active series has changed
     */

  }, {
    key: 'activeSeriesChanged',
    value: function activeSeriesChanged() {

      var useTimeoutSetupGraph = true;

      // the student data has changed
      this.studentDataChanged(useTimeoutSetupGraph);

      // tell the parent node that this component wants to save
      //this.$scope.$emit('componentSaveTriggered', {nodeId: this.nodeId, componentId: this.componentId});
    }
  }, {
    key: 'studentDataChanged',


    /**
     * Called when the student changes their work
     */
    value: function studentDataChanged(useTimeoutSetupGraph) {
      var _this5 = this;

      /*
       * set the dirty flags so we will know we need to save or submit the
       * student work later
       */
      this.isDirty = true;
      this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: true });

      this.isSubmitDirty = true;
      this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });

      // clear out the save message
      this.setSaveMessage('', null);

      // re-draw the graph
      this.setupGraph(useTimeoutSetupGraph);

      // get this component id
      var componentId = this.getComponentId();

      /*
       * the student work in this component has changed so we will tell
       * the parent node that the student data will need to be saved.
       * this will also notify connected parts that this component's student
       * data has changed.
       */
      var action = 'change';

      // create a component state populated with the student data
      this.createComponentState(action).then(function (componentState) {

        if (_this5.addNextComponentStateToUndoStack) {
          if (_this5.previousComponentState != null) {
            // push the previous component state onto our undo stack
            _this5.undoStack.push(_this5.previousComponentState);
          }

          /*
           * Remember this current component state for the next time
           * studentDataChanged() is called. The next time
           * studentDataChanged() is called, this will be the previous
           * component state and we will add it to the undoStack. We do not
           * want to put the current component state onto the undoStack
           * because if the student clicks undo and this current component
           * state is on the top of the stack, the graph won't change.
           * Basically the undoStack contains the component states from the
           * current visit except for the current component state.
           */
          _this5.previousComponentState = componentState;

          _this5.addNextComponentStateToUndoStack = false;
        }

        // check if a digest is in progress
        if (!_this5.$scope.$$phase) {}
        // digest is not in progress so we can force a redraw
        // TODO GK (from HT) this line was causing a lot of js errors ( $digest already in progress ), so I commented it out
        // and it still seems to work. Do we need this line?
        // see here: http://stackoverflow.com/questions/12729122/angularjs-prevent-error-digest-already-in-progress-when-calling-scope-apply
        //this.$scope.$apply();


        /*
         * fire the componentStudentDataChanged event after a short timeout
         * so that the other component handleConnectedComponentStudentDataChanged()
         * listeners can initialize before this and are then able to process
         * this componentStudentDataChanged event
         */
        _this5.$timeout(function () {
          _this5.$scope.$emit('componentStudentDataChanged', { nodeId: _this5.nodeId, componentId: componentId, componentState: componentState });
        }, 100);
      });
    }
  }, {
    key: 'createComponentState',


    /**
     * Create a new component state populated with the student data
     * @param action the action that is triggering creating of this component state
     * e.g. 'submit', 'save', 'change'
     * @return a promise that will return a component state
     */
    value: function createComponentState(action) {

      var deferred = this.$q.defer();

      // create a new component state
      var componentState = this.NodeService.createNewComponentState();

      var studentData = {};

      studentData.version = this.studentDataVersion;

      if (this.studentDataVersion == 1) {
        // insert the series data
        studentData.series = this.UtilService.makeCopyOfJSONObject(this.getSeries());
      } else {
        if (this.trials != null) {
          // make a copy of the trials
          studentData.trials = this.UtilService.makeCopyOfJSONObject(this.trials);

          // remember which trial is being shown
          var activeTrialIndex = this.getTrialIndex(this.activeTrial);
          studentData.activeTrialIndex = activeTrialIndex;
        }
      }

      /*
       // remove high-charts assigned id's from each series before saving
      for (var s = 0; s < studentData.series.length; s++) {
        var series = studentData.series[s];
        //series.id = null;
      }
      */

      // insert the x axis data
      studentData.xAxis = this.UtilService.makeCopyOfJSONObject(this.getXAxis());
      /*
       * The student data plot bands are stored in the trials so we do not
       * need to save the plot bands in the x axis.
       */
      delete studentData.xAxis.plotBands;
      if (this.componentContent.xAxis != null && this.componentContent.xAxis.plotBands != null) {
        /*
         * There are authored plot bands so we will save those into the
         * student data since they are not stored in the trials.
         */
        studentData.xAxis.plotBands = this.componentContent.xAxis.plotBands;
      }

      // insert the y axis data
      studentData.yAxis = this.getYAxis();

      // get the active series index
      var activeSeriesIndex = this.getSeriesIndex(this.activeSeries);

      if (activeSeriesIndex != null) {
        // set the active series index
        studentData.activeSeriesIndex = activeSeriesIndex;
      }

      // get the uploaded file name if any
      var uploadedFileName = this.getUploadedFileName();

      if (uploadedFileName != null) {
        // set the uploaded file name
        studentData.uploadedFileName = uploadedFileName;
      }

      if (this.backgroundImage != null) {
        studentData.backgroundImage = this.backgroundImage;
      }

      // set the submit counter
      studentData.submitCounter = this.submitCounter;

      if (this.mouseOverPoints.length != 0) {
        studentData.mouseOverPoints = this.mouseOverPoints;
      }

      // set the flag for whether the student submitted this work
      componentState.isSubmit = this.isSubmit;

      // set the student data into the component state
      componentState.studentData = studentData;

      // set the component type
      componentState.componentType = 'Graph';

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
    key: 'createComponentStateAdditionalProcessing',


    /**
     * Perform any additional processing that is required before returning the
     * component state
     * Note: this function must call deferred.resolve() otherwise student work
     * will not be saved
     * @param deferred a deferred object
     * @param componentState the component state
     * @param action the action that we are creating the component state for
     * e.g. 'submit', 'save', 'change'
     */
    value: function createComponentStateAdditionalProcessing(deferred, componentState, action) {

      if (this.ProjectService.hasAdditionalProcessingFunctions(this.nodeId, this.componentId)) {
        // this component has additional processing functions

        // get the additional processing functions
        var additionalProcessingFunctions = this.ProjectService.getAdditionalProcessingFunctions(this.nodeId, this.componentId);
        var allPromises = [];

        // call all the additional processing functions
        for (var i = 0; i < additionalProcessingFunctions.length; i++) {
          var additionalProcessingFunction = additionalProcessingFunctions[i];
          var defer = this.$q.defer();
          var promise = defer.promise;
          allPromises.push(promise);
          additionalProcessingFunction(defer, componentState, action);
        }
        this.$q.all(allPromises).then(function () {
          deferred.resolve(componentState);
        });
      } else {
        /*
         * we don't need to perform any additional processing so we can resolve
         * the promise immediately
         */
        deferred.resolve(componentState);
      }
    }

    /**
     * Check whether we need to show the prompt
     * @return whether to show the prompt
     */

  }, {
    key: 'showPrompt',
    value: function showPrompt() {
      var show = false;

      if (this.isPromptVisible) {
        show = true;
      }

      return show;
    }
  }, {
    key: 'showResetGraphButton',


    /**
     * Check whether we need to show the reset graph button
     * @return whether to show the reset graph button
     */
    value: function showResetGraphButton() {
      var show = false;

      if (this.isResetGraphButtonVisible) {
        show = true;
      }

      return show;
    }
  }, {
    key: 'showResetSeriesButton',


    /**
     * Check whether we need to show the reset series button
     * @return whether to show the reset series button
     */
    value: function showResetSeriesButton() {
      var show = false;

      if (this.isResetSeriesButtonVisible) {
        show = true;
      }

      return show;
    }

    /**
     * Get the index of a series
     * @param series the series
     * @return the index of the series
     */

  }, {
    key: 'getSeriesIndex',
    value: function getSeriesIndex(series) {
      var index = null;

      if (series != null) {

        // get all of the series
        var seriesArray = this.getSeries();

        if (seriesArray != null) {

          // loop through all the series
          for (var s = 0; s < seriesArray.length; s++) {
            var tempSeries = seriesArray[s];

            // check if this is the series we are looking for
            if (series == tempSeries) {
              index = s;
              break;
            }
          }
        }
      }

      return index;
    }
  }, {
    key: 'getSeriesByIndex',


    /**
     * Get a series by the index
     * @param index the index of the series in the series array
     * @returns the series object or null if not found
     */
    value: function getSeriesByIndex(index) {
      var series = null;

      if (index != null && index >= 0) {
        // get all of the series
        var seriesArray = this.getSeries();

        if (seriesArray != null && seriesArray.length > 0) {
          // get the series at the index
          series = seriesArray[index];
        }
      }

      return series;
    }

    /**
     * Get a series by the id
     * @param id the id of the series
     * @return the series object with the given id
     */

  }, {
    key: 'getSeriesById',
    value: function getSeriesById(id) {
      var seriesArray = this.getSeries();

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = seriesArray[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var series = _step2.value;

          if (series.id == id) {
            return series;
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

      return null;
    }

    /**
     * Import work from another component
     */

  }, {
    key: 'importWork',
    value: function importWork() {
      var _this6 = this;

      // get the component content
      var componentContent = this.componentContent;

      if (componentContent != null) {

        // get the import previous work node id and component id
        var importPreviousWorkNodeId = componentContent.importPreviousWorkNodeId;
        var importPreviousWorkComponentId = componentContent.importPreviousWorkComponentId;
        var importWork = componentContent.importWork;

        if (importPreviousWorkNodeId == null || importPreviousWorkNodeId == '') {

          /*
           * check if the node id is in the field that we used to store
           * the import previous work node id in
           */
          if (componentContent.importWorkNodeId != null && componentContent.importWorkNodeId != '') {
            importPreviousWorkNodeId = componentContent.importWorkNodeId;
          }
        }

        if (importPreviousWorkComponentId == null || importPreviousWorkComponentId == '') {

          /*
           * check if the component id is in the field that we used to store
           * the import previous work component id in
           */
          if (componentContent.importWorkComponentId != null && componentContent.importWorkComponentId != '') {
            importPreviousWorkComponentId = componentContent.importWorkComponentId;
          }
        }

        if (importPreviousWorkNodeId != null && importPreviousWorkComponentId != null) {

          // get the latest component state for this component
          var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

          /*
           * we will only import work into this component if the student
           * has not done any work for this component
           */
          if (componentState == null || !this.GraphService.componentStateHasStudentWork(componentState)) {
            // the student has not done any work for this component

            // get the latest component state from the component we are importing from
            var importWorkComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(importPreviousWorkNodeId, importPreviousWorkComponentId);

            if (importWorkComponentState != null) {
              /*
               * populate a new component state with the work from the
               * imported component state
               */
              var populatedComponentState = this.GraphService.populateComponentState(importWorkComponentState);

              // populate the component state into this component
              this.setStudentWork(populatedComponentState);
              this.studentDataChanged();
            }
          }
        }

        if (importWork != null) {
          // we are importing work

          var mergedTrials = [];

          /*
           * This will hold all the promises that will return the trials
           * that we want. The trials will either be from this student
           * or from classmates.
           */
          var promises = [];

          // get the components to import work from
          var importWorkComponents = importWork.components;

          // loop through all the import work components
          for (var c = 0; c < importWorkComponents.length; c++) {
            var importWorkComponent = importWorkComponents[c];

            if (importWorkComponent != null) {

              // get the node id and component id to import from
              var nodeId = importWorkComponent.nodeId;
              var componentId = importWorkComponent.componentId;

              /*
               * example of the importWork field in a component that
               * shows classmate work
               *
               * "importWork": {
               *   "components": [
               *     {
               *       "nodeId": "node1",
               *       "componentId": "yppyfy01er",
               *       "showClassmateWork": true,
               *       "showClassmateWorkSource": "period"
               *     }
               *   ]
               * }
               */

              // whether we are showing classmate work
              var showClassmateWork = importWorkComponent.showClassmateWork;

              if (showClassmateWork) {
                // we are showing classmate work

                /*
                 * showClassmateWorkSource determines whether to get
                 * work from the period or the whole class (all periods)
                 */
                var showClassmateWorkSource = importWorkComponent.showClassmateWorkSource;

                // get the trials from the classmates
                promises.push(this.getTrialsFromClassmates(nodeId, componentId, showClassmateWorkSource));
              } else {
                // we are getting the work from this student

                // get the latest component state from the component
                var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);

                // get the trials from the component state
                promises.push(this.getTrialsFromComponentState(nodeId, componentId, componentState));
              }
            }
          }

          /*
           * wait for all the promises to resolve because we may need to
           * request the classmate work from the server
           */
          this.$q.all(promises).then(function (promiseResults) {

            // this will hold all the trials
            var mergedTrials = [];

            /*
             * Loop through all the promise results. There will be a
             * promise result for each component we are importing from.
             * Each promiseResult is an array of trials.
             */
            for (var p = 0; p < promiseResults.length; p++) {

              // get the array of trials for one component
              var trials = promiseResults[p];

              // loop through all the trials from the component
              for (var t = 0; t < trials.length; t++) {
                var trial = trials[t];

                // add the trial to our array of merged trials
                mergedTrials.push(trial);
              }
            }

            // create a new student data
            var studentData = {};
            studentData.trials = mergedTrials;
            studentData.version = 2;

            // create a new component state
            var newComponentState = _this6.NodeService.createNewComponentState();
            newComponentState.studentData = studentData;

            // populate the component state into this component
            _this6.setStudentWork(newComponentState);
            _this6.studentDataChanged();
          });
        }
      }
    }
  }, {
    key: 'getTrialsFromClassmates',


    /**
     * Get the trials from classmates
     * @param nodeId the node id
     * @param componentId the component id
     * @param showClassmateWorkSource Whether to get the work only from the
     * period the student is in or from all the periods. The possible values
     * are "period" or "class".
     * @return a promise that will return all the trials from the classmates
     */
    value: function getTrialsFromClassmates(nodeId, componentId, showClassmateWorkSource) {
      var _this7 = this;

      var deferred = this.$q.defer();

      // make a request for the classmate student work
      this.StudentDataService.getClassmateStudentWork(nodeId, componentId, showClassmateWorkSource).then(function (componentStates) {

        var promises = [];

        // loop through all the component states
        for (var c = 0; c < componentStates.length; c++) {
          var componentState = componentStates[c];

          if (componentState != null) {

            // get the trials from the component state
            promises.push(_this7.getTrialsFromComponentState(nodeId, componentId, componentState));
          }
        }

        // wait for all the promises of trials
        _this7.$q.all(promises).then(function (promiseResults) {

          var mergedTrials = [];

          // loop through all the promise results
          for (var p = 0; p < promiseResults.length; p++) {

            // get the trials from one of the promise results
            var trials = promiseResults[p];

            // loop through all the trials
            for (var t = 0; t < trials.length; t++) {
              var trial = trials[t];

              // add the trial to our merged trials
              mergedTrials.push(trial);
            }
          }

          // return the merged trials
          deferred.resolve(mergedTrials);
        });
      });

      return deferred.promise;
    }

    /**
     * Get the trials from a component state.
     * Note: The code in this function doesn't actually require usage of a
     * promise. It's just the code that calls this function that utilizes
     * promise functionality. It's possible to refactor the code so that this
     * function doesn't need to return a promise.
     * @param nodeId the node id
     * @param componentId the component id
     * @param componentState the component state
     * @return a promise that will return the trials from the component state
     */

  }, {
    key: 'getTrialsFromComponentState',
    value: function getTrialsFromComponentState(nodeId, componentId, componentState) {
      var deferred = this.$q.defer();

      var mergedTrials = [];

      // get the step number and title e.g. "1.3: Explore the evidence"
      var nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);

      if (componentState != null) {

        // get the student data
        var studentData = componentState.studentData;

        if (studentData != null) {

          if (studentData.version == 1) {
            /*
             * we are using the old student data format
             * that can contain multiple series
             */

            var series = studentData.series;

            // create a new trial and put the series into it
            var newTrial = {};
            newTrial.id = this.UtilService.generateKey(10);
            newTrial.name = nodePositionAndTitle;
            newTrial.show = true;
            newTrial.series = series;
            mergedTrials.push(newTrial);
          } else {
            /*
             * we are using the new student data format
             * that can contain multiple trials
             */

            // get the trials
            var trials = studentData.trials;

            if (trials != null) {

              /*
               * loop through all the trials and add them
               * to our array of merged trials
               */
              for (var t = 0; t < trials.length; t++) {
                var trial = trials[t];
                // make a copy of the trial
                newTrial = this.UtilService.makeCopyOfJSONObject(trial);

                // set the name of the trial to be the step number and title
                newTrial.name = nodePositionAndTitle;
                newTrial.show = true;

                mergedTrials.push(newTrial);
              }
            }
          }
        }
      }

      deferred.resolve(mergedTrials);

      return deferred.promise;
    }

    /**
     * Handle importing external data (we only support csv for now)
     * @param studentAsset CSV file student asset
     */

  }, {
    key: 'attachStudentAsset',
    value: function attachStudentAsset(studentAsset) {
      var _this8 = this;

      if (studentAsset != null) {
        this.StudentAssetService.copyAssetForReference(studentAsset).then(function (copiedAsset) {
          if (copiedAsset != null) {

            _this8.StudentAssetService.getAssetContent(copiedAsset).then(function (assetContent) {
              var rowData = _this8.StudentDataService.CSVToArray(assetContent);
              var params = {};
              params.skipFirstRow = true; // first row contains header, so ignore it
              params.xColumn = 0; // assume (for now) x-axis data is in first column
              params.yColumn = 1; // assume (for now) y-axis data is in second column

              var seriesData = _this8.convertRowDataToSeriesData(rowData, params);

              // get the index of the series that we will put the data into
              var seriesIndex = _this8.series.length; // we're always appending a new series

              if (seriesIndex != null) {

                // get the series
                var series = _this8.series[seriesIndex];

                if (series == null) {
                  // the series is null so we will create a series
                  series = {};
                  series.name = copiedAsset.fileName;
                  series.color = _this8.seriesColors[seriesIndex];
                  series.marker = {
                    'symbol': _this8.seriesMarkers[seriesIndex]
                  };
                  series.regression = false;
                  series.regressionSettings = {};
                  series.canEdit = false;
                  _this8.series[seriesIndex] = series;
                }

                // set the data into the series
                series.data = seriesData;
              }

              // the graph has changed
              _this8.isDirty = true;

              /*
               * set the flag to add the next component state created in
               * studentDataChanged() to the undo stack
               */
              _this8.addNextComponentStateToUndoStack = true;
              _this8.studentDataChanged();
            });
          }
        });
      }
    }
  }, {
    key: 'convertRowDataToSeriesData',


    /**
     * Convert the table data into series data
     * @param componentState the component state to get table data from
     * @param params (optional) the params to specify what columns
     * and rows to use from the table data
     */
    value: function convertRowDataToSeriesData(rows, params) {
      var data = [];

      /*
       * the default is set to not skip the first row and for the
       * x column to be the first column and the y column to be the
       * second column
       */
      var skipFirstRow = false;
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

      // loop through all the rows
      for (var r = 0; r < rows.length; r++) {

        if (skipFirstRow && r === 0) {
          // skip the first row
          continue;
        }

        // get the row
        var row = rows[r];

        // get the x cell and y cell from the row
        var xCell = row[xColumn];
        var yCell = row[yColumn];

        if (xCell != null && yCell != null) {

          /*
           * the point array where the 0 index will contain the
           * x value and the 1 index will contain the y value
           */
          var point = [];

          // get the x text and y text
          var xText = null;
          if ((typeof xCell === 'undefined' ? 'undefined' : _typeof(xCell)) === 'object' && xCell.text) {
            xText = xCell.text;
          }

          var yText = null;
          if ((typeof yCell === 'undefined' ? 'undefined' : _typeof(yCell)) === 'object' && yCell.text) {
            yText = yCell.text;
          }

          if (xText != null && xText !== '' && yText != null && yText !== '') {

            // try to convert the text values into numbers
            var xNumber = Number(xText);
            var yNumber = Number(yText);

            if (!isNaN(xNumber)) {
              /*
               * we were able to convert the value into a
               * number so we will add that
               */
              point.push(xNumber);
            } else {
              /*
               * we were unable to convert the value into a
               * number so we will add the text
               */
              point.push(xText);
            }

            if (!isNaN(yNumber)) {
              /*
               * we were able to convert the value into a
               * number so we will add that
               */
              point.push(yNumber);
            } else {
              /*
               * we were unable to convert the value into a
               * number so we will add the text
               */
              point.push(yText);
            }

            // add the point to our data
            data.push(point);
          }
        }
      }

      return data;
    }
  }, {
    key: 'setSeriesIds',


    /**
     * Set the series id for each series
     * @param allSeries an array of series
     */
    value: function setSeriesIds(allSeries) {
      var usedSeriesIds = [];

      if (allSeries != null) {

        /*
         * loop through all the series to get the existing ids that are
         * being used
         */
        for (var x = 0; x < allSeries.length; x++) {
          var series = allSeries[x];

          // get the series id if it is set
          var seriesId = series.id;

          if (seriesId != null) {
            // remember the series id
            usedSeriesIds.push(seriesId);
          }
        }

        // loop through all the series
        for (var y = 0; y < allSeries.length; y++) {
          var series = allSeries[y];

          // get the series id if it is set
          var seriesId = series.id;

          if (seriesId == null) {
            // the series doesn't have a series id so we will give it one
            var nextSeriesId = this.getNextSeriesId(usedSeriesIds);
            series.id = nextSeriesId;
            usedSeriesIds.push(nextSeriesId);
          }
        }
      }
    }
  }, {
    key: 'getNextSeriesId',


    /**
     * Get the next available series id
     * @param usedSeriesIds an array of used series ids
     * @returns the next available series id
     */
    value: function getNextSeriesId(usedSeriesIds) {
      var nextSeriesId = null;
      var currentSeriesNumber = 0;
      var foundNextSeriesId = false;

      while (!foundNextSeriesId) {

        // get a temp series id
        var tempSeriesId = 'series-' + currentSeriesNumber;

        // check if the temp series id is used
        if (usedSeriesIds.indexOf(tempSeriesId) == -1) {
          // temp series id has not been used

          nextSeriesId = tempSeriesId;

          foundNextSeriesId = true;
        } else {
          /*
           * the temp series id has been used so we will increment the
           * counter to try another series id the next iteration
           */
          currentSeriesNumber++;
        }
      }

      return nextSeriesId;
    }
  }, {
    key: 'handleDeleteKeyPressed',


    /**
     * Handle the delete key press
     */
    value: function handleDeleteKeyPressed() {

      // get the active series
      var series = this.activeSeries;

      // check if the student is allowed to edit the the active series
      if (series != null && this.canEdit(series)) {

        // get the chart
        var chart = $('#' + this.chartId).highcharts();

        // get the selected points
        var selectedPoints = chart.getSelectedPoints();

        var index = null;

        if (selectedPoints != null) {

          // an array to hold the indexes of the selected points
          var indexes = [];

          // get the series data
          var data = series.data;

          // loop through all the selected points
          for (var x = 0; x < selectedPoints.length; x++) {

            // get a selected point
            var selectedPoint = selectedPoints[x];

            // get the index of the selected point
            index = selectedPoint.index;

            // get the data point from the series data
            var dataPoint = data[index];

            if (dataPoint != null) {

              /*
               * make sure the x and y values match the selected point
               * that we are going to delete
               */
              if (dataPoint[0] == selectedPoint.x || dataPoint[1] == selectedPoint.y) {

                // the x and y values match

                // add the index to our array
                indexes.push(index);
              }
            }
          }

          /*
           * order the array from largest to smallest. we are doing this
           * so that we delete the points from the end first. if we delete
           * points starting from lower indexes first, then the indexes
           * will shift and we will end up deleting the wrong points.
           */
          indexes.sort().reverse();

          // loop through all the indexes and remove them from the series data
          for (var i = 0; i < indexes.length; i++) {

            index = indexes[i];

            if (data != null) {
              data.splice(index, 1);
            }
          }

          /*
           * set the flag to add the next component state created in
           * studentDataChanged() to the undo stack
           */
          this.addNextComponentStateToUndoStack = true;
          this.studentDataChanged();
        }
      }
    }
  }, {
    key: 'getComponentId',


    /**
     * Get the component id
     * @return the component id
     */
    value: function getComponentId() {
      return this.componentContent.id;
    }
  }, {
    key: 'authoringViewComponentChanged',


    /**
     * The component has changed in the regular authoring view so we will save the project
     */
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

        // set the new authoring component content
        this.authoringComponentContent = authoringComponentContent;

        // set the new component into the controller
        this.componentContent = authoringComponentContent;

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
    key: 'getStepNodeIds',


    /**
     * Get all the step node ids in the project
     * @returns all the step node ids
     */
    value: function getStepNodeIds() {
      var stepNodeIds = this.ProjectService.getNodeIds();

      return stepNodeIds;
    }

    /**
     * Get the step number and title
     * @param nodeId get the step number and title for this node
     * @returns the step number and title
     */

  }, {
    key: 'getNodePositionAndTitleByNodeId',
    value: function getNodePositionAndTitleByNodeId(nodeId) {
      var nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);

      return nodePositionAndTitle;
    }

    /**
     * Get the components in a step
     * @param nodeId get the components in the step
     * @returns the components in the step
     */

  }, {
    key: 'getComponentsByNodeId',
    value: function getComponentsByNodeId(nodeId) {
      var components = this.ProjectService.getComponentsByNodeId(nodeId);

      return components;
    }

    /**
     * Check if a node is a step node
     * @param nodeId the node id to check
     * @returns whether the node is an application node
     */

  }, {
    key: 'isApplicationNode',
    value: function isApplicationNode(nodeId) {
      var result = this.ProjectService.isApplicationNode(nodeId);

      return result;
    }

    /**
     * Add a series in the authoring view
     */

  }, {
    key: 'authoringAddSeriesClicked',
    value: function authoringAddSeriesClicked() {

      // create a new series
      var newSeries = this.createNewSeries();

      // add the new series
      this.authoringComponentContent.series.push(newSeries);

      // save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Create a new series object
     * @returns a new series object
     */

  }, {
    key: 'createNewSeries',
    value: function createNewSeries() {
      var newSeries = {};

      newSeries.name = '';
      newSeries.data = [];

      var marker = {};
      marker.symbol = 'circle';
      newSeries.marker = marker;

      newSeries.regression = false;
      newSeries.regressionSettings = {};
      newSeries.canEdit = true;

      return newSeries;
    }

    /**
     * Delete a series in the authoring view
     * @param the index of the series in the series array
     */

  }, {
    key: 'authoringDeleteSeriesClicked',
    value: function authoringDeleteSeriesClicked(index) {

      var confirmMessage = '';
      var seriesName = '';

      if (this.authoringComponentContent.series != null) {

        // get the series
        var series = this.authoringComponentContent.series[index];

        if (series != null && series.name != null) {

          // get the series name
          seriesName = series.name;
        }
      }

      if (seriesName == null || seriesName == '') {
        // the series does not have a name
        confirmMessage = this.$translate('graph.areYouSureYouWantToDeleteTheSeries');
      } else {
        // the series has a name
        confirmMessage = this.$translate('graph.areYouSureYouWantToDeleteTheNamedSeries', { seriesName: seriesName });
      }

      // ask the author if they are sure they want to delete the series
      var answer = confirm(confirmMessage);

      if (answer) {
        // remove the series from the series array
        this.authoringComponentContent.series.splice(index, 1);

        // save the project
        this.authoringViewComponentChanged();
      }
    }
  }, {
    key: 'setSaveMessage',


    /**
     * Set the message next to the save button
     * @param message the message to display
     * @param time the time to display
     */
    value: function setSaveMessage(message, time) {
      this.saveMessage.text = message;
      this.saveMessage.time = time;
    }
  }, {
    key: 'registerExitListener',


    /**
     * Register the the listener that will listen for the exit event
     * so that we can perform saving before exiting.
     */
    value: function registerExitListener() {

      /*
       * Listen for the 'exit' event which is fired when the student exits
       * the VLE. This will perform saving before the VLE exits.
       */
      this.exitListener = this.$scope.$on('exit', angular.bind(this, function (event, args) {

        this.$rootScope.$broadcast('doneExiting');
      }));
    }
  }, {
    key: 'isActiveSeries',


    /**
     * Check if a series is the active series. There can only be on active series.
     * @param series the series
     * @returns whether the series is the active series
     */
    value: function isActiveSeries(series) {

      // get the series index
      var seriesIndex = this.getSeriesIndex(series);

      // check if the series is the active series
      var result = this.isActiveSeriesIndex(seriesIndex);

      return result;
    }

    /**
     * Check if a series index is the active series index. There can only be
     * one active series.
     * @param seriesIndex the series index
     * @returns whether the series is the active series
     */

  }, {
    key: 'isActiveSeriesIndex',
    value: function isActiveSeriesIndex(seriesIndex) {

      var result = false;

      if (this.series != null && this.series.indexOf(this.activeSeries) === seriesIndex) {
        // the series is the active series
        result = true;
      }

      return result;
    }

    /**
     * Whether to show the select series input
     * @returns whether to show the select series input
     */

  }, {
    key: 'showSelectSeries',
    value: function showSelectSeries() {
      var show = false;

      if (this.trialIdsToShow.length && this.hasEditableSeries() && this.isSelectSeriesVisible && this.series.length > 1) {
        /*
         * we are in a mode the shows the select series input and there is
         * more than one series
         */
        show = true;
      }

      return show;
    }

    /**
     * The New Trial button was clicked by the student
     */

  }, {
    key: 'newTrialButtonClicked',
    value: function newTrialButtonClicked() {

      // create a new trial
      this.newTrial();

      /*
       * set the flag to add the next component state created in
       * studentDataChanged() to the undo stack
       */
      this.addNextComponentStateToUndoStack = true;
      this.studentDataChanged();
    }

    /**
     * Create a new trial
     */

  }, {
    key: 'newTrial',
    value: function newTrial() {

      // get the current number of trials
      var trialCount = this.trials.length;

      /*
       * get the index of the active series so that we can make the series
       * at the given index active in the new trial
       */
      var activeSeriesIndex = this.getSeriesIndex(this.activeSeries);

      // make a copy of the original series (most likely blank with no points)
      var series = this.UtilService.makeCopyOfJSONObject(this.componentContent.series);

      // regex to find the trial number from the trial names
      var trialNameRegex = /Trial (\d*)/;
      var trialNumbers = [];

      // loop through all the trials
      for (var t = 0; t < this.trials.length; t++) {
        var tempTrial = this.trials[t];

        if (tempTrial != null) {
          // get a trial name
          var tempTrialName = tempTrial.name;

          // run the regex matcher on the trial name
          var match = trialNameRegex.exec(tempTrialName);

          if (match != null && match.length > 0) {
            // we have found a trial name that looks like "Trial X"

            /*
             * get the trial number e.g. if the trial name is "Trial 3",
             * the trial number is 3
             */
            var tempTrialNumber = match[1];

            if (tempTrialNumber != null) {
              /*
               * get the number e.g. if the trial name is "Trial 2",
               * the trial number is 2
               */
              trialNumbers.push(parseInt(tempTrialNumber));
            }
          }
        }
      }

      // sort the trial numbers from smallest to largest
      trialNumbers.sort();

      var maxTrialNumber = 0;

      if (trialNumbers.length > 0) {
        // get the highest trial number
        maxTrialNumber = trialNumbers[trialNumbers.length - 1];
      }

      if (this.hideAllTrialsOnNewTrial) {
        // we only want to show the latest trial

        // loop through all the existing trials and hide them
        for (var t = 0; t < this.trials.length; t++) {
          var tempTrial = this.trials[t];

          if (tempTrial != null) {
            tempTrial.show = false;
          }
        }
      }

      // make a new trial with a trial number one larger than the existing max
      var trial = {};
      trial.name = this.$translate('graph.trial') + ' ' + (maxTrialNumber + 1);
      trial.series = series;
      trial.show = true;
      trial.id = this.UtilService.generateKey(10);

      // add the trial to the array of trials
      this.trials.push(trial);

      // set the new trial to be the active trial
      this.activeTrial = trial;

      // set the series to be displayed
      this.series = series;

      if (this.activeSeries == null) {
        /*
         * there was no previous active series so we will set the active
         * series to the first editable series or if there are no editable
         * series, set the active series to the first series
         */
        this.setDefaultActiveSeries();
      } else {
        /*
         * set the active series to the same series at the index that was
         * previously active
         */
        this.setActiveSeriesByIndex(activeSeriesIndex);
      }

      this.setTrialIdsToShow();
    }

    /**
     * Delete a trial
     * @param trialIndex the index (in the trials array) of the trial to delete
     */

  }, {
    key: 'deleteTrial',
    value: function deleteTrial(trialIndex) {

      if (trialIndex == null) {
        trialIndex = this.trials.indexOf(this.activeTrial);
      }

      if (trialIndex != null && trialIndex != -1) {

        // get the trial to remove
        var trialToRemove = this.trials[trialIndex];

        // get the trial id of the trial to remove
        var trialToRemoveId = trialToRemove.id;

        // remove the trial from the array of trials
        this.trials.splice(trialIndex, 1);

        // remove the trial id from the trial ids to show array
        for (var t = 0; t < this.trialIdsToShow.length; t++) {
          if (trialToRemoveId == this.trialIdsToShow[t]) {
            // remove the trial id
            this.trialIdsToShow.splice(t, 1);

            /*
             * move the counter back one because we have just removed
             * an element from the array. a trial id should never show
             * up more than once in the trialIdsToShow array but we
             * will go through the whole array just to be safe.
             */
            t--;
          }
        }

        if (this.trials.length == 0) {
          // there are no more trials so we will create a new empty trial
          this.newTrial();

          // reset the axis limits
          this.setXAxis(this.componentContent.xAxis);
          this.setYAxis(this.componentContent.yAxis);
        } else if (this.trials.length > 0) {
          if (trialToRemove == this.activeTrial) {
            // remove the references to the trial that we are deleting
            this.activeTrial = null;
            this.activeSeries = null;
            this.series = null;

            // make the highest shown trial the active trial
            var highestTrialIndex = null;
            var highestTrial = null;

            // loop through the shown trials
            for (var t = 0; t < this.trialIdsToShow.length; t++) {
              var trialId = this.trialIdsToShow[t];

              // get one of the shown trials
              var trial = this.getTrialById(trialId);

              if (trial != null) {

                // get the trial index
                var trialIndex = this.getTrialIndex(trial);

                if (trialIndex != null) {

                  if (highestTrialIndex == null || trialIndex > highestTrialIndex) {
                    /*
                     * this is the highest trial we have seen so
                     * far so we will remember it
                     */
                    highestTrialIndex = trialIndex;
                    highestTrial = trial;
                  }
                }
              }
            }

            if (highestTrial != null) {
              /*
               * get the index of the active series so that we can set the
               * same series to be active in the new active trial
               */
              var seriesIndex = this.getSeriesIndex(this.activeSeries);

              // set the highest shown trial to be the active trial
              this.activeTrial = highestTrial;

              // set the series
              this.setSeries(this.activeTrial.series);

              if (seriesIndex != null) {
                // set the active series
                this.setActiveSeriesByIndex(seriesIndex);
              }
            }
          }
        }

        this.setTrialIdsToShow();
      }

      /*
       * set the flag to add the next component state created in
       * studentDataChanged() to the undo stack
       */
      this.addNextComponentStateToUndoStack = true;
      this.studentDataChanged();

      // update the selected trial text
      this.selectedTrialsText = this.getSelectedTrialsText();

      // tell the parent node that this component wants to save
      //this.$scope.$emit('componentSaveTriggered', {nodeId: this.nodeId, componentId: this.componentId});
    }

    /**
     * The student has selected a different trial to edit
     */

  }, {
    key: 'activeTrialChanged',
    value: function activeTrialChanged() {

      // get the active trial
      var activeTrial = this.activeTrial;

      if (activeTrial != null) {

        // get the index of the active series
        var seriesIndex = this.getSeriesIndex(this.activeSeries);

        if (seriesIndex == null) {
          // default the index to 0
          seriesIndex = 0;
        }

        // get the series from the trial
        var series = activeTrial.series;

        // set the series to be displayed
        this.series = series;

        /*
         * set the active series index to the same series index of the
         * previously active series
         */
        this.setActiveSeriesByIndex(seriesIndex);

        /*
         * set the flag to add the next component state created in
         * studentDataChanged() to the undo stack
         */
        this.addNextComponentStateToUndoStack = true;
        this.studentDataChanged();
      }
    }

    /**
     * The student has selected different trials to view
     */

  }, {
    key: 'trialIdsToShowChanged',
    value: function trialIdsToShowChanged() {
      // get the trial indexes to show
      var trialIdsToShow = this.trialIdsToShow;
      var trials = this.trials;

      // update the trials
      for (var i = 0; i < trials.length; i++) {
        var trial = trials[i];
        var id = trial.id;

        if (trialIdsToShow.indexOf(id) > -1) {
          trial.show = true;
        } else {
          trial.show = false;

          if (this.activeTrial != null && this.activeTrial.id == id) {
            // the active trial is no longer shown
            this.activeTrial = null;
            this.activeSeries = null;
            this.series = null;
          }
        }
      }

      // get the latest trial that was checked and make it the active trial
      if (this.trialIdsToShow.length > 0) {

        // get the latest trial that was checked
        var lastShownTrialId = this.trialIdsToShow[this.trialIdsToShow.length - 1];
        var lastShownTrial = this.getTrialById(lastShownTrialId);

        if (lastShownTrial != null) {

          /*
           * get the index of the active series so that we can set the
           * same series to active in the new active trial
           */
          var seriesIndex = this.getSeriesIndex(this.activeSeries);

          // set the last shown trial to be the active trial
          this.activeTrial = lastShownTrial;

          // set the series
          this.setSeries(this.activeTrial.series);

          if (seriesIndex != null) {
            // set the active series
            this.setActiveSeriesByIndex(seriesIndex);
          }
        }
      }

      // hack: for some reason, the ids to show model gets out of sync when deleting a trial, for example
      // TODO: figure out why this check is sometimes necessary and remove
      for (var a = 0; a < trialIdsToShow.length; a++) {
        var idToShow = trialIdsToShow[a];
        if (!this.getTrialById(idToShow)) {
          trialIdsToShow.splice(a, 1);
        }
      }

      /*
       * Make sure the trialIdsToShow has actually changed. Sometimes
       * trialIdsToShowChanged() gets called even if trialIdsToShow
       * does not change because the model for the trial checkbox
       * select is graphController.trials. This means trialIdsToShowChanged()
       * will be called when we replace the trials increateComponentState()
       * but this does not necessarily mean the trialIdsToShow has changed.
       * We do this check to minimize the number of times studentDataChanged()
       * is called.
       */
      if (!this.UtilService.arraysContainSameValues(this.previousTrialIdsToShow, trialIdsToShow)) {
        // update the trialIdsToShow
        this.trialIdsToShow = trialIdsToShow;
        this.studentDataChanged();
      }

      /*
       * Remember the trial ids to show so we can use it to make sure the
       * trialIdsToShow actually change the next time trialIdsToShowChanged()
       * is called.
       */
      this.previousTrialIdsToShow = this.UtilService.makeCopyOfJSONObject(this.trialIdsToShow);

      // update the selected trial text
      this.selectedTrialsText = this.getSelectedTrialsText();
    }
  }, {
    key: 'setTrialIdsToShow',


    /**
     * Set which trials are selected in the trial select model
     */
    value: function setTrialIdsToShow() {
      var idsToShow = [];

      var trials = this.trials;
      for (var i = 0; i < trials.length; i++) {
        var trial = trials[i];
        if (trial.show) {
          // trial is visible on graph, so add it to the ids to show model
          var id = trial.id;
          idsToShow.push(id);
        }
      }

      this.trialIdsToShow = idsToShow;
    }
  }, {
    key: 'getSelectedTrialsText',


    /**
     * Get the text to show in the trials select dropdown
     */
    value: function getSelectedTrialsText() {
      if (this.trialIdsToShow.length === 1) {
        var id = this.trialIdsToShow[0];
        var name = this.getTrialById(id).name;
        return name;
      } else if (this.trialIdsToShow.length > 1) {
        return this.trialIdsToShow.length + ' ' + this.$translate('graph.trialsShown');
      } else {
        return this.$translate('graph.selectTrialsToShow');
      }
    }
  }, {
    key: 'processConnectedComponentStudentData',


    /**
     * Process the student data that we have received from a connected component.
     * @param studentData The student data from a connected component.
     * @param params The connected component params.
     */
    value: function processConnectedComponentStudentData(studentData, params) {
      if (params.fields == null) {
        /*
         * we do not need to look at specific fields so we will directly
         * parse the the trial data from the student data.
         */
        this.parseLatestTrial(studentData, params);
      } else {
        // we need to process specific fields in the student data
        var fields = params.fields;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = fields[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var field = _step3.value;

            var name = field.name;
            var when = field.when;
            var action = field.action;
            var firstTime = false;
            if (when == 'firstTime' && firstTime == true) {
              if (action == 'write') {
                // TODO
              } else if (action == 'read') {
                // TODO
              }
            } else if (when == 'always') {
              if (action == 'write') {
                // TODO
              } else if (action == 'read') {
                this.readConnectedComponentFieldFromStudentData(studentData, params, name);
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
      }
    }

    /**
     * Read the field from the new student data and perform any processing on our
     * existing student data based upon the new student data.
     * @param studentData The new student data from the connected component.
     * @param params The connected component params.
     * @param name The field name to read and process.
     */

  }, {
    key: 'readConnectedComponentFieldFromStudentData',
    value: function readConnectedComponentFieldFromStudentData(studentData, params, name) {
      if (name == 'selectedCells') {
        // only show the trials that are specified in the selectedCells array
        var selectedCells = studentData[name];
        var selectedTrialIds = this.convertSelectedCellsToTrialIds(selectedCells);
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = this.trials[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var trial = _step4.value;

            if (selectedTrialIds.includes(trial.id)) {
              trial.show = true;
            } else {
              trial.show = false;
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
      } else if (name == 'trial') {
        this.parseLatestTrial(studentData, params);
      } else if (name == 'trialIdsToDelete') {
        this.deleteTrialsByTrialId(studentData.trialIdsToDelete);
      }
    }

    /**
     * Delete the trials
     * @param trialIdsToDelete An array of trial ids to delete
     */

  }, {
    key: 'deleteTrialsByTrialId',
    value: function deleteTrialsByTrialId(trialIdsToDelete) {
      if (trialIdsToDelete != null) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = trialIdsToDelete[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var trialIdToDelete = _step5.value;

            this.deleteTrialId(trialIdToDelete);
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }
      }
    }

    /**
     * Delete a trial
     * @param trialId The trial id string to delete
     */

  }, {
    key: 'deleteTrialId',
    value: function deleteTrialId(trialId) {
      for (var t = 0; t < this.trials.length; t++) {
        var trial = this.trials[t];
        if (trial.id == trialId) {
          this.trials.splice(t, 1);
          break;
        }
      }
    }

    /**
     * Parse the latest trial and set it into the component
     * @param studentData the student data object that has a trials field
     * @param params (optional) parameters that specify what to use from the
     * student data
     */

  }, {
    key: 'parseLatestTrial',
    value: function parseLatestTrial(studentData, params) {
      var _this9 = this;

      if (studentData != null) {

        var latestStudentDataTrial = null;

        if (studentData.trial != null) {
          // the student data only has one trial
          latestStudentDataTrial = studentData.trial;
        }

        if (studentData.trials != null && studentData.trials.length > 0) {
          // the student data has an array of trials
          latestStudentDataTrial = studentData.trials[studentData.trials.length - 1];
        }

        if (latestStudentDataTrial != null) {

          // get the latest student data trial id
          var latestStudentDataTrialId = latestStudentDataTrial.id;

          /*
           * remove the first default trial that is automatically created
           * when the student first visits the component otherwise there
           * will be a blank trial.
           */
          if (this.trials.length > 0) {

            // get the first trial
            var firstTrial = this.trials[0];

            if (firstTrial != null) {

              /*
               * check if the trial has any series. if the trial doesn't
               * have any series it means it was automatically created by
               * the component.
               */
              if (firstTrial.series == null || firstTrial.series.length == 0 || firstTrial.series.length == 1 && !firstTrial.series[0].data.length) {
                if (firstTrial.id == null || firstTrial.id !== latestStudentDataTrialId) {
                  // delete the first trial
                  this.trials.shift();
                }
              }
            }
          }

          // get the trial with the given trial id
          var latestTrial = this.getTrialById(latestStudentDataTrialId);

          if (latestTrial == null) {
            /*
             * we did not find a trial with the given id which means
             * this is a new trial
             */

            if (this.hideAllTrialsOnNewTrial) {
              // we only show the latest trial when a new trial starts

              // loop through all the existing trials and hide them
              for (var t = 0; t < this.trials.length; t++) {
                var tempTrial = this.trials[t];

                if (tempTrial != null) {
                  tempTrial.show = false;
                }
              }
            }

            // create the new trial
            latestTrial = {};

            latestTrial.id = latestStudentDataTrialId;

            latestTrial.show = true;

            this.setXAxis(this.componentContent.xAxis);
            this.setYAxis(this.componentContent.yAxis);

            // add the trial to the array of trials
            this.trials.push(latestTrial);
          }

          if (latestStudentDataTrial.name != null) {

            // set the trial name
            latestTrial.name = latestStudentDataTrial.name;
          }

          if (latestStudentDataTrial.series != null) {

            // set the trial series
            latestTrial.series = [];

            var tempSeries = latestStudentDataTrial.series;

            if (tempSeries != null) {

              // loop through all the series in the trial
              for (var s = 0; s < tempSeries.length; s++) {

                /*
                 * check if there are any params. if series numbers
                 * are specified in the params, we will only use
                 * those series numbers.
                 */
                if (params == null || params.seriesNumbers == null || params.seriesNumbers.length == 0 || params.seriesNumbers != null && params.seriesNumbers.indexOf(s) != -1) {

                  // get a single series
                  var singleSeries = tempSeries[s];

                  if (singleSeries != null) {

                    // get the series name and data
                    var seriesName = singleSeries.name;
                    var seriesData = singleSeries.data;
                    var seriesColor = singleSeries.color;
                    var allowPointMouseOver = singleSeries.allowPointMouseOver;
                    var marker = singleSeries.marker;
                    var dashStyle = singleSeries.dashStyle;

                    // make a series object
                    var newSeries = {};
                    newSeries.name = seriesName;
                    newSeries.data = seriesData;
                    newSeries.color = seriesColor;
                    newSeries.canEdit = false;
                    newSeries.allowPointSelect = false;

                    if (marker != null) {
                      newSeries.marker = marker;
                    }

                    if (dashStyle != null) {
                      newSeries.dashStyle = dashStyle;
                    }

                    if (allowPointMouseOver != null) {
                      newSeries.allowPointMouseOver = allowPointMouseOver;
                    }

                    // add the series to the trial
                    latestTrial.series.push(newSeries);

                    if (params.highlightLatestPoint) {
                      this.$timeout(function () {
                        //this.showTooltipOnX(studentData.trial.id, studentData.showTooltipOnX);
                        _this9.highlightPointOnX(studentData.trial.id, studentData.xPointToHighlight);
                      }, 1);
                    }
                  }
                }
              }
            }
          }

          if (latestStudentDataTrial.xAxis != null && latestStudentDataTrial.xAxis.plotBands != null) {
            if (latestTrial.xAxis == null) {
              latestTrial.xAxis = {};
            }
            latestTrial.xAxis.plotBands = latestStudentDataTrial.xAxis.plotBands;
          }
        }

        if (this.trials.length > 0) {
          // make the last trial the active trial
          this.activeTrial = this.trials[this.trials.length - 1];
          this.activeTrial.show = true;
        }

        if (studentData.xPlotLine != null) {
          this.showXPlotLine(studentData.xPlotLine);
        }

        this.setTrialIdsToShow();

        // redraw the graph so that the active trial gets displayed
        this.activeTrialChanged();
      }
    }

    /**
     * Get the trial by id
     * @param id the trial id
     * @returns the trial with the given id or null
     */

  }, {
    key: 'getTrialById',
    value: function getTrialById(id) {

      var trial = null;

      if (id != null) {

        // loop through all the trials
        for (var t = 0; t < this.trials.length; t++) {
          var tempTrial = this.trials[t];

          if (tempTrial != null && tempTrial.id == id) {
            // we have found the trial with the id we want
            trial = tempTrial;
            break;
          }
        }
      }

      return trial;
    }

    /**
     * Check if there is an editable series
     * @return whether there is an editable series
     */

  }, {
    key: 'hasEditableSeries',
    value: function hasEditableSeries() {

      var result = false;

      // get the array of series
      var series = this.getSeries();

      if (series != null) {

        // loop through all the lines
        for (var s = 0; s < series.length; s++) {
          var tempSeries = series[s];

          if (tempSeries != null) {

            if (tempSeries.canEdit) {
              // this line can be edited
              result = true;
            }
          }
        }
      }

      return result;
    }

    /**
     * Update the x and y axis min and max values if necessary to make sure
     * all points are visible in the graph view.
     * @param series the an array of series
     * @param xAxis the x axis object
     * @param yAxis the y axis object
     */

  }, {
    key: 'updateMinMaxAxisValues',
    value: function updateMinMaxAxisValues(series, xAxis, yAxis) {

      // get the min and max x and y values
      var minMaxValues = this.getMinMaxValues(series);

      if (minMaxValues != null) {

        if (xAxis != null && !xAxis.locked) {
          if (minMaxValues.xMin < xAxis.min) {
            /*
             * there is a point that has a smaller x value than the
             * specified x axis min. we will remove the min value from
             * the xAxis object so that highcharts will automatically
             * set the min x value automatically
             */
            xAxis.min = null;
            xAxis.minPadding = 0.2;
          }

          if (minMaxValues.xMax >= xAxis.max) {
            /*
             * there is a point that has a larger x value than the
             * specified x axis max. we will remove the max value from
             * the xAxis object so that highcharts will automatically
             * set the max x value automatically
             */
            xAxis.max = null;
            xAxis.maxPadding = 0.2;
          }
        }

        if (yAxis != null && !yAxis.locked) {
          if (minMaxValues.yMin < yAxis.min) {
            /*
             * there is a point that has a smaller y value than the
             * specified y axis min. we will remove the min value from
             * the yAxis object so that highcharts will automatically
             * set the min y value automatically
             */
            yAxis.min = null;
            yAxis.minPadding = 0.2;
          }

          if (minMaxValues.yMax >= yAxis.max) {
            /*
             * there is a point that has a larger y value than the
             * specified y axis max. we will remove the max value from
             * the yAxis object so that highcharts will automatically
             * set the max y value automatically
             */
            yAxis.max = null;
            yAxis.maxPadding = 0.2;
          }
        }
      }
    }

    /**
     * Get the min and max x and y values
     * @param series an array of series
     * @returns an object containing the min and max x and y values from the
     * series data
     */

  }, {
    key: 'getMinMaxValues',
    value: function getMinMaxValues(series) {

      var result = {};
      var xMin = 0;
      var xMax = 0;
      var yMin = 0;
      var yMax = 0;

      if (series != null) {

        // loop through all the series
        for (var s = 0; s < series.length; s++) {

          // get a single series
          var tempSeries = series[s];

          if (tempSeries != null) {

            // get the data from the single series
            var data = tempSeries.data;

            if (data != null) {

              // loop through all the data points in the single series
              for (var d = 0; d < data.length; d++) {
                var tempData = data[d];

                var tempX = null;
                var tempY = null;

                if (tempData != null) {
                  if (tempData.constructor.name == 'Object') {
                    /*
                     * the element is an object so we will get
                     * the x and y fields
                     */
                    tempX = tempData.x;
                    tempY = tempData.y;
                  } else if (tempData.constructor.name == 'Array') {
                    /*
                     * the element is an array so we will get
                     * the first and second element in the array
                     * which correspond to the x and y values
                     */
                    tempX = tempData[0];
                    tempY = tempData[1];
                  } else if (tempData.constructor.name == 'Number') {
                    // the element is a number
                    tempY = tempData;
                  }
                }

                if (tempX > xMax) {
                  /*
                   * we have found a data point with a greater x
                   * value than what we have previously found
                   */
                  xMax = tempX;
                }

                if (tempX < xMin) {
                  /*
                   * we have found a data point with a smaller x
                   * value than what we have previously found
                   */
                  xMin = tempX;
                }

                if (tempY > yMax) {
                  /*
                   * we have found a data point with a greater y
                   * value than what we have previously found
                   */
                  yMax = tempY;
                }

                if (tempY < yMin) {
                  /*
                   * we have found a data point with a smaller y
                   * value than what we have previously found
                   */
                  yMin = tempY;
                }
              }
            }
          }
        }
      }

      result.xMin = xMin;
      result.xMax = xMax;
      result.yMin = yMin;
      result.yMax = yMax;

      return result;
    }

    /**
     * Clear all the series ids
     * @param allSeries all of the series
     */

  }, {
    key: 'clearSeriesIds',
    value: function clearSeriesIds(allSeries) {

      if (allSeries != null) {

        // loop through all the series
        for (var s = 0; s < allSeries.length; s++) {
          var tempSeries = allSeries[s];

          if (tempSeries != null) {
            // clear the id
            tempSeries.id = null;
          }
        }
      }
    }

    /**
     * The "Enable Trials" checkbox was clicked
     */

  }, {
    key: 'authoringViewEnableTrialsClicked',
    value: function authoringViewEnableTrialsClicked() {

      if (this.authoringComponentContent.enableTrials) {
        // trials are now enabled
        this.authoringComponentContent.canCreateNewTrials = true;
        this.authoringComponentContent.canDeleteTrials = true;
      } else {
        // trials are now disabled
        this.authoringComponentContent.canCreateNewTrials = false;
        this.authoringComponentContent.canDeleteTrials = false;
        this.authoringComponentContent.hideAllTrialsOnNewTrial = true;
      }

      this.authoringViewComponentChanged();
    }

    /**
     * Check whether we need to show the snip drawing button
     * @return whether to show the snip drawing button
     */

  }, {
    key: 'showSnipDrawingButton',
    value: function showSnipDrawingButton() {
      if (this.NotebookService.isNotebookEnabled() && this.isSnipDrawingButtonVisible) {
        return true;
      } else {
        return false;
      }
    }

    /**
     * Snip the drawing by converting it to an image
     * @param $event the click event
     */

  }, {
    key: 'snipDrawing',
    value: function snipDrawing($event) {
      var _this10 = this;

      // get the highcharts div
      var highchartsDiv = angular.element('#' + this.chartId).find('.highcharts-container');

      if (highchartsDiv != null && highchartsDiv.length > 0) {
        highchartsDiv = highchartsDiv[0];

        // convert the model element to a canvas element
        (0, _html2canvas2.default)(highchartsDiv).then(function (canvas) {

          // get the canvas as a base64 string
          var img_b64 = canvas.toDataURL('image/png');

          // get the image object
          var imageObject = _this10.UtilService.getImageObjectFromBase64String(img_b64);

          // create a notebook item with the image populated into it
          _this10.NotebookService.addNote($event, imageObject);
        });
      }
    }

    /**
     * Read a csv string and load the data into the active series
     * @param csv a csv string
     */

  }, {
    key: 'readCSV',
    value: function readCSV(csv) {

      if (csv != null) {

        // splite the string into lines
        var lines = csv.split(/\r\n|\n/);

        // clear the data in the active series
        this.activeSeries.data = [];

        // loop through all the lines
        for (var lineNumber = 0; lineNumber < lines.length; lineNumber++) {

          // get a line
          var line = lines[lineNumber];

          if (line != null) {

            // split the line to get the values
            var values = line.split(',');

            if (values != null) {

              // get the x and y values
              var x = parseFloat(values[0]);
              var y = parseFloat(values[1]);

              if (!isNaN(x) && !isNaN(y)) {
                // make the data point
                var dataPoint = [x, y];

                // add the data point to the active series
                this.activeSeries.data.push(dataPoint);
              }
            }
          }
        }
      }
    }

    /**
     * Set the uploaded file name
     * @param fileName the file name
     */

  }, {
    key: 'setUploadedFileName',
    value: function setUploadedFileName(fileName) {
      this.uploadedFileName = fileName;
    }

    /**
     * Get the uploaded file name
     * @return the uploaded file name
     */

  }, {
    key: 'getUploadedFileName',
    value: function getUploadedFileName() {
      return this.uploadedFileName;
    }

    /**
     * Check if a component generates student work
     * @param component the component
     * @return whether the component generates student work
     */

  }, {
    key: 'componentHasWork',
    value: function componentHasWork(component) {
      var result = true;

      if (component != null) {
        result = this.ProjectService.componentHasWork(component);
      }

      return result;
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
     * Show the asset popup to allow the author to choose the background image
     */

  }, {
    key: 'chooseBackgroundImage',
    value: function chooseBackgroundImage() {

      // generate the parameters
      var params = {};
      params.isPopup = true;
      params.nodeId = this.nodeId;
      params.componentId = this.componentId;
      params.target = 'background';

      // display the asset chooser
      this.$rootScope.$broadcast('openAssetChooser', params);
    }

    /**
     * Add an x axis category
     */

  }, {
    key: 'authoringAddXAxisCategory',
    value: function authoringAddXAxisCategory() {

      // add an empty string as a new category
      this.authoringComponentContent.xAxis.categories.push('');

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Delete an x axis category
     * @param index the index of the category to delete
     */

  }, {
    key: 'authoringDeleteXAxisCategory',
    value: function authoringDeleteXAxisCategory(index) {

      if (index != null) {

        var confirmMessage = '';

        var categoryName = '';

        if (this.authoringComponentContent.xAxis != null && this.authoringComponentContent.xAxis.categories != null) {

          // get the category name
          categoryName = this.authoringComponentContent.xAxis.categories[index];
        }

        if (categoryName == null || categoryName == '') {
          // there category does not have a name
          confirmMessage = this.$translate('graph.areYouSureYouWantToDeleteTheCategory');
        } else {
          // the category has a name
          confirmMessage = this.$translate('graph.areYouSureYouWantToDeleteTheNamedCategory', { categoryName: categoryName });
        }

        // ask the author if they are sure they want to delete the category
        var answer = confirm(confirmMessage);

        if (answer) {
          // remove the category at the given index
          this.authoringComponentContent.xAxis.categories.splice(index, 1);

          // the authoring component content has changed so we will save the project
          this.authoringViewComponentChanged();
        }
      }
    }

    /**
     * Add an empty data point to the series
     * @param series the series to add the empty data point to
     */

  }, {
    key: 'authoringAddSeriesDataPoint',
    value: function authoringAddSeriesDataPoint(series) {

      if (series != null && series.data != null) {

        if (this.authoringComponentContent.xAxis.type == null || this.authoringComponentContent.xAxis.type === 'limits') {
          // add an empty data point to the series
          series.data.push([]);
        } else if (this.authoringComponentContent.xAxis.type === 'categories') {
          // add an empty data point to the series
          series.data.push(null);
        }
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Delete a data point from a series
     * @param series the series to delete a data point from
     * @param index the index of the data point to delete
     */

  }, {
    key: 'authoringDeleteSeriesDataPoint',
    value: function authoringDeleteSeriesDataPoint(series, index) {

      if (series != null && series.data != null) {

        // ask the author if they are sure they want to delete the point
        var answer = confirm(this.$translate('graph.areYouSureYouWantToDeleteTheDataPoint'));

        if (answer) {
          // delete the data point at the given index
          series.data.splice(index, 1);

          // the authoring component content has changed so we will save the project
          this.authoringViewComponentChanged();
        }
      }
    }

    /**
     * Move a data point up
     * @param series the series the data point belongs to
     * @param index the index of the data point in the series
     */

  }, {
    key: 'authoringMoveSeriesDataPointUp',
    value: function authoringMoveSeriesDataPointUp(series, index) {
      if (series != null && series.data != null) {

        if (index > 0) {
          // the data point is not at the top so we can move it up

          // remember the data point we are moving
          var dataPoint = series.data[index];

          // remove the data point at the given index
          series.data.splice(index, 1);

          // insert the data point back in at one index back
          series.data.splice(index - 1, 0, dataPoint);
        }

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Move a data point down
     * @param series the series the data point belongs to
     * @param index the index of the data point in the series
     */

  }, {
    key: 'authoringMoveSeriesDataPointDown',
    value: function authoringMoveSeriesDataPointDown(series, index) {
      if (series != null && series.data != null) {

        if (index < series.data.length - 1) {
          // the data point is not at the bottom so we can move it down

          // remember the data point we are moving
          var dataPoint = series.data[index];

          // remove the data point at the given index
          series.data.splice(index, 1);

          // insert the data point back in at one index back
          series.data.splice(index + 1, 0, dataPoint);
        }

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * The graph type changed so we will handle updating the series data points
     * @param newValue the new value of the graph type
     * @param oldValue the old value of the graph type
     */

  }, {
    key: 'authoringViewGraphTypeChanged',
    value: function authoringViewGraphTypeChanged(newValue, oldValue) {

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * The author has changed the x axis type
     * @param newValue the new x axis type
     * @param oldValue the old x axis type
     */

  }, {
    key: 'authoringViewXAxisTypeChanged',
    value: function authoringViewXAxisTypeChanged(newValue, oldValue) {
      // ask the author if they are sure they want to change the x axis type
      var answer = confirm(this.$translate('graph.areYouSureYouWantToChangeTheXAxisType'));

      if (answer) {
        // the author answered yes to change the type
        if (newValue === 'limits') {
          if (oldValue === 'categories') {
            // the graph type is changing from categories to limits
            delete this.authoringComponentContent.xAxis.categories;
            this.authoringComponentContent.xAxis.min = 0;
            this.authoringComponentContent.xAxis.max = 10;
            this.authoringConvertAllSeriesDataPoints(newValue);
          }
        } else if (newValue === 'categories') {
          if (oldValue === 'limits' || oldValue === '' || oldValue == null) {
            // the graph type is changing from limits to categories
            delete this.authoringComponentContent.xAxis.min;
            delete this.authoringComponentContent.xAxis.max;
            delete this.authoringComponentContent.xAxis.units;
            delete this.authoringComponentContent.yAxis.units;
            this.authoringComponentContent.xAxis.categories = [];
            this.authoringConvertAllSeriesDataPoints(newValue);
          }
        }
      } else {
        // the author answered no so we will not change the type
        // revert the x axis type
        this.authoringComponentContent.xAxis.type = oldValue;
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Add symbols to all the series
     */

  }, {
    key: 'authoringAddSymbolsToSeries',
    value: function authoringAddSymbolsToSeries() {

      // get all the series
      var series = this.authoringComponentContent.series;

      if (series != null) {

        // loop through all the series
        for (var s = 0; s < series.length; s++) {

          // get a series
          var tempSeries = series[s];

          if (tempSeries != null) {
            // set the symbol to circle
            tempSeries.marker = {};
            tempSeries.marker.symbol = 'circle';
          }
        }
      }
    }

    /**
     * Convert the data points in all the series
     * @param graphType the x axis type to convert the data points to
     */

  }, {
    key: 'authoringConvertAllSeriesDataPoints',
    value: function authoringConvertAllSeriesDataPoints(xAxisType) {

      // get all the series
      var series = this.authoringComponentContent.series;

      if (series != null) {

        // loop through all the series
        for (var s = 0; s < series.length; s++) {

          // get a series
          var tempSeries = series[s];

          // convert the data points in the series
          this.convertSeriesDataPoints(tempSeries, xAxisType);
        }
      }
    }

    /**
     * Convert all the data points in the series
     * @param series convert the data points in the series
     * @param xAxisType the new x axis type to convert to
     */

  }, {
    key: 'convertSeriesDataPoints',
    value: function convertSeriesDataPoints(series, xAxisType) {

      if (series != null && series.data != null) {

        // get the data from the series
        var data = series.data;

        // an array to hold the new data after it has been converted
        var newData = [];

        // loop through all the data points
        for (var d = 0; d < data.length; d++) {
          var oldDataPoint = data[d];

          if (xAxisType == null || xAxisType === '' || xAxisType === 'limits') {
            if (!Array.isArray(oldDataPoint)) {
              /*
               * the old data point is not an array which means it is
               * a single value such as a number
               */
              // create an array to hold [x, y]
              var newDataPoint = [d + 1, oldDataPoint];

              // add the new data point to our new data array
              newData.push(newDataPoint);
            } else {
              // the old data point is an array so we can re-use it
              newData.push(oldDataPoint);
            }
          } else if (xAxisType === 'categories') {
            if (Array.isArray(oldDataPoint)) {
              /*
               * the old data point is an array which is most likely
               * in the form of [x, y]
               */

              // get the y value
              var newDataPoint = oldDataPoint[1];

              if (newDataPoint != null) {
                // add the y value as the data point
                newData.push(newDataPoint);
              }
            } else {
              /*
               * the old data is not an array which means it is a
               * single value such as a number so we can re-use it
               */
              newData.push(oldDataPoint);
            }
          }
        }

        // set the new data into the series
        series.data = newData;
      }
    }

    /**
     * Round the number according to the authoring settings
     * @param number a number
     * @return the rounded number
     */

  }, {
    key: 'performRounding',
    value: function performRounding(number) {

      if (this.componentContent.roundValuesTo === 'integer') {
        number = this.roundToNearestInteger(number);
      } else if (this.componentContent.roundValuesTo === 'tenth') {
        number = this.roundToNearestTenth(number);
      } else if (this.componentContent.roundValuesTo === 'hundredth') {
        number = this.roundToNearestHundredth(number);
      }

      return number;
    }

    /**
     * Round a number to the nearest integer
     * @param x a number
     * @return the number rounded to the nearest integer
     */

  }, {
    key: 'roundToNearestInteger',
    value: function roundToNearestInteger(x) {

      // make sure x is a number
      x = parseFloat(x);

      // round to the nearest integer
      x = Math.round(x);

      return x;
    }

    /**
     * Round a number to the nearest tenth
     * @param x a number
     * @return the number rounded to the nearest tenth
     */

  }, {
    key: 'roundToNearestTenth',
    value: function roundToNearestTenth(x) {

      // make sure x is a number
      x = parseFloat(x);

      // round the number to the nearest tenth
      x = Math.round(x * 10) / 10;

      return x;
    }

    /**
     * Round a number to the nearest hundredth
     * @param x a number
     * @return the number rounded to the nearest hundredth
     */

  }, {
    key: 'roundToNearestHundredth',
    value: function roundToNearestHundredth(x) {

      // make sure x is a number
      x = parseFloat(x);

      // round the number to the nearest hundredth
      x = Math.round(x * 100) / 100;

      return x;
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

      if (this.authoringComponentContent.connectedComponents.length > 1) {
        /*
         * there is more than one connected component so we will enable
         * trials so that each connected component can put work in a
         * different trial
         */
        this.authoringComponentContent.enableTrials = true;
      }

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
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = components[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var component = _step6.value;

              if (component != null) {
                if (this.isConnectedComponentTypeAllowed(component.type) && component.id != this.componentId) {
                  // we have found a viable component we can connect to
                  numberOfAllowedComponents += 1;
                  allowedComponent = component;
                }
              }
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
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
            this.authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent);
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
     * Add a connected component series number
     * @param connectedComponent the connected component object
     */

  }, {
    key: 'authoringAddConnectedComponentSeriesNumber',
    value: function authoringAddConnectedComponentSeriesNumber(connectedComponent) {

      if (connectedComponent != null) {

        // initialize the series numbers if necessary
        if (connectedComponent.seriesNumbers == null) {
          connectedComponent.seriesNumbers = [];
        }

        // add an empty value into the series numbers
        connectedComponent.seriesNumbers.push(null);

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Delete a connected component series number
     * @param connectedComponent the connected component object
     * @param seriesNumberIndex the series number index to delete
     */

  }, {
    key: 'authoringDeleteConnectedComponentSeriesNumber',
    value: function authoringDeleteConnectedComponentSeriesNumber(connectedComponent, seriesNumberIndex) {

      if (connectedComponent != null) {

        // initialize the series numbers if necessary
        if (connectedComponent.seriesNumbers == null) {
          connectedComponent.seriesNumbers = [];
        }

        // remove the element at the given index
        connectedComponent.seriesNumbers.splice(seriesNumberIndex, 1);

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * The author has changed a series number
     * @param connectedComponent the connected component object
     * @param seriesNumberIndex the series number index to update
     * @param value the new series number value
     */

  }, {
    key: 'authoringConnectedComponentSeriesNumberChanged',
    value: function authoringConnectedComponentSeriesNumberChanged(connectedComponent, seriesNumberIndex, value) {

      if (connectedComponent != null) {

        // initialize the series numbers if necessary
        if (connectedComponent.seriesNumbers == null) {
          connectedComponent.seriesNumbers = [];
        }

        // make sure the index is in the range of acceptable indexes
        if (seriesNumberIndex < connectedComponent.seriesNumbers.length) {

          // update the series number at the given index
          connectedComponent.seriesNumbers[seriesNumberIndex] = value;
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
        delete connectedComponent.importWorkAsBackground;
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

        // get the new component type
        var connectedComponentType = this.authoringGetConnectedComponentType(connectedComponent);

        if (connectedComponentType != 'Embedded') {
          /*
           * the component type is not Embedded so we will remove the
           * seriesNumbers field
           */
          delete connectedComponent.seriesNumbers;
        }

        if (connectedComponentType != 'Table') {
          /*
           * the component type is not Table so we will remove the
           * skipFirstRow, xColumn, and yColumn fields
           */
          delete connectedComponent.skipFirstRow;
          delete connectedComponent.xColumn;
          delete connectedComponent.yColumn;
        }

        if (connectedComponentType != 'Graph') {
          /*
           * the component type is not Graph so we will remove the
           * show classmate work fields
           */
          delete connectedComponent.showClassmateWorkSource;
        }

        if (connectedComponentType == 'Table') {
          // set default values for the connected component params
          connectedComponent.skipFirstRow = true;
          connectedComponent.xColumn = 0;
          connectedComponent.yColumn = 1;
        }

        // default the type to import work
        connectedComponent.type = 'importWork';
        this.authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent);

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Set the active series to the first series that the student can edit
     * or if there are no series the student can edit, set the active series
     * to the first series
     */

  }, {
    key: 'setDefaultActiveSeries',
    value: function setDefaultActiveSeries() {
      if (this.activeSeries == null && this.series.length > 0) {
        /*
         * the active series has not been set so we will set the active
         * series to the first series that the student can edit
         */

        // loop through all the series
        for (var s = 0; s < this.series.length; s++) {

          var tempSeries = this.series[s];

          if (tempSeries != null) {

            if (tempSeries.canEdit) {
              /*
               * the student can edit this series so we will make it
               * the active series
               */
              this.setActiveSeriesByIndex(s);
              break;
            }
          }
        }
      }

      if (this.activeSeries == null && this.series.length > 0) {
        /*
         * we did not find any series that the student can edit so we will
         * just set the active series to be the first series
         */
        this.setActiveSeriesByIndex(0);
      }
    }

    /**
     * Set the vertical plot line
     * @param x the x location to display the vertical plot line
     */

  }, {
    key: 'setVerticalPlotLine',
    value: function setVerticalPlotLine(x) {
      var _this11 = this;

      // make the plot line
      var plotLine = {
        color: 'red',
        width: 2,
        value: x,
        zIndex: 5

        // set the plot line into the plot lines array
      };this.plotLines = [plotLine];

      /*
       * Call $apply() so that the red plot line position gets updated. If we
       * don't call this, the line position won't get updated unless the student
       * moves their mouse around which forces angular to update.
       */
      this.$timeout(function () {
        _this11.$scope.$apply();
      });
    }

    /**
     * Import any work we need from connected components
     */

  }, {
    key: 'handleConnectedComponents',
    value: function handleConnectedComponents() {
      var _this12 = this;

      // get the connected components
      var connectedComponents = this.componentContent.connectedComponents;

      if (connectedComponents != null) {

        var mergedTrials = [];

        /*
         * This will hold all the promises that will return the trials
         * that we want. The trials will either be from this student
         * or from classmates.
         */
        var promises = [];

        /*
         * this will end up containing the background from the last
         * connected component
         */
        var connectedComponentBackgroundImage = null;

        // loop through all the connected components
        for (var c = 0; c < connectedComponents.length; c++) {
          var connectedComponent = connectedComponents[c];

          if (connectedComponent != null) {
            var nodeId = connectedComponent.nodeId;
            var componentId = connectedComponent.componentId;
            var type = connectedComponent.type;

            if (type == 'showClassmateWork') {
              // we are showing classmate work

              if (this.ConfigService.isPreview()) {
                /*
                 * we are in preview mode so we will just get the
                 * work for this student and show it
                 */

                // get the latest component state from the component
                var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);

                // get the trials from the component state
                promises.push(this.getTrialsFromComponentState(nodeId, componentId, componentState));

                // we are showing work so we will not allow the student to edit it
                this.isDisabled = true;

                if (componentState != null && componentState.studentData != null && componentState.studentData.backgroundImage != null) {
                  connectedComponentBackgroundImage = componentState.studentData.backgroundImage;
                }
              } else {
                /*
                 * showClassmateWorkSource determines whether to get
                 * work from the period or the whole class (all periods)
                 */
                var showClassmateWorkSource = connectedComponent.showClassmateWorkSource;

                // get the trials from the classmates
                promises.push(this.getTrialsFromClassmates(nodeId, componentId, showClassmateWorkSource));

                // we are showing work so we will not allow the student to edit it
                this.isDisabled = true;

                // get the connected component content
                var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
                if (component != null) {
                  // inject the asset paths so that the assets are absolute
                  component = this.ProjectService.injectAssetPaths(component);
                  connectedComponentBackgroundImage = component.backgroundImage;
                }
              }
            } else if (type == 'showWork' || type == 'importWork' || type == null) {
              // get the latest component state from the component
              var _componentState2 = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
              if (_componentState2 != null) {
                if (_componentState2.componentType == 'ConceptMap' || _componentState2.componentType == 'Draw' || _componentState2.componentType == 'Label') {
                  var _connectedComponent = this.UtilService.getConnectedComponentByComponentState(this.componentContent, _componentState2);
                  if (_connectedComponent.importWorkAsBackground === true) {
                    promises.push(this.setComponentStateAsBackgroundImage(_componentState2));
                  }
                } else {
                  // get the trials from the component state
                  promises.push(this.getTrialsFromComponentState(nodeId, componentId, _componentState2));

                  if (type == 'showWork') {
                    // we are showing work so we will not allow the student to edit it
                    this.isDisabled = true;
                  }

                  if (_componentState2 != null && _componentState2.studentData != null && _componentState2.studentData.backgroundImage != null) {
                    connectedComponentBackgroundImage = _componentState2.studentData.backgroundImage;
                  }
                }
              }
            }
          }
        }

        /*
         * wait for all the promises to resolve because we may need to
         * request the classmate work from the server
         */
        this.$q.all(promises).then(function (promiseResults) {
          /*
           * First we will accumulate all the trials into one new component state
           * and then we will perform connected component processing.
           */

          // this will hold all the trials
          var mergedTrials = [];

          /*
           * Loop through all the promise results. There will be a
           * promise result for each component we are importing from.
           * Each promiseResult is an array of trials or an image url.
           */
          var _iteratorNormalCompletion7 = true;
          var _didIteratorError7 = false;
          var _iteratorError7 = undefined;

          try {
            for (var _iterator7 = promiseResults[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
              var promiseResult = _step7.value;

              if (promiseResult instanceof Array) {
                var trials = promiseResult;
                // loop through all the trials from the component
                for (var t = 0; t < trials.length; t++) {
                  var trial = trials[t];

                  // add the trial to our array of merged trials
                  mergedTrials.push(trial);
                }
              } else if (typeof promiseResult === "string") {
                connectedComponentBackgroundImage = promiseResult;
              }
            }

            // create a new student data with all the trials
          } catch (err) {
            _didIteratorError7 = true;
            _iteratorError7 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion7 && _iterator7.return) {
                _iterator7.return();
              }
            } finally {
              if (_didIteratorError7) {
                throw _iteratorError7;
              }
            }
          }

          var studentData = {};
          studentData.trials = mergedTrials;
          studentData.version = 2;

          // create a new component state
          var newComponentState = _this12.NodeService.createNewComponentState();
          newComponentState.studentData = studentData;

          if (_this12.componentContent.backgroundImage != null && _this12.componentContent.backgroundImage != '') {
            // use the background image from this component
            newComponentState.studentData.backgroundImage = _this12.componentContent.backgroundImage;
          } else if (connectedComponentBackgroundImage != null) {
            // use the background image from the connected component
            newComponentState.studentData.backgroundImage = connectedComponentBackgroundImage;
          }

          newComponentState = _this12.handleConnectedComponentsHelper(newComponentState);

          // populate the component state into this component
          _this12.setStudentWork(newComponentState);
          _this12.studentDataChanged();
        });
      }
    }

    /**
     * Create an image from a component state and set the image as the background.
     * @param componentState A component state.
     * @return A promise that returns the url of the image that is generated from
     * the component state.
     */

  }, {
    key: 'setComponentStateAsBackgroundImage',
    value: function setComponentStateAsBackgroundImage(componentState) {
      return this.UtilService.generateImageFromComponentState(componentState).then(function (image) {
        return image.url;
      });
    }

    /**
     * Perform additional connected component processing.
     * @param newComponentState The new component state generated by accumulating
     * the trials from all the connected component student data.
     */

  }, {
    key: 'handleConnectedComponentsHelper',
    value: function handleConnectedComponentsHelper(newComponentState) {
      var mergedComponentState = this.$scope.componentState;
      var firstTime = true;
      if (mergedComponentState == null) {
        mergedComponentState = newComponentState;
      } else {
        /*
         * This component has previous student data so this is not the first time
         * this component is being loaded.
         */
        firstTime = false;
      }
      var connectedComponents = this.componentContent.connectedComponents;
      if (connectedComponents != null) {
        var componentStates = [];
        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = connectedComponents[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var connectedComponent = _step8.value;

            if (connectedComponent != null) {
              var nodeId = connectedComponent.nodeId;
              var componentId = connectedComponent.componentId;
              var type = connectedComponent.type;
              var mergeFields = connectedComponent.mergeFields;
              if (type == 'showWork') {
                var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
                if (componentState != null) {
                  componentStates.push(this.UtilService.makeCopyOfJSONObject(componentState));
                }
                // we are showing work so we will not allow the student to edit it
                this.isDisabled = true;
              } else if (type == 'showClassmateWork') {
                mergedComponentState = newComponentState;
              } else if (type == 'importWork' || type == null) {
                var connectedComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
                var fields = connectedComponent.fields;
                if (connectedComponentState != null) {
                  // the connected component has student work
                  mergedComponentState = this.mergeComponentState(mergedComponentState, connectedComponentState, fields, firstTime);
                } else {
                  // the connected component does not have student work
                  mergedComponentState = this.mergeNullComponentState(mergedComponentState, fields, firstTime);
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError8 = true;
          _iteratorError8 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion8 && _iterator8.return) {
              _iterator8.return();
            }
          } finally {
            if (_didIteratorError8) {
              throw _iteratorError8;
            }
          }
        }

        if (mergedComponentState.studentData.version == null) {
          mergedComponentState.studentData.version = this.studentDataVersion;
        }
        if (newComponentState.studentData.backgroundImage != null) {
          mergedComponentState.studentData.backgroundImage = newComponentState.studentData.backgroundImage;
        }

        if (mergedComponentState != null) {
          this.setStudentWork(mergedComponentState);
          this.studentDataChanged();
        }
      }
      return mergedComponentState;
    }

    /**
     * Merge the component state from the connected component into the component
     * state from this component.
     * @param baseComponentState The component state from this component.
     * @param connectedComponentState The component state from the connected component.
     * @param mergeFields (optional) An array of objects that specify which fields
     * to look at in the connectedComponentState. Each object can contain 3 fields which
     * are "name", "when", "action".
     * - "name" is the name of the field in the connectedComponentState.studentData object
     *   For example, if connectedComponentState is from a Graph component, we may author the value to be "trials"
     * - "when" possible values
     *     "firstTime" means we merge the "name" field only the first time we visit the component
     *     "always" means we merge the "name" field every time we visit the component
     * - "action" possible values
     *     "read" means we look at the value of the "name" field and perform processing on it to generate
     *       some value that we will set into the baseComponentState
     *     "write" means we copy the value of the "name" field from connectedComponentState.studentData to
     *       baseComponentState.studentData
     * @param firstTime Whether this is the first time this component is being
     * visited.
     * @return The merged component state.
     */

  }, {
    key: 'mergeComponentState',
    value: function mergeComponentState(baseComponentState, connectedComponentState, mergeFields, firstTime) {
      if (mergeFields == null) {
        if (connectedComponentState.componentType == 'Graph' && firstTime) {
          // there are no merge fields specified so we will get all of the fields
          baseComponentState.studentData = this.UtilService.makeCopyOfJSONObject(connectedComponentState.studentData);
        }
      } else {
        // we will merge specific fields
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = mergeFields[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var mergeField = _step9.value;

            var name = mergeField.name;
            var when = mergeField.when;
            var action = mergeField.action;
            if (when == 'firstTime' && firstTime) {
              if (action == 'write') {
                baseComponentState.studentData[name] = connectedComponentState.studentData[name];
              } else if (action == 'read') {
                // TODO
              }
            } else if (when == 'always') {
              if (action == 'write') {
                baseComponentState.studentData[name] = connectedComponentState.studentData[name];
              } else if (action == 'read') {
                this.readConnectedComponentField(baseComponentState, connectedComponentState, name);
              }
            }
          }
        } catch (err) {
          _didIteratorError9 = true;
          _iteratorError9 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion9 && _iterator9.return) {
              _iterator9.return();
            }
          } finally {
            if (_didIteratorError9) {
              throw _iteratorError9;
            }
          }
        }
      }
      return baseComponentState;
    }

    /**
     * We want to merge the component state from the connected component into this
     * component but the connected component does not have any work. We will
     * instead use default values.
     * @param baseComponentState The component state from this component.
     * @param mergeFields (optional) An array of objects that specify which fields
     * to look at. (see comment for mergeComponentState() for more information).
     * @param firstTime Whether this is the first time this component is being
     * visited.
     * @return The merged component state.
     */

  }, {
    key: 'mergeNullComponentState',
    value: function mergeNullComponentState(baseComponentState, mergeFields, firstTime) {
      var newComponentState = null;
      if (mergeFields == null) {
        // TODO
      } else {
        // we will merge specific fields
        var _iteratorNormalCompletion10 = true;
        var _didIteratorError10 = false;
        var _iteratorError10 = undefined;

        try {
          for (var _iterator10 = mergeFields[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
            var mergeField = _step10.value;

            var name = mergeField.name;
            var when = mergeField.when;
            var action = mergeField.action;

            if (when == 'firstTime' && firstTime == true) {
              if (action == 'write') {
                // TODO
              } else if (action == 'read') {
                // TODO
              }
            } else if (when == 'always') {
              if (action == 'write') {
                // TODO
              } else if (action == 'read') {
                var connectedComponentState = null;
                this.readConnectedComponentField(baseComponentState, connectedComponentState, name);
              }
            }
          }
        } catch (err) {
          _didIteratorError10 = true;
          _iteratorError10 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion10 && _iterator10.return) {
              _iterator10.return();
            }
          } finally {
            if (_didIteratorError10) {
              throw _iteratorError10;
            }
          }
        }
      }
      return baseComponentState;
    }

    /**
     * Read the field from the connected component's component state.
     * @param baseComponentState The component state from this component.
     * @param connectedComponentState The component state from the connected component.
     * @param field The field to look at in the connected component's component
     * state.
     */

  }, {
    key: 'readConnectedComponentField',
    value: function readConnectedComponentField(baseComponentState, connectedComponentState, field) {
      if (field == 'selectedCells') {
        if (connectedComponentState == null) {
          // we will default to hide all the trials
          var _iteratorNormalCompletion11 = true;
          var _didIteratorError11 = false;
          var _iteratorError11 = undefined;

          try {
            for (var _iterator11 = baseComponentState.studentData.trials[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
              var trial = _step11.value;

              trial.show = false;
            }
          } catch (err) {
            _didIteratorError11 = true;
            _iteratorError11 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion11 && _iterator11.return) {
                _iterator11.return();
              }
            } finally {
              if (_didIteratorError11) {
                throw _iteratorError11;
              }
            }
          }
        } else {
          /*
           * loop through all the trials and show the ones that are in the
           * selected cells array.
           */
          var studentData = connectedComponentState.studentData;
          var selectedCells = studentData[field];
          var selectedTrialIds = this.convertSelectedCellsToTrialIds(selectedCells);
          var _iteratorNormalCompletion12 = true;
          var _didIteratorError12 = false;
          var _iteratorError12 = undefined;

          try {
            for (var _iterator12 = baseComponentState.studentData.trials[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
              var _trial = _step12.value;

              if (selectedTrialIds.includes(_trial.id)) {
                _trial.show = true;
              } else {
                _trial.show = false;
              }
            }
          } catch (err) {
            _didIteratorError12 = true;
            _iteratorError12 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion12 && _iterator12.return) {
                _iterator12.return();
              }
            } finally {
              if (_didIteratorError12) {
                throw _iteratorError12;
              }
            }
          }
        }
      } else if (field == 'trial') {
        // TODO
      }
    }

    /**
     * The showClassmateWork value has changed in a connected component
     * @param connectedComponent the connected component that changed
     */

  }, {
    key: 'connectedComponentShowClassmateWorkChanged',
    value: function connectedComponentShowClassmateWorkChanged(connectedComponent) {

      if (connectedComponent != null) {

        if (connectedComponent.showClassmateWork) {
          /*
           * show classmate work was enabled so we will default the
           * show classmate work source to period
           */
          connectedComponent.showClassmateWorkSource = 'period';
        } else {
          /*
           * the show classmate work was disabled so we will remove
           * the show classmate work fields
           */
          delete connectedComponent.showClassmateWork;
          delete connectedComponent.showClassmateWorkSource;
        }

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * If the component type is a certain type, we will set the importWorkAsBackground
     * field to true.
     * @param connectedComponent The connected component object.
     */

  }, {
    key: 'authoringSetImportWorkAsBackgroundIfApplicable',
    value: function authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent) {
      var componentType = this.authoringGetConnectedComponentType(connectedComponent);
      if (componentType == 'ConceptMap' || componentType == 'Draw' || componentType == 'Label') {
        connectedComponent.importWorkAsBackground = true;
      } else {
        delete connectedComponent.importWorkAsBackground;
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
          delete connectedComponent.showClassmateWorkSource;
        } else if (connectedComponent.type == 'showWork') {
          /*
           * the type has changed to show work
           */
          delete connectedComponent.showClassmateWorkSource;
        } else if (connectedComponent.type == 'showClassmateWork') {
          /*
           * the type has changed to show classmate work so we will enable
           * trials so that each classmate work will show up in a
           * different trial
           */
          this.authoringComponentContent.enableTrials = true;

          if (connectedComponent.showClassmateWorkSource == null) {
            connectedComponent.showClassmateWorkSource = 'period';
          }
        }

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * The undo button was clicked
     */

  }, {
    key: 'undoClicked',
    value: function undoClicked() {

      if (this.undoStack != null && this.undoStack.length > 0) {
        // there are component states on the undo stack

        // get the previous component state
        var previousComponentState = this.undoStack.pop();

        if (previousComponentState != null) {

          // load the previous component state
          this.setStudentWork(previousComponentState);

          // remember this previous component state
          this.previousComponentState = previousComponentState;

          // re-render the graph
          this.setupGraph();
        }
      } else {
        // there are no previous component states

        // check if there was a component state when this component loaded
        if (this.initialComponentState == null) {

          // there is no previous component state now
          this.previousComponentState = null;

          /*
           * there was no initial component state so we can just
           * reset the graph
           */

          // remove all the trials
          this.trials = [];

          // create a blank trial
          this.newTrial();

          // reset the series
          this.resetSeriesHelper();

          // re-render the graph
          this.setupGraph();
        }
      }
    }

    /**
     * A trial checkbox was clicked to hide or show a trial
     */

  }, {
    key: 'trialCheckboxClicked',
    value: function trialCheckboxClicked() {

      /*
       * set the flag to add the next component state created in
       * studentDataChanged() to the undo stack
       */
      this.addNextComponentStateToUndoStack = true;
    }

    /**
     * Add a tag
     */

  }, {
    key: 'addTag',
    value: function addTag() {

      if (this.authoringComponentContent.tags == null) {
        // initialize the tags array
        this.authoringComponentContent.tags = [];
      }

      // add a tag
      this.authoringComponentContent.tags.push('');

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Move a tag up
     * @param index the index of the tag to move up
     */

  }, {
    key: 'moveTagUp',
    value: function moveTagUp(index) {

      if (index > 0) {
        // the index is not at the top so we can move it up

        // remember the tag
        var tag = this.authoringComponentContent.tags[index];

        // remove the tag
        this.authoringComponentContent.tags.splice(index, 1);

        // insert the tag one index back
        this.authoringComponentContent.tags.splice(index - 1, 0, tag);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Move a tag down
     * @param index the index of the tag to move down
     */

  }, {
    key: 'moveTagDown',
    value: function moveTagDown(index) {

      if (index < this.authoringComponentContent.tags.length - 1) {
        // the index is not at the bottom so we can move it down

        // remember the tag
        var tag = this.authoringComponentContent.tags[index];

        // remove the tag
        this.authoringComponentContent.tags.splice(index, 1);

        // insert the tag one index forward
        this.authoringComponentContent.tags.splice(index + 1, 0, tag);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Delete a tag
     * @param index the index of the tag to delete
     */

  }, {
    key: 'deleteTag',
    value: function deleteTag(index) {

      // ask the author if they are sure they want to delete the tag
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisTag'));

      if (answer) {
        // the author answered yes to delete the tag

        // remove the tag
        this.authoringComponentContent.tags.splice(index, 1);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
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
     * Get the category name given the index of the category on the x axis
     * @param index the index of the category
     * @return the category name at the given index
     */

  }, {
    key: 'getCategoryByIndex',
    value: function getCategoryByIndex(index) {

      var category = null;

      if (this.componentContent.xAxis != null && this.componentContent.xAxis.categories != null && index < this.componentContent.xAxis.categories.length) {

        category = this.componentContent.xAxis.categories[index];
      }

      return category;
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

    /**
     * Whether we are showing a plot line where the mouse is.
     * @return True if we are showing a plot line on the x or y axis where the
     * mouse is.
     */

  }, {
    key: 'isMousePlotLineOn',
    value: function isMousePlotLineOn() {
      if (this.isMouseXPlotLineOn() || this.isMouseYPlotLineOn()) {
        return true;
      } else {
        return false;
      }
    }

    /**
     * @return Whether we are showing the vertical plot line on the graph.
     */

  }, {
    key: 'isMouseXPlotLineOn',
    value: function isMouseXPlotLineOn() {
      return this.componentContent.showMouseXPlotLine;
    }

    /**
     * @return Whether we are showing the horizontal plot line on the graph.
     */

  }, {
    key: 'isMouseYPlotLineOn',
    value: function isMouseYPlotLineOn() {
      return this.componentContent.showMouseYPlotLine;
    }

    /**
     * @return Whether we are saving the mouse points in the component state.
     */

  }, {
    key: 'isSaveMouseOverPoints',
    value: function isSaveMouseOverPoints() {
      return this.componentContent.saveMouseOverPoints;
    }

    /**
     * Get the x value from the data point.
     * @param dataPoint An object or an array that represents a data point.
     * @return A number or null if there is no x value.
     */

  }, {
    key: 'getXValueFromDataPoint',
    value: function getXValueFromDataPoint(dataPoint) {
      if (dataPoint.constructor.name == 'Object') {
        return dataPoint.x;
      } else if (dataPoint.constructor.name == 'Array') {
        return dataPoint[0];
      }
      return null;
    }

    /**
     * Get the y value from the data point.
     * @param dataPoint An object or an array that represents a data point.
     * @return A number or null if there is no y value.
     */

  }, {
    key: 'getYValueFromDataPoint',
    value: function getYValueFromDataPoint(dataPoint) {
      if (dataPoint.constructor.name == 'Object') {
        return dataPoint.y;
      } else if (dataPoint.constructor.name == 'Array') {
        return dataPoint[1];
      }
      return null;
    }

    /**
     * @return The x value of the latest mouse over point.
     */

  }, {
    key: 'getLatestMouseOverPointX',
    value: function getLatestMouseOverPointX() {
      if (this.mouseOverPoints.length > 0) {
        /*
         * The latestMouseOverPoint is an array with the 0 element being x and the
         * 1 element being y.
         */
        return this.getXValueFromDataPoint(this.mouseOverPoints[this.mouseOverPoints.length - 1]);
      }
      return null;
    }

    /**
     * @return The y value of the latest mouse over point.
     */

  }, {
    key: 'getLatestMouseOverPointY',
    value: function getLatestMouseOverPointY() {
      if (this.mouseOverPoints.length > 0) {
        /*
         * The latestMouseOverPoint is an array with the 0 element being x and the
         * 1 element being y.
         */
        return this.getYValueFromDataPoint(this.mouseOverPoints[this.mouseOverPoints.length - 1]);
      }
      return null;
    }

    /**
     * Show the x plot line if it is enabled.
     * @param text The text to show on the plot line.
     */

  }, {
    key: 'showXPlotLineIfOn',
    value: function showXPlotLineIfOn() {
      var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (this.isMouseXPlotLineOn()) {
        // show the previous x plot line or default to 0
        var x = this.getLatestMouseOverPointX();
        if (x == null) {
          x == 0;
        }
        this.showXPlotLine(x, text);
      }
    }

    /**
     * Show the y plot line if it is enabled.
     * @param text The text to show on the plot line.
     */

  }, {
    key: 'showYPlotLineIfOn',
    value: function showYPlotLineIfOn() {
      var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (this.isMouseYPlotLineOn()) {
        // show the previous y plot line or default to 0
        var y = this.getLatestMouseOverPointY();
        if (y == null) {
          y == 0;
        }
        this.showYPlotLine(y, text);
      }
    }

    /**
     * Show the tooltip on the point with the given x value.
     * @param seriesId The id of the series.
     * @param x The x value we want to show the tooltip on.
     */

  }, {
    key: 'showTooltipOnX',
    value: function showTooltipOnX(seriesId, x) {
      var chart = $('#' + this.chartId).highcharts();
      if (chart.series.length > 0) {
        var series = null;
        if (seriesId == null) {
          series = chart.series[chart.series.length - 1];
        } else {
          var _iteratorNormalCompletion13 = true;
          var _didIteratorError13 = false;
          var _iteratorError13 = undefined;

          try {
            for (var _iterator13 = chart.series[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
              var tempSeries = _step13.value;

              if (tempSeries.userOptions.name == seriesId) {
                series = tempSeries;
              }
            }
          } catch (err) {
            _didIteratorError13 = true;
            _iteratorError13 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion13 && _iterator13.return) {
                _iterator13.return();
              }
            } finally {
              if (_didIteratorError13) {
                throw _iteratorError13;
              }
            }
          }
        }
        var points = series.points;
        var _iteratorNormalCompletion14 = true;
        var _didIteratorError14 = false;
        var _iteratorError14 = undefined;

        try {
          for (var _iterator14 = points[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
            var point = _step14.value;

            if (point.x == x) {
              chart.tooltip.refresh(point);
            }
          }
        } catch (err) {
          _didIteratorError14 = true;
          _iteratorError14 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion14 && _iterator14.return) {
              _iterator14.return();
            }
          } finally {
            if (_didIteratorError14) {
              throw _iteratorError14;
            }
          }
        }
      }
    }

    /**
     * Highlight the point with the given x value.
     * @param seriesId The id of the series.
     * @param x The x value we want to highlight.
     */

  }, {
    key: 'highlightPointOnX',
    value: function highlightPointOnX(seriesId, x) {
      var chart = $('#' + this.chartId).highcharts();
      if (chart.series.length > 0) {
        var series = null;
        if (seriesId == null) {
          series = chart.series[chart.series.length - 1];
        } else {
          var _iteratorNormalCompletion15 = true;
          var _didIteratorError15 = false;
          var _iteratorError15 = undefined;

          try {
            for (var _iterator15 = chart.series[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
              var tempSeries = _step15.value;

              if (tempSeries.userOptions.name == seriesId) {
                series = tempSeries;
              }
              // remove the hover state from the other points
              var _iteratorNormalCompletion16 = true;
              var _didIteratorError16 = false;
              var _iteratorError16 = undefined;

              try {
                for (var _iterator16 = tempSeries.points[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                  var point = _step16.value;

                  point.setState('');
                }
              } catch (err) {
                _didIteratorError16 = true;
                _iteratorError16 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion16 && _iterator16.return) {
                    _iterator16.return();
                  }
                } finally {
                  if (_didIteratorError16) {
                    throw _iteratorError16;
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError15 = true;
            _iteratorError15 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion15 && _iterator15.return) {
                _iterator15.return();
              }
            } finally {
              if (_didIteratorError15) {
                throw _iteratorError15;
              }
            }
          }
        }
        var points = series.points;
        var _iteratorNormalCompletion17 = true;
        var _didIteratorError17 = false;
        var _iteratorError17 = undefined;

        try {
          for (var _iterator17 = points[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
            var _point = _step17.value;

            if (_point.x == x) {
              // make the point larger and also have a highlight around it
              _point.setState('hover');
            }
          }
        } catch (err) {
          _didIteratorError17 = true;
          _iteratorError17 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion17 && _iterator17.return) {
              _iterator17.return();
            }
          } finally {
            if (_didIteratorError17) {
              throw _iteratorError17;
            }
          }
        }
      }
    }

    /**
     * Show the tooltip on the newest point.
     */

  }, {
    key: 'showTooltipOnLatestPoint',
    value: function showTooltipOnLatestPoint() {
      var chart = $('#' + this.chartId).highcharts();
      if (chart.series.length > 0) {
        var latestSeries = chart.series[chart.series.length - 1];
        var points = latestSeries.points;
        if (points.length > 0) {
          var latestPoint = points[points.length - 1];
          chart.tooltip.refresh(latestPoint);
        }
      }
    }

    /**
     * Convert the selected cells array into an array of trial ids.
     * @param selectedCells An array of objects representing selected cells.
     * @return An array of trial id strings.
     */

  }, {
    key: 'convertSelectedCellsToTrialIds',
    value: function convertSelectedCellsToTrialIds(selectedCells) {
      var selectedTrialIds = [];
      if (selectedCells != null) {
        var _iteratorNormalCompletion18 = true;
        var _didIteratorError18 = false;
        var _iteratorError18 = undefined;

        try {
          for (var _iterator18 = selectedCells[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
            var selectedCell = _step18.value;

            var material = selectedCell.material;
            var bevTemp = selectedCell.bevTemp;
            var airTemp = selectedCell.airTemp;
            var selectedTrialId = material + '-' + bevTemp + 'Liquid';
            selectedTrialIds.push(selectedTrialId);
          }
        } catch (err) {
          _didIteratorError18 = true;
          _iteratorError18 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion18 && _iterator18.return) {
              _iterator18.return();
            }
          } finally {
            if (_didIteratorError18) {
              throw _iteratorError18;
            }
          }
        }
      }
      return selectedTrialIds;
    }

    /**
     * The "Import Work As Background" checkbox was clicked.
     * @param connectedComponent The connected component associated with the
     * checkbox.
     */

  }, {
    key: 'authoringImportWorkAsBackgroundClicked',
    value: function authoringImportWorkAsBackgroundClicked(connectedComponent) {
      if (!connectedComponent.importWorkAsBackground) {
        delete connectedComponent.importWorkAsBackground;
      }
      this.authoringViewComponentChanged();
    }
  }]);

  return GraphController;
}(_componentController2.default);

GraphController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', 'AnnotationService', 'ConfigService', 'GraphService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = GraphController;
//# sourceMappingURL=graphController.js.map
