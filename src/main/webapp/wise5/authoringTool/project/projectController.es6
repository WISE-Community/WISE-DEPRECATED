'use strict';

class ProjectController {

    constructor($scope, $state, $stateParams, ProjectService, ConfigService) {
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.ProjectService = ProjectService;
        this.ConfigService = ConfigService;

        this.title = "project controller";
        this.projectId = this.$stateParams.projectId;
        this.project = this.ProjectService.project;
        this.items = this.ProjectService.idToOrder;
        this.nodeIds = this.ProjectService.getFlattenedProjectAsNodeIds();
        this.showCreateGroup = false;
        this.showCreateNode = false;

        this.updateProjectAsText();

        $scope.$watch(
            () => {
                return this.projectAsText;
            },
            () => {
                try {
                    this.project = JSON.parse(this.projectAsText);
                } catch(exp) {
                    //Exception handler
                };
        });
    };

    // updates projectAsText field, which is the string representation of the project that we'll show in the textarea
    updateProjectAsText() {
        this.projectAsText = JSON.stringify(this.project, null, 4);
    };

    /**
     * Launch the project in preview mode
     */
    previewProject() {
        let previewProjectURL = this.ConfigService.getConfigParam("previewProjectURL");
        window.open(previewProjectURL);
    };

    viewProjectAssets() {
        this.$state.go('root.project.asset', {projectId:this.projectId});
    };

    viewProjectHistory() {
        this.$state.go('root.project.history', {projectId:this.projectId});
    };

    saveProject() {
        //let projectJSONString = JSON.stringify(this.project, null, 4);
        let commitMessage = $("#commitMessageInput").val();
        try {
            // if projectJSONString is bad json, it will throw an exception and not save.
            this.ProjectService.project = this.project;

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

            // save the project
            this.ProjectService.saveProject();

            // turn off create mode
            this.createMode = false;

            // turn off insert mode
            this.insertGroupMode = false;
            this.insertNodeMode = false;

            // refresh the project
            this.ProjectService.parseProject();
            this.items = this.ProjectService.idToOrder;
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
    
                // save the project
                this.ProjectService.saveProject();
    
                // turn off move mode
                this.moveMode = false;
    
                // turn off insert mode
                this.insertGroupMode = false;
                this.insertNodeMode = false;
    
                // refresh the project
                this.ProjectService.parseProject();
                this.items = this.ProjectService.idToOrder;
    
                this.unselectAllItems();
            }
        }
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

            // save the project
            this.ProjectService.saveProject();

            // turn off create mode
            this.createMode = false;

            // turn off insert mode
            this.insertGroupMode = false;
            this.insertNodeMode = false;

            // refresh the project
            this.ProjectService.parseProject();
            this.items = this.ProjectService.idToOrder;
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
    
                // save the project
                this.ProjectService.saveProject();
    
                // turn off move mode
                this.moveMode = false;
    
                // turn off insert mode
                this.insertGroupMode = false;
                this.insertNodeMode = false;
    
                // refresh the project
                this.ProjectService.parseProject();
                this.items = this.ProjectService.idToOrder;
    
                this.unselectAllItems();
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
            
                this.showMove = true;
            
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
        } else {
            // the user did not select any items so we will display an error message
            alert('You must first select an activity or step to move.');
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
        
            if (selectedNodeIds.length == 0) {
                // the user did not select any items so we will display an error message
                alert('You must first select and activity or step to delete.');
            } else if (selectedNodeIds.length == 1) {
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
        
                    // loop through each node id
                    for (var n = 0; n < selectedNodeIds.length; n++) {
                        var nodeId = selectedNodeIds[n];
        
                        // delete the node
                        this.ProjectService.deleteNode(nodeId);
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
};

ProjectController.$inject = ['$scope', '$state', '$stateParams', 'ProjectService', 'ConfigService'];

export default ProjectController;
