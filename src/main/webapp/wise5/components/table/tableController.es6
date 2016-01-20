class TableController {
    constructor($rootScope,
                $scope,
                NodeService,
                ProjectService,
                StudentDataService,
                TableService) {

        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        this.TableService = TableService;

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

        // get the current node and node id
        var currentNode = this.StudentDataService.getCurrentNode();
        if (currentNode != null) {
            this.nodeId = currentNode.id;
        } else {
            this.nodeId = this.$scope.nodeId;
        }

        // get the component content from the scope
        this.componentContent = this.$scope.component;

        this.mode = this.$scope.mode;

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
            } else if (this.mode === 'authoring') {
                this.updateAdvancedAuthoringView();
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

                // get the component type that has changed
                var componentType = connectedComponent.type;

                if (componentType === 'Graph') {

                    // set the graph data into the table
                    this.$scope.tableController.setGraphDataIntoTableData(componentState, connectedComponentParams);

                    // the table has changed
                    this.$scope.tableController.isDirty = true;
                }
            }
        }.bind(this);

        /**
         * Get the component state from this component. The parent node will
         * call this function to obtain the component state when it needs to
         * save student data.
         * @return a component state containing the student data
         */
        this.$scope.getComponentState = function() {

            var componentState = null;

            if (this.$scope.tableController.isDirty) {
                // create a component state populated with the student data
                componentState = this.$scope.tableController.createComponentState();

                // set isDirty to false since this student work is about to be saved
                this.$scope.tableController.isDirty = false;
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
            }
        }
    };

    /**
     * Called when the student clicks the save button
     */
    saveButtonClicked() {

        // tell the parent node that this component wants to save
        this.$scope.$emit('componentSaveTriggered', {nodeId: this.nodeId, componentId: this.componentId});
    };

    /**
     * Called when the student clicks the submit button
     */
    submitButtonClicked() {
        this.isSubmit = true;

        // check if we need to lock the component after the student submits
        if (this.isLockAfterSubmit()) {
            this.isDisabled = true;
        }

        this.$scope.$emit('componentSubmitTriggered', {nodeId: this.nodeId, componentId: this.componentId});
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

        if (this.componentContent != null) {
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
    attachNotebookItemToComponent(notebookItem) {
        if (notebookItem.studentAsset != null) {
            // TODO implement me
        } else if (notebookItem.studentWork != null) {
            // TODO implement me
        }
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
     * Get the component id
     * @return the component id
     */
    getComponentId() {
        var componentId = this.componentContent.id;

        return componentId;
    };

    /**
     * The component has changed in the regular authoring view so we will save the project
     */
    authoringViewComponentChanged() {

        // update the JSON string in the advanced authoring view textarea
        this.updateAdvancedAuthoringView();

        // render the preview table again so it will pick up any changes
        this.resetTable();

        // save the project to the server
        this.ProjectService.saveProject();
    };

    /**
     * The component has changed in the advanced authoring view so we will update
     * the component and save the project.
     */
    advancedAuthoringViewComponentChanged() {

        try {
            /*
             * create a new comopnent by converting the JSON string in the advanced
             * authoring view into a JSON object
             */
            var editedComponentContent = angular.fromJson(this.componentContentJSONString);

            // replace the component in the project
            this.ProjectService.replaceComponent(this.nodeId, this.componentId, editedComponentContent);

            // set the new component into the controller
            this.componentContent = editedComponentContent;

            // save the project to the server
            this.ProjectService.saveProject();
        } catch(e) {

        }
    };

    /**
     * Update the component JSON string that will be displayed in the advanced authoring view textarea
     */
    updateAdvancedAuthoringView() {
        this.componentContentJSONString = angular.toJson(this.componentContent, 4);
    };

    /**
     * The table size has changed in the authoring view so we will update it
     */
    authoringViewTableSizeChanged() {

        // create a new table with the new size and populate it with the existing cells
        var newTable = this.getUpdatedTableSize(this.componentContent.numRows, this.componentContent.numColumns);

        // set the new table into the component content
        this.componentContent.tableData = newTable;

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

        var tableData = this.componentContent.tableData;

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
        var tableData = this.componentContent.tableData;

        if (tableData != null) {

            // create the new row that we will insert
            var newRow = [];

            // get the number of columns
            var numColumns = this.componentContent.numColumns;

            // populate the new row with the correct number of cells
            for (var c = 0; c < numColumns; c++) {
                // create an empty cell
                var newCell = this.createEmptyCell();
                newRow.push(newCell);
            }

            // insert the new row into the table
            tableData.splice(y, 0, newRow);

            // update the number of rows value
            this.componentContent.numRows++;
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
            var tableData = this.componentContent.tableData;

            if (tableData != null) {

                // remove the row
                tableData.splice(y, 1);

                // update the number of rows value
                this.componentContent.numRows--;
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
        var tableData = this.componentContent.tableData;

        if (tableData != null) {

            var numRows = this.componentContent.numRows;

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
            this.componentContent.numColumns++;
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
            var tableData = this.componentContent.tableData;

            if (tableData != null) {

                var numRows = this.componentContent.numRows;

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
                this.componentContent.numColumns--;
            }

            // save the project and update the preview
            this.authoringViewComponentChanged();
        }
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
    'TableService'
];

export default TableController;
