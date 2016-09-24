import html2canvas from 'html2canvas';

//import $ from 'jquery';
//import Highcharts from 'highcharts';
//import angularHighcharts from 'highcharts-ng';
//import Highcharts from '../../lib/highcharts@4.2.1';
//import draggablePoints from 'highcharts/draggable-points';

class GraphController {
    constructor($q,
                $rootScope,
                $scope,
                ConfigService,
                GraphService,
                NodeService,
                NotebookService,
                ProjectService,
                StudentAssetService,
                StudentDataService,
                UtilService) {

        this.$q = $q;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.ConfigService = ConfigService;
        this.GraphService = GraphService;
        this.NodeService = NodeService;
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;
        this.idToOrder = this.ProjectService.idToOrder;

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

        // whether the student work has changed since last submit
        this.isSubmitDirty = false;

        // message to show next to save/submit buttons
        this.saveMessage = {
            text: '',
            time: ''
        };

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

        // the latest annotations
        this.latestAnnotations = null;

        // whether the reset graph button is shown or not
        this.isResetGraphButtonVisible = false;

        // whether the select series input is shown or not
        this.isSelectSeriesVisible = false;
        
        // whether the snip drawing button is shown or not
        this.isSnipDrawingButtonVisible = true;

        // the id of the chart element
        this.chartId = 'chart1';

        // the width of the graph
        this.width = 800;

        // the height of the graph
        this.height = 500;

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
        this.authoringComponentContentJSONString = this.$scope.authoringComponentContentJSONString;

        /*
         * get the original component content. this is used when showing
         * previous work from another component.
         */
        this.originalComponentContent = this.$scope.originalComponentContent;

        // the mode to load the component in e.g. 'student', 'grading', 'onlyShowWork'
        this.mode = this.$scope.mode;

        this.workgroupId = this.$scope.workgroupId;
        this.teacherWorkgroupId = this.$scope.teacherWorkgroupId;
        
        this.trials = [];
        this.activeTrial = null;
        this.studentDataVersion = 2;
        
        this.canCreateNewTrials = false;
        this.canDeleteTrials = false;

        if (this.componentContent != null) {

            // get the component id
            this.componentId = this.componentContent.id;

            // set the chart id
            this.chartId = 'chart' + this.componentId;
            
            if (this.componentContent.canCreateNewTrials) {
                this.canCreateNewTrials = this.componentContent.canCreateNewTrials;
            }
            
            if (this.componentContent.canDeleteTrials) {
                this.canDeleteTrials = this.componentContent.canDeleteTrials;
            }

            if (this.mode === 'student') {
                this.isPromptVisible = true;
                this.isSaveButtonVisible = this.componentContent.showSaveButton;
                this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
                //this.isResetGraphButtonVisible = true;
                this.isResetSeriesButtonVisible = true;
                this.isSelectSeriesVisible = true;

                // get the latest annotations
                // TODO: watch for new annotations and update accordingly
                this.latestAnnotations = this.$scope.$parent.nodeController.getLatestComponentAnnotations(this.componentId);
            } else if (this.mode === 'grading') {
                this.isPromptVisible = true;
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                //this.isResetGraphButtonVisible = false;
                this.isResetSeriesButtonVisible = false;
                this.isSelectSeriesVisible = false;
                this.isDisabled = true;
                this.isSnipDrawingButtonVisible = false;
            } else if (this.mode === 'onlyShowWork') {
                this.isPromptVisible = true;
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isResetGraphButtonVisible = false;
                this.isResetSeriesButtonVisible = false;
                this.isSelectSeriesVisible = false;
                this.isDisabled = true;
                this.isSnipDrawingButtonVisible = false;
            } else if (this.mode === 'showPreviousWork') {
                this.isPromptVisible = true;
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isDisabled = true;
            } else if (this.mode === 'authoring') {
            }

            var componentState = null;

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
                } else {
                    
                    /* 
                     * trials are enabled so we will create an empty trial
                     * since there is no student work
                     */
                    this.newTrial();
                }
            } else {
                // populate the student work into this component
                this.setStudentWork(componentState);
            }

            // check if we need to lock this component
            this.calculateDisabled();

            // setup the graph
            this.setupGraph();

            if (this.$scope.$parent.nodeController != null) {
                // register this component with the parent node
                this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
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

                            if (seriesIndex != null) {

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

                        // get the student data
                        var studentData = componentState.studentData;
                        
                        // parse the latest trial and set it into the component
                        this.parseLatestTrial(studentData);
                        
                        /*
                         * notify the controller that the student data has 
                         * changed so that it will perform any necessary saving
                         */
                        this.studentDataChanged();
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

        /**
         * The parent node submit button was clicked
         */
        this.$scope.$on('nodeSubmitClicked', angular.bind(this, function(event, args) {

            // get the node id of the node
            var nodeId = args.nodeId;

            // make sure the node id matches our parent node
            if (this.nodeId === nodeId) {
                this.isSubmit = true;
            }
        }));

        /**
         * Listen for the 'studentWorkSavedToServer' event which is fired when
         * we receive the response from saving a component state to the server
         */
        this.$scope.$on('studentWorkSavedToServer', angular.bind(this, function(event, args) {

            let componentState = args.studentWork;

            // check that the component state is for this component
            if (componentState && this.nodeId === componentState.nodeId
                && this.componentId === componentState.componentId) {

                // set isDirty to false because the component state was just saved and notify node
                this.isDirty = false;
                this.$scope.$emit('componentDirty', {componentId: this.componentId, isDirty: false});

                let isAutoSave = componentState.isAutoSave;
                let isSubmit = componentState.isSubmit;
                let serverSaveTime = componentState.serverSaveTime;
                let clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);

                // set save message
                if (isSubmit) {
                    this.setSaveMessage('Submitted', clientSaveTime);

                    this.submit();

                    // set isSubmitDirty to false because the component state was just submitted and notify node
                    this.isSubmitDirty = false;
                    this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: false});
                } else if (isAutoSave) {
                    this.setSaveMessage('Auto-saved', clientSaveTime);
                } else {
                    this.setSaveMessage('Saved', clientSaveTime);
                }

                // re-draw the graph
                this.setupGraph();
            }
        }));

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
    }

    /**
     * Setup the graph
     */
    setupGraph() {

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

        if (this.xAxis != null) {
            // do not display decimals on the x axis
            this.xAxis.allowDecimals = false;
        }

        if (this.yAxis == null && this.componentContent.yAxis != null) {
            /*
             * the student does not have y axis data so we will use the
             * y axis from the component content
             */
            yAxis = this.componentContent.yAxis;
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

        /*
         * remember this graph controller so we can access it in the click
         * event for the graph
         */
        var thisGraphController = this;

        // get all the series from the student data
        var series = this.getSeries();
        
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
                    }
                }
            }
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

        if (this.activeSeries == null && series.length > 0) {
            // the active series has not been set so we will set the active series to the first series
            this.setActiveSeriesByIndex(0);
        }

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
                    tempSeries.allowPointSelect = false;
                } else if (tempSeries.canEdit && this.isActiveSeriesIndex(s)) {
                    // set the fields to allow points to be draggable
                    tempSeries.draggableX = true;
                    tempSeries.draggableY = true;
                    tempSeries.allowPointSelect = true;
                    tempSeries.cursor = 'move';
                } else {
                    // make the series uneditable
                    tempSeries.draggableX = false;
                    tempSeries.draggableY = false;
                    tempSeries.allowPointSelect = false;
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

        this.chartConfig = {
            options: {
                tooltip: {
                    formatter:function(){
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
                    width: this.width,
                    height: this.height,
                    type: graphType,
                    events: {
                        click: function(e) {
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

                                    /*
                                     * get the x and y positions that were clicked and round
                                     * them to the nearest tenth
                                     */
                                    var x = thisGraphController.roundToNearestTenth(e.xAxis[0].value);
                                    var y = thisGraphController.roundToNearestTenth(e.yAxis[0].value);

                                    // add the point to the series
                                    thisGraphController.addPointToSeries(activeSeries, x, y);

                                    // notify the controller that the student data has changed
                                    thisGraphController.studentDataChanged();
                                }
                            }
                        }
                    }
                },
                plotOptions: {
                    series: {
                        stickyTracking: false,
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
                                                var x = thisGraphController.roundToNearestTenth(target.x);
                                                var y = thisGraphController.roundToNearestTenth(target.y);

                                                // get the index of the point
                                                var index = target.index;

                                                // get the series data
                                                var data = activeSeries.data;

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
    };

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
                data.push([x, y]);
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
    };

    /**
     * Check whether the student is allowed to edit a given series
     * @param series the series to check
     * @return whether the series can edit the series
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

        /*
         * notify the controller that the student data has changed
         * so that the graph will be redrawn
         */
        this.studentDataChanged();
    };

    /**
     * Reset the active series
     */
    resetSeries() {

        var confirmMessage = '';

        // get the series name
        var seriesName = this.activeSeries.name;

        if (seriesName == null || seriesName == '') {
            confirmMessage = 'Are you sure you want to reset the series?';
        } else {
            confirmMessage = 'Are you sure you want to reset the "' + seriesName + '" series?';
        }

        // ask the student if they are sure they want to reset the series
        var answer = confirm(confirmMessage);

        if (answer) {
            // the student answer yes to reset the series

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

                    /*
                     * notify the controller that the student data has changed
                     * so that the graph will be redrawn
                     */
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
                        
                        // redraw the graph
                        this.setupGraph();
                    }
                }
                
                this.setXAxis(studentData.xAxis);
                this.setYAxis(studentData.yAxis);
                this.setActiveSeriesByIndex(studentData.activeSeriesIndex);

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
                // set save message
                this.setSaveMessage('Last submitted', clientSaveTime);
            } else {
                // latest state is not a submission, so set isSubmitDirty to true and notify node
                this.isSubmitDirty = true;
                this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});
                // set save message
                this.setSaveMessage('Last saved', clientSaveTime);
            }
        }
    };

    /**
     * Called when the student clicks the save button
     */
    saveButtonClicked() {
        this.isSubmit = false;

        // tell the parent node that this component wants to save
        this.$scope.$emit('componentSaveTriggered', {nodeId: this.nodeId, componentId: this.componentId});
    };

    /**
     * Called when the student clicks the submit button
     */
    submitButtonClicked() {
        this.isSubmit = true;

        // tell the parent node that this component wants to submit
        this.$scope.$emit('componentSubmitTriggered', {nodeId: this.nodeId, componentId: this.componentId});
    };

    /**
     * The active series has changed
     */
    activeSeriesChanged() {
        // the student data has changed
        this.studentDataChanged();
        
        // tell the parent node that this component wants to save
        //this.$scope.$emit('componentSaveTriggered', {nodeId: this.nodeId, componentId: this.componentId});
    };

    submit() {
        // check if we need to lock the component after the student submits
        if (this.isLockAfterSubmit()) {
            this.isDisabled = true;
        }
    };

    /**
     * Called when the student changes their work
     */
    studentDataChanged() {
        /*
         * set the dirty flags so we will know we need to save or submit the
         * student work later
         */
        this.isDirty = true;
        this.$scope.$emit('componentDirty', {componentId: this.componentId, isDirty: true});

        this.isSubmitDirty = true;
        this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});

        // clear out the save message
        this.setSaveMessage('', null);

        // re-draw the graph
        this.setupGraph();

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
        this.createComponentState(action).then((componentState) => {

            // check if a digest is in progress
            if(!this.$scope.$$phase) {
                // digest is not in progress so we can force a redraw
                // TODO GK (from HT) this line was causing a lot of js errors ( $digest already in progress ), so I commented it out
                // and it still seems to work. Do we need this line?
                // see here: http://stackoverflow.com/questions/12729122/angularjs-prevent-error-digest-already-in-progress-when-calling-scope-apply
                //this.$scope.$apply();
            }

            this.$scope.$emit('componentStudentDataChanged', {componentId: componentId, componentState: componentState});
        });
    };

    /**
     * Create a new component state populated with the student data
     * @param action the action that is triggering creating of this component state
     * e.g. 'submit', 'save', 'change'
     * @return a promise that will return a component state
     */
    createComponentState(action) {

        // create a new component state
        var componentState = this.NodeService.createNewComponentState();

        if (componentState != null) {
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
            studentData.xAxis = this.getXAxis();

            // insert the y axis data
            studentData.yAxis = this.getYAxis();

            // get the active series index
            var activeSeriesIndex  = this.getSeriesIndex(this.activeSeries);

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

        var deferred = this.$q.defer();

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
        /*
         * we don't need to perform any additional processing so we can resolve
         * the promise immediately
         */
        deferred.resolve(componentState);
    }

    /**
     * Check if we need to lock the component
     */
    calculateDisabled() {

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
    };

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
     * Check whether we need to show the save button
     * @return whether to show the save button
     */
    showSaveButton() {
        var show = false;

        if (this.isSaveButtonVisible) {
            show = true;
        }

        return show;
    };

    /**
     * Check whether we need to show the submit button
     * @return whether to show the submit button
     */
    showSubmitButton() {
        var show = false;

        if (this.isSubmitButtonVisible) {
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
     * Check whether we need to lock the component after the student
     * submits an answer.
     */
    isLockAfterSubmit() {
        var result = false;

        if (this.componentContent != null) {

            // check the lockAfterSubmit field in the component content
            if (this.componentContent.lockAfterSubmit) {
                result = true;
            }
        }

        return result;
    };

    /**
     * Get the prompt to show to the student
     * @return a string containing the prompt
     */
    getPrompt() {
        var prompt = null;

        if (this.originalComponentContent != null) {
            // this is a show previous work component

            if (this.originalComponentContent.showPreviousWorkPrompt) {
                // show the prompt from the previous work component
                prompt = this.componentContent.prompt;
            } else {
                // show the prompt from the original component
                prompt = this.originalComponentContent.prompt;
            }
        } else if (this.componentContent != null) {
            prompt = this.componentContent.prompt;
        }

        return prompt;
    };

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
     * Import work from another component
     */
    importWork() {

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
                if(componentState == null) {
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
    };

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
                        params.xColumn = 0;          // assume (for now) x-axis data is in first column
                        params.yColumn = 1;          // assume (for now) y-axis data is in second column

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
                    });
                    this.studentDataChanged();
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
     * Round a number to the nearest tenth
     */
    roundToNearestTenth(x) {

        // make sure x is a number
        x = parseFloat(x);

        // round the number to the nearest tenth
        x = Math.round(x * 10) / 10;

        return x;
    }

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
    };

    /**
     * Get the component id
     * @return the component id
     */
    getComponentId() {
        return this.componentContent.id;
    };


    /**
     * The component has changed in the regular authoring view so we will save the project
     */
    authoringViewComponentChanged() {

        // update the JSON string in the advanced authoring view textarea
        this.updateAdvancedAuthoringView();
    };

    /**
     * Update the component JSON string that will be displayed in the advanced authoring view textarea
     */
    updateAdvancedAuthoringView() {
        this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
        this.advancedAuthoringViewComponentChanged();
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

            // set the new component into the controller
            this.componentContent = authoringComponentContent;

            /*
             * notify the parent node that the content has changed which will save
             * the project to the server
             */
            this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
        } catch(e) {
        }
    };

    /**
     * The show previous work node id has changed
     */
    authoringShowPreviousWorkNodeIdChanged() {

        if (this.authoringComponentContent.showPreviousWorkNodeId == null ||
            this.authoringComponentContent.showPreviousWorkNodeId == '') {

            /*
             * the show previous work node id is null so we will also set the
             * show previous component id to null
             */
            this.authoringComponentContent.showPreviousWorkComponentId = '';
        }

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
    }

    /**
     * Get all the step node ids in the project
     * @returns all the step node ids
     */
    getStepNodeIds() {
        var stepNodeIds = this.ProjectService.getNodeIds();

        return stepNodeIds;
    }

    /**
     * Get the step number and title
     * @param nodeId get the step number and title for this node
     * @returns the step number and title
     */
    getNodePositionAndTitleByNodeId(nodeId) {
        var nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);

        return nodePositionAndTitle;
    }

    /**
     * Get the components in a step
     * @param nodeId get the components in the step
     * @returns the components in the step
     */
    getComponentsByNodeId(nodeId) {
        var components = this.ProjectService.getComponentsByNodeId(nodeId);

        return components;
    }

    /**
     * Check if a node is a step node
     * @param nodeId the node id to check
     * @returns whether the node is an application node
     */
    isApplicationNode(nodeId) {
        var result = this.ProjectService.isApplicationNode(nodeId);

        return result;
    }

    /**
     * Add a series in the authoring view
     */
    authoringAddSeriesClicked() {

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
     * Delete a series in the authoring view
     * @param the index of the series in the series array
     */
    authoringDeleteSeriesClicked(index) {

        // remove the series from the series array
        this.authoringComponentContent.series.splice(index, 1);

        // save the project
        this.authoringViewComponentChanged();
    };

    /**
     * Set the message next to the save button
     * @param message the message to display
     * @param time the time to display
     */
    setSaveMessage(message, time) {
        this.saveMessage.text = message;
        this.saveMessage.time = time;
    };

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

        if (this.series.indexOf(this.activeSeries) === seriesIndex) {
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

        if (this.hasEditableSeries() && this.isSelectSeriesVisible && this.series.length > 1) {
            /*
             * we are in a mode the shows the select series input and there is
             * more than one series
             */
            show = true;
        }

        return show;
    }
    
    /**
     * Create a new trial
     */
    newTrial() {
        
        // get the current number of trials
        var trialCount = this.trials.length;
        
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
        
        if (!this.componentContent.showAllTrialsOnNewTrial) {
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
        trial.name = 'Trial ' + (maxTrialNumber + 1);
        trial.series = series;
        trial.show = true;
        
        // add the trial to the array of trials
        this.trials.push(trial);
        
        // set the new trial to be the active trial
        this.activeTrial = trial;
        
        // set the series to be displayed
        this.series = series;
        
        var activeSeriesIndex = 0;
        
        if (this.activeSeries != null) {
            // get the index of the active series
            activeSeriesIndex = this.getSeriesIndex(this.activeSeries);
        }
        
        this.setActiveSeriesByIndex(activeSeriesIndex);
        
        // redraw the graph
        this.setupGraph();
        
        /*
         * notify the controller that the student data has 
         * changed so that it will perform any necessary saving
         */
        this.studentDataChanged();
        
        // tell the parent node that this component wants to save
        //this.$scope.$emit('componentSaveTriggered', {nodeId: this.nodeId, componentId: this.componentId});
    }
    
    /**
     * Delete a trial
     */
    deleteTrial(trialIndex) {
        
        /*
         * get the index of the active trial which will be the trial we are
         * going to delete
         */
        //var trialIndex = this.trials.indexOf(this.activeTrial);
        
        if (trialIndex == null) {
            trialIndex = this.trials.indexOf(this.activeTrial);
        }
        
        if (trialIndex != null && trialIndex != -1) {
            
            // remove the trial from the array of trials
            this.trials.splice(trialIndex, 1);
            
            if (this.trials.length == 0) {
                // there are no more trials so we will create a new empty trial
                this.newTrial();
                
                // reset the axis limits
                this.setXAxis(this.componentContent.xAxis);
                this.setYAxis(this.componentContent.yAxis);
            } else if (this.trials.length > 0) {
                // set the active trial to the next highest trial number
                if (trialIndex > (this.trials.length - 1)) {
                    /*
                     * the trial index is higher than any available index
                     * in the trials array so we will just use the last index
                     */
                    this.activeTrial = this.trials[this.trials.length - 1];
                    this.activeTrialChanged(this.trials.length - 1);
                } else {
                    // make the next highest trial the active trial
                    this.activeTrial = this.trials[trialIndex];
                    this.activeTrialChanged(trialIndex);
                }
            }
        }
        
        /*
         * notify the controller that the student data has 
         * changed so that it will perform any necessary saving
         */
        this.studentDataChanged();
        
        // tell the parent node that this component wants to save
        //this.$scope.$emit('componentSaveTriggered', {nodeId: this.nodeId, componentId: this.componentId});
    }
    
    /**
     * The student has selected a different trial to view
     */
    activeTrialChanged() {
        
        // get the index of the active series
        var activeSeriesIndex  = this.getSeriesIndex(this.activeSeries);
        
        // get the active trial
        var activeTrial = this.activeTrial;
        
        if (activeTrial != null) {
            
            // get the series from the trial
            var series = activeTrial.series;

            // set the series to be displayed
            this.series = series;
            
            /*
             * set the active series index so that the the active series
             * is the same as before.
             */
            this.setActiveSeriesByIndex(activeSeriesIndex);
            
            // redraw the graph
            this.setupGraph();
        }
        
        /*
         * notify the controller that the student data has 
         * changed so that it will perform any necessary saving
         */
        this.studentDataChanged();
        
        // tell the parent node that this component wants to save
        //this.$scope.$emit('componentSaveTriggered', {nodeId: this.nodeId, componentId: this.componentId});
    }
    
    /**
     * Parse the trials and set it into the component
     * @param studentData the student data object that has a trials field
     */
    parseTrials0(studentData) {
        
        if (studentData != null) {
            
            // get the trials
            var trials = studentData.trials;
            
            if (trials != null) {
                
                this.trials = [];
                
                // loop through all the trials in the student data
                for (var t = 0; t < trials.length; t++) {
                    var tempTrial = trials[t];
                    
                    if (tempTrial != null) {
                        
                        // create a trial object
                        var newTrial = {};
                        
                        if (tempTrial.name != null) {
                            
                            // set the trial name
                            newTrial.name = tempTrial.name;
                        }
                        
                        if (tempTrial.series != null) {
                            
                            // set the trial series
                            newTrial.series = [];
                            
                            var tempSeries = tempTrial.series;
                            
                            if (tempSeries != null) {
                                
                                // loop through all the series in the trial
                                for (var s = 0; s < tempSeries.length; s++) {
                                    
                                    // get a single series
                                    var singleSeries = tempSeries[s];
                                    
                                    if (singleSeries != null) {
                                        
                                        // get the series name and data
                                        var seriesName = singleSeries.name;
                                        var seriesData = singleSeries.data;
                                        
                                        // make a series object
                                        var newSeries = {};
                                        newSeries.name = seriesName;
                                        newSeries.data = seriesData;
                                        newSeries.canEdit = false;
                                        newSeries.allowPointSelect = false;
                                        
                                        // add the series to the trial
                                        newTrial.series.push(newSeries);
                                    }
                                }
                            }
                        }
                        
                        // add the trial to the array of trials
                        this.trials.push(newTrial);
                    }
                }
                
                if (trials.length > 0) {
                    // make the last trial the active trial
                    this.activeTrial = this.trials[trials.length - 1];
                }
            }
            
            // redraw the graph so that the active trial gets displayed
            this.activeTrialChanged();
        }
    }
    
    /**
     * Parse the latest trial and set it into the component
     * @param studentData the student data object that has a trials field
     */
    parseLatestTrial(studentData) {
        
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
                         * check if the trial has an id. if the trial doesn't
                         * have an id it means it was automatically created by
                         * the component.
                         */
                        if (firstTrial.id == null) {
                            // delete the first trial
                            this.trials.shift();
                        }
                    }
                }
                
                // get the latest student data trial id
                var latestStudentDataTrialId = latestStudentDataTrial.id;
                
                // get the trial with the given trial id
                var latestTrial = this.getTrialById(latestStudentDataTrialId);
                
                if (latestTrial == null) {
                    /* 
                     * we did not find a trial with the given id which means
                     * this is a new trial
                     */
                    
                    if (!this.componentContent.showAllTrialsOnNewTrial) {
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
                            
                            // get a single series
                            var singleSeries = tempSeries[s];
                            
                            if (singleSeries != null) {
                                
                                // get the series name and data
                                var seriesName = singleSeries.name;
                                var seriesData = singleSeries.data;
                                var seriesColor = singleSeries.color;
                                
                                // make a series object
                                var newSeries = {};
                                newSeries.name = seriesName;
                                newSeries.data = seriesData;
                                newSeries.color = seriesColor;
                                newSeries.canEdit = false;
                                newSeries.allowPointSelect = false;
                                
                                // add the series to the trial
                                latestTrial.series.push(newSeries);
                            }
                        }
                    }
                }
            }
            
            if (this.trials.length > 0) {
                // make the last trial the active trial
                this.activeTrial = this.trials[this.trials.length - 1];
                this.activeTrial.show = true;
            }
            
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
            
            if (xAxis != null) {
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
            
            if (yAxis != null) {
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
     * The "Enable Trials" checkbox was clicked
     */
    authoringViewEnableTrialsClicked() {
        
        if (this.authoringComponentContent.enableTrials) {
            // trials are now enabled
            this.authoringComponentContent.canCreateNewTrials = true;
            this.authoringComponentContent.canDeleteTrials = true;
        } else {
            // trials are now disabled
            this.authoringComponentContent.canCreateNewTrials = false;
            this.authoringComponentContent.canDeleteTrials = false;
            this.authoringComponentContent.showAllTrialsOnNewTrial = false;
        }
        
        this.authoringViewComponentChanged();
    }
    
    /**
     * Check whether we need to show the snip drawing button
     * @return whether to show the snip drawing button
     */
    showSnipDrawingButton() {
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
                this.NotebookService.addNewItem($event, imageObject);
            });
        }
    }
}


GraphController.$inject = [
    '$q',
    '$rootScope',
    '$scope',
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
