'use strict';

import ComponentController from "../componentController";
import html2canvas from 'html2canvas';

class GraphController extends ComponentController {
  constructor($filter,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      $timeout,
      AnnotationService,
      ConfigService,
      GraphService,
      NodeService,
      NotebookService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService) {
    super($filter, $mdDialog, $rootScope, $scope,
        AnnotationService, ConfigService, NodeService,
        NotebookService, ProjectService, StudentAssetService,
        StudentDataService, UtilService);
    this.$q = $q;
    this.$timeout = $timeout;
    this.GraphService = GraphService;

    // the graph type
    this.graphType = null;

    // holds all the series
    this.series = [];

    // which color the series will be in
    this.seriesColors = ['blue', 'red', 'green', 'orange', 'purple', 'black'];

    // series marker options
    this.seriesMarkers = ['circle', 'square', 'diamond', 'triangle', 'triangle-down', 'circle'];

    // will hold the active series
    this.activeSeries = null;

    // the latest annotations
    this.latestAnnotations = null;

    // whether the reset graph button is shown or not
    this.isResetGraphButtonVisible = false;

    // whether the select series input is shown or not
    this.isSelectSeriesVisible = false;

    // the label for the notebook in the project
    this.notebookConfig = this.NotebookService.getNotebookConfig();

    // whether to only show the new trial when a new trial is created
    this.hideAllTrialsOnNewTrial = true;

    // whether to show the undo button
    this.showUndoButton = false;

    this.legendEnabled = true;

    this.hasCustomLegendBeenSet = false;

    this.showTrialSelect = true;

    // the id of the chart element
    this.chartId = 'chart1';



    // the width of the graph
    this.width = null;

    // the height of the graph
    this.height = null;

    /*
     * get the original component content. this is used when showing
     * previous work from another component.
     */
    this.originalComponentContent = this.$scope.originalComponentContent;

    this.trials = [];
    this.activeTrial = null;
    this.trialIdsToShow = [];
    this.selectedTrialsText = '';

    this.studentDataVersion = 2;

    this.canCreateNewTrials = false;
    this.canDeleteTrials = false;

    this.uploadedFileName = null;

    this.backgroundImage = null;

    /*
     * An array to store the component states for the student to undo.
     * The undoStack will contain the component states from the current
     * visit except for the current component state.
     */
    this.undoStack = [];

    // used to hold the component state that is loaded when this component loads
    this.initialComponentState = null;

    /*
     * whether to add the next component state created in
     * studentDataChanged() to the undoStack
     */
    this.addNextComponentStateToUndoStack = false;

    this.mouseOverPoints = [];


    // set the chart id
    this.chartId = 'chart_' + this.componentId;

    // get the graph type
    this.graphType = this.componentContent.graphType;

    if (this.graphType == null) {
      // there is no graph type so we will default to line plot
      this.graphType = 'line';
    }

    if (this.componentContent.canCreateNewTrials) {
      this.canCreateNewTrials = this.componentContent.canCreateNewTrials;
    }

    if (this.componentContent.canDeleteTrials) {
      this.canDeleteTrials = this.componentContent.canDeleteTrials;
    }

    if (this.componentContent.hideAllTrialsOnNewTrial === false) {
      this.hideAllTrialsOnNewTrial = false;
    }

    if (this.mode === 'student') {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.isResetSeriesButtonVisible = true;
      this.isSelectSeriesVisible = true;

      // get the latest annotations
      // TODO: watch for new annotations and update accordingly
      this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
      this.backgroundImage = this.componentContent.backgroundImage;
    } else if (this.mode === 'grading' || this.mode === 'gradingRevision') {
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      //this.isResetGraphButtonVisible = false;
      this.isResetSeriesButtonVisible = false;
      this.isSelectSeriesVisible = false;
      this.isDisabled = true;

      // get the component state from the scope
      let componentState = this.$scope.componentState;

      if (componentState != null) {
        // create a unique id for the chart element using this component state
        this.chartId = 'chart_' + componentState.id;
        if (this.mode === 'gradingRevision') {
          this.chartId = 'chart_gradingRevision_' + componentState.id;
        }
      }

      if (this.mode === 'grading') {
        // get the latest annotations
        this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
      }
    } else if (this.mode === 'onlyShowWork') {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isResetGraphButtonVisible = false;
      this.isResetSeriesButtonVisible = false;
      this.isSelectSeriesVisible = false;
      this.isDisabled = true;
      this.backgroundImage = this.componentContent.backgroundImage;
    } else if (this.mode === 'showPreviousWork') {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isDisabled = true;
      this.backgroundImage = this.componentContent.backgroundImage;
    }

    // get the component state from the scope
    let componentState = this.$scope.componentState;

    // set whether studentAttachment is enabled
    this.isStudentAttachmentEnabled = this.componentContent.isStudentAttachmentEnabled;

    if (this.mode == 'student') {
      if (!this.GraphService.componentStateHasStudentWork(componentState, this.componentContent)) {
        this.newTrial();
      }
      if (this.UtilService.hasConnectedComponentAlwaysField(this.componentContent)) {
        /*
         * This component has a connected component that we always want to look at for
         * merging student data.
         */
        this.handleConnectedComponents();
      } else if (this.GraphService.componentStateHasStudentWork(componentState, this.componentContent)) {
        // this student has previous work so we will load it
        this.setStudentWork(componentState);
      } else if (this.UtilService.hasConnectedComponent(this.componentContent)) {
        /*
         * This student doesn't have any previous work but this component has connected components
         * so we will get the work from the connected component.
         */
        this.handleConnectedComponents();
      }
    } else {
      // populate the student work into this component
      this.setStudentWork(componentState);
    }

    if (componentState != null) {
      // there is an initial component state so we will remember it
      this.initialComponentState = componentState;

      /*
       * remember this component state as the previous component
       * state for undo purposes
       */
      this.previousComponentState = componentState;
    }

    // check if the student has used up all of their submits
    if (this.componentContent.maxSubmitCount != null && this.submitCounter >= this.componentContent.maxSubmitCount) {
      /*
       * the student has used up all of their chances to submit so we
       * will disable the submit button
       */
      this.isSubmitButtonDisabled = true;
    }

    if (this.componentContent.hideLegend) {
      this.legendEnabled = false;
    }

    if (this.componentContent.hideTrialSelect) {
      this.showTrialSelect = false;
    }

    this.disableComponentIfNecessary();

    // setup the graph
    this.setupGraph().then(() => {
      this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: this.nodeId, componentId: this.componentId });
    });

    if (this.$scope.$parent.nodeController != null) {
      // register this component with the parent node
      this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
    }

    /**
     * A connected component has changed its student data so we will
     * perform any necessary changes to this component
     * @param connectedComponent the connected component
     * @param connectedComponentParams the connected component params
     * @param componentState the student data from the connected
     * component that has changed
     */
    this.$scope.handleConnectedComponentStudentDataChanged = function(connectedComponent, connectedComponentParams, componentState) {

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
            let studentData = componentState.studentData;
            this.processConnectedComponentStudentData(studentData, connectedComponentParams);
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
    }.bind(this);

    /**
     * Get the component state from this component. The parent node will
     * call this function to obtain the component state when it needs to
     * save student data.
     * @param isSubmit boolean whether the request is coming from a submit
     * action (optional; default is false)
     * @return a component state containing the student data
     */
    this.$scope.getComponentState = function(isSubmit) {
      var deferred = this.$q.defer();
      let getState = false;
      let action = 'change';

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
        this.$scope.graphController.createComponentState(action).then((componentState) => {
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
    }.bind(this);

    /*
     * Handle the delete key pressed event
     */
    this.deleteKeyPressedListenerDestroyer = this.$scope.$on('deleteKeyPressed', () => {
      this.handleDeleteKeyPressed();
    });

    /**
     * Listen for the 'exitNode' event which is fired when the student
     * exits the parent node. This will perform any necessary cleanup
     * when the student exits the parent node.
     */
    this.$scope.$on('exitNode', angular.bind(this, function(event, args) {
      // destroy the delete key pressed listener
      this.deleteKeyPressedListenerDestroyer();
    }));

    /**
     * The student has changed the file input
     * @param element the file input element
     */
    this.$scope.fileUploadChanged = function(element) {

      var overwrite = true;

      // check if the active series already has data
      if (this.graphController != null &&
        this.graphController.activeSeries != null &&
        this.graphController.activeSeries.data != null) {

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
          reader.onload = function() {

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
          }

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
    }
  }

  handleNodeSubmit() {
    this.submit('nodeSubmitButton');
  }

  /**
   * Set up the mouse over listener which will be used to draw plot lines at the
   * mouse position.
   */
  setupMouseMoveListener() {

    // Make sure we only add the listeners once.
    if (!this.setupMouseMoveListenerDone) {

      /*
       * Remove all existing listeners on the chart div to make sure we don't
       * bind a listener multiple times.
       */
      $('#' + this.chartId).unbind();

      $('#' + this.chartId).bind('mousedown', (e) => {
        this.mouseDown = true;
        this.mouseDownEventOccurred(e);
      });

      $('#' + this.chartId).bind('mouseup', (e) => {
        this.mouseDown = false;
      });

      $('#' + this.chartId).bind('mousemove', (e) => {
        if (this.mouseDown) {
          this.mouseDownEventOccurred(e);
        }
      });

      $('#' + this.chartId).bind('mouseleave', (e) => {
        this.mouseDown = false;
      });

      this.setupMouseMoveListenerDone = true;
    }
  }

  /**
   * The student has moved the mouse while holding the mouse button down.
   * @param e The mouse event.
   */
  mouseDownEventOccurred(e) {
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

    let chart = $('#' + this.chartId).highcharts();

    // handle the x position of the mouse
    let chartXAxis = chart.xAxis[0];
    let x = chartXAxis.toValue(e.offsetX, false);
    x = this.makeSureXIsWithinXMinMaxLimits(x);
    if (this.componentContent.showMouseXPlotLine) {
      this.showXPlotLine(x);
    }

    // handle the y position of the mouse
    let chartYAxis = chart.yAxis[0];
    let y = chartYAxis.toValue(e.offsetY, false);
    y = this.makeSureYIsWithinYMinMaxLimits(y);
    if (this.componentContent.showMouseYPlotLine) {
      this.showYPlotLine(y);
    }

    if (this.componentContent.saveMouseOverPoints) {
      /*
       * Make sure we aren't saving the points too frequently. We want to avoid
       * saving too many unnecessary data points.
       */
      let currentTimestamp = new Date().getTime();

      /*
       * Make sure this many milliseconds has passed before saving another mouse
       * over point.
       */
      let timeBetweenSendingMouseOverPoints = 200;

      if (this.lastSavedMouseMoveTimestamp == null ||
            currentTimestamp - this.lastSavedMouseMoveTimestamp > timeBetweenSendingMouseOverPoints) {
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
  showXPlotLine(x, text) {
    let chart = $('#' + this.chartId).highcharts();
    let chartXAxis = chart.xAxis[0];
    chartXAxis.removePlotLine('plot-line-x');
    let plotLine = {
        value: x,
        color: 'red',
        width: 4,
        id: 'plot-line-x'
    };
    if (text != null && text != '') {
      plotLine.label = {
        text: text,
        verticalAlign: 'top'
      }
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
  drawRangeRectangle(xMin, xMax, yMin, yMax,
      strokeColor = 'black', strokeWidth = '.5',
      fillColor = 'black', fillOpacity = '.1') {

    let chart = $('#' + this.chartId).highcharts();

    // convert the x and y values to pixel values
    xMin = chart.xAxis[0].translate(xMin);
    xMax = chart.xAxis[0].translate(xMax);
    yMin = chart.yAxis[0].translate(yMin);
    yMax = chart.yAxis[0].translate(yMax);

    // create the rectangle if it hasn't been created before
    if (this.rectangle == null) {
      this.rectangle = chart.renderer.rect(0,0,0,0,0).css({
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
  showYPlotLine(y, text) {
    let chart = $('#' + this.chartId).highcharts();
    let chartYAxis = chart.yAxis[0];
    chartYAxis.removePlotLine('plot-line-y');
    let plotLine = {
        value: y,
        color: 'red',
        width: 2,
        id: 'plot-line-y'
    };
    if (text != null && text != '') {
      plotLine.label = {
        text: text,
        align: 'right'
      }
    }
    chartYAxis.addPlotLine(plotLine);
  }

  /**
   * Clear the x and y plot lines on the graph.
   */
  clearPlotLines() {
    let chart = Highcharts.charts[0];
    let chartXAxis = chart.xAxis[0];
    chartXAxis.removePlotLine('plot-line-x');
    let chartYAxis = chart.yAxis[0];
    chartYAxis.removePlotLine('plot-line-y');
  }

  /**
   * If the x value is not within the x min and max limits, we will modify the
   * x value to be at the limit.
   * @param x the x value
   * @return an x value between the x min and max limits
   */
  makeSureXIsWithinXMinMaxLimits(x) {
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
  makeSureYIsWithinYMinMaxLimits(y) {
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
  addMouseOverPoint(x, y) {
    let mouseOverPoint = [x, y];
    this.mouseOverPoints.push(mouseOverPoint);
  }

  /**
   * Setup the graph
   * @param useTimeout whether to call the setupGraphHelper() function in
   * a timeout callback
   */
  setupGraph(useTimeout) {

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
      this.$timeout(() => {
        this.setupGraphHelper(deferred);
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
  setupGraphHelper(deferred) {

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
      if (this.componentContent.xAxis != null &&
          this.componentContent.xAxis.plotBands != null) {
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

            if (trial.xAxis != null &&
                trial.xAxis.plotBands != null) {
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
    let timeout = this.$timeout;

    if (this.plotLines != null) {
      // set the plot lines
      xAxis.plotLines = this.plotLines;
    }

    // let user zoom the graph in the grading tool by clicking and dragging with mouse
    // TODO: provide authoring option to allow zooming for students?
    let zoomType = this.mode === 'grading' || this.mode === 'gradingRevision' ? 'xy' : null;

    let legendEnabled = this.legendEnabled;

    this.chartConfig = {
      options: {
        legend: {
          enabled: legendEnabled
        },
        tooltip: {
          formatter: function(){
            if (this.series != null) {
              var text = '';

              var xText = '';
              var yText = '';

              var xAxisUnits = '';
              var yAxisUnits = '';

              if (this.series.xAxis != null &&
                this.series.xAxis.userOptions != null &&
                this.series.xAxis.userOptions.units != null) {

                // get the x axis units
                xAxisUnits = this.series.xAxis.userOptions.units;
              }
              if (this.series.yAxis != null &&
                this.series.yAxis.userOptions != null &&
                this.series.yAxis.userOptions.units != null) {

                // get the y axis units
                yAxisUnits = this.series.yAxis.userOptions.units;
              }

              if (thisGraphController.xAxis.type == null ||
                thisGraphController.xAxis.type === '' ||
                thisGraphController.xAxis.type === 'limits') {


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
            load: function() {
              deferred.resolve(this);
            },
            click: function(e) {
              if (thisGraphController.graphType == 'line' ||
                thisGraphController.graphType == 'scatter') {
                // only attempt to add a new point if the graph type is line or scatter

                // get the current time
                var currentTime = new Date().getTime();

                // check if a drop event recently occurred
                if (thisGraphController.lastDropTime != null) {

                  // check if the last drop event was not within the last 100 milliseconds
                  if ((currentTime - thisGraphController.lastDropTime) < 100) {
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
              legendItemClick: function(event) {
                // the student clicked on a series in the legend

                if (thisGraphController.componentContent.canStudentHideSeriesOnLegendClick != null) {
                  if (thisGraphController.componentContent.canStudentHideSeriesOnLegendClick) {
                    /*
                     * Update the show field in all the series depending on
                     * whether each line is active in the legend.
                     */
                    for (let yAxisSeries of this.yAxis.series) {
                      let series = thisGraphController.getSeriesById(yAxisSeries.userOptions.id);
                      if (this.userOptions.id == series.id) {
                        series.show = !yAxisSeries.visible;
                      } else {
                        series.show = yAxisSeries.visible;
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
                drag: function (e) {
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
                drop: function (e) {
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
                          if (thisGraphController.xAxis.type == null ||
                            thisGraphController.xAxis.type === '' ||
                            thisGraphController.xAxis.type === 'limits') {

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
      func: function (chart) {
        timeout(function () {
          thisGraphController.showXPlotLineIfOn('Drag Me');
          thisGraphController.showYPlotLineIfOn('Drag Me');

          if (thisGraphController.isMouseXPlotLineOn() ||
              thisGraphController.isMouseYPlotLineOn() ||
              thisGraphController.isSaveMouseOverPoints()) {
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
      this.$timeout(() => {
        this.setCustomLegend();
      });
    }

    return deferred.promise;
  };

  /**
   * Overwrite the existing legend with the custom authored legend.
   */
  setCustomLegend() {
    if (!this.hasCustomLegendBeenSet) {
      if ($('.highcharts-legend').length > 0) {
        // move the legend to the very left by setting the x position to 0

        let userAgent = navigator.userAgent;
        if (userAgent.indexOf('Firefox') != -1) {
          let currentTransform = $('.highcharts-legend').attr('transform');

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
          let matrixRegEx = /(translate\()(\d*)(,\s*\d*\))/;

          // run the regex on the current transform
          let results = matrixRegEx.exec(currentTransform);

          // replace the second group with 0
          let newTransform = currentTransform.replace(matrixRegEx, '$10$3');

          // update the transform
          $('.highcharts-legend').attr('transform', newTransform);
        } else {
          let currentTransform = $('.highcharts-legend').css('transform');

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
          let matrixRegEx = /(matrix\(\d*,\s*\d*,\s*\d*,\s*\d*,\s*)(\d*)(,\s*\d*\))/;

          // run the regex on the current transform
          let results = matrixRegEx.exec(currentTransform);

          // replace the second group with 0
          let newTransform = currentTransform.replace(matrixRegEx, '$10$3');

          // update the transform
          $('.highcharts-legend').css('transform', newTransform);
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
  addPointToSeries0(series, x, y) {
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
  };

  /**
   * Add a point to a series. The point will be inserted at the end of
   * the series.
   * @param series the series
   * @param x the x value
   * @param y the y value
   */
  addPointToSeries(series, x, y) {
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
  };

  /**
   * Remove a point from a series. We will remove all points that
   * have the given x value.
   * @param series the series to remove the point from
   * @param x the x value of the point to remove
   */
  removePointFromSeries(series, x) {
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
  };

  /**
   * Check if we need to add the click to remove event to the series
   * @param series an array of series
   */
  addClickToRemovePointEvent(series) {

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
                click: function (e) {

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
  };

  /**
   * Check whether the student is allowed to edit a given series
   * @param series the series to check
   * @return whether the student can edit the series
   */
  canEdit(series) {
    var result = false;

    if (series != null && series.canEdit) {
      result = true;
    }

    return result;
  };

  /**
   * Set all the series
   * @param series an array of series
   */
  setSeries(series) {
    this.series = series;
  };

  /**
   * Get all the series
   * @returns an array of series
   */
  getSeries() {
    return this.series;
  };

  /**
   * Set the series at the given index
   * @param series the series object
   * @param index the index the series will be placed in
   */
  setSeriesByIndex(series, index) {

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
  getSeriesByIndex(index) {
    return this.series[index];
  }

  /**
   * Set the trials
   * @param trials the trials
   */
  setTrials(trials) {
    this.trials = trials;
  }

  /**
   * Get the trials
   * @return the trials
   */
  getTrials() {
    return this.trials;
  }

  /**
   * Get the index of the trial
   * @param trial the trial object
   * @return the index of the trial within the trials array
   */
  getTrialIndex(trial) {

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
  setActiveTrialByIndex(index) {

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
  canEditTrial(trial) {
    let result = false;
    let series = trial.series;

    for (let i = 0; i < series.length; i++) {
      let currentSeries = series[i];
      if (currentSeries.canEdit) {
        // at least one series in this trial is editable
        result = true;
        break;
      }
    }

    return result;
  };

  /**
   * Set whether to show the active trial select menu
   * @return whether to show the active trial select menu
   */
  showSelectActiveTrials() {
    let result = false;
    let editableTrials = 0;
    for (let i = 0; i < this.trials.length; i++) {
      let trial = this.trials[i];
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
  };

  /**
   * Set the xAxis object
   * @param xAxis the xAxis object that can be used to render the graph
   */
  setXAxis(xAxis) {
    this.xAxis = this.UtilService.makeCopyOfJSONObject(xAxis);
  };

  /**
   * Get the xAxis object
   * @return the xAxis object that can be used to render the graph
   */
  getXAxis() {
    return this.xAxis;
  };

  /**
   * Set the yAxis object
   * @param yAxis the yAxis object that can be used to render the graph
   */
  setYAxis(yAxis) {
    this.yAxis = this.UtilService.makeCopyOfJSONObject(yAxis);
  };

  /**
   * Get the yAxis object
   * @return the yAxis object that can be used to render the graph
   */
  getYAxis() {
    return this.yAxis;
  };

  /**
   * Set the active series
   * @param series the series
   */
  setActiveSeries(series) {
    this.activeSeries = series;
  };

  /**
   * Set the active series by the index
   * @param index the index
   */
  setActiveSeriesByIndex(index) {

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
  };

  /**
   * Reset the table data to its initial state from the component content
   */
  resetGraph() {

    // reset the series and parameters of the graph
    this.resetGraphHelper();

    /*
     * set the flag to add the next component state created in
     * studentDataChanged() to the undo stack
     */
    this.addNextComponentStateToUndoStack = true;
    this.studentDataChanged();
  };

  /**
   * Reset the series and parameters of the graph
   */
  resetGraphHelper() {

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
  resetSeries() {

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
  resetSeriesHelper() {

    if (this.UtilService.hasConnectedComponent(this.componentContent)) {
      /*
       * There are connected components so we will get the work from them.
       * This will actually reset all the series and not just the active
       * one.
       */
      this.newTrial();
      const isReset = true;
      this.handleConnectedComponents(isReset);
    } else {
      // get the index of the active series
      var activeSeriesIndex  = this.getSeriesIndex(this.activeSeries);

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
  setStudentWork(componentState) {

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

        if (studentData.mouseOverPoints != null &&
            studentData.mouseOverPoints.length > 0) {
          this.mouseOverPoints = studentData.mouseOverPoints;
        }

        this.processLatestSubmit();
      }
    }
  };

  /**
   * Check if latest component state is a submission and set isSubmitDirty accordingly
   */
  processLatestSubmit() {
    let latestState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

    if (latestState) {
      let serverSaveTime = latestState.serverSaveTime;
      let clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
      if (latestState.isSubmit) {
        // latest state is a submission, so set isSubmitDirty to false and notify node
        this.isSubmitDirty = false;
        this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: false});
        this.setSaveMessage(this.$translate('LAST_SUBMITTED'), clientSaveTime);
      } else {
        // latest state is not a submission, so set isSubmitDirty to true and notify node
        this.isSubmitDirty = true;
        this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});
        this.setSaveMessage(this.$translate('LAST_SAVED'), clientSaveTime);
      }
    }
  };

  /**
   * A submit was triggered by the component submit button or node submit button
   * @param submitTriggeredBy what triggered the submit
   * e.g. 'componentSubmitButton' or 'nodeSubmitButton'
   */
  submit(submitTriggeredBy) {

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
          this.$scope.$emit('componentSubmitTriggered', {nodeId: this.nodeId, componentId: this.componentId});
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
  activeSeriesChanged() {

    var useTimeoutSetupGraph = true;

    // the student data has changed
    this.studentDataChanged(useTimeoutSetupGraph);

    // tell the parent node that this component wants to save
    //this.$scope.$emit('componentSaveTriggered', {nodeId: this.nodeId, componentId: this.componentId});
  };

  /**
   * Called when the student changes their work
   */
  studentDataChanged(useTimeoutSetupGraph) {
    /*
     * set the dirty flags so we will know we need to save or submit the
     * student work later
     */
    this.isDirty = true;
    this.$scope.$emit('componentDirty', {componentId: this.componentId, isDirty: true});

    this.isSubmitDirty = true;
    this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});
    this.setSaveMessage('', null);

    // re-draw the graph
    this.setupGraph(useTimeoutSetupGraph);

    /*
     * the student work in this component has changed so we will tell
     * the parent node that the student data will need to be saved.
     * this will also notify connected parts that this component's student
     * data has changed.
     */
    var action = 'change';

    // create a component state populated with the student data
    this.createComponentState(action).then((componentState) => {

      if (this.addNextComponentStateToUndoStack) {
        if (this.previousComponentState != null) {
          // push the previous component state onto our undo stack
          this.undoStack.push(this.previousComponentState);
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
        this.previousComponentState = componentState;

        this.addNextComponentStateToUndoStack = false;
      }

      // check if a digest is in progress
      if(!this.$scope.$$phase) {
        // digest is not in progress so we can force a redraw
        // TODO GK (from HT) this line was causing a lot of js errors ( $digest already in progress ), so I commented it out
        // and it still seems to work. Do we need this line?
        // see here: http://stackoverflow.com/questions/12729122/angularjs-prevent-error-digest-already-in-progress-when-calling-scope-apply
        //this.$scope.$apply();
      }

      /*
       * fire the componentStudentDataChanged event after a short timeout
       * so that the other component handleConnectedComponentStudentDataChanged()
       * listeners can initialize before this and are then able to process
       * this componentStudentDataChanged event
       */
      this.$timeout(() => {
        this.$scope.$emit('componentStudentDataChanged', {nodeId: this.nodeId, componentId: this.componentId, componentState: componentState});
      }, 100);
    });
  };

  /**
   * Create a new component state populated with the student data
   * @param action the action that is triggering creating of this component state
   * e.g. 'submit', 'save', 'change'
   * @return a promise that will return a component state
   */
  createComponentState(action) {

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
    if (this.componentContent.xAxis != null &&
        this.componentContent.xAxis.plotBands != null) {
      /*
       * There are authored plot bands so we will save those into the
       * student data since they are not stored in the trials.
       */
      studentData.xAxis.plotBands = this.componentContent.xAxis.plotBands;
    }

    // insert the y axis data
    studentData.yAxis = this.getYAxis();

    // get the active series index
    var activeSeriesIndex  = this.getSeriesIndex(this.activeSeries);

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
  };

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
  createComponentStateAdditionalProcessing(deferred, componentState, action) {

    if (this.ProjectService.hasAdditionalProcessingFunctions(this.nodeId, this.componentId)) {
      // this component has additional processing functions

      // get the additional processing functions
      let additionalProcessingFunctions = this.ProjectService.getAdditionalProcessingFunctions(this.nodeId, this.componentId);
      let allPromises = [];

      // call all the additional processing functions
      for (let i = 0; i < additionalProcessingFunctions.length; i++) {
        let additionalProcessingFunction = additionalProcessingFunctions[i];
        let defer = this.$q.defer();
        let promise = defer.promise;
        allPromises.push(promise);
        additionalProcessingFunction(defer, componentState, action);
      }
      this.$q.all(allPromises).then(() => {
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
  showPrompt() {
    var show = false;

    if (this.isPromptVisible) {
      show = true;
    }

    return show;
  };

  /**
   * Check whether we need to show the reset graph button
   * @return whether to show the reset graph button
   */
  showResetGraphButton() {
    var show = false;

    if (this.isResetGraphButtonVisible) {
      show = true;
    }

    return show;
  };

  /**
   * Check whether we need to show the reset series button
   * @return whether to show the reset series button
   */
  showResetSeriesButton() {
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
  getSeriesIndex(series) {
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
  };

  /**
   * Get a series by the index
   * @param index the index of the series in the series array
   * @returns the series object or null if not found
   */
  getSeriesByIndex(index) {
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
  getSeriesById(id) {
    var seriesArray = this.getSeries();

    for (let series of seriesArray) {
      if (series.id == id) {
        return series;
      }
    }

    return null;
  }

  /**
   * Get the trials from classmates
   * @param nodeId the node id
   * @param componentId the component id
   * @param showClassmateWorkSource Whether to get the work only from the
   * period the student is in or from all the periods. The possible values
   * are "period" or "class".
   * @return a promise that will return all the trials from the classmates
   */
  getTrialsFromClassmates(nodeId, componentId, showClassmateWorkSource) {

    var deferred = this.$q.defer();

    // make a request for the classmate student work
    this.StudentDataService.getClassmateStudentWork(nodeId, componentId, showClassmateWorkSource).then((componentStates) => {

      var promises = [];

      // loop through all the component states
      for (var c = 0; c < componentStates.length; c++) {
        var componentState = componentStates[c];

        if (componentState != null) {

          // get the trials from the component state
          promises.push(this.getTrialsFromComponentState(nodeId, componentId, componentState));
        }
      }

      // wait for all the promises of trials
      this.$q.all(promises).then((promiseResults) => {

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
  getTrialsFromComponentState(nodeId, componentId, componentState) {
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
  attachStudentAsset(studentAsset) {
    if (studentAsset != null) {
      this.StudentAssetService.copyAssetForReference(studentAsset).then( (copiedAsset) => {
        if (copiedAsset != null) {

          this.StudentAssetService.getAssetContent(copiedAsset).then( (assetContent) => {
            var rowData = this.StudentDataService.CSVToArray(assetContent);
            var params = {};
            params.skipFirstRow = true;  // first row contains header, so ignore it
            params.xColumn = 0;      // assume (for now) x-axis data is in first column
            params.yColumn = 1;      // assume (for now) y-axis data is in second column

            var seriesData = this.convertRowDataToSeriesData(rowData, params);

            // get the index of the series that we will put the data into
            var seriesIndex = this.series.length;  // we're always appending a new series

            if (seriesIndex != null) {

              // get the series
              var series = this.series[seriesIndex];

              if (series == null) {
                // the series is null so we will create a series
                series = {};
                series.name = copiedAsset.fileName;
                series.color = this.seriesColors[seriesIndex];
                series.marker = {
                  'symbol': this.seriesMarkers[seriesIndex]
                };
                series.regression = false;
                series.regressionSettings = {};
                series.canEdit = false;
                this.series[seriesIndex] = series;
              }

              // set the data into the series
              series.data = seriesData;
            }

            // the graph has changed
            this.isDirty = true;

            /*
             * set the flag to add the next component state created in
             * studentDataChanged() to the undo stack
             */
            this.addNextComponentStateToUndoStack = true;
            this.studentDataChanged();
          });
        }
      });
    }
  };

  /**
   * Convert the table data into series data
   * @param componentState the component state to get table data from
   * @param params (optional) the params to specify what columns
   * and rows to use from the table data
   */
  convertRowDataToSeriesData(rows, params) {
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
        if (typeof(xCell) === 'object' && xCell.text) {
          xText = xCell.text;
        }

        var yText = null;
        if (typeof(yCell) === 'object' && yCell.text) {
          yText = yCell.text;
        }

        if (xText != null &&
          xText !== '' &&
          yText != null &&
          yText !== '') {

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
  };

  /**
   * Set the series id for each series
   * @param allSeries an array of series
   */
  setSeriesIds(allSeries) {
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
  };

  /**
   * Get the next available series id
   * @param usedSeriesIds an array of used series ids
   * @returns the next available series id
   */
  getNextSeriesId(usedSeriesIds) {
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
  };

  /**
   * Handle the delete key press
   */
  handleDeleteKeyPressed() {

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
            if (dataPoint[0] == selectedPoint.x ||
              dataPoint[1] == selectedPoint.y) {

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
  };

  /**
   * Create a new series object
   * @returns a new series object
   */
  createNewSeries() {
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
   * Register the the listener that will listen for the exit event
   * so that we can perform saving before exiting.
   */
  registerExitListener() {

    /*
     * Listen for the 'exit' event which is fired when the student exits
     * the VLE. This will perform saving before the VLE exits.
     */
    this.exitListener = this.$scope.$on('exit', angular.bind(this, function(event, args) {

      this.$rootScope.$broadcast('doneExiting');
    }));
  };

  /**
   * Check if a series is the active series. There can only be on active series.
   * @param series the series
   * @returns whether the series is the active series
   */
  isActiveSeries(series) {

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
  isActiveSeriesIndex(seriesIndex) {

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
  showSelectSeries() {
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
  newTrialButtonClicked() {

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
  newTrial() {

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
  deleteTrial(trialIndex) {

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
  activeTrialChanged() {

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
  trialIdsToShowChanged() {
    // get the trial indexes to show
    let trialIdsToShow = this.trialIdsToShow;
    let trials = this.trials;

    // update the trials
    for (let i = 0; i < trials.length; i++) {
      let trial = trials[i];
      let id = trial.id;

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
    for (let a = 0; a < trialIdsToShow.length; a++) {
      let idToShow = trialIdsToShow[a];
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
  };



  /**
   * Set which trials are selected in the trial select model
   */
  setTrialIdsToShow() {
    let idsToShow = [];

    let trials = this.trials;
    for (let i = 0; i < trials.length; i++) {
      let trial = trials[i];
      if (trial.show) {
        // trial is visible on graph, so add it to the ids to show model
        let id = trial.id;
        idsToShow.push(id);
      }
    }

    this.trialIdsToShow = idsToShow;
  };

  /**
   * Get the text to show in the trials select dropdown
   */
  getSelectedTrialsText() {
    if (this.trialIdsToShow.length === 1) {
      let id = this.trialIdsToShow[0];
      let name = this.getTrialById(id).name;
      return name;
    } else if (this.trialIdsToShow.length > 1) {
      return this.trialIdsToShow.length + ' ' + this.$translate('graph.trialsShown');
    } else {
      return this.$translate('graph.selectTrialsToShow');
    }
  };

  /**
   * Process the student data that we have received from a connected component.
   * @param studentData The student data from a connected component.
   * @param params The connected component params.
   */
  processConnectedComponentStudentData(studentData, params) {
    if (params.fields == null) {
      /*
       * we do not need to look at specific fields so we will directly
       * parse the the trial data from the student data.
       */
      this.parseLatestTrial(studentData, params);
    } else {
      // we need to process specific fields in the student data
      let fields = params.fields;
      for (let field of fields) {
        let name = field.name;
        let when = field.when;
        let action = field.action;
        let firstTime = false;
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
    }
  }

  /**
   * Read the field from the new student data and perform any processing on our
   * existing student data based upon the new student data.
   * @param studentData The new student data from the connected component.
   * @param params The connected component params.
   * @param name The field name to read and process.
   */
  readConnectedComponentFieldFromStudentData(studentData, params, name) {
    if (name == 'selectedCells') {
      // only show the trials that are specified in the selectedCells array
      let selectedCells = studentData[name];
      let selectedTrialIds = this.convertSelectedCellsToTrialIds(selectedCells);
      for (let trial of this.trials) {
        if (selectedTrialIds.includes(trial.id)) {
          trial.show = true;
        } else {
          trial.show = false;
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
  deleteTrialsByTrialId(trialIdsToDelete) {
    if (trialIdsToDelete != null) {
      for (let trialIdToDelete of trialIdsToDelete) {
        this.deleteTrialId(trialIdToDelete);
      }
    }
  }

  /**
   * Delete a trial
   * @param trialId The trial id string to delete
   */
  deleteTrialId(trialId) {
    for (let t = 0; t < this.trials.length; t++) {
      let trial = this.trials[t];
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
  parseLatestTrial(studentData, params) {

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
            if (firstTrial.series == null ||
                firstTrial.series.length == 0 ||
                (firstTrial.series.length == 1 && !firstTrial.series[0].data.length)) {
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
              if (params == null ||
                  params.seriesNumbers == null ||
                  params.seriesNumbers.length == 0 ||
                  (params.seriesNumbers != null && params.seriesNumbers.indexOf(s) != -1)) {

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
                    this.$timeout(() => {
                      //this.showTooltipOnX(studentData.trial.id, studentData.showTooltipOnX);
                      this.highlightPointOnX(studentData.trial.id, studentData.xPointToHighlight);
                    }, 1);
                  }
                }
              }
            }
          }
        }

        if (latestStudentDataTrial.xAxis != null &&
            latestStudentDataTrial.xAxis.plotBands != null) {
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
  getTrialById(id) {

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
  hasEditableSeries() {

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
  updateMinMaxAxisValues(series, xAxis, yAxis) {

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
  getMinMaxValues(series) {

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
                } else if(tempData.constructor.name == 'Number') {
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
                xMin = tempX
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
  clearSeriesIds(allSeries) {

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
   * Snip the drawing by converting it to an image
   * @param $event the click event
   */
  snipDrawing($event) {

    // get the highcharts div
    var highchartsDiv = angular.element('#' + this.chartId).find('.highcharts-container');

    if (highchartsDiv != null && highchartsDiv.length > 0) {
      highchartsDiv = highchartsDiv[0];

      // convert the model element to a canvas element
      html2canvas(highchartsDiv).then((canvas) => {

        // get the canvas as a base64 string
        var img_b64 = canvas.toDataURL('image/png');

        // get the image object
        var imageObject = this.UtilService.getImageObjectFromBase64String(img_b64);

        // create a notebook item with the image populated into it
        this.NotebookService.addNote($event, imageObject);
      });
    }
  }

  /**
   * Read a csv string and load the data into the active series
   * @param csv a csv string
   */
  readCSV(csv) {

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
  setUploadedFileName(fileName) {
    this.uploadedFileName = fileName;
  }

  /**
   * Get the uploaded file name
   * @return the uploaded file name
   */
  getUploadedFileName() {
    return this.uploadedFileName;
  }

  /**
   * Convert all the data points in the series
   * @param series convert the data points in the series
   * @param xAxisType the new x axis type to convert to
   */
  convertSeriesDataPoints(series, xAxisType) {

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
            var newDataPoint = [(d + 1), oldDataPoint];

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
  performRounding(number) {

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
  roundToNearestInteger(x) {

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
  roundToNearestTenth(x) {

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
  roundToNearestHundredth(x) {

    // make sure x is a number
    x = parseFloat(x);

    // round the number to the nearest hundredth
    x = Math.round(x * 100) / 100;

    return x;
  }

  /**
   * Set the active series to the first series that the student can edit
   * or if there are no series the student can edit, set the active series
   * to the first series
   */
  setDefaultActiveSeries() {
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
  setVerticalPlotLine(x) {

    // make the plot line
    let plotLine = {
      color: 'red',
      width: 2,
      value: x,
      zIndex: 5
    }

    // set the plot line into the plot lines array
    this.plotLines = [
      plotLine
    ];

    /*
     * Call $apply() so that the red plot line position gets updated. If we
     * don't call this, the line position won't get updated unless the student
     * moves their mouse around which forces angular to update.
     */
    this.$timeout(() => {
      this.$scope.$apply();
    });
  }

  /**
   * Import any work we need from connected components
   * @param {boolean} isReset (optional) Whether this function call was
   * triggered by the student clicking the reset button.
   */
  handleConnectedComponents(isReset) {

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

              if (componentState != null &&
                  componentState.studentData != null &&
                  componentState.studentData.backgroundImage != null) {
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
              let component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
              if (component != null) {
                // inject the asset paths so that the assets are absolute
                component = this.ProjectService.injectAssetPaths(component);
                connectedComponentBackgroundImage = component.backgroundImage;
              }
            }
          } else if (type == 'showWork' || type == 'importWork' || type == null) {
            // get the latest component state from the component
            let componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
            if (componentState != null) {
              if (componentState.componentType == 'ConceptMap' ||
                  componentState.componentType == 'Draw' ||
                  componentState.componentType == 'Label') {
                let connectedComponent =
                  this.UtilService.getConnectedComponentByComponentState(this.componentContent, componentState);
                if (connectedComponent.importWorkAsBackground === true) {
                  promises.push(this.setComponentStateAsBackgroundImage(componentState));
                }
              } else {
                // get the trials from the component state
                promises.push(this.getTrialsFromComponentState(nodeId, componentId, componentState));

                if (type == 'showWork') {
                  // we are showing work so we will not allow the student to edit it
                  this.isDisabled = true;
                }

                if (componentState != null &&
                  componentState.studentData != null &&
                  componentState.studentData.backgroundImage != null) {
                  connectedComponentBackgroundImage = componentState.studentData.backgroundImage;
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
      this.$q.all(promises).then((promiseResults) => {
        /*
         * First we will accumulate all the trials into one new component state
         * and then we will perform connected component processing.
         */

        // this will hold all the trials
        let mergedTrials = [];

        /*
         * Loop through all the promise results. There will be a
         * promise result for each component we are importing from.
         * Each promiseResult is an array of trials or an image url.
         */
        for (let promiseResult of promiseResults) {
          if (promiseResult instanceof Array) {
            let trials = promiseResult;
            // loop through all the trials from the component
            for (let t = 0; t < trials.length; t++) {
              let trial = trials[t];

              // add the trial to our array of merged trials
              mergedTrials.push(trial);
            }
          } else if (typeof(promiseResult) === "string") {
            connectedComponentBackgroundImage = promiseResult;
          }
        }

        // create a new student data with all the trials
        let studentData = {};
        studentData.trials = mergedTrials;
        studentData.version = 2;

        // create a new component state
        let newComponentState = this.NodeService.createNewComponentState();
        newComponentState.studentData = studentData;

        if (this.componentContent.backgroundImage != null &&
            this.componentContent.backgroundImage != '') {
          // use the background image from this component
          newComponentState.studentData.backgroundImage = this.componentContent.backgroundImage;
        } else if (connectedComponentBackgroundImage != null) {
          // use the background image from the connected component
          newComponentState.studentData.backgroundImage = connectedComponentBackgroundImage;
        }

        newComponentState = this.handleConnectedComponentsHelper(newComponentState, isReset);

        // populate the component state into this component
        this.setStudentWork(newComponentState);
        this.studentDataChanged();
      });
    }
  }

  /**
   * Create an image from a component state and set the image as the background.
   * @param componentState A component state.
   * @return A promise that returns the url of the image that is generated from
   * the component state.
   */
  setComponentStateAsBackgroundImage(componentState) {
    return this.UtilService.generateImageFromComponentState(componentState).then((image) => {
      return image.url;
    });
  }

  /**
   * Perform additional connected component processing.
   * @param newComponentState The new component state generated by accumulating
   * the trials from all the connected component student data.
   */
  handleConnectedComponentsHelper(newComponentState, isReset) {
    let mergedComponentState = this.$scope.componentState;
    let firstTime = true;
    if (mergedComponentState == null || isReset) {
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
      for (var connectedComponent of connectedComponents) {
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
            let fields = connectedComponent.fields;
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
  mergeComponentState(baseComponentState, connectedComponentState, mergeFields, firstTime) {
    if (mergeFields == null) {
      if (connectedComponentState.componentType == 'Graph' && firstTime) {
        // there are no merge fields specified so we will get all of the fields
        baseComponentState.studentData = this.UtilService.makeCopyOfJSONObject(connectedComponentState.studentData);
      }
    } else {
      // we will merge specific fields
      for (let mergeField of mergeFields) {
        let name = mergeField.name;
        let when = mergeField.when;
        let action = mergeField.action;
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
  mergeNullComponentState(baseComponentState, mergeFields, firstTime) {
    let newComponentState = null;
    if (mergeFields == null) {
      // TODO
    } else {
      // we will merge specific fields
      for (let mergeField of mergeFields) {
        let name = mergeField.name;
        let when = mergeField.when;
        let action = mergeField.action;

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
            const connectedComponentState = null;
            this.readConnectedComponentField(baseComponentState, connectedComponentState, name);
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
  readConnectedComponentField(baseComponentState, connectedComponentState, field) {
    if (field == 'selectedCells') {
      if (connectedComponentState == null) {
        // we will default to hide all the trials
        for (let trial of baseComponentState.studentData.trials) {
          trial.show = false;
        }
      } else {
        /*
         * loop through all the trials and show the ones that are in the
         * selected cells array.
         */
        let studentData = connectedComponentState.studentData;
        let selectedCells = studentData[field];
        let selectedTrialIds = this.convertSelectedCellsToTrialIds(selectedCells);
        for (let trial of baseComponentState.studentData.trials) {
          if (selectedTrialIds.includes(trial.id)) {
            trial.show = true;
          } else {
            trial.show = false;
          }
        }
      }
    } else if (field == 'trial') {
      // TODO
    }
  }

  /**
   * The undo button was clicked
   */
  undoClicked() {

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
  trialCheckboxClicked() {

    /*
     * set the flag to add the next component state created in
     * studentDataChanged() to the undo stack
     */
    this.addNextComponentStateToUndoStack = true;
  }

  /**
   * Get the category name given the index of the category on the x axis
   * @param index the index of the category
   * @return the category name at the given index
   */
  getCategoryByIndex(index) {

    let category = null;

    if (this.componentContent.xAxis != null &&
        this.componentContent.xAxis.categories != null &&
        index < this.componentContent.xAxis.categories.length) {

      category = this.componentContent.xAxis.categories[index];
    }

    return category;
  }

  /**
   * Whether we are showing a plot line where the mouse is.
   * @return True if we are showing a plot line on the x or y axis where the
   * mouse is.
   */
  isMousePlotLineOn() {
    if (this.isMouseXPlotLineOn() || this.isMouseYPlotLineOn()) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * @return Whether we are showing the vertical plot line on the graph.
   */
  isMouseXPlotLineOn() {
    return this.componentContent.showMouseXPlotLine;
  }

  /**
   * @return Whether we are showing the horizontal plot line on the graph.
   */
  isMouseYPlotLineOn() {
    return this.componentContent.showMouseYPlotLine;
  }

  /**
   * @return Whether we are saving the mouse points in the component state.
   */
  isSaveMouseOverPoints() {
    return this.componentContent.saveMouseOverPoints;
  }

  /**
   * Get the x value from the data point.
   * @param dataPoint An object or an array that represents a data point.
   * @return A number or null if there is no x value.
   */
  getXValueFromDataPoint(dataPoint) {
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
  getYValueFromDataPoint(dataPoint) {
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
  getLatestMouseOverPointX() {
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
  getLatestMouseOverPointY() {
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
  showXPlotLineIfOn(text = null) {
    if (this.isMouseXPlotLineOn()) {
      // show the previous x plot line or default to 0
      let x = this.getLatestMouseOverPointX();
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
  showYPlotLineIfOn(text = null) {
    if (this.isMouseYPlotLineOn()) {
      // show the previous y plot line or default to 0
      let y = this.getLatestMouseOverPointY();
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
  showTooltipOnX(seriesId, x) {
    let chart = $('#' + this.chartId).highcharts();
    if (chart.series.length > 0) {
      let series = null;
      if (seriesId == null) {
        series = chart.series[chart.series.length - 1];
      } else {
        for (let tempSeries of chart.series) {
          if (tempSeries.userOptions.name == seriesId) {
            series = tempSeries;
          }
        }
      }
      let points = series.points;
      for (let point of points) {
        if (point.x == x) {
          chart.tooltip.refresh(point);
        }
      }
    }
  }

  /**
   * Highlight the point with the given x value.
   * @param seriesId The id of the series.
   * @param x The x value we want to highlight.
   */
  highlightPointOnX(seriesId, x) {
    let chart = $('#' + this.chartId).highcharts();
    if (chart.series.length > 0) {
      let series = null;
      if (seriesId == null) {
        series = chart.series[chart.series.length - 1];
      } else {
        for (let tempSeries of chart.series) {
          if (tempSeries.userOptions.name == seriesId) {
            series = tempSeries;
          }
          // remove the hover state from the other points
          for (let point of tempSeries.points) {
            point.setState('');
          }
        }
      }
      let points = series.points;
      for (let point of points) {
        if (point.x == x) {
          // make the point larger and also have a highlight around it
          point.setState('hover');
        }
      }
    }
  }

  /**
   * Show the tooltip on the newest point.
   */
  showTooltipOnLatestPoint() {
    let chart = $('#' + this.chartId).highcharts();
    if (chart.series.length > 0) {
      let latestSeries = chart.series[chart.series.length - 1];
      let points = latestSeries.points;
      if (points.length > 0) {
        let latestPoint = points[points.length - 1];
        chart.tooltip.refresh(latestPoint);
      }
    }
  }

  /**
   * Convert the selected cells array into an array of trial ids.
   * @param selectedCells An array of objects representing selected cells.
   * @return An array of trial id strings.
   */
  convertSelectedCellsToTrialIds(selectedCells) {
    let selectedTrialIds = [];
    if (selectedCells != null) {
      for (let selectedCell of selectedCells) {
        let material = selectedCell.material;
        let bevTemp = selectedCell.bevTemp;
        let airTemp = selectedCell.airTemp;
        let selectedTrialId = material + '-' + bevTemp + 'Liquid';
        selectedTrialIds.push(selectedTrialId);
      }
    }
    return selectedTrialIds;
  }
}


GraphController.$inject = [
  '$filter',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$scope',
  '$timeout',
  'AnnotationService',
  'ConfigService',
  'GraphService',
  'NodeService',
  'NotebookService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default GraphController;
