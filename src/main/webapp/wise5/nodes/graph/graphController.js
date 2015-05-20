define(['app', 'bootstrap', 'highcharts', 'highcharts-ng'], function(app, bootstrap, highcharts, highchartsng) {
    
    app.$controllerProvider.register('GraphController', 
        function($rootScope,
            $scope,
            $state, 
            $stateParams,
            AnnotationService,
            ConfigService,
            CurrentNodeService,
            CRaterService,
            NodeService,
            OpenResponseService,
            ProjectService,
            SessionService,
            StudentAssetService,
            StudentDataService) {
        
        // the node id of the current node
        this.nodeId = null;
        
        // field that will hold the node content
        this.nodeContent = null;
        
        // holds the text that the student has typed
        this.studentResponse = '';
        
        // whether the step should be disabled
        this.isDisabled = false;
        
        // whether the student work is dirty and needs saving
        this.isDirty = false;
        
        // whether this is part of another node such as a Questionnaire node
        this.isNodePart = false;
        
        // holds all the series
        this.series = null;
        
        /**
         * Perform setup of the node
         */
        this.setup = function() {
            
            // get the current node and node id
            var currentNode = CurrentNodeService.getCurrentNode();
            if (currentNode != null) {
                this.nodeId = currentNode.id;
            }
            
            // check if the node is part of another node
            if ($scope.part != null) {
                // the node is part of another node
                this.isNodePart = true;
                
                // set the content
                this.nodeContent = $scope.part;
                
                // get the latest node state
                var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
                
                // populate the student work into this node
                this.setStudentWork(nodeState);
                
                // setup the graph
                this.setupGraph();
                
                // check if we need to lock this node
                this.calculateDisabled();
                
                // get the part
                var part = $scope.part;
                
                /*
                 * register this node with the parent node which will most  
                 * likely be a Questionnaire node
                 */
                $scope.$parent.registerPartController($scope, part);
            } else {
                // this is a regular standalone node
                var nodeSrc = ProjectService.getNodeSrcByNodeId(this.nodeId);
                
                // get the node content for this node
                NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(nodeContent) {
                    
                    this.nodeContent = nodeContent;
                    
                    // get the latest node state
                    var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
                    
                    // popualte the student work into this node
                    this.setStudentWork(nodeState);
                    
                    // setup the graph
                    this.setupGraph();
                    
                    // check if we need to lock this node
                    this.calculateDisabled();
                    
                    // import any work if necessary
                    this.importWork();
                    
                    // tell the parent controller that this node has loaded
                    $scope.$parent.nodeController.nodeLoaded(this.nodeId);
                    
                    // start the auto save interval
                    this.startAutoSaveInterval();
                    
                    // register this controller to listen for the exit event
                    this.registerExitListener();
                }));
            }
        };
        
        /**
         * Setup the graph
         */
        this.setupGraph = function() {
            
            // get the title
            var title = this.nodeContent.title;
            
            // get the graph type
            var graphType = this.nodeContent.graphType;
            
            // get the x and y axis attributes from the student data
            var xAxis = this.xAxis;
            var yAxis = this.yAxis;
            
            if (this.xAxis == null && this.nodeContent.xAxis != null) {
                /*
                 * the student does not have x axis data so we will use the
                 * x axis from the node content
                 */
                xAxis = this.nodeContent.xAxis;
            }
            
            if (this.yAxis == null && this.nodeContent.yAxis != null) {
                /*
                 * the student does not have y axis data so we will use the
                 * y axis from the node content
                 */
                yAxis = this.nodeContent.yAxis;
            }
            
            /*
             * remember this graph controller so we can access it in the click
             * event for the graph
             */
            thisGraphController = this;
            
            // get all the series from the student data
            var series = this.series;
            
            if (this.series == null && this.nodeContent.series != null) {
                /*
                 * use the series from the step content if the student does not
                 * have any series data
                 */
                series = this.nodeContent.series;
            }
            
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
                                if (thisGraphController.canClickToAddData()) {
                                    
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
            
            this.studentDataChanged();
        };
        
        /**
         * Check whether the student is allowed to click on the graph to
         * add data
         */
        this.canClickToAddData = function() {
            var result = false;
            
            if (this.nodeContent.canClickToAddData) {
                result = this.nodeContent.canClickToAddData;
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
         * Populate the student work into the node
         * @param nodeState the node state to populate into the node
         */
        this.setStudentWork = function(nodeState) {
            
            /*
             * check if the part student data has been passed. this will be
             * used when the node is part of a Questionnaire node
             */
            if ($scope.partStudentData != null) {
                // set the part student data as the node state
                nodeState = $scope.partStudentData;
            }
            
            if (nodeState != null) {
                // populate the student data into the node
                this.series = nodeState.series;
                this.xAxis = nodeState.xAxis;
                this.yAxis = nodeState.yAxis;
            }
        };
        
        /**
         * Called when the student clicks the save button
         */
        this.saveButtonClicked = function() {
            var saveTriggeredBy = 'saveButton';
            
            // create and add the node state to the node visit
            var nodeState = this.createAndAddNodeState(saveTriggeredBy);
            
            // save the node visit to the server
            this.saveNodeVisitToServer().then(angular.bind(this, function(nodeState, nodeVisit) {
                // if this is a CRater step, score it
                this.makeCRaterRequest(nodeState, nodeVisit);
            }, nodeState));
        };
        
        /**
         * Called when the student clicks the submit button
         */
        this.submitButtonClicked = function() {
            var saveTriggeredBy = 'submitButton';
            
            // create and add the node state to the node visit
            var nodeState = this.createAndAddNodeState(saveTriggeredBy);
            
            // save the node visit to the server
            this.saveNodeVisitToServer().then(angular.bind(this, function(nodeState, nodeVisit) {
                // if this is a CRater step, score it
                this.makeCRaterRequest(nodeState, nodeVisit);
            }, nodeState));
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
            
            if (this.isNodePart) {
                /*
                 * this step is a node part so we will tell its parent that
                 * the student work is dirty and will need to be saved
                 */
                $scope.$emit('isDirty');
            }
        };
        
        /**
         * Get the student response
         */
        this.getStudentResponse = function() {
            return this.studentResponse;
        };
        
        /**
         * Create a node state and add it to the latest node visit
         * @param saveTriggeredBy the reason why we are saving a new node state
         * e.g.
         * 'autoSave'
         * 'saveButton'
         * 'submitButton'
         * 'nodeOnExit'
         * 'logOut'
         */
        this.createAndAddNodeState = function(saveTriggeredBy) {
            
            var nodeState = null;
            
            /*
             * check if this node is part of another node such as a
             * Questionnaire node. if it is part of a Questionnaire node
             * we do not need to create a node state or save anything
             * since the parent Questionnaire node will handle that.
             */
            if (!this.isNodePart) {
                // this is a standalone node
                
                if (saveTriggeredBy != null) {
                    
                    /*
                     * check if the save was triggered by the submit button
                     * or if the student data is dirty
                     */
                    if (saveTriggeredBy === 'submitButton' || this.isDirty) {
                        
                        // create the node state
                        nodeState = NodeService.createNewNodeState();
                        
                        // set the values into the node state
                        nodeState = this.populateNodeState(nodeState);
                        
                        nodeState.saveTriggeredBy = saveTriggeredBy;
                        
                        if (saveTriggeredBy === 'submitButton') {
                            nodeState.isSubmit = true;
                        } 
                        
                        // add the node state to the latest node visit
                        $scope.$parent.nodeController.addNodeStateToLatestNodeVisit(this.nodeId, nodeState);
                    }
                }
            }
            
            return nodeState;
        };
        
        /**
         * Get the student data and populate it into the node state
         * @param nodeState the node state to populate
         * @return the nodeState after it has been populated
         */
        this.populateNodeState = function(nodeState) {
            
            if (nodeState != null) {
                
                // insert the series data
                nodeState.series = this.getSeries();
                
                // insert the x axis data
                nodeState.xAxis = this.getXAxis();
                
                // insert the y axis data
                nodeState.yAxis = this.getYAxis();
            }
            
            return nodeState;
        };
        
        /**
         * Save the node visit to the server
         */
        this.saveNodeVisitToServer = function() {
            // save the node visit to the server
            return $scope.$parent.nodeController.saveNodeVisitToServer(this.nodeId).then(angular.bind(this, function(nodeVisit) {
                
                // check if we need to lock this node
                this.calculateDisabled();
                
                /*
                 * set the isDirty flag to false because the student work has 
                 * been saved to the server
                 */
                this.isDirty = false;
            }));
        };
        
        /**
         * Check if we need to lock the node
         */
        this.calculateDisabled = function() {
            
            var nodeId = this.nodeId;
            
            // get the node content
            var nodeContent = this.nodeContent;
            
            if (nodeContent) {
                var lockAfterSubmit = nodeContent.lockAfterSubmit;
                
                if (lockAfterSubmit) {
                    // we need to lock the step after the student has submitted
                    
                    // get the node visits for the node
                    var nodeVisits = StudentDataService.getNodeVisitsByNodeId(nodeId);
                    
                    // check if the student has ever submitted work for this node
                    var isSubmitted = NodeService.isWorkSubmitted(nodeVisits);
                    
                    if (isSubmitted) {
                        // the student has submitted work for this node
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
            
            // check if this is a node part
            if (!this.isNodePart) {
                // this is not a node part so we will show the save button
                show = true;
            }
            
            return show;
        };
        
        /**
         * Check whether we need to show the submit button
         * @return whether to show the submit button
         */
        this.showSubmitButton = function() {
            var show = false;
            
            if (this.nodeContent != null) {
                
                // check the showSubmitButton field in the node content
                if (this.nodeContent.showSubmitButton) {
                    show = true;
                }
            }
            
            return show;
        };
        
        /**
         * Start the auto save interval for this node
         */
        this.startAutoSaveInterval = function() {
            this.autoSaveIntervalId = setInterval(angular.bind(this, function() {
                // check if the student work is dirty
                if (this.isDirty) {
                    // the student work is dirty so we will save
                    
                    var saveTriggeredBy = 'autoSave';
                    
                    // create and add a node state to the node visit
                    this.createAndAddNodeState(saveTriggeredBy);
                    
                    // save the node visit to the server
                    this.saveNodeVisitToServer();
                }
            }), $scope.$parent.nodeController.autoSaveInterval);
        };
        
        /**
         * Stop the auto save interval for this node
         */
        this.stopAutoSaveInterval = function() {
            clearInterval(this.autoSaveIntervalId);
        };
        
        /**
         * Get the prompt to show to the student
         */
        this.getPrompt = function() {
            var prompt = null;
            
            if (this.nodeContent != null) {
                prompt = this.nodeContent.prompt;
            }
            
            return prompt;
        };
        
        /**
         * Get the number of rows for the textarea
         */
        this.getNumRows = function() {
            var numRows = null;
            
            if (this.nodeContent != null) {
                numRows = this.nodeContent.numRows;
            }
            
            return numRows;
        };
        
        /**
         * Get the number of columns for the textarea
         */
        this.getNumColumns = function() {
            var numColumns = null;
            
            if (this.nodeContent != null) {
                numColumns = this.nodeContent.numColumns;
            }
            
            return numColumns;
        };
        
        /**
         * Get the text the student typed
         */
        this.getResponse = function() {
            var response = null;
            
            if (this.studentResponse != null) {
                response = this.studentResponse;
            }
            
            return response;
        };
        
        /**
         * Import work from another node
         */
        this.importWork = function() {
            
            // get the node content
            var nodeContent = this.nodeContent;
            
            if (nodeContent != null) {
                
                var importWork = nodeContent.importWork;
                
                if (importWork != null) {
                    
                    // get the latest node state for this node
                    var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
                    
                    /*
                     * we will only import work into this node if the student
                     * has not done any work for this node
                     */
                    if(nodeState == null) {
                        // the student has not done any work for this node
                        
                        var importWorkNodeId = importWork.nodeId;
                        
                        if (importWorkNodeId != null) {
                            
                            // get the node that we want to import work from
                            var importWorkNode = ProjectService.getNodeById(importWorkNodeId);
                            
                            if (importWorkNode != null) {
                                
                                // get the node type of the node we are importing from
                                var importWorkNodeType = importWorkNode.type;
                                
                                // get the latest node state from the node we are importing from
                                var importWorkNodeState = StudentDataService.getLatestNodeStateByNodeId(importWorkNodeId);
                                
                                if (importWorkNodeState != null) {
                                    /*
                                     * populate a new node state with the work from the 
                                     * imported node state
                                     */
                                    var populatedNodeState = GraphService.populateNodeState(importWorkNodeState, importWorkNodeType);
                                    
                                    // populate the node state into this node
                                    this.setStudentWork(populatedNodeState);
                                }
                            }
                        }
                    }
                }
            }
        };
        
        /**
         * Get the student work object that will contain the student
         * work for the node. This is only used when this node is
         * part of another node such as a Questionnaire node.
         * The Questionnaire node will call this function to obtain
         * the student work.
         * @return an object containing the student work
         */
        $scope.getStudentWorkObject = function() {
            var studentWork = {};
            
            // insert the student data into the student data object
            studentWork = $scope.graphController.populateNodeState(studentWork);
            
            return studentWork;
        };
        
        /**
         * Listen for the 'nodeOnExit' event which is fired when the student
         * exits the node. This will perform saving when the student exits
         * the node.
         */
        $scope.$on('nodeOnExit', angular.bind(this, function(event, args) {
            
            /*
             * Check if this node is part of another node such as a
             * Questionnaire node. If this is part of another node we do
             * not need to perform any saving because the parent will
             * handle the saving.
             */
            if (!this.isNodePart) {
                // this is a standalone node so we will save
                
                // get the node that is exiting
                var nodeToExit = args.nodeToExit;
                
                /*
                 * make sure the node id of the node that is exiting is
                 * this node
                 */
                if (nodeToExit.id === this.nodeId) {
                    var saveTriggeredBy = 'nodeOnExit';
                    
                    // create and add a node state to the latest node visit
                    this.createAndAddNodeState(saveTriggeredBy);
                    
                    // stop the auto save interval for this node
                    this.stopAutoSaveInterval();
                    
                    /*
                     * tell the parent that this node is done performing
                     * everything it needs to do before exiting
                     */
                    $scope.$parent.nodeController.nodeUnloaded(this.nodeId);
                }
            }
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
                
                /*
                 * Check if this node is part of another node such as a
                 * Questionnaire node. If this is part of another node we do
                 * not need to perform any saving because the parent will
                 * handle the saving.
                 */
                if (!this.isNodePart) {
                    // this is a standalone node so we will save
                    
                    var saveTriggeredBy = 'exit';
                    
                    // create and add a node state to the latest node visit
                    this.createAndAddNodeState(saveTriggeredBy);
                    
                    // stop the auto save interval for this node
                    this.stopAutoSaveInterval();
                    
                    /*
                     * tell the parent that this node is done performing
                     * everything it needs to do before exiting
                     */
                    $scope.$parent.nodeController.nodeUnloaded(this.nodeId);
                    
                    // call this function to remove the listener
                    this.exitListener();
                    
                    /*
                     * tell the session service that this listener is done
                     * performing everything it needs to do before exiting
                     */
                    $rootScope.$broadcast('doneExiting');
                }
            }));
        };
        
        // perform setup of this node
        this.setup();
    });
});