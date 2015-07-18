define(['app', 
        'bootstrap', 
        'highcharts', 
        'highcharts-more',
        'highcharts-ng', 
        'highcharts-regression', 
        'jquery'], 
        function(app, 
                bootstrap, 
                highcharts, 
                highchartsMore, 
                highchartsng, 
                highchartsRegression, 
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
        
        // whether this is part of another node such as a Questionnaire node
        this.isNodePart = false;
        
        // holds all the series
        this.series = null;
        
        // whether this part is showing previous work
        this.isShowPreviousWork = false;
        
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
                        
                        // get the node content for the component we are showing previous work for
                        this.componentContent = NodeService.getComponentContentById(showPreviousWorkNodeContent, showPreviousWorkComponentId);
                        
                        // get the component state for the show previous work
                        var componentState = StudentDataService.getLatestComponentStateByNodeIdAndComponentId(showPreviousWorkNodeId, showPreviousWorkComponentId);
                        
                        // populate the student work into this component
                        this.setStudentWork(componentState);
                        
                        // setup the graph
                        this.setupGraph();
                        
                        // disable the component since we are just showing previous work
                        this.isDisabled = true;
                        
                        // get the component
                        var component = $scope.component;
                        
                        // register this component with the parent node
                        $scope.$parent.registerComponentController($scope, component);
                    }));
                } else {
                    // this is a regular component
                    
                    // get the component from the scope
                    var component = $scope.component;
                    
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
                    $scope.$parent.registerComponentController($scope, component);
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
                 * x axis from the node content
                 */
                xAxis = this.componentContent.xAxis;
            }
            
            if (this.yAxis == null && this.componentContent.yAxis != null) {
                /*
                 * the student does not have y axis data so we will use the
                 * y axis from the node content
                 */
                yAxis = this.componentContent.yAxis;
            }
            
            /*
             * remember this graph controller so we can access it in the click
             * event for the graph
             */
            thisGraphController = this;
            
            // get all the series from the student data
            var series = this.series;
            
            if (this.series == null && this.componentContent.series != null) {
                /*
                 * use the series from the step content if the student does not
                 * have any series data
                 */
                series = this.componentContent.series;
            }
            
            if (this.canClickToAddData() && !this.isDisabled) {
                /*
                 * the student can click to add a point so we will also allow
                 * them to click to remove a point
                 */
                
                if (series != null) {
                    
                    // loop through all the series
                    for (var s = 0; s < series.length; s++) {
                        
                        /*
                         * create a point click event to remove a point when
                         * it is clicked
                         */
                        var point = {
                            events: {
                                click: function (e) {
                                    this.remove();
                                    
                                    thisGraphController.studentDataChanged();
                                    
                                    $scope.$apply();
                                }
                            }
                        };
                        
                        series[s].point = point;
                    }
                }
            }
            
            series = GraphService.generateRegressionSeries(series);
            
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
                                if (thisGraphController.canClickToAddData() && !thisGraphController.isDisabled) {
                                    
                                    // TODO: check for point with existing x value
                                    
                                    // get the x and y positions that were clicked
                                    var x = e.xAxis[0].value;
                                    var y = e.yAxis[0].value;
                                    
                                    // get the series for the graph, there should only be one in this case
                                    var series = this.series[0];
                                    
                                    // round the values to the nearest hundredth
                                    x = Math.round(x * 100) / 100;
                                    y = Math.round(y * 100) / 100;
                                    
                                    // add the point to the series
                                    series.addPoint([x, y]);
                                    
                                    /*
                                     * notify the controller that the student 
                                     * data has changed
                                     */
                                    thisGraphController.studentDataChanged();
                                    
                                    $scope.$apply();
                                }
                            }
                        }
                    }
                },
                series: series,
                title: {
                    text: title
                },
                xAxis: xAxis,
                yAxis: yAxis,
                loading: false
            };
        };
        
        /**
         * Check whether the student is allowed to click on the graph to
         * add data
         */
        this.canClickToAddData = function() {
            var result = false;
            
            if (this.componentContent.canClickToAddData) {
                result = this.componentContent.canClickToAddData;
            }
            
            return result;
        };
        
        /**
         * Get the series object from the graph
         */
        this.getSeries = function() {
            
            // get the highcharts object
            var highchartsObject = $('#chart1').highcharts();
            
            var series = null;
            
            if (highchartsObject != null && highchartsObject.series != null) {
                
                // get the series
                highchartsObjectSeries = highchartsObject.series;
                
                /*
                 * get all the plain series data and not any of the extra
                 * attributes that highcharts adds to the data
                 */
                series = this.getAllPlainSeriesData(highchartsObjectSeries);
            }
            
            return series;
        };
        
        /**
         * Get all the plain series data
         * @param allSeries an array of series
         */
        this.getAllPlainSeriesData = function(allSeries) {
            var allPlainSeriesData = [];
            
            if (allSeries) {
                
                // loop through all the series
                for (var x = 0 ; x < allSeries.length; x++) {
                    var series = allSeries[x];
                    
                    // get the plain data for a single series
                    var plainSeriesData = this.getPlainSeriesData(series);
                    
                    // add the plain series data to our array
                    allPlainSeriesData.push(plainSeriesData);
                }
            }
            
            return allPlainSeriesData;
        };
        
        /**
         * Get the plain series data for a single series
         * @param series a single series
         */
        this.getPlainSeriesData = function(series) {
            
            // the series object
            var plainSeriesData = {};
            
            // the array that will hold our data points
            plainSeriesData.data = [];
            
            if (series != null) {
                
                // get the data from the series
                var seriesData = series.data;
                
                if (seriesData != null) {
                    
                    // loop through all the points
                    for (var p = 0; p < seriesData.length; p++) {
                        
                        // get a point
                        var point = seriesData[p];
                        
                        if (point != null) {
                            
                            // get the x and y values
                            var x = point.x;
                            var y = point.y;
                            
                            if (x != null && y != null) {
                                
                                // create an array to hold the x and y values
                                var dataPoint = [x , y];
                                
                                // add the data point array to our data array
                                plainSeriesData.data.push(dataPoint);
                            }
                        }
                    }
                }
                
                if (series.color != null) {
                    plainSeriesData.color = series.color;
                }
                
                if (series.regression) {
                    plainSeriesData.regression = series.regression;
                    plainSeriesData.regressionSettings = series.regressionSettings;
                }
                
                if (series.options != null && series.options.regressionGenerated) {
                    var regressionGenerated = series.options.regressionGenerated;
                    plainSeriesData.regressionGenerated = true;
                }
                
                if (series.options.isRegressionLine) {
                    plainSeriesData.isRegressionLine = series.options.isRegressionLine;
                    plainSeriesData.name = series.options.name;
                    plainSeriesData.regressionOutputs = series.options.regressionOutputs;
                    plainSeriesData.type = series.options.type;
                    //plainSeriesData.lineWidth = series.options.lineWidth;
                }
            }
            
            return plainSeriesData;
        };
        
        /**
         * Get the xAxis object
         * @return the xAxis object that can be used to render the graph
         */
        this.getXAxis = function() {
            var xAxis = null;
            
            /*
            var highchartsObject = $('#chart1').highcharts();
            
            if (highchartsObject != null) {
                var highchartsObjectXAxis = highchartsObject.xAxis;
                
                if (highchartsObjectXAxis != null && highchartsObjectXAxis.length > 0) {
                    var tempXAxis = highchartsObjectXAxis[0];
                    
                    if (tempXAxis != null) {
                        var min = tempXAxis.min;
                        var max = tempXAxis.max;
                        
                        xAxis.min = min;
                        xAxis.max = max;
                    }
                }
            }
            */
            
            return xAxis;
        };
        
        /**
         * Get the yAxis object
         * @return the yAxis object that can be used to render the graph
         */
        this.getYAxis = function() {
            var yAxis = null;
            
            return yAxis;
        };
        
        /**
         * Reset the table data to its initial state from the node content
         */
        this.resetGraph = function() {
            // get the original series from the step content
            this.series = this.componentContent.series;
            
            // redraw the graph
            //this.setupGraph();
            
            // the graph has changed so we will perform additional processing
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
                    this.series = studentData.series;
                    this.xAxis = studentData.xAxis;
                    this.yAxis = studentData.yAxis;
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
                
                // re-draw the graph and make it read only
                this.setupGraph();
            }
            
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
            
            //var series = this.getSeries();
            //this.series = this.updateSeriesFromHighcharts(this.series);
            
            //
            //this.series = this.removeRegressionLines(this.series);
            
            // redraw the graph
            this.setupGraph();
            
            // get this part id
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
        
        this.removeRegressionLines = function(series) {
            
            if (series != null) {
                for (var s = 0; s < series.length; s++) {
                    var tempSeries = series[s];
                    
                    if (tempSeries != null) {
                        if (tempSeries.isRegressionLine) {
                            series.splice(s, 1);
                            s--;
                        } else if (tempSeries.regressionGenerated) {
                            tempSeries.regressionGenerated = false;
                        }
                    }
                }
            }
            
            return series;
        };
        
        this.updateSeriesFromHighcharts = function(series) {
            
            if (series != null) {
                var highchartsSeries = this.getSeries();
                
                for (var s = 0; s < series.length; s++) {
                    if (highchartsSeries[s] != null) {
                        var tempHighchartsSeries = highchartsSeries[s];
                        var tempSeries = series[s];
                        
                        tempSeries.data = tempHighchartsSeries.data;
                    }
                }
            }
            
            return series;
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
                studentData.series = this.getSeries();
                
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
        
        this.setRegressionLine = function(series, regressionType, xMin, xMax, numberOfRegressionPoints) {
            if (series != null) {
                series.regression = true;
                series.regressionSettings = {
                    type: regressionType,
                    color: 'rgba(223, 83, 83, .9)',
                    xMin: xMin,
                    xMax: xMax,
                    numberOfPoints: numberOfRegressionPoints
                };
                series.rendered = false;
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