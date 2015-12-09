define(['app'], function(app) {
    app.$controllerProvider.register('TableController', 
        function($rootScope,
            $scope,
            $state, 
            $stateParams,
            ConfigService,
            NodeService,
            ProjectService,
            SessionService,
            StudentAssetService,
            StudentDataService,
            TableService) {
        
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
        
        // holds the the table data
        this.tableData = null;
        
        // whether this part is showing previous work
        this.isShowPreviousWork = false;

        // whether the student work is for a submit
        this.isSubmit = false;

        // whether students can attach files to their work
        this.isStudentAttachmentEnabled = false;

        // whether the prompt is shown or not
        this.isPromptVisible = true;

        // whether the save button is shown or not
        this.isSaveButtonVisible = false;

        // whether the submit button is shown or not
        this.isSubmitButtonVisible = false;

        // whether the reset table button is shown or not
        this.isResetTableButtonVisible = true;

        /**
         * Perform setup of the component
         */
        this.setup = function() {
            
            // get the current node and node id
            var currentNode = StudentDataService.getCurrentNode();
            if (currentNode != null) {
                this.nodeId = currentNode.id;
            } else {
                this.nodeId = $scope.nodeId;
            }
            
            // get the component content from the scope
            this.componentContent = $scope.component;

            this.mode = $scope.mode;
            
            if (this.componentContent != null) {
                
                // get the component id
                this.componentId = this.componentContent.id;

                if (this.mode === 'student') {
                    this.isPromptVisible = true;
                    this.isSaveButtonVisible = this.componentContent.showSaveButton;
                    this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
                    this.isResetTableButtonVisible = true;
                } else if (this.mode === 'grading') {
                    this.isPromptVisible = true;
                    this.isSaveButtonVisible = false;
                    this.isSubmitButtonVisible = false;
                    this.isResetTableButtonVisible = false;
                    this.isDisabled = true;
                } else if (this.mode === 'onlyShowWork') {
                    this.isPromptVisible = false;
                    this.isSaveButtonVisible = false;
                    this.isSubmitButtonVisible = false;
                    this.isResetTableButtonVisible = false;
                    this.isDisabled = true;
                }
                
                // get the show previous work node id if it is provided
                var showPreviousWorkNodeId = this.componentContent.showPreviousWorkNodeId;

                var componentState = null;
                
                if (showPreviousWorkNodeId != null) {
                    // this component is showing previous work
                    this.isShowPreviousWork = true;

                    // get the show previous work component id if it is provided
                    var showPreviousWorkComponentId = this.componentContent.showPreviousWorkComponentId;

                    // get the node content for the other node
                    var showPreviousWorkNodeContent = ProjectService.getNodeContentByNodeId(showPreviousWorkNodeId);

                    // get the component content for the component we are showing previous work for
                    this.componentContent = NodeService.getComponentContentById(showPreviousWorkNodeContent, showPreviousWorkComponentId);

                    // get the component state for the show previous work
                    componentState = StudentDataService.getLatestComponentStateByNodeIdAndComponentId(showPreviousWorkNodeId, showPreviousWorkComponentId);

                    // populate the student work into this component
                    this.setStudentWork(componentState);

                    // disable the component since we are just showing previous work
                    this.isDisabled = true;

                    // set up the table
                    this.setupTable();

                    // register this component with the parent node
                    $scope.$parent.registerComponentController($scope, this.componentContent);
                } else {
                    // this is a regular component

                    // get the component state from the scope
                    componentState = $scope.componentState;

                    // set whether studentAttachment is enabled
                    this.isStudentAttachmentEnabled = this.componentContent.isStudentAttachmentEnabled;

                    if (componentState == null) {
                        // check if we need to import work.
                        // only import work if the student does not already have
                        // work for this component
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
                    
                    // set up the table
                    this.setupTable();
                    
                    // check if we need to lock this component
                    this.calculateDisabled();

                    if ($scope.$parent.registerComponentController != null) {
                        // register this component with the parent node
                        $scope.$parent.registerComponentController($scope, this.componentContent);
                    }
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
                 * the table data from the component content
                 */
                this.tableData = this.getCopyOfTableData(this.componentContent.tableData);
            }
        };
        
        /**
         * Reset the table data to its initial state from the component content
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
         * Populate the student work into the component
         * @param componentState the component state to populate into the component
         */
        this.setStudentWork = function(componentState) {
            
            if (componentState != null) {
                
                // get the student data from the component state
                var studentData = componentState.studentData;
                
                if (studentData != null) {
                    // set the table into the controller
                    this.tableData = studentData.tableData;
                }
            }
        };
        
        /**
         * Called when the student clicks the save button
         */
        this.saveButtonClicked = function() {

            // tell the parent node that this component wants to save
            $scope.$emit('componentSaveTriggered', {nodeId: this.nodeId, componentId: this.componentId});
        };
        
        /**
         * Called when the student clicks the submit button
         */
        this.submitButtonClicked = function() {
            this.isSubmit = true;
            
            // check if we need to lock the component after the student submits
            if (this.isLockAfterSubmit()) {
                this.isDisabled = true;
            }
            
            $scope.$emit('componentSubmitTriggered', {nodeId: this.nodeId, componentId: this.componentId});
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
                
                // insert the table data
                studentData.tableData = this.getCopyOfTableData(this.tableData);

                if (this.isSubmit) {
                    // the student submitted this work
                    componentState.isSubmit = this.isSubmit;

                    /*
                     * reset the isSubmit value so that the next component state
                     * doesn't maintain the same value
                     */
                    this.isSubmit = false;
                }

                // set the student data into the component state
                componentState.studentData = studentData;
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
         * Check whether we need to show the prompt
         * @return whether to show the prompt
         */
        this.showPrompt = function() {
            return this.isPromptVisible;
        };

        /**
         * Check whether we need to show the save button
         * @return whether to show the save button
         */
        this.showSaveButton = function() {
            return this.isSaveButtonVisible;
        };
        
        /**
         * Check whether we need to show the submit button
         * @return whether to show the submit button
         */
        this.showSubmitButton = function() {
            return this.isSubmitButtonVisible;
        };


        /**
         * Check whether we need to show the reset table button
         * @return whether to show the reset table button
         */
        this.showResetTableButton = function() {
            return this.isResetTableButtonVisible;
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
                            var populatedComponentState = TableService.populateComponentState(importWorkComponentState);
                            
                            // populate the component state into this component
                            this.setStudentWork(populatedComponentState);
                        }
                    }
                }
            }
        };

        /**
         * handle importing notebook item data (we only support csv for now)
         */
        this.attachNotebookItemToComponent = angular.bind(this, function(notebookItem) {
            if (notebookItem.studentAsset != null) {
                // TODO implement me
            } else if (notebookItem.studentWork != null) {
                // TODO implement me
            }
        });
        
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
                var componentType = connectedComponent.type;
                
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
            var seriesIndex = 0;
            
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

                if (params.seriesIndex != null) {
                    // get the series index
                    seriesIndex = params.seriesIndex;
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
                        
                        // get the series that we will get data from
                        var tempSeries = series[seriesIndex];
                        
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
         * Get the component state from this component. The parent node will 
         * call this function to obtain the component state when it needs to
         * save student data.
         * @return a component state containing the student data
         */
        $scope.getComponentState = function() {
            
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