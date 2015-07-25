define(['app', 
        'bootstrap', 
        'highcharts', 
        'highcharts-more',
        'highcharts-ng', 
        'jquery'],
        function(app, 
                bootstrap, 
                highcharts, 
                highchartsMore, 
                highchartsng, 
                $) {
    
    app.$controllerProvider.register('GraphController', 
        function($rootScope,
            $scope,
            $state, 
            $stateParams,
            AnnotationService,
            ConfigService,
            CurrentNodeService,
            GraphService,
            NodeService,
            ProjectService,
            SessionService,
            StudentAssetService,
            StudentDataService) {
        
        // the node id of the current node
        this.nodeId = null;
        
        // the component id
        this.componentId = null;
        
        // field that will hold the component content
        this.componentContent = null;
        
        // whether the step should be disabled
        this.isDisabled = false;
        
        // whether the student work is dirty and needs saving
        this.isDirty = false;
        
        // holds all the series
        this.series = [];

        // whether this part is showing previous work
        this.isShowPreviousWork = false;

        // the index of the active student series
        this.activeSeriesIndex = 0;
        
        /**
         * Perform setup of the component
         */
        this.setup = function() {
            
            // get the current node and node id
            var currentNode = CurrentNodeService.getCurrentNode();
            if (currentNode != null) {
                this.nodeId = currentNode.id;
            }
            
            // get the component content from the scope
            this.componentContent = $scope.component;
            
            if (this.componentContent != null) {
                
                // get the component id
                this.componentId = this.componentContent.id;
                
                // get the show previous work node id if it is provided
                var showPreviousWorkNodeId = this.componentContent.showPreviousWorkNodeId;
                
                if (showPreviousWorkNodeId != null) {
                    // this component is showing previous work
                    this.isShowPreviousWork = true;
                    
                    // get the node src for the node we want previous work from
                    var nodeSrc = ProjectService.getNodeSrcByNodeId(showPreviousWorkNodeId);
                    
                    // get the show previous work component id if it is provided
                    var showPreviousWorkComponentId = this.componentContent.showPreviousWorkComponentId;
                    
                    // get the node content for the show previous work node
                    NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(showPreviousWorkNodeContent) {
                        
                        // get the component content for the component we are showing previous work for
                        this.componentContent = NodeService.getComponentContentById(showPreviousWorkNodeContent, showPreviousWorkComponentId);
                        
                        // get the component state for the show previous work
                        var componentState = StudentDataService.getLatestComponentStateByNodeIdAndComponentId(showPreviousWorkNodeId, showPreviousWorkComponentId);
                        
                        // populate the student work into this component
                        this.setStudentWork(componentState);
                        
                        // setup the graph
                        this.setupGraph();
                        
                        // disable the component since we are just showing previous work
                        this.isDisabled = true;

                        // register this component with the parent node
                        $scope.$parent.registerComponentController($scope, this.componentContent);
                    }));
                } else {
                    // this is a regular component

                    // get the component state from the scope
                    var componentState = $scope.componentState;
                    
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
                    
                    // register this component with the parent node
                    $scope.$parent.registerComponentController($scope, this.componentContent);
                }
            }
        };
        
        /**
         * Setup the graph
         */
        this.setupGraph = function() {
            
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
            }
            
            if (this.yAxis == null && this.componentContent.yAxis != null) {
                /*
                 * the student does not have y axis data so we will use the
                 * y axis from the component content
                 */
                yAxis = this.componentContent.yAxis;
            }
            
            /*
             * remember this graph controller so we can access it in the click
             * event for the graph
             */
            var thisGraphController = this;
            
            // get all the series from the student data
            var series = this.getSeries();
            
            if (series == null && this.componentContent.series != null) {
                /*
                 * use the series from the component content if the student does not
                 * have any series data
                 */
                series = StudentDataService.makeCopyOfJSONObject(this.componentContent.series);
                this.setSeries(series);
            }

            // add the event that will remove a point when clicked
            this.addClickToRemovePointEvent(series);

            // loop through all the series and
            for (var s = 0; s < series.length; s++) {
                var tempSeries = series[s];

                // check if the series should have a regression line generated for it
                if (tempSeries != null && tempSeries.regression) {
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
            }

            /*
             * generate an array of regression series for the series that
             * requrie a regression line
             */
            var regressionSeries = GraphService.generateRegressionSeries(series);
            this.regressionSeries = regressionSeries;

            /*
             * create an array that will contain all the regular series and all
             * the regression series
             */
            var allSeries = [];
            allSeries = allSeries.concat(series);
            allSeries = allSeries.concat(regressionSeries);

            this.chartConfig = {
                options: {
                    chart: {
                        type: graphType,
                        zoomType: 'xy',
                        events: {
                            click: function(e) {
                                
                                /*
                                 * check if the student can click to add data
                                 * on the graph
                                 */
                                if (!thisGraphController.isDisabled) {
                                    
                                    // get the index of the active series
                                    var activeSeriesIndex = thisGraphController.activeSeriesIndex;

                                    if (activeSeriesIndex != null) {

                                        // get the active series
                                        var series = thisGraphController.series[activeSeriesIndex];

                                        // check if the student is allowed to add points to the active series
                                        if (series != null && thisGraphController.canClickToAddData(series)) {

                                            // get the x and y positions that were clicked
                                            var x = e.xAxis[0].value;
                                            var y = e.yAxis[0].value;

                                            // round the values to the nearest hundredth
                                            x = Math.round(x * 100) / 100;
                                            y = Math.round(y * 100) / 100;

                                            // remove any point with the given x value
                                            thisGraphController.removePointFromSeries(series, x);

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
        this.addPointToSeries = function(series, x, y) {
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
         * Remove a point from a series. We will remove all points that
         * have the given x value.
         * @param series the series to remove the point from
         * @param x the x value of the point to remove
         */
        this.removePointFromSeries = function(series, x) {
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
        this.addClickToRemovePointEvent = function(series) {

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

                        if (this.canClickToAddData(tempSeries)) {
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

                                            // get the index of the active series
                                            var activeSeriesIndex = thisGraphController.activeSeriesIndex;

                                            if (thisGraphController != null &&
                                                thisGraphController.series != null &&
                                                thisGraphController.series[activeSeriesIndex] != null) {

                                                // get the active series
                                                var activeSeries = thisGraphController.series[activeSeriesIndex];

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
         * Check whether the student is allowed to click on given series to
         * add a data point
         * @param series the series to check
         * @return whether the series can be clicked to add data
         */
        this.canClickToAddData = function(series) {
            var result = false;

            if (series != null && series.canClickToAddData) {
                result = true;
            }

            return result;
        };

        /**
         * Set all the series
         * @param series an array of series
         */
        this.setSeries = function(series) {
            this.series = series;
        };

        /**
         * Get all the series
         * @returns an array of series
         */
        this.getSeries = function() {
            return this.series;
        };

        /**
         * Set the xAxis object
         * @param xAxis the xAxis object that can be used to render the graph
         */
        this.setXAxis = function(xAxis) {
            this.xAxis = xAxis;
        };

        /**
         * Get the xAxis object
         * @return the xAxis object that can be used to render the graph
         */
        this.getXAxis = function() {
            return this.xAxis;
        };

        /**
         * Set the yAxis object
         * @param yAxis the yAxis object that can be used to render the graph
         */
        this.setYAxis = function(yAxis) {
            this.yAxis = yAxis;
        };

        /**
         * Get the yAxis object
         * @return the yAxis object that can be used to render the graph
         */
        this.getYAxis = function() {
            return this.yAxis;
        };
        
        /**
         * Reset the table data to its initial state from the component content
         */
        this.resetGraph = function() {
            // get the original series from the component content
            this.setSeries(StudentDataService.makeCopyOfJSONObject(this.componentContent.series));

            /*
             * notify the controller that the student data has changed
             * so that the graph will be redrawn
             */
            this.studentDataChanged();
        };
        
        /**
         * Populate the student work into the component
         * @param componentState the component state to populate into the component
         */
        this.setStudentWork = function(componentState) {
            
            if (componentState != null) {
                
                // get the student data from the component state
                var studentData = componentState.studentData;
                
                if (studentData != null) {
                    // populate the student data into the component
                    this.setSeries(StudentDataService.makeCopyOfJSONObject(studentData.series));
                    this.setXAxis(studentData.xAxis);
                    this.setYAxis(studentData.yAxis);
                }
            }
        };
        
        /**
         * Called when the student clicks the save button
         */
        this.saveButtonClicked = function() {
            this.saveTriggeredBy = 'saveButton';
            
            $scope.$emit('componentSaveClicked');
        };
        
        /**
         * Called when the student clicks the submit button
         */
        this.submitButtonClicked = function() {
            this.saveTriggeredBy = 'submitButton';
            this.isSubmit = true;
            
            // check if we need to lock the component after the student submits
            if (this.isLockAfterSubmit()) {
                this.isDisabled = true;
                
                // re-draw the graph
                this.setupGraph();
            }

            /*
             * notify the parent node that the submit button in this component
             * was clicked
             */
            $scope.$emit('componentSubmitClicked');
        };
        
        /**
         * Called when the student changes their work
         */
        this.studentDataChanged = function() {
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
            
            /*
             * the student work in this component has changed so we will tell
             * the parent node that the student data will need to be saved. 
             * this will also notify connected parts that this component's student 
             * data has changed.
             */
            $scope.$emit('componentStudentDataChanged', {componentId: componentId, componentState: componentState});
        };

        /**
         * Create a new component state populated with the student data
         * @return the componentState after it has been populated
         */
        this.createComponentState = function() {
            
            // create a new component state
            var componentState = NodeService.createNewComponentState();
            
            if (componentState != null) {
                var studentData = {};
                
                // insert the series data
                studentData.series = StudentDataService.makeCopyOfJSONObject(this.getSeries());

                // insert the x axis data
                studentData.xAxis = this.getXAxis();
                
                // insert the y axis data
                studentData.yAxis = this.getYAxis();
                
                componentState.studentData = studentData;
                
                if(this.saveTriggeredBy != null) {
                    // set the saveTriggeredBy value
                    componentState.saveTriggeredBy = this.saveTriggeredBy;
                }
            }
            
            return componentState;
        };
        
        /**
         * Check if we need to lock the component
         */
        this.calculateDisabled = function() {
            
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
                    var componentStates = StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);
                    
                    // check if any of the component states were submitted
                    var isSubmitted = NodeService.isWorkSubmitted(componentStates);
                    
                    if (isSubmitted) {
                        // the student has submitted work for this component
                        this.isDisabled = true;
                    }
                }
            }
        };
        
        /**
         * Check whether we need to show the save button
         * @return whether to show the save button
         */
        this.showSaveButton = function() {
            var show = false;
            
            if (this.componentContent != null) {
                
                // check the showSaveButton field in the component content
                if (this.componentContent.showSaveButton) {
                    show = true;
                }
            }
            
            return show;
        };
        
        /**
         * Check whether we need to show the submit button
         * @return whether to show the submit button
         */
        this.showSubmitButton = function() {
            var show = false;
            
            if (this.componentContent != null) {
                
                // check the showSubmitButton field in the component content
                if (this.componentContent.showSubmitButton) {
                    show = true;
                }
            }
            
            return show;
        };
        
        /**
         * Check whether we need to lock the component after the student
         * submits an answer.
         */
        this.isLockAfterSubmit = function() {
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
        this.getPrompt = function() {
            var prompt = null;
            
            if (this.componentContent != null) {
                prompt = this.componentContent.prompt;
            }
            
            return prompt;
        };
        
        /**
         * Import work from another component
         */
        this.importWork = function() {
            
            // get the component content
            var componentContent = this.componentContent;
            
            if (componentContent != null) {
                
                var importWorkNodeId = componentContent.importWorkNodeId;
                var importWorkComponentId = componentContent.importWorkComponentId;
                
                if (importWorkNodeId != null && importWorkComponentId != null) {
                    
                    // get the latest component state for this component
                    var componentState = StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
                    
                    /*
                     * we will only import work into this component if the student
                     * has not done any work for this component
                     */
                    if(componentState == null) {
                        // the student has not done any work for this component
                        
                        // get the latest component state from the component we are importing from
                        var importWorkComponentState = StudentDataService.getLatestComponentStateByNodeIdAndComponentId(importWorkNodeId, importWorkComponentId);
                        
                        if (importWorkComponentState != null) {
                            /*
                             * populate a new component state with the work from the 
                             * imported component state
                             */
                            var populatedComponentState = GraphService.populateComponentState(importWorkComponentState);
                            
                            // populate the component state into this component
                            this.setStudentWork(populatedComponentState);
                        }
                    }
                }
            }
        };

        /**
         * A connected component has changed its student data so we will
         * perform any necessary changes to this component
         * @param connectedComponent the connected component
         * @param connectedComponentParams the connected component params
         * @param componentState the student data from the connected 
         * component that has changed
         */
        $scope.handleConnectedComponentStudentDataChanged = function(connectedComponent, connectedComponentParams, componentState) {
            
            if (connectedComponent != null && componentState != null) {
                
                // get the component type that has changed
                var componentType = connectedComponent.componentType;
                
                if (componentType === 'Table') {
                    
                    // convert the table data to series data
                    var data = $scope.graphController.convertTableDataToSeriesData(componentState, connectedComponentParams);
                    
                    // create a new series object
                    var series = {};
                    
                    // set the data into the series
                    series.data = data;
                    
                    if ($scope.graphController.series == null) {
                        // initialize the series in the controller
                        $scope.graphController.series = [];
                    }
                    
                    // set the series into the array of series
                    $scope.graphController.series[0] = series;
                    
                    // render the graph
                    $scope.graphController.setupGraph();
                    
                    // the graph has changed
                    $scope.graphController.isDirty = true;
                }
            }
        }
        
        /**
         * Convert the table data into series data
         * @param componentState the component state to get table data from
         * @param params (optional) the params to specify what columns
         * and rows to use from the table data
         */
        this.convertTableDataToSeriesData = function(componentState, params) {
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
            
            if (componentState != null) {
                
                // get the student data
                var studentData = componentState.studentData;
                
                if (studentData != null && studentData.tableData != null) {
                    
                    // get the rows in the table
                    var rows = studentData.tableData;
                    
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
                            var xText = xCell.text;
                            var yText = yCell.text;
                            
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
                }
            }
            
            return data;
        };
        
        /**
         * Get the component id
         * @return the component id
         */
        this.getComponentId = function() {
            var componentId = this.componentContent.id;
            
            return componentId;
        };
        
        /**
         * Get the component state from this component. The parent node will 
         * call this function to obtain the component state when it needs to
         * save student data.
         * @return a component state containing the student data
         */
        $scope.getComponentState = function() {
            
            var componentState = null;
            
            if ($scope.graphController.isDirty) {
                // create a component state populated with the student data
                componentState = $scope.graphController.createComponentState();
                
                // set isDirty to false since this student work is about to be saved
                $scope.graphController.isDirty = false;
            }
            
            return componentState;
        };
        
        /**
         * The parent node submit button was clicked
         */
        $scope.$on('nodeSubmitClicked', angular.bind(this, function(event, args) {
            
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
        $scope.$on('exitNode', angular.bind(this, function(event, args) {
            
        }));
        
        /**
         * Register the the listener that will listen for the exit event
         * so that we can perform saving before exiting.
         */
        this.registerExitListener = function() {
            
            /*
             * Listen for the 'exit' event which is fired when the student exits
             * the VLE. This will perform saving before the VLE exits.
             */
            this.exitListener = $scope.$on('exit', angular.bind(this, function(event, args) {
                
                $rootScope.$broadcast('doneExiting');
            }));
        };
        
        // perform setup of this component
        this.setup();
    });
});