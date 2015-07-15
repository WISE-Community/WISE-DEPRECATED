define(['app'], function(app) {
    app.$controllerProvider.register('TableController', 
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
        
        // field that will hold the component content
        this.componentContent = null;
        
        // whether the step should be disabled
        this.isDisabled = false;
        
        // whether the student work is dirty and needs saving
        this.isDirty = false;
        
        // holds the the table data
        this.tableData = null;
        
        // whether this part is showing previous work
        this.isShowPreviousWork = false;
        
        /**
         * Perform setup of the node
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
                        this.componentContent = NodeService.getNodeContentPartById(showPreviousWorkNodeContent, showPreviousWorkComponentId);
                        
                        // get the component state for the show previous work
                        var componentState = StudentDataService.getLatestComponentStateByNodeIdAndComponentId(showPreviousWorkNodeId, showPreviousWorkComponentId);
                        
                        // populate the student work into this component
                        this.setStudentWork(componentState);
                        
                        // disable the component since we are just showing previous work
                        this.isDisabled = true;
                        
                        // set up the table
                        this.setupTable();
                        
                        // get the component
                        var component = $scope.component;
                        
                        // register this component with the parent node
                        $scope.$parent.registerPartController($scope, component);
                    }));
                } else {
                    // this is a regular component
                    
                    // get the component from the scope
                    var component = $scope.component;
                    
                    // get the component state from the scope
                    var componentState = $scope.componentState;
                    
                    // populate the student work into this component
                    this.setStudentWork(componentState);
                    
                    // set up the table
                    this.setupTable();
                    
                    // check if we need to lock this node
                    this.calculateDisabled();
                    
                    // register this component with the parent node
                    $scope.$parent.registerPartController($scope, component);
                }
            }
        };
        
        /**
         * Get a copy of the table data
         * @param tableData the table data to copy
         * @return a copy of the table data
         */
        this.getCopyOfTableData = function(tableData) {
            var tableDataCopy = null;
            
            if (tableData != null) {
                // create a JSON string from the table data
                var tableDataJSONString = JSON.stringify(tableData);
                
                // create a JSON object from the table data string
                var tableDataJSON = JSON.parse(tableDataJSONString);
                
                tableDataCopy = tableDataJSON;
            }
            
            return tableDataCopy;
        };
        
        /**
         * Setup the table
         */
        this.setupTable = function() {
            
            if (this.tableData == null) {
                /*
                 * the student does not have any table data so we will use
                 * the table data from the node content
                 */
                this.tableData = this.getCopyOfTableData(this.componentContent.tableData);
            }
        };
        
        /**
         * Reset the table data to its initial state from the node content
         */
        this.resetTable = function() {
            // get the original table from the step content
            this.tableData = this.getCopyOfTableData(this.componentContent.tableData);
            
            // the table has changed so we will perform additional processing
            this.studentDataChanged();
        };
        
        /**
         * Get the rows of the table data
         */
        this.getTableDataRows = function() {
            return this.tableData;
        };
        
        /**
         * Populate the student work into the node
         * @param nodeState the node state to populate into the node
         */
        this.setStudentWork = function(nodeState) {
            
            if (nodeState != null) {
                var studentData = nodeState.studentData;
                
                if (studentData != null) {
                    // populate the text the student previously typed
                    this.tableData = studentData.tableData;
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
            
            // get this part id
            var componentId = this.getComponentId();
            
            // create a node state populated with the student data
            var componentState = this.createComponentState();
            
            /*
             * this step is a node part so we will tell its parent that
             * the student work has changed and will need to be saved.
             * this will also notify connected parts that this part's
             * student data has changed.
             */
            $scope.$emit('partStudentDataChanged', {componentId: componentId, componentState: componentState});
        };
        
        /**
         * Create a new node state populated with the student data
         * @return the nodeState after it has been populated
         */
        this.createComponentState = function() {
            
            // create a new node state
            var componentState = NodeService.createNewComponentState();
            
            if (componentState != null) {
                var studentData = {};
                
                // insert the table data
                studentData.tableData = this.getCopyOfTableData(this.tableData);
                
                // set the student data into the component state
                componentState.studentData = studentData;
            }
            
            return componentState;
        };
        
        /**
         * Check if we need to lock the node
         */
        this.calculateDisabled = function() {
            
            var nodeId = this.nodeId;
            
            // get the node content
            var componentContent = this.componentContent;
            
            if (componentContent) {
                var lockAfterSubmit = componentContent.lockAfterSubmit;
                
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
            
            if (this.componentContent != null) {
                
                // check the showSaveButton field in the node content
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
                
                // check the showSubmitButton field in the node content
                if (this.componentContent.showSubmitButton) {
                    show = true;
                }
            }
            
            return show;
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
         * Import work from another node
         */
        this.importWork = function() {
            
            // get the node content
            var componentContent = this.componentContent;
            
            if (componentContent != null) {
                
                var importWork = componentContent.importWork;
                
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
                                    var populatedNodeState = TableService.populateNodeState(importWorkNodeState, importWorkNodeType);
                                    
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
         * A connected component has changed its student data so we will
         * perform any necessary changes to this component
         * @param connectedComponent the connected component
         * @param connectedComponentParams the connected component params
         * @param componentState the component state from the connected 
         * component that has changed
         */
        $scope.handleConnectedComponentStudentDataChanged = function(connectedComponent, connectedComponentParams, componentState) {
            
            if (connectedComponent != null && connectedComponentParams != null && componentState != null) {
                
                // get the component type that has changed
                var componentType = connectedComponent.componentType;
                
                if (componentType === 'Graph') {
                    
                    // set the graph data into the table
                    $scope.tableController.setGraphDataIntoTableData(componentState, connectedComponentParams);
                    
                    // the table has changed
                    $scope.tableController.isDirty = true;
                }
            }
        }
        
        /**
         * Set the graph data into the table data
         * @param componentState the component state to get the graph data from
         * @param params (optional) the params to specify what columns
         * and rows to overwrite in the table data
         */
        this.setGraphDataIntoTableData = function(componentState, params) {
            
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
            
            if (componentState != null && componentState.studentData != null) {
                
                // get the table data rows
                var tableDataRows = this.getTableDataRows();
                
                if (tableDataRows != null) {
                    
                    var data = null;
                    
                    var studentData = componentState.studentData;
                    
                    // get the series
                    var series = studentData.series;
                    
                    if (series != null && series.length > 0) {
                        
                        // get the first series
                        var tempSeries = series[0];
                        
                        if (tempSeries != null) {
                            
                            // get the data from the series
                            data = tempSeries.data;
                            
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
                                    this.setTableDataCellValue(xColumn, r, x);
                                    this.setTableDataCellValue(yColumn, r, y);
                                    
                                    // increment the data row counter
                                    dataRowCounter++;
                                }
                            }
                        }
                    }
                }
            }
        };
        
        /**
         * Set the table data cell value
         * @param x the x index (0 indexed)
         * @param y the y index (0 indexed)
         * @param value the value to set in the cell
         */
        this.setTableDataCellValue = function(x, y, value) {
            
            // get the table data rows
            var tableDataRows = this.getTableDataRows();
            
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
         * Get the student work object that will contain the student
         * work for the node. This is only used when this node is
         * part of another node such as a Questionnaire node.
         * The Questionnaire node will call this function to obtain
         * the student work.
         * @return an object containing the student work
         */
        $scope.getStudentWorkObject = function() {
            
            var componentState = null;
            
            if ($scope.tableController.isDirty) {
                // create a component state populated with the student data
                componentState = $scope.tableController.createComponentState();
                
                // set isDirty to false since this student work is about to be saved
                $scope.tableController.isDirty = false;
            }
            
            return componentState;
        };
        
        /**
         * Listen for the 'nodeOnExit' event which is fired when the student
         * exits the node. This will perform saving when the student exits
         * the node.
         */
        $scope.$on('nodeOnExit', angular.bind(this, function(event, args) {
            
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
        
        // perform setup of this node
        this.setup();
    });
});