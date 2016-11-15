'use strict';

class ProjectController {

    constructor($interval, $q, $scope, $state, $stateParams, $translate, AuthorWebSocketService, ConfigService, ProjectService, UtilService) {
        this.$interval = $interval;
        this.$q = $q;
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.AuthorWebSocketService = AuthorWebSocketService;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.UtilService = UtilService;

        this.projectId = this.$stateParams.projectId;
        this.runId = this.ConfigService.getRunId();
        this.items = this.ProjectService.idToOrder;
        this.nodeIds = this.ProjectService.getFlattenedProjectAsNodeIds();
        this.showCreateGroup = false;
        this.showCreateNode = false;
        this.projectTitle = this.ProjectService.getProjectTitle();
        this.inactiveGroups = this.ProjectService.getInactiveGroups();
        this.inactiveNodes = this.ProjectService.getInactiveNodes();

        // check to see if there are other authors right now.
        this.ProjectService.getCurrentAuthors(this.projectId).then((currentAuthors) => {
            if (currentAuthors.length == 0) {
                this.currentAuthorsMessage = "";
            } else {
                // TODO: internationalize me
                
                var showWarningMessage = true;
                
                // get the user name of the signed in user
                var myUserName = this.ConfigService.getMyUserName();
                
                // check if the signed in user is the current author
                if (currentAuthors.length == 1 && currentAuthors[0] == myUserName) {
                    /*
                     * the signed in user is the current author so we do not need
                     * to display the warning message
                     */
                    showWarningMessage = false;
                }
                
                if (showWarningMessage) {
                    this.currentAuthorsMessage = currentAuthors.join(",") + " is currently editing this project.";
                    alert(currentAuthors.join(",") + " is currently editing this project. Please be careful not to overwrite each other's work!");
                }
            }
        });

        // notify others that this project is being authored
        this.ProjectService.notifyAuthorProjectBegin(this.projectId);

        // temprary polling until we get websocket working
        this.checkOtherAuthorsIntervalId = this.$interval(() => {
            this.ProjectService.getCurrentAuthors(this.projectId).then((currentAuthors) => {
                if (currentAuthors.length == 0) {
                    this.currentAuthorsMessage = "";
                } else {
                    
                    var showWarningMessage = true;
                    
                    // get the user name of the signed in user
                    var myUserName = this.ConfigService.getMyUserName();
                    
                    // check if the signed in user is the current author
                    if (currentAuthors.length == 1 && currentAuthors[0] == myUserName) {
                        /*
                         * the signed in user is the current author so we do not need
                         * to display the warning message
                         */
                        showWarningMessage = false;
                    }
                    
                    if (showWarningMessage) {
                        this.currentAuthorsMessage = currentAuthors.join(",") + " is currently editing this project.";
                    }
                }
            });
        }, 15000);

        this.$scope.$on("$destroy", () => {
            // cancel the checkOtherAuthorsInterval
            this.$interval.cancel(this.checkOtherAuthorsIntervalId);
            // notify others that this project is no longer being authored
            this.ProjectService.notifyAuthorProjectEnd(this.projectId);
        });
    };

    // updates projectAsText field, which is the string representation of the project that we'll show in the textarea
    updateProjectAsText() {
        this.projectAsText = JSON.stringify(this.ProjectService.project, null, 4);
    };

    /**
     * Launch the project in preview mode
     */
    previewProject() {
        let previewProjectURL = this.ConfigService.getConfigParam("previewProjectURL");
        window.open(previewProjectURL);
    };
    
    /**
     * Launch the project in preview mode without constraints
     */
    previewProjectWithoutConstraints() {
        let previewProjectURL = this.ConfigService.getConfigParam("previewProjectURL");
        previewProjectURL = previewProjectURL + '?constraints=false';
        window.open(previewProjectURL);
    };

    viewProjectAssets() {
        this.$state.go('root.project.asset', {projectId:this.projectId});
    };

    viewProjectHistory() {
        this.$state.go('root.project.history', {projectId:this.projectId});
    };

    viewNotebookSettings() {
        this.$state.go('root.project.notebook', {projectId:this.projectId});
    }

    saveProject() {
        //let projectJSONString = JSON.stringify(this.project, null, 4);
        //let commitMessage = $("#commitMessageInput").val();
        let commitMessage = "Made changes to Project.";
        try {
            // if projectJSONString is bad json, it will throw an exception and not save.
            //this.ProjectService.project = this.project;

            this.ProjectService.saveProject(commitMessage).then((commitHistoryArray) => {
                this.commitHistory = commitHistoryArray;
                $("#commitMessageInput").val("");  // clear field after commit
            });
        } catch (error) {
            alert("Invalid JSON. Please check syntax. Aborting save.");
            return;
        }
    };

    /**
     * Close authoring for the current project and bring user back to main AT page
     */
    closeProject() {
        this.$state.go('root.main');
    };

    /**
     * Get the node position
     * @param nodeId the node id
     * @returns the node position
     */
    getNodePositionById(nodeId) {
        return this.ProjectService.getNodePositionById(nodeId);
    };

    /**
     * The the components in the specified node id.
     * @param nodeId the node id
     * @returns components in the node
     */
    getComponentsByNodeId(nodeId) {
        return this.ProjectService.getComponentsByNodeId(nodeId);
    }

    /**
     * Returns a list of possible criteria for the specified node and component
     * @param nodeId the node id
     * @param componentId the component id in the node
     */
    getPossibleTransitionCriteria(nodeId, componentId) {
        return this.ProjectService.getPossibleTransitionCriteria(nodeId, componentId);
    }

    /**
     * Get the node title for a node
     * @param nodeId the node id
     * @returns the node title
     */
    getNodeTitleByNodeId(nodeId) {
        return this.ProjectService.getNodeTitleByNodeId(nodeId);
    };

    /**
     * Check if a node id is for a group
     * @param nodeId
     * @returns whether the node is a group node
     */
    isGroupNode(nodeId) {
        return this.ProjectService.isGroupNode(nodeId);
    };

    /**
     * A node was clicked so we will go to the node authoring view
     * @param nodeId
     */
    nodeClicked(nodeId) {
        this.$state.go('root.project.node', {projectId: this.projectId, nodeId:nodeId});
    };

    /**
     * Create a new group (activity)
     */
    createGroup() {

        // create a new group
        var newGroup = this.ProjectService.createGroup(this.createGroupTitle);

        /*
         * set the group into this variable to hold it temporarily while the
         * author decides where to place it
         */
        this.nodeToAdd = newGroup;
        //this.updateProjectAsText();

        // turn off the create group div
        this.showCreateGroup = false;

        // clear the title from the create group div
        this.createGroupTitle = '';

        // turn on insert mode
        this.insertGroupMode = true;

        // turn on create mode
        this.createMode = true;
    }

    /**
     * Create a new node (step)
     */
    createNode() {

        // create a new node
        var newNode = this.ProjectService.createNode(this.createNodeTitle);

        /*
         * set the node into this variable to hold it temporarily while the
         * author decides where to place it
         */
        this.nodeToAdd = newNode;
        //this.updateProjectAsText();

        // turn off the create node div
        this.showCreateNode = false;

        // clear the title from the create node div
        this.createNodeTitle = '';

        // turn on insert mode
        this.insertNodeMode = true;

        // turn on create mode
        this.createMode = true;
    }

    /**
     * Insert the node(s) inside
     * @param nodeId the node id of the group that we will insert into
     */
    insertInside(nodeId) {

        // TODO check that we are inserting into a group

        if (this.createMode) {
            // we are in create mode

            // create the node inside the group
            this.ProjectService.createNodeInside(this.nodeToAdd, nodeId);

            /*
             * clear this variable that we used to hold the node we inserted.
             * since we have inserted the node we don't need a handle to it
             * anymore
             */
            this.nodeToAdd = null;

            // turn off create mode
            this.createMode = false;

            // turn off insert mode
            this.insertGroupMode = false;
            this.insertNodeMode = false;
        } else if (this.moveMode) {
            // we are in move mode

            // get the nodes that were selected
            var selectedNodeIds = this.getSelectedItems();

            if (selectedNodeIds != null && selectedNodeIds.indexOf(nodeId) != -1) {
                /*
                 * the user is trying to insert the selected node ids into
                 * itself so we will not allow that
                 */
                if (selectedNodeIds.length == 1) {
                    alert('You are not allowed to insert the selected item into itself.');
                } else if (selectedNodeIds.length > 1) {
                    alert('You are not allowed to insert the selected items into itself.');
                }
            } else {
                // move the nodes into the group
                this.ProjectService.moveNodesInside(selectedNodeIds, nodeId);

                // turn off move mode
                this.moveMode = false;
    
                // turn off insert mode
                this.insertGroupMode = false;
                this.insertNodeMode = false;
            }
        } else if (this.copyMode) {
            // We are in copy mode

            // get the nodes that were selected
            var selectedNodeIds = this.getSelectedItems();

            // copy the nodes into the group
            this.ProjectService.copyNodesInside(selectedNodeIds, nodeId);

            // turn off copy mode
            this.copyMode = false;

            // turn off insert mode
            this.insertGroupMode = false;
            this.insertNodeMode = false;
        }
        
        // save and refresh the project
        this.checkPotentialStartNodeIdChangeThenSaveProject();
    }

    /**
     * Insert the node(s) after
     * @param nodeId the node id of the node we will insert after
     */
    insertAfter(nodeId) {

        if (this.createMode) {
            // we are in create mode

            // create the node after the node id
            this.ProjectService.createNodeAfter(this.nodeToAdd, nodeId);

            /*
             * clear this variable that we used to hold the node we inserted.
             * since we have inserted the node we don't need a handle to it
             * anymore
             */
            this.nodeToAdd = null;

            // turn off create mode
            this.createMode = false;

            // turn off insert mode
            this.insertGroupMode = false;
            this.insertNodeMode = false;
            
            // save and referesh the project
            this.checkPotentialStartNodeIdChangeThenSaveProject();
        } else if (this.moveMode) {
            // we are in move mode

            // get the selected nodes
            var selectedNodeIds = this.getSelectedItems();

            if (selectedNodeIds != null && selectedNodeIds.indexOf(nodeId) != -1) {
                /*
                 * the user is trying to insert the selected node ids after
                 * itself so we will not allow that
                 */
                 if (selectedNodeIds.length == 1) {
                    alert('You are not allowed to insert the selected item after itself.');
                 } else if (selectedNodeIds.length > 1) {
                    alert('You are not allowed to insert the selected items after itself.');
                 }
            } else {
                // move the nodes after the node id
                this.ProjectService.moveNodesAfter(selectedNodeIds, nodeId);

                // turn off move mode
                this.moveMode = false;
    
                // turn off insert mode
                this.insertGroupMode = false;
                this.insertNodeMode = false;

                // save and refresh the project
                this.checkPotentialStartNodeIdChangeThenSaveProject();
            }
        } else if (this.copyMode) {
            // We are in copy mode

            // get the selected nodes
            var selectedNodeIds = this.getSelectedItems();

            // copy the nodes and put them after the node id
            this.ProjectService.copyNodesAfter(selectedNodeIds, nodeId);

            // turn off copy mode
            this.copyMode = false;

            // turn off insert mode
            this.insertGroupMode = false;
            this.insertNodeMode = false;

            // save and refresh the project
            this.checkPotentialStartNodeIdChangeThenSaveProject();
        }
    }

    /**
     * Turn on copy mode
     */
    copy() {

        // make sure there is at least one item selected
        var selectedNodeIds = this.getSelectedItems();

        if (selectedNodeIds != null && selectedNodeIds.length > 0) {
            // get the nodes that were selected
            var selectedItemTypes = this.getSelectedItemTypes();

            if (selectedItemTypes != null && selectedItemTypes.length > 0) {

                if (selectedItemTypes.length === 0) {
                    // there are no selected items
                    alert('Please select an item to copy.');
                } else if (selectedItemTypes.length === 1 && selectedItemTypes[0] === 'node') {
                    // turn on insert mode
                    this.insertNodeMode = true;

                    // turn on copy mode
                    this.copyMode = true;
                } else {
                    alert('You cannot copy the item(s) at this time.');
                }
            }
        }
    }

    /**
     * Turn on move mode
     */
    move() {
    
        // make sure there is at least one item selected
        var selectedNodeIds = this.getSelectedItems();
        
        if (selectedNodeIds != null && selectedNodeIds.length > 0) {
            // get the nodes that were selected
            var selectedItemTypes = this.getSelectedItemTypes();
            
            if (selectedItemTypes != null && selectedItemTypes.length > 0) {
            
                if (selectedItemTypes.length == 0) {
                    // there are no selected items
                    alert('Please select an item to move.');
                } else if (selectedItemTypes.length == 1) {
                    // all the items the user selected are the same type
                    
                    if (selectedItemTypes[0] === 'group') {
                        // turn on insert mode
                        this.insertGroupMode = true;
            
                        // turn on move mode
                        this.moveMode = true;
                    } else if (selectedItemTypes[0] === 'node') {
                        // turn on insert mode
                        this.insertNodeMode = true;
            
                        // turn on move mode
                        this.moveMode = true;
                    }
                } else if (selectedItemTypes.length > 1) {
                    /*
                     * the items the user selected are different types but
                     * we do not allow moving different types of items at
                     * the same time
                     */
                    
                    alert('If you want to move multiple items at once, they must be of the same type. Please select only activities or only steps.');
                }
            }
        }
    }

    /**
     * Delete the selected nodes
     */
    delete() {
    
        // get the selected items
        var selectedNodeIds = this.getSelectedItems();

        if (selectedNodeIds != null) {
        
            var confirmMessage = null;
        
            if (selectedNodeIds.length == 1) {
                // the user selected one item
                confirmMessage = 'Are you sure you want to delete the selected item?';
            } else if (selectedNodeIds.length > 1) {
                // the user selected multiple items
                confirmMessage = 'Are you sure you want to delete the selected items?';
            }
            
            if (confirmMessage != null) {
                // ask the user to confirm the delete
                var answer = confirm(confirmMessage);
        
                if (answer) {
                    // the user confirmed yes
        
                    // get the selected node ids
                    var selectedNodeIds = this.getSelectedItems();
        
                    // flag that will be set if we have deleted the start node id
                    var deletedStartNodeId = false;
        
                    // loop through each node id
                    for (var n = 0; n < selectedNodeIds.length; n++) {
                        var nodeId = selectedNodeIds[n];
        
                        if (this.ProjectService.isStartNodeId(nodeId)) {
                            // we have deleted the start node id
                            deletedStartNodeId = true;
                        }
        
                        // delete the node
                        this.ProjectService.deleteNode(nodeId);
                    }
                    
                    // update start node id if necesary
                    if (deletedStartNodeId) {
                        this.updateStartNodeId();
                    }
        
                    // save the project
                    this.ProjectService.saveProject();
        
                    // refresh the project
                    this.ProjectService.parseProject();
                    this.items = this.ProjectService.idToOrder;
                }
            }
        }
    }

    /**
     * Get the selected items
     * @returns an array of node ids that are selected
     */
    getSelectedItems() {

        // an array to hold the node ids of the nodes that are selected
        var selectedNodeIds = [];

        // loop through all the node checkboxes
        angular.forEach(this.items, function(value, key) {
            if (value.checked) {
                // this node is checked
                selectedNodeIds.push(key);
            }
        }, selectedNodeIds);
        
        if (this.inactiveNodes != null) {
            
            // loop through all the inactive nodes
            for (var i = 0; i < this.inactiveNodes.length; i++) {
                var inactiveNode = this.inactiveNodes[i];
                
                if (inactiveNode != null) {
                    if (inactiveNode.checked) {
                        // the inactive node was checked so we will add it
                        selectedNodeIds.push(inactiveNode.id);
                    }
                }
            }
        }

        return selectedNodeIds;
    }
    
    /**
     * Get the types of the selected items
     * @returns an array of item types. possible items are group or node.
     */
    getSelectedItemTypes() {

        var selectedItemTypes = [];

        // loop through all the node checkboxes
        angular.forEach(this.items, function(value, key) {
            if (value.checked) {
                
                // this node is checked
                var node = this.ProjectService.getNodeById(key);
                
                if (node != null) {
                
                    // get the node type
                    var nodeType = node.type;
                    
                    if (selectedItemTypes.indexOf(nodeType) == -1) {
                        // we have not seen this node type yet so we will add it
                        selectedItemTypes.push(nodeType);
                    }
                }
            }
        }, this);
        
        var inactiveNodes = this.inactiveNodes;
        
        if (inactiveNodes != null) {
            
            // loop through all the inactive nodes
            for (var i = 0; i < inactiveNodes.length; i++) {
                var inactiveNode = inactiveNodes[i];
                
                if (inactiveNode != null) {
                    if (inactiveNode.checked) {
                        // the node was checked
                        
                        // get the node type
                        var nodeType = inactiveNode.type;
                        
                        if (selectedItemTypes.indexOf(nodeType) == -1) {
                            // we have not seen this node type yet so we will add it
                            selectedItemTypes.push(nodeType);
                        }
                    }
                }
            }
        }

        return selectedItemTypes;
    }

    /**
     * Unselect all the items
     */
    unselectAllItems() {
        angular.forEach(this.items, function(value, key) {
            value.checked = false;
        });
    }
    
    /**
     * Toggle the create group input
     */
    toggleCreateGroup() {
        this.hideCreateNode();
        this.showCreateGroup = !this.showCreateGroup;
        this.createGroupTitle = '';
    }
    
    /**
     * Hide the create group input
     */
    hideCreateGroup() {
        this.showCreateGroup = false;
        this.createGroupTitle = '';
    }
    
    /**
     * Toggle the create node input
     */
    toggleCreateNode() {
        this.hideCreateGroup();
        this.showCreateNode = !this.showCreateNode;
        this.createNodeTitle = '';
    }
    
    /**
     * Hide the create group input
     */
    hideCreateNode() {
        this.showCreateNode = false;
        this.createNodeTitle = '';
    }
    
    /**
     * Cancel the move mode
     */
    cancelMove() {
        this.insertGroupMode = false;
        this.insertNodeMode = false;
    }
    
    /**
     * Update the start node id by traversing start ids until a
     * node id is found.
     */
    updateStartNodeId() {
        
        var newStartNodeId = null;
        
        // get the start group id
        var startGroupId = this.ProjectService.getStartGroupId();
        var node = this.ProjectService.getNodeById(startGroupId);
        
        var done = false;
        
        // recursively traverse the start ids
        while(!done) {
            
            if (node == null) {
                // base case in case something went wrong
                done = true;
            } else if (this.ProjectService.isGroupNode(node.id)) {
                // the node is a group node so we will get its start node
                node = this.ProjectService.getNodeById(node.startId);
            } else if (this.ProjectService.isApplicationNode(node.id)) {
                // the node is a step node so we have found the new start node id
                newStartNodeId = node.id;
                done = true;
            } else {
                // base case in case something went wrong
                done = true;
            }
        }
        
        if (newStartNodeId) {
            // set the new start node id
            this.ProjectService.setStartNodeId(newStartNodeId);
        }
    }
    
    /**
     * Check if the start node id for the project could potentially
     * change.
     */
    checkPotentialStartNodeIdChange() {
        return this.$q((resolve, reject) => {
            // get the current start node id
            var currentStartNodeId = this.ProjectService.getStartNodeId();

            // get the first leaf node id
            var firstLeafNodeId = this.ProjectService.getFirstLeafNodeId();

            if (firstLeafNodeId == null) {
                // there are no steps in the project
                
                // set the start node id to empty string
                this.ProjectService.setStartNodeId('');
                
                resolve();
            } else {
                // we have found a leaf node
                
                if (currentStartNodeId != firstLeafNodeId) {
                    /*
                     * the node ids are different which means the first leaf node
                     * id is different than the current start node id and that
                     * the author may want to use the first leaf node id as the
                     * new start node id
                     */
                    var firstLeafNode = this.ProjectService.getNodeById(firstLeafNodeId);

                    if (firstLeafNode != null) {
                        var firstChildTitle = firstLeafNode.title;

                        // ask the user if they would like to change the start step to the step that is now the first child in the group
                        this.$translate('confirmUpdateStartStep', { startStepTitle: firstChildTitle }).then((confirmUpdateStartStep) => {
                            var answer = confirm(confirmUpdateStartStep);

                            if (answer) {
                                // change the project start node id
                                this.ProjectService.setStartNodeId(firstLeafNodeId);
                                resolve();
                            } else {
                                resolve();
                            }
                        });
                    } else {
                        resolve();
                    }
                } else {
                    resolve();
                }
            }
        });
    }
    
    /**
     * Check if the start node id has changed and then save the project
     */
    checkPotentialStartNodeIdChangeThenSaveProject() {
        // check if the project start node id should be changed
        this.checkPotentialStartNodeIdChange().then(() => {
            // save the project
            this.ProjectService.saveProject();

            // refresh the project
            this.ProjectService.parseProject();
            this.items = this.ProjectService.idToOrder;

            this.unselectAllItems();
        });
    }
    
    /**
     * The project title changed so we will update the project title in the 
     * project service
     */
    projectTitleChanged() {
        
        // update the project title in the project service
        this.ProjectService.setProjectTitle(this.projectTitle);
        
        // save the project
        this.ProjectService.saveProject();
    }
    
    /**
     * Toggle the import view
     */
    toggleImportView() {
        this.importMode = !this.importMode;
    }
    
    /**
     * Get all the authorable projects
     */
    getAuthorableProjects() {
        return this.ConfigService.getConfigParam('projects');
    }
    
    /**
     * Get all the library projects
     */
    getLibraryProjects() {
        this.ConfigService.getLibraryProjects().then((libraryProjects) => {
            this.libraryProjects = libraryProjects;
        });
    }
    
    /**
     * Show the project we want to import steps from
     */
    showImportProject() {
        
        if (this.importProjectId != null) {
            
            // get the import project
            this.ProjectService.retrieveProjectById(this.importProjectId).then((projectJSON) => {
                
                // create the mapping of node id to order for the import project
                this.importProjectIdToOrder = {};
                this.importProject = projectJSON;
                
                // calculate the node order of the import project
                var result = this.ProjectService.getNodeOrderOfProject(this.importProject);
                this.importProjectIdToOrder = result.idToOrder;
                this.importProjectItems = result.nodes;
            });
        }
    }
    
    /**
     * Preview the step
     * @param node
     */
    previewImportNode(node) {
        
        if (node != null) {
            
            // get the node id
            var nodeId = node.id;
            
            // get the preview project url for the import project
            var previewProjectURL = this.importProject.previewProjectURL;
            
            // create the url to preview the step
            var previewStepURL  = previewProjectURL + "#/vle/" + nodeId;
            
            // open the preview step in a new tab
            window.open(previewStepURL);
        }
    }
    
    /**
     * Import the selected steps
     */
    importSteps() {
        
        // get the nodes that were selected
        var selectedNodes = this.getSelectedNodesToImport();
        
        var selectedNodeTitles = '';
        
        // loop through all the selected nodes
        for (var s = 0; s < selectedNodes.length; s++) {
            var selectedNode = selectedNodes[s];
            
            if (selectedNode != null) {
                
                var stepNumber = null;
                var title = selectedNode.title;
                
                if (this.importProjectIdToOrder[selectedNode.id] != null) {
                    // get the step number
                    stepNumber = this.importProjectIdToOrder[selectedNode.id].stepNumber;
                }
                
                if (selectedNodeTitles != '') {
                    selectedNodeTitles += '\n';
                }
                
                // get the step number and title
                selectedNodeTitles += stepNumber + ': ' + title;
            }
        }
        
        // ask the author if they are sure they want to import these steps
        var answer = confirm('Are you sure you want to import these steps?\n\n' + selectedNodeTitles);
        
        if (answer) {
            // the author answered yes to import
            
            // get the inactive nodes from the project
            var inactiveNodes = this.ProjectService.getInactiveNodes();
            
            var nodeIdToInsertAfter = 'inactiveSteps';
            
            // loop through the nodes we will import
            for (var n = 0; n < selectedNodes.length; n++) {
                
                var selectedNode = selectedNodes[n];
                
                if (selectedNode != null) {
                    
                    var tempNodeId = selectedNode.id;
                    
                    // get the item which contains the node we want to import
                    var tempItem = this.importProjectIdToOrder[tempNodeId];
                    
                    if (tempItem != null) {
                        
                        // find where to insert the imported node
                        if (inactiveNodes != null && inactiveNodes.length > 0) {
                            nodeIdToInsertAfter = inactiveNodes[inactiveNodes.length - 1];
                        }
                        
                        // make a copy of the node so that we don't modify the source
                        var tempNode = this.UtilService.makeCopyOfJSONObject(tempItem.node);
                        
                        // check if the node id is already being used in the current project
                        if (this.ProjectService.isNodeIdUsed(tempNode.id)) {
                            // the node id is already being used in the current project
                            
                            // get the next available node id
                            var nextAvailableNodeId = this.ProjectService.getNextAvailableNodeId();
                            
                            // change the node id of the node we are importing
                            tempNode.id = nextAvailableNodeId;
                        }
                        
                        var tempComponents = tempNode.components;
                        
                        if (tempComponents != null) {
                            
                            // loop through all the components in the node we are importing
                            for (var c = 0; c < tempComponents.length; c++) {
                                var tempComponent = tempComponents[c];
                                
                                if (tempComponent != null) {
                                    
                                    // check if the component id is already being used
                                    if (this.ProjectService.isComponentIdUsed(tempComponent.id)) {
                                        // we are already using the component id so we will need to change it
                                        
                                        // find a component id that isn't currently being used
                                        var newComponentId = this.ProjectService.getUnusedComponentId();
                                        
                                        // set the new component id into the component
                                        tempComponent.id = newComponentId;
                                    }
                                }
                            }
                        }
                        
                        // add the imported node to the end of the inactive nodes
                        this.ProjectService.addInactiveNode(tempNode, nodeIdToInsertAfter);
                    }
                }
            }
            
            // save the project
            this.ProjectService.saveProject();

            // refresh the project
            this.ProjectService.parseProject();
            this.items = this.ProjectService.idToOrder;
            
            // turn off import mode
            this.importMode = false;
        }
    }
    
    /**
     * Get the selected nodes to import
     * @return an array of selected nodes
     */
    getSelectedNodesToImport() {
        var selectedNodes = [];
        
        // loop through all the import project items
        for (var n = 0; n < this.importProjectItems.length; n++) {
            var item = this.importProjectItems[n];
            
            if (item.checked) {
                /*
                 * this item is checked so we will add it to the array of nodes
                 * that we will import
                 */
                selectedNodes.push(item.node);
            }
        }
        
        return selectedNodes;
    }
};

ProjectController.$inject = ['$interval', '$q', '$scope', '$state', '$stateParams', '$translate',
    'AuthorWebSocketService', 'ConfigService', 'ProjectService', 'UtilService'];

export default ProjectController;
