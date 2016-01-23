'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
//import $ from 'jquery';

//import angularHighcharts from 'highcharts-ng';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _highcharts = require('highcharts');

var _highcharts2 = _interopRequireDefault(_highcharts);

var _draggablePoints = require('highcharts/draggable-points');

var _draggablePoints2 = _interopRequireDefault(_draggablePoints);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GraphController = function () {
    function GraphController($rootScope, $scope, GraphService, NodeService, ProjectService, StudentAssetService, StudentDataService) {
        _classCallCheck(this, GraphController);

        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.GraphService = GraphService;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;

        // the node id of the current node
        this.nodeId = null;

        // the component id
        this.componentId = null;

        // field that will hold the component content
        this.componentContent = null;

        // field that will hold the authoring component content
        this.authoringComponentContent = null;

        // whether the component should be disabled
        this.isDisabled = false;

        // whether the student work is dirty and needs saving
        this.isDirty = false;

        // holds all the series
        this.series = [];

        // which color the series will be in
        this.seriesColors = ['blue', 'red', 'green', 'orange', 'purple', 'black'];

        // series marker options
        this.seriesMarkers = ['circle', 'square', 'diamond', 'triangle', 'triangle-down', 'circle'];

        // whether this part is showing previous work
        this.isShowPreviousWork = false;

        // whether the student work is for a submit
        this.isSubmit = false;

        // whether students can attach files to their work
        this.isStudentAttachmentEnabled = false;

        // will hold the active series
        this.activeSeries = null;

        // the mode to load the component in e.g. 'student', 'grading', 'onlyShowWork'
        this.mode = null;

        // whether the prompt is shown or not
        this.isPromptVisible = true;

        // whether the save button is shown or not
        this.isSaveButtonVisible = false;

        // whether the submit button is shown or not
        this.isSubmitButtonVisible = false;

        // whether the reset graph button is shown or not
        this.isResetGraphButtonVisible = true;

        // get the current node and node id
        var currentNode = this.StudentDataService.getCurrentNode();
        if (currentNode != null) {
            this.nodeId = currentNode.id;
        } else {
            this.nodeId = this.$scope.nodeId;
        }

        // get the component content from the scope
        this.componentContent = this.$scope.componentContent;

        // get the authoring component content
        this.authoringComponentContent = this.$scope.authoringComponentContent;

        this.mode = this.$scope.mode;

        if (this.componentContent != null) {

            // get the component id
            this.componentId = this.componentContent.id;

            if (this.mode === 'student') {
                this.isPromptVisible = true;
                this.isSaveButtonVisible = this.componentContent.showSaveButton;
                this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
                this.isResetGraphButtonVisible = true;
            } else if (this.mode === 'grading') {
                this.isPromptVisible = true;
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isResetGraphButtonVisible = false;
                this.isDisabled = true;
            } else if (this.mode === 'onlyShowWork') {
                this.isPromptVisible = false;
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isResetGraphButtonVisible = false;
                this.isDisabled = true;
            } else if (this.mode === 'authoring') {
                this.updateAdvancedAuthoringView();

                $scope.$watch(function () {
                    return this.authoringComponentContent;
                }.bind(this), function (newValue, oldValue) {
                    this.componentContent = this.ProjectService.injectAssetPaths(newValue);
                    this.series = null;
                    this.xAxis = null;
                    this.yAxis = null;
                    this.setupGraph();
                }.bind(this), true);
            }

            // get the show previous work node id if it is provided
            var showPreviousWorkNodeId = this.componentContent.showPreviousWorkNodeId;

            var componentState = null;

            if (false) {
                // this component is showing previous work
                this.isShowPreviousWork = true;

                // get the show previous work component id if it is provided
                var showPreviousWorkComponentId = this.componentContent.showPreviousWorkComponentId;

                // get the node content for the other node
                var showPreviousWorkNodeContent = this.ProjectService.getNodeContentByNodeId(showPreviousWorkNodeId);

                //var showPreviousWorkPrompt = this.componentContent.showPreviousWorkPrompt;

                // get the component content for the component we are showing previous work for
                this.componentContent = this.NodeService.getComponentContentById(showPreviousWorkNodeContent, showPreviousWorkComponentId);

                /*
                 if (!showPreviousWorkPrompt) {
                 this.componentContent = '';
                 }
                 */

                // hide the prompt, save, submit, and reset graph buttons when showing previous work
                this.isPromptVisible = false;
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isResetGraphButtonVisible = false;

                // get the component state for the show previous work
                componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(showPreviousWorkNodeId, showPreviousWorkComponentId);

                if (componentState == null) {
                    // the component state will be passed into the scope when we are in the grading tool
                    componentState = this.$scope.componentState;
                }

                // populate the student work into this component
                this.setStudentWork(componentState);

                // setup the graph
                this.setupGraph();

                // disable the component since we are just showing previous work
                this.isDisabled = true;

                if (this.$scope.$parent.registerComponentController != null) {
                    // register this component with the parent node
                    this.$scope.$parent.registerComponentController(this.$scope, this.componentContent);
                }
            } else {
                // this is a regular component

                // get the component state from the scope
                componentState = this.$scope.componentState;

                // set whether studentAttachment is enabled
                this.isStudentAttachmentEnabled = this.componentContent.isStudentAttachmentEnabled;

                if (componentState == null) {
                    /*
                     * only import work if the student does not already have
                     * work for this component
                     */

                    // check if we need to import work
                    var importWorkNodeId = this.componentContent.importWorkNodeId;
                    var importWorkComponentId = this.componentContent.importWorkComponentId;

                    if (importWorkNodeId != null && importWorkComponentId != null) {
                        // import the work from the other component
                        this.importWork();
                    }
                } else {
                    // populate the student work into this component
                    this.setStudentWork(componentState);
                }

                // check if we need to lock this component
                this.calculateDisabled();

                // setup the graph
                this.setupGraph();

                if (this.$scope.$parent.registerComponentController != null) {
                    // register this component with the parent node
                    this.$scope.$parent.registerComponentController(this.$scope, this.componentContent);
                }
            }
        }

        /**
         * A connected component has changed its student data so we will
         * perform any necessary changes to this component
         * @param connectedComponent the connected component
         * @param connectedComponentParams the connected component params
         * @param componentState the student data from the connected
         * component that has changed
         */
        this.$scope.handleConnectedComponentStudentDataChanged = function (connectedComponent, connectedComponentParams, componentState) {

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

                            if (seriesIndex != null) {

                                // get the series
                                var series = this.$scope.graphController.series[seriesIndex];

                                if (series == null) {
                                    // the series is null so we will create a series
                                    series = {};
                                    this.$scope.graphController.series[seriesIndex] = series;
                                }

                                // set the data into the series
                                series.data = data;
                            }

                            // render the graph
                            this.$scope.graphController.setupGraph();

                            // the graph has changed
                            this.$scope.graphController.isDirty = true;
                        }
                    }
                }
            }
        }.bind(this);

        /**
         * Handle the delete key press
         */
        this.$scope.handleDeleteKeyPressed = function () {
            this.$scope.graphController.handleDeleteKeyPressed();
        }.bind(this);

        /**
         * Get the component state from this component. The parent node will
         * call this function to obtain the component state when it needs to
         * save student data.
         * @return a component state containing the student data
         */
        this.$scope.getComponentState = function () {

            var componentState = null;

            if (this.$scope.graphController.isDirty) {
                // create a component state populated with the student data
                componentState = this.$scope.graphController.createComponentState();

                // set isDirty to false since this student work is about to be saved
                this.$scope.graphController.isDirty = false;
            }

            return componentState;
        }.bind(this);

        /**
         * The parent node submit button was clicked
         */
        this.$scope.$on('nodeSubmitClicked', angular.bind(this, function (event, args) {

            // get the node id of the node
            var nodeId = args.nodeId;

            // make sure the node id matches our parent node
            if (this.nodeId === nodeId) {

                if (this.isLockAfterSubmit()) {
                    // disable the component if it was authored to lock after submit
                    this.isDisabled = true;
                }
            }
        }));

        /**
         * Listen for the 'exitNode' event which is fired when the student
         * exits the parent node. This will perform any necessary cleanup
         * when the student exits the parent node.
         */
        this.$scope.$on('exitNode', angular.bind(this, function (event, args) {}));
    }

    /**
     * Setup the graph
     */

    _createClass(GraphController, [{
        key: 'setupGraph',
        value: function setupGraph() {

            // get the title
            var title = this.componentContent.title;

            // get the graph type
            var graphType = this.componentContent.graphType;

            // get the x and y axis attributes from the student data
            var xAxis = this.xAxis;
            var yAxis = this.yAxis;

            if (this.xAxis == null && this.componentContent.xAxis != null) {
                /*
                 * the student does not have x axis data so we will use the
                 * x axis from the component content
                 */
                xAxis = this.componentContent.xAxis;
                this.xAxis = xAxis;
            }

            if (this.yAxis == null && this.componentContent.yAxis != null) {
                /*
                 * the student does not have y axis data so we will use the
                 * y axis from the component content
                 */
                yAxis = this.componentContent.yAxis;
                this.yAxis = yAxis;
            }

            /*
             * remember this graph controller so we can access it in the click
             * event for the graph
             */
            var thisGraphController = this;

            // get all the series from the student data
            var series = this.getSeries();

            if ((series == null || series.length === 0) && this.componentContent.series != null) {
                /*
                 * use the series from the component content if the student does not
                 * have any series data
                 */
                series = this.StudentDataService.makeCopyOfJSONObject(this.componentContent.series);
                this.setSeries(series);
            }

            // add the event that will remove a point when clicked
            //this.addClickToRemovePointEvent(series);

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

                    if (this.isDisabled) {
                        // disable dragging
                        tempSeries.draggableX = false;
                        tempSeries.draggableY = false;
                    } else if (tempSeries.canEdit) {
                        // set the fields to allow points to be draggable
                        tempSeries.draggableX = true;
                        tempSeries.draggableY = true;
                        tempSeries.cursor = 'move';
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

            //this.setSeriesIds(allSeries);

            if (this.activeSeries == null && series.length > 0) {
                // the active series has not been set so we will set the active series to the first series
                this.setActiveSeriesByIndex(0);
            }

            this.chartConfig = {
                options: {
                    tooltip: {
                        formatter: function formatter() {
                            /*
                             * When the user mouseovers a point, display a tooltip that looks like
                             *
                             * x: 10
                             * y: 15
                             *
                             */
                            var x = thisGraphController.roundToNearestTenth(this.x);
                            var y = thisGraphController.roundToNearestTenth(this.y);

                            return 'x: ' + x + '<br/>y: ' + y;
                        }
                    },
                    chart: {
                        type: graphType,
                        events: {
                            click: function click(e) {
                                // get the current time
                                var currentTime = new Date().getTime();

                                // check if a drop event recently occurred
                                if (thisGraphController.lastDropTime != null) {

                                    // check if the last drop event was not within the last 100 milliseconds
                                    if (currentTime - thisGraphController.lastDropTime < 100) {

                                        /*
                                         * the last drope event was within the last 100 milliseconds so we
                                         * will not register this click. we need to do this because when
                                         * students drag points, a click event is fired when they release
                                         * the mouse button. we don't want that click event to create a new
                                         * point so we need to ignore it.
                                         */
                                        return;
                                    }
                                }

                                /*
                                 * check if the student can click to add data
                                 * on the graph
                                 */
                                if (!thisGraphController.isDisabled) {

                                    // get the active series
                                    var series = thisGraphController.activeSeries;

                                    // check if the student is allowed to edit the active series
                                    if (series != null && thisGraphController.canEdit(series)) {

                                        /*
                                         * get the x and y positions that were clicked and round
                                         * them to the nearest tenth
                                         */
                                        var x = thisGraphController.roundToNearestTenth(e.xAxis[0].value);
                                        var y = thisGraphController.roundToNearestTenth(e.yAxis[0].value);

                                        // remove any point with the given x value
                                        //thisGraphController.removePointFromSeries(series, x);

                                        // add the point to the series
                                        thisGraphController.addPointToSeries(series, x, y);

                                        /*
                                         * notify the controller that the student data has changed
                                         * so that the graph will be redrawn
                                         */
                                        thisGraphController.studentDataChanged();
                                    }
                                }
                            }
                        }
                    },
                    plotOptions: {
                        series: {
                            allowPointSelect: true,
                            point: {
                                events: {
                                    drag: function drag(e) {
                                        // the student has started dragging a point

                                        // get the active series
                                        var series = thisGraphController.activeSeries;

                                        // check if the student is allowed to edit the active series
                                        if (series != null && thisGraphController.canEdit(series)) {
                                            // set a flag to note that the student is dragging a point
                                            thisGraphController.dragging = true;
                                        }
                                    },
                                    drop: function drop(e) {
                                        // the student has stopped dragging the point and dropped the point

                                        // get the active series
                                        var series = thisGraphController.activeSeries;

                                        // check if the student is allowed to edit the active series
                                        if (series != null && thisGraphController.canEdit(series)) {

                                            if (thisGraphController.dragging) {

                                                // set the dragging flag off
                                                thisGraphController.dragging = false;

                                                // remember this drop time
                                                thisGraphController.lastDropTime = new Date().getTime();

                                                // get the current target
                                                var currentTarget = e.currentTarget;

                                                if (currentTarget != null) {

                                                    /*
                                                     * get the x and y positions where the point was dropped and round
                                                     * them to the nearest tenth
                                                     */
                                                    var x = thisGraphController.roundToNearestTenth(currentTarget.x);
                                                    var y = thisGraphController.roundToNearestTenth(currentTarget.y);

                                                    // get the index of the point
                                                    var index = currentTarget.index;

                                                    // get the series data
                                                    var data = series.data;

                                                    if (data != null) {
                                                        // update the point
                                                        data[index] = [x, y];

                                                        // tell the controller the student data has changed
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
                loading: false
            };
        }
    }, {
        key: 'addPointToSeries0',

        /**
         * Add a point to a series. The point will be inserted into the series
         * in the appropriate position that will keep the series data sorted.
         * @param series the series
         * @param x the x value
         * @param y the y value
         */
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
                    data.push([x, y]);
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

                                                        /*
                                                         * notify the controller that the student data has changed
                                                         * so that the graph will be redrawn
                                                         */
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
         * @return whether the series can edit the series
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
        key: 'setXAxis',

        /**
         * Set the xAxis object
         * @param xAxis the xAxis object that can be used to render the graph
         */
        value: function setXAxis(xAxis) {
            this.xAxis = xAxis;
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
            this.yAxis = yAxis;
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
            // get the original series from the component content
            this.setSeries(this.StudentDataService.makeCopyOfJSONObject(this.componentContent.series));

            if (this.componentContent.xAxis != null) {
                this.setXAxis(this.componentContent.xAxis);
            }

            if (this.componentContent.yAxis != null) {
                this.setYAxis(this.componentContent.yAxis);
            }

            // set the active series to null so that the default series will become selected later
            this.setActiveSeries(null);

            /*
             * notify the controller that the student data has changed
             * so that the graph will be redrawn
             */
            this.studentDataChanged();
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
                    // populate the student data into the component
                    this.setSeries(this.StudentDataService.makeCopyOfJSONObject(studentData.series));
                    this.setXAxis(studentData.xAxis);
                    this.setYAxis(studentData.yAxis);
                    this.setActiveSeriesByIndex(studentData.activeSeriesIndex);
                }
            }
        }
    }, {
        key: 'saveButtonClicked',

        /**
         * Called when the student clicks the save button
         */
        value: function saveButtonClicked() {

            // tell the parent node that this component wants to save
            this.$scope.$emit('componentSaveTriggered', { nodeId: this.nodeId, componentId: this.componentId });
        }
    }, {
        key: 'submitButtonClicked',

        /**
         * Called when the student clicks the submit button
         */
        value: function submitButtonClicked() {
            this.isSubmit = true;

            // check if we need to lock the component after the student submits
            if (this.isLockAfterSubmit()) {
                this.isDisabled = true;

                // re-draw the graph
                this.setupGraph();
            }

            // tell the parent node that this component wants to submit
            this.$scope.$emit('componentSubmitTriggered', { nodeId: this.nodeId, componentId: this.componentId });
        }
    }, {
        key: 'activeSeriesChanged',

        /**
         * The active series has changed
         */
        value: function activeSeriesChanged() {

            // the student data has changed
            this.studentDataChanged();
        }
    }, {
        key: 'studentDataChanged',

        /**
         * Called when the student changes their work
         */
        value: function studentDataChanged() {
            /*
             * set the dirty flag so we will know we need to save the
             * student work later
             */
            this.isDirty = true;

            // re-draw the graph
            this.setupGraph();

            // get this component id
            var componentId = this.getComponentId();

            // create a component state populated with the student data
            var componentState = this.createComponentState();

            //force redraw
            this.$scope.$apply();

            /*
             * the student work in this component has changed so we will tell
             * the parent node that the student data will need to be saved.
             * this will also notify connected parts that this component's student
             * data has changed.
             */
            this.$scope.$emit('componentStudentDataChanged', { componentId: componentId, componentState: componentState });
        }
    }, {
        key: 'createComponentState',

        /**
         * Create a new component state populated with the student data
         * @return the componentState after it has been populated
         */
        value: function createComponentState() {

            // create a new component state
            var componentState = this.NodeService.createNewComponentState();

            if (componentState != null) {
                var studentData = {};

                // insert the series data
                studentData.series = this.StudentDataService.makeCopyOfJSONObject(this.getSeries());

                // remove high-charts assigned id's from each series before saving
                for (var s = 0; s < studentData.series.length; s++) {
                    var series = studentData.series[s];
                    series.id = null;
                }

                // insert the x axis data
                studentData.xAxis = this.getXAxis();

                // insert the y axis data
                studentData.yAxis = this.getYAxis();

                // get the active series index
                var activeSeriesIndex = this.getSeriesIndex(this.activeSeries);

                if (activeSeriesIndex != null) {
                    // set the active series index
                    studentData.activeSeriesIndex = activeSeriesIndex;
                }

                if (this.isSubmit) {
                    // the student submitted this work
                    componentState.isSubmit = this.isSubmit;

                    /*
                     * reset the isSubmit value so that the next component state
                     * doesn't maintain the same value
                     */
                    this.isSubmit = false;
                }

                componentState.studentData = studentData;
            }

            return componentState;
        }
    }, {
        key: 'calculateDisabled',

        /**
         * Check if we need to lock the component
         */
        value: function calculateDisabled() {

            var nodeId = this.nodeId;

            // get the component content
            var componentContent = this.componentContent;

            if (componentContent != null) {

                // check if the parent has set this component to disabled
                if (componentContent.isDisabled) {
                    this.isDisabled = true;
                } else if (componentContent.lockAfterSubmit) {
                    // we need to lock the step after the student has submitted

                    // get the component states for this component
                    var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);

                    // check if any of the component states were submitted
                    var isSubmitted = this.NodeService.isWorkSubmitted(componentStates);

                    if (isSubmitted) {
                        // the student has submitted work for this component
                        this.isDisabled = true;
                    }
                }
            }
        }
    }, {
        key: 'showPrompt',

        /**
         * Check whether we need to show the prompt
         * @return whether to show the prompt
         */
        value: function showPrompt() {
            var show = false;

            if (this.isPromptVisible) {
                show = true;
            }

            return show;
        }
    }, {
        key: 'showSaveButton',

        /**
         * Check whether we need to show the save button
         * @return whether to show the save button
         */
        value: function showSaveButton() {
            var show = false;

            if (this.isSaveButtonVisible) {
                show = true;
            }

            return show;
        }
    }, {
        key: 'showSubmitButton',

        /**
         * Check whether we need to show the submit button
         * @return whether to show the submit button
         */
        value: function showSubmitButton() {
            var show = false;

            if (this.isSubmitButtonVisible) {
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
        key: 'isLockAfterSubmit',

        /**
         * Check whether we need to lock the component after the student
         * submits an answer.
         */
        value: function isLockAfterSubmit() {
            var result = false;

            if (this.componentContent != null) {

                // check the lockAfterSubmit field in the component content
                if (this.componentContent.lockAfterSubmit) {
                    result = true;
                }
            }

            return result;
        }
    }, {
        key: 'getPrompt',

        /**
         * Get the prompt to show to the student
         * @return a string containing the prompt
         */
        value: function getPrompt() {
            var prompt = null;

            if (this.componentContent != null) {
                prompt = this.componentContent.prompt;
            }

            return prompt;
        }
    }, {
        key: 'getSeriesIndex',

        /**
         * Get the index of a series
         * @param series the series
         * @return the index of the series
         */
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
         * Import work from another component
         */

    }, {
        key: 'importWork',
        value: function importWork() {

            // get the component content
            var componentContent = this.componentContent;

            if (componentContent != null) {

                var importWorkNodeId = componentContent.importWorkNodeId;
                var importWorkComponentId = componentContent.importWorkComponentId;

                if (importWorkNodeId != null && importWorkComponentId != null) {

                    // get the latest component state for this component
                    var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

                    /*
                     * we will only import work into this component if the student
                     * has not done any work for this component
                     */
                    if (componentState == null) {
                        // the student has not done any work for this component

                        // get the latest component state from the component we are importing from
                        var importWorkComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(importWorkNodeId, importWorkComponentId);

                        if (importWorkComponentState != null) {
                            /*
                             * populate a new component state with the work from the
                             * imported component state
                             */
                            var populatedComponentState = this.GraphService.populateComponentState(importWorkComponentState);

                            // populate the component state into this component
                            this.setStudentWork(populatedComponentState);
                        }
                    }
                }
            }
        }
    }, {
        key: 'attachNotebookItemToComponent',

        /**
         * handle importing notebook item data (we only support csv for now)
         */
        value: function attachNotebookItemToComponent(notebookItem) {
            if (notebookItem.studentAsset != null) {
                // we're importing a StudentAssetNotebookItem
                var studentAsset = notebookItem.studentAsset;
                this.StudentAssetService.copyAssetForReference(studentAsset).then(angular.bind(this, function (copiedAsset) {
                    if (copiedAsset != null) {
                        var attachment = {
                            notebookItemId: notebookItem.id,
                            studentAssetId: copiedAsset.id,
                            iconURL: copiedAsset.iconURL
                        };

                        this.StudentAssetService.getAssetContent(copiedAsset).then(angular.bind(this, function (assetContent) {
                            var rowData = this.StudentDataService.CSVToArray(assetContent);
                            var params = {};
                            params.skipFirstRow = true; // first row contains header, so ignore it
                            params.xColumn = 0; // assume (for now) x-axis data is in first column
                            params.yColumn = 1; // assume (for now) y-axis data is in second column

                            var seriesData = this.convertRowDataToSeriesData(rowData, params);

                            // get the index of the series that we will put the data into
                            var seriesIndex = this.series.length; // we're always appending a new series

                            if (seriesIndex != null) {

                                // get the series
                                var series = this.series[seriesIndex];

                                if (series == null) {
                                    // the series is null so we will create a series
                                    series = {};
                                    series.name = copiedAsset.fileName;
                                    series.color = this.seriesColors[seriesIndex];
                                    series.marker = {
                                        "symbol": this.seriesMarkers[seriesIndex]
                                    };
                                    series.regression = false;
                                    series.regressionSettings = {};
                                    series.canEdit = false;
                                    this.series[seriesIndex] = series;
                                }

                                // set the data into the series
                                series.data = seriesData;
                            }

                            // render the graph
                            this.setupGraph();

                            // the graph has changed
                            this.isDirty = true;
                        }));
                        this.studentDataChanged();
                    }
                }));
            } else if (notebookItem.studentWork != null) {
                // TODO implement me
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
                    } else {
                        xText = xCell;
                    }

                    var yText = null;
                    if ((typeof yCell === 'undefined' ? 'undefined' : _typeof(yCell)) === 'object' && yCell.text) {
                        yText = yCell.text;
                    } else {
                        yText = yCell;
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

                // loop through all the series
                for (var x = 0; x < allSeries.length; x++) {
                    var series = allSeries[x];

                    // get the series id if it is set
                    var seriesId = series.id;

                    if (seriesId == null) {
                        // the series doesn't have a series id so we will give it one
                        var nextSeriesId = getNextSeriesId(usedSeriesIds);
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
        key: 'roundToNearestTenth',

        /**
         * Round a number to the nearest tenth
         */
        value: function roundToNearestTenth(x) {

            // make sure x is a number
            x = parseFloat(x);

            // round the number to the nearest tenth
            x = Math.round(x * 10) / 10;

            return x;
        }

        /**
         * Handle the delete key press
         */

    }, {
        key: 'handleDeleteKeyPressed',
        value: function handleDeleteKeyPressed() {

            // get the active series
            var series = this.activeSeries;

            // check if the student is allowed to edit the the active series
            if (series != null && this.canEdit(series)) {

                // get the chart
                var chart = $('#chart1').highcharts();

                // get the selected points
                var selectedPoints = chart.getSelectedPoints();

                var index = null;

                if (selectedPoints != null) {

                    // an array to hold the indexes of the selected points
                    var indexes = [];

                    // loop through all the selected points
                    for (var x = 0; x < selectedPoints.length; x++) {

                        // get a selected point
                        var selectedPoint = selectedPoints[x];

                        // get the index of the selected point
                        index = selectedPoint.index;

                        // add the index to our array
                        indexes.push(index);
                    }

                    // order the array from largest to smallest
                    indexes.sort().reverse();

                    // get the series data
                    var data = series.data;

                    // loop through all the indexes and remove them from the series data
                    for (var i = 0; i < indexes.length; i++) {

                        index = indexes[i];

                        if (data != null) {
                            data.splice(index, 1);
                        }
                    }

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
            var componentId = this.componentContent.id;

            return componentId;
        }
    }, {
        key: 'authoringViewComponentChanged',

        /**
         * The component has changed in the regular authoring view so we will save the project
         */
        value: function authoringViewComponentChanged() {

            // update the JSON string in the advanced authoring view textarea
            this.updateAdvancedAuthoringView();

            // save the project to the server
            this.ProjectService.saveProject();
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
                this.componentContent = editedComponentContent;

                // save the project to the server
                this.ProjectService.saveProject();
            } catch (e) {}
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
        key: 'authoringAddSeriesClicked',

        /**
         * Add a series in the authoring view
         */
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

            // remove the series from the series array
            this.authoringComponentContent.series.splice(index, 1);

            // save the project
            this.authoringViewComponentChanged();
        }

        /**
         * Register the the listener that will listen for the exit event
         * so that we can perform saving before exiting.
         */

    }, {
        key: 'registerExitListener',
        value: function registerExitListener() {

            /*
             * Listen for the 'exit' event which is fired when the student exits
             * the VLE. This will perform saving before the VLE exits.
             */
            this.exitListener = this.$scope.$on('exit', angular.bind(this, function (event, args) {

                this.$rootScope.$broadcast('doneExiting');
            }));
        }
    }]);

    return GraphController;
}();

GraphController.$inject = ['$rootScope', '$scope', 'GraphService', 'NodeService', 'ProjectService', 'StudentAssetService', 'StudentDataService'];

exports.default = GraphController;

//# sourceMappingURL=graphController.js.map