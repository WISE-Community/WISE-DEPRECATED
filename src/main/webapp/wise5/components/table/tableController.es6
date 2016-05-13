class TableController {
    constructor($rootScope,
                $scope,
                NodeService,
                ProjectService,
                StudentDataService,
                TableService,
                UtilService) {

        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        this.TableService = TableService;
        this.UtilService = UtilService;

        // the node id of the current node
        this.nodeId = null;

        // the component id
        this.componentId = null;

        // field that will hold the component content
        this.componentContent = null;

        // field that will hold the authoring component content
        this.authoringComponentContent = null;

        // whether the step should be disabled
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

        // the latest annotations
        this.latestAnnotations = null;

        // whether the reset table button is shown or not
        this.isResetTableButtonVisible = true;

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

        /*
         * get the original component content. this is used when showing
         * previous work from another component.
         */
        this.originalComponentContent = this.$scope.originalComponentContent;

        // the mode to load the component in e.g. 'student', 'grading', 'onlyShowWork'
        this.mode = this.$scope.mode;
        
        this.latestConnectedComponentState = null;
        this.latestConnectedComponentParams = null;

        this.workgroupId = this.$scope.workgroupId;
        this.teacherWorkgroupId = this.$scope.teacherWorkgroupId;

        if (this.componentContent != null) {

            // get the component id
            this.componentId = this.componentContent.id;

            if (this.mode === 'student') {
                this.isPromptVisible = true;
                this.isSaveButtonVisible = this.componentContent.showSaveButton;
                this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

                // get the latest annotations
                // TODO: watch for new annotations and update accordingly
                this.latestAnnotations = this.$scope.$parent.nodeController.getLatestComponentAnnotations(this.componentId);
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
            } else if (this.mode === 'showPreviousWork') {
                this.isPromptVisible = true;
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isResetTableButtonVisible = false;
                this.isDisabled = true;
            } else if (this.mode === 'authoring') {
                this.updateAdvancedAuthoringView();

                $scope.$watch(function() {
                    return this.authoringComponentContent;
                }.bind(this), function(newValue, oldValue) {
                    this.componentContent = this.ProjectService.injectAssetPaths(newValue);
                    this.resetTable();
                }.bind(this), true);
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
                var showPreviousWorkNodeContent = this.ProjectService.getNodeContentByNodeId(showPreviousWorkNodeId);

                // get the component content for the component we are showing previous work for
                this.componentContent = this.NodeService.getComponentContentById(showPreviousWorkNodeContent, showPreviousWorkComponentId);

                // get the component state for the show previous work
                componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(showPreviousWorkNodeId, showPreviousWorkComponentId);

                // populate the student work into this component
                this.setStudentWork(componentState);

                // disable the component since we are just showing previous work
                this.isDisabled = true;

                // set up the table
                this.setupTable();

                // register this component with the parent node
                this.$scope.$parent.registerComponentController(this.$scope, this.componentContent);
            } else {
                // this is a regular component

                // get the component state from the scope
                componentState = this.$scope.componentState;

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
         * @param componentState the component state from the connected
         * component that has changed
         */
        this.$scope.handleConnectedComponentStudentDataChanged = function(connectedComponent, connectedComponentParams, componentState) {

            if (connectedComponent != null && connectedComponentParams != null && componentState != null) {

                if (connectedComponentParams.updateOn === 'change') {
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
            let componentState = null;
            let getState = false;

            if (isSubmit) {
                if (this.$scope.tableController.isSubmitDirty) {
                    getState = true;
                }
            } else {
                if (this.$scope.tableController.isDirty) {
                    getState = true;
                }
            }

            if (getState) {
                // create a component state populated with the student data
                componentState = this.$scope.tableController.createComponentState();
            }

            return componentState;
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
                let clientSaveTime = componentState.clientSaveTime;

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
            }
            
            // check if the component state is from a connected component
            if (this.ProjectService.isConnectedComponent(this.nodeId, this.componentId, componentState.componentId)) {
                
                // get the connected component params
                var connectedComponentParams = this.ProjectService.getConnectedComponentParams(this.componentContent, componentState.componentId);
                
                if (connectedComponentParams != null) {
                    
                    if (connectedComponentParams.updateOn === 'save' ||
                        (connectedComponentParams.updateOn === 'submit' && componentState.isSubmit)) {
                            
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
                            var answer = confirm('Do you want to update the connected table?');
                            
                            if (answer) {
                                // the student answered yes
                                performUpdate = true;
                            }
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

        /**
         * Listen for the 'exitNode' event which is fired when the student
         * exits the parent node. This will perform any necessary cleanup
         * when the student exits the parent node.
         */
        this.$scope.$on('exitNode', angular.bind(this, function(event, args) {

        }));

        this.$scope.getNumber = function(num) {
            return new Array(parseInt(num));
        }
    }

    /**
     * Get a copy of the table data
     * @param tableData the table data to copy
     * @return a copy of the table data
     */
    getCopyOfTableData(tableData) {
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
    setupTable() {

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
    resetTable() {
        
        // get the original table from the step content
        this.tableData = this.getCopyOfTableData(this.componentContent.tableData);

        // the table has changed so we will perform additional processing
        this.studentDataChanged();
    };

    /**
     * Get the rows of the table data
     */
    getTableDataRows() {
        return this.tableData;
    };

    /**
     * Populate the student work into the component
     * @param componentState the component state to populate into the component
     */
    setStudentWork(componentState) {

        if (componentState != null) {

            // get the student data from the component state
            var studentData = componentState.studentData;

            if (studentData != null) {
                // set the table into the controller
                this.tableData = studentData.tableData;

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
            if (latestState.isSubmit) {
                // latest state is a submission, so set isSubmitDirty to false and notify node
                this.isSubmitDirty = false;
                this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: false});
                // set save message
                this.setSaveMessage('Last submitted', latestState.clientSaveTime);
            } else {
                // latest state is not a submission, so set isSubmitDirty to true and notify node
                this.isSubmitDirty = true;
                this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});
                // set save message
                this.setSaveMessage('Last saved', latestState.clientSaveTime);
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
         * set the dirty flag so we will know we need to save the
         * student work later
         */
        this.isDirty = true;
        this.$scope.$emit('componentDirty', {componentId: this.componentId, isDirty: true});

        this.isSubmitDirty = true;
        this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});

        // clear out the save message
        this.setSaveMessage('', null);

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
        this.$scope.$emit('componentStudentDataChanged', {componentId: componentId, componentState: componentState});
    };

    /**
     * Create a new component state populated with the student data
     * @return the componentState after it has been populated
     */
    createComponentState() {

        // create a new component state
        var componentState = this.NodeService.createNewComponentState();

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
        return this.isPromptVisible;
    };

    /**
     * Check whether we need to show the save button
     * @return whether to show the save button
     */
    showSaveButton() {
        return this.isSaveButtonVisible;
    };

    /**
     * Check whether we need to show the submit button
     * @return whether to show the submit button
     */
    showSubmitButton() {
        return this.isSubmitButtonVisible;
    };


    /**
     * Check whether we need to show the reset table button
     * @return whether to show the reset table button
     */
    showResetTableButton() {
        return this.isResetTableButtonVisible;
    };

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
                        var populatedComponentState = this.TableService.populateComponentState(importWorkComponentState);

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
    attachStudentAsset(studentAsset) {
        // TODO: implement me
    };

    /**
     * Set the graph data into the table data
     * @param componentState the component state to get the graph data from
     * @param params (optional) the params to specify what columns
     * and rows to overwrite in the table data
     */
    setGraphDataIntoTableData(componentState, params) {

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
    setTableDataCellValue(x, y, value) {

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
     * Get the value of a cell in the table
     * @param x the x coordinate
     * @param y the y coordinate
     * @param table (optional) table data to get the value from. this is used
     * when we want to look up the value in the default authored table
     * @returns the cell value (text or a number)
     */
    getTableDataCellValue(x, y, table) {
        
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

        /*
         * notify the parent node that the content has changed which will save
         * the project to the server
         */
        this.$scope.$parent.nodeController.authoringViewNodeChanged();
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

            this.authoringComponentContent = authoringComponentContent;

            // set the new component into the controller
            this.componentContent = this.ProjectService.injectAssetPaths(authoringComponentContent);

            /*
             * notify the parent node that the content has changed which will save
             * the project to the server
             */
            this.$scope.$parent.nodeController.authoringViewNodeChanged();
        } catch(e) {

        }
    };

    /**
     * Update the component JSON string that will be displayed in the advanced authoring view textarea
     */
    updateAdvancedAuthoringView() {
        this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
    };

    /**
     * The table size has changed in the authoring view so we will update it
     */
    authoringViewTableSizeChanged() {

        // create a new table with the new size and populate it with the existing cells
        var newTable = this.getUpdatedTableSize(this.authoringComponentContent.numRows, this.authoringComponentContent.numColumns);

        // set the new table into the component content
        this.authoringComponentContent.tableData = newTable;

        // perform preview updating and project saving
        this.authoringViewComponentChanged();
    }

    /**
     * Create a table with the given dimensions. Populate the cells with
     * the cells from the old table.
     * @param newNumRows the number of rows in the new table
     * @param newNumColumns the number of columns in the new table
     * @returns a new table
     */
    getUpdatedTableSize(newNumRows, newNumColumns) {

        var newTable = [];

        // create the rows
        for (var r = 0; r < newNumRows; r++) {

            var newRow = [];

            // create the columns
            for (var c = 0; c < newNumColumns; c++) {

                // try to get the cell from the old table
                var cell = this.getCellObjectFromComponentContent(c, r);

                if (cell == null) {
                    /*
                     * the old table does not have a cell for the given
                     * row/column location so we will create an empty cell
                     */
                    cell = this.createEmptyCell();
                }

                newRow.push(cell);
            }

            newTable.push(newRow);
        }

        return newTable;
    }

    /**
     * Get the cell object at the given x, y location
     * @param x the column number (zero indexed)
     * @param y the row number (zero indexed)
     * @returns the cell at the given x, y location or null if there is none
     */
    getCellObjectFromComponentContent(x, y) {
        var cellObject = null;

        var tableData = this.authoringComponentContent.tableData;

        if (tableData != null) {

            // get the row
            var row = tableData[y];

            if (row != null) {

                // get the cell
                cellObject = row[x];
            }
        }

        return cellObject;
    }

    /**
     * Create an empty cell
     * @returns an empty cell object
     */
    createEmptyCell() {
        var cell = {};

        cell.text = '';
        cell.editable = true;
        cell.size = null;

        return cell;
    }

    /**
     * Insert a row into the table from the authoring view
     * @param y the row number to insert at
     */
    authoringViewInsertRow(y) {

        // get the table
        var tableData = this.authoringComponentContent.tableData;

        if (tableData != null) {

            // create the new row that we will insert
            var newRow = [];

            // get the number of columns
            var numColumns = this.authoringComponentContent.numColumns;

            // populate the new row with the correct number of cells
            for (var c = 0; c < numColumns; c++) {
                // create an empty cell
                var newCell = this.createEmptyCell();
                newRow.push(newCell);
            }

            // insert the new row into the table
            tableData.splice(y, 0, newRow);

            // update the number of rows value
            this.authoringComponentContent.numRows++;
        }

        // save the project and update the preview
        this.authoringViewComponentChanged();
    }

    /**
     * Delete a row in the table from the authoring view
     * @param y the row number to delete
     */
    authoringViewDeleteRow(y) {

        var answer = confirm('Are you sure you want to delete this column?');

        if (answer) {
            // get the table
            var tableData = this.authoringComponentContent.tableData;

            if (tableData != null) {

                // remove the row
                tableData.splice(y, 1);

                // update the number of rows value
                this.authoringComponentContent.numRows--;
            }

            // save the project and update the preview
            this.authoringViewComponentChanged();
        }
    }

    /**
     * Insert a column into the table from the authoring view
     * @param x the column number to insert at
     */
    authoringViewInsertColumn(x) {

        // get the table
        var tableData = this.authoringComponentContent.tableData;

        if (tableData != null) {

            var numRows = this.authoringComponentContent.numRows;

            // loop through all the rows
            for (var r = 0; r < numRows; r++) {

                // get a row
                var tempRow = tableData[r];

                if (tempRow != null) {

                    // create an empty cell
                    var newCell = this.createEmptyCell();

                    // insert the cell into the row
                    tempRow.splice(x, 0, newCell);
                }
            }

            // update the number of columns value
            this.authoringComponentContent.numColumns++;
        }

        // save the project and update the preview
        this.authoringViewComponentChanged();
    }

    /**
     * Delete a column in the table from the authoring view
     * @param x the column number to delete
     */
    authoringViewDeleteColumn(x) {

        var answer = confirm('Are you sure you want to delete this column?');

        if (answer) {
            // get the table
            var tableData = this.authoringComponentContent.tableData;

            if (tableData != null) {

                var numRows = this.authoringComponentContent.numRows;

                // loop through all the rows
                for (var r = 0; r < numRows; r++) {

                    // get a row
                    var tempRow = tableData[r];

                    if (tempRow != null) {

                        // remove the cell from the row
                        tempRow.splice(x, 1);
                    }
                }

                // update the number of columns value
                this.authoringComponentContent.numColumns--;
            }

            // save the project and update the preview
            this.authoringViewComponentChanged();
        }
    }

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
     * Get the number of rows in the table
     * @returns the number of rows in the table
     */
    getNumRows() {
        return this.componentContent.numRows;
    }
    
    /**
     * Get the number of columns in the table
     * @returns the number of columns in the table
     */
    getNumColumns() {
        return this.componentContent.numColumns;
    }
    
    /**
     * Check if the table is empty. The table is empty if all the 
     * cells are empty string.
     * @returns whether the table is empty
     */
    isTableEmpty() {
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
    isTableReset() {
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
}

TableController.$inject = [
    '$rootScope',
    '$scope',
    'NodeService',
    'ProjectService',
    'StudentDataService',
    'TableService',
    'UtilService'
];

export default TableController;
