'use strict';

class ProjectController {

    constructor($anchorScroll,
                $filter,
                $interval,
                $mdDialog,
                $q,
                $rootScope,
                $scope,
                $state,
                $stateParams,
                $timeout,
                AuthorWebSocketService,
                ConfigService,
                ProjectAssetService,
                ProjectService,
                TeacherDataService,
                UtilService) {
        this.$anchorScroll = $anchorScroll;
        this.$filter = $filter;
        this.$interval = $interval;
        this.$mdDialog = $mdDialog;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$timeout = $timeout;
        this.$translate = this.$filter('translate');
        this.AuthorWebSocketService = AuthorWebSocketService;
        this.ConfigService = ConfigService;
        this.ProjectAssetService = ProjectAssetService;
        this.ProjectService = ProjectService;
        this.TeacherDataService = TeacherDataService;
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
        this.projectScriptFilename = this.ProjectService.getProjectScriptFilename();
        this.currentAuthorsMessage = "";  // show a message when there is more than one author currently authoring this project

        this.projectMode = true;
        this.showCreateGroup = false;
        this.showCreateNode = false;
        this.showImportView = false;
        this.importMode = false;
        this.editProjectRubricMode = false;
        this.advancedMode = false;
        this.showJSONAuthoring = false;

        // we are opening the project so we will set the current node to null
        this.TeacherDataService.setCurrentNode(null);

        // scroll to the top of the page
        this.$anchorScroll('top');

        // process metadata
        this.metadata = this.ProjectService.getProjectMetadata();

        // notify others that this project is being authored
        this.ProjectService.notifyAuthorProjectBegin(this.projectId);

        // generate the summernote rubric element id
        this.summernoteRubricId = 'summernoteRubric_' + this.projectId;

        // set the project rubric into the summernote rubric
        this.summernoteRubricHTML = this.ProjectService.replaceAssetPaths(this.ProjectService.getProjectRubric());

        // the tooltip text for the insert WISE asset button
        var insertAssetString = this.$translate('INSERT_ASSET');

        /*
         * create the custom button for inserting WISE assets into
         * summernote
         */
        var InsertAssetButton = this.UtilService.createInsertAssetButton(this, this.projectId, null, null, 'rubric', insertAssetString);

        /*
         * the options that specifies the tools to display in the
         * summernote prompt
         */
        this.summernoteRubricOptions = {
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'underline', 'clear']],
                ['fontname', ['fontname']],
                ['fontsize', ['fontsize']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['table', ['table']],
                ['insert', ['link', 'video']],
                ['view', ['fullscreen', 'codeview', 'help']],
                ['customButton', ['insertAssetButton']]
            ],
            height: 300,
            disableDragAndDrop: true,
            buttons: {
                insertAssetButton: InsertAssetButton
            }
        };

        this.$scope.$on('currentAuthorsReceived', (event, args) => {
            let currentAuthorsUsernames = args.currentAuthorsUsernames;
            // get the user name of the signed in user
            var myUserName = this.ConfigService.getMyUserName();
            // remove my username from the currentAuthors
            currentAuthorsUsernames.splice(currentAuthorsUsernames.indexOf(myUserName),1);
            if (currentAuthorsUsernames.length > 0) {
                this.currentAuthorsMessage = this.$translate('concurrentAuthorsWarning', { currentAuthors: currentAuthorsUsernames.join(", ") });
            } else {
                this.currentAuthorsMessage = "";
            }
        });

        this.$scope.$on("$destroy", () => {
            // notify others that this project is no longer being authored
            this.ProjectService.notifyAuthorProjectEnd(this.projectId);
        });

        /*
         * Listen for the assetSelected event which occurs when the user
         * selects an asset from the choose asset popup
         */
        this.$scope.$on('assetSelected', (event, args) => {

            if (args != null) {

                // make sure the event was fired for this component
                if (args.projectId == this.projectId) {
                    // the asset was selected for this component
                    var assetItem = args.assetItem;

                    if (assetItem != null) {
                        var fileName = assetItem.fileName;

                        if (fileName != null) {
                            /*
                             * get the assets directory path
                             * e.g.
                             * /wise/curriculum/3/
                             */
                            var assetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
                            var fullAssetPath = assetsDirectoryPath + '/' + fileName;

                            var summernoteId = '';

                            if (args.target == 'rubric') {
                                // the target is the summernote rubric element
                                summernoteId = 'summernoteRubric_' + this.projectId;

                                if (summernoteId != '') {
                                    if (this.UtilService.isImage(fileName)) {
                                        /*
                                         * move the cursor back to its position when the asset chooser
                                         * popup was clicked
                                         */
                                        $('#' + summernoteId).summernote('editor.restoreRange');
                                        $('#' + summernoteId).summernote('editor.focus');

                                        // add the image html
                                        $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
                                    } else if (this.UtilService.isVideo(fileName)) {
                                        /*
                                         * move the cursor back to its position when the asset chooser
                                         * popup was clicked
                                         */
                                        $('#' + summernoteId).summernote('editor.restoreRange');
                                        $('#' + summernoteId).summernote('editor.focus');

                                        // insert the video element
                                        var videoElement = document.createElement('video');
                                        videoElement.controls = 'true';
                                        videoElement.innerHTML = "<source ng-src='" + fullAssetPath + "' type='video/mp4'>";
                                        $('#' + summernoteId).summernote('insertNode', videoElement);
                                    }
                                }
                            } else if (args.target == 'scriptFilename') {
                                // the target is the project script filename
                                this.projectScriptFilename = fileName;
                                this.projectScriptFilenameChanged();
                            }
                        }
                    }
                }
            }

            // close the popup
            this.$mdDialog.hide();
        });
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
        this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
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

            let newNodes = [this.nodeToAdd];

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

            // temporarily highlight the new nodes
            this.highlightNewNodes(newNodes);

            // save and refresh the project
            this.checkPotentialStartNodeIdChangeThenSaveProject();
        } else if (this.moveMode) {
            // we are in move mode

            // get the nodes that were selected
            let selectedNodeIds = this.getSelectedItems();

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
                let newNodes = this.ProjectService.moveNodesInside(selectedNodeIds, nodeId);

                // turn off move mode
                this.moveMode = false;

                // turn off insert mode
                this.insertGroupMode = false;
                this.insertNodeMode = false;

                // temporarily highlight the new nodes
                this.highlightNewNodes(newNodes);
            }

            // save and refresh the project
            this.checkPotentialStartNodeIdChangeThenSaveProject();
        } else if (this.copyMode) {
            // We are in copy mode

            // get the nodes that were selected
            let selectedNodeIds = this.getSelectedItems();

            // copy the nodes into the group
            let newNodes = this.ProjectService.copyNodesInside(selectedNodeIds, nodeId);

            // turn off copy mode
            this.copyMode = false;

            // turn off insert mode
            this.insertGroupMode = false;
            this.insertNodeMode = false;

            // temporarily highlight the new nodes
            this.highlightNewNodes(newNodes);

            // save and refresh the project
            this.checkPotentialStartNodeIdChangeThenSaveProject();
        } else if (this.importMode) {
            // we are in import mode

            // import the selected nodes and place them inside the given group
            this.performImport(nodeId).then(() => {
                // save and refresh the project
                this.checkPotentialStartNodeIdChangeThenSaveProject();
            });
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

            let newNodes = [this.nodeToAdd];

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

            // temporarily highlight the new nodes
            this.highlightNewNodes(newNodes);

            // save and referesh the project
            this.checkPotentialStartNodeIdChangeThenSaveProject();
        } else if (this.moveMode) {
            // we are in move mode

            // get the selected nodes
            let selectedNodeIds = this.getSelectedItems();

            if (selectedNodeIds != null && selectedNodeIds.indexOf(nodeId) != -1) {
                /*
                 * the user is trying to insert the selected node ids after
                 * itself so we will not allow that
                 */
                if (selectedNodeIds.length == 1) {
                    alert(this.$translate('youAreNotAllowedToInsertTheSelectedItemAfterItself'));
                } else if (selectedNodeIds.length > 1) {
                    alert(this.$translate('youAreNotAllowedToInsertTheSelectedItemsAfterItself'));
                }
            } else {
                // move the nodes after the node id
                let newNodes = this.ProjectService.moveNodesAfter(selectedNodeIds, nodeId);

                // turn off move mode
                this.moveMode = false;

                // turn off insert mode
                this.insertGroupMode = false;
                this.insertNodeMode = false;

                // temporarily highlight the new nodes
                this.highlightNewNodes(newNodes);

                // save and refresh the project
                this.checkPotentialStartNodeIdChangeThenSaveProject();
            }
        } else if (this.copyMode) {
            // We are in copy mode

            // get the selected nodes
            let selectedNodeIds = this.getSelectedItems();

            // copy the nodes and put them after the node id
            let newNodes = this.ProjectService.copyNodesAfter(selectedNodeIds, nodeId);

            // turn off copy mode
            this.copyMode = false;

            // turn off insert mode
            this.insertGroupMode = false;
            this.insertNodeMode = false;

            // temporarily highlight the new nodes
            this.highlightNewNodes(newNodes);

            // save and refresh the project
            this.checkPotentialStartNodeIdChangeThenSaveProject();
        } else if (this.importMode) {
            // we are in import mode

            // import the selected nodes and place them after the given step
            this.performImport(nodeId).then(() => {
                // save and refresh the project
                this.checkPotentialStartNodeIdChangeThenSaveProject();
            });
        }
    }

    /**
     * Import the step and place it in the chosen location
     * @param nodeIdToInsertInsideOrAfter If this is a group, we will make the
     * new step the first step in the group. If this is a step, we will place
     * the new step after it.
     */
    performImport(nodeIdToInsertInsideOrAfter) {

        var selectedNodes = this.getSelectedNodesToImport();

        // get the project id we are importing into
        var toProjectId = this.ConfigService.getConfigParam('projectId');

        // get the project id we are importing from
        var fromProjectId = this.importProjectId;

        // copy the nodes into the project
        return this.ProjectService.copyNodes(selectedNodes, fromProjectId, toProjectId, nodeIdToInsertInsideOrAfter).then(() => {

            // save the project
            this.ProjectService.saveProject();

            // refresh the project
            this.ProjectService.parseProject();
            this.items = this.ProjectService.idToOrder;

            // turn off the insert node mode
            this.insertNodeMode = false;

            // go back to the project view
            this.toggleView('project');

            // clear the import fields
            this.importProjectIdToOrder = {};
            this.importProjectItems = [];
            this.importMyProjectId = null;
            this.importLibraryProjectId = null;
            this.importProjectId = null;
            this.importProject = null;

            // go back to the project view
            this.showProjectHome();

            /*
             * refresh the project assets in case any of the imported
             * steps also imported assets
             */
            this.ProjectAssetService.retrieveProjectAssets();
        });
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
        let selectedNodeIds = this.getSelectedItems();

        if (selectedNodeIds != null) {

            var confirmMessage = null;

            if (selectedNodeIds.length == 1) {
                // the user selected one item
                confirmMessage = 'Are you sure you want to delete the selected item?';
            } else if (selectedNodeIds.length > 1) {
                // the user selected multiple items
                confirmMessage = 'Are you sure you want to delete the ' + selectedNodeIds.length + ' selected items?';
            }

            if (confirmMessage != null) {
                // ask the user to confirm the delete
                var answer = confirm(confirmMessage);

                if (answer) {
                    // the user confirmed yes

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

        // uncheck all the checkboxes
        this.unselectAllItems();
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
     * Show the create group input
     */
    creatNewActivityClicked() {

        // clear the create group title
        this.createGroupTitle = '';

        // show the create group view
        this.toggleView('createGroup');

        if (this.showCreateGroup) {
            /*
             * we are showing the create node view so we will give focus to the
             * createGroupTitle input element
             */
            this.$timeout(() => {
                var createGroupTitleInput = document.getElementById('createGroupTitle');

                if (createGroupTitleInput != null) {
                    createGroupTitleInput.focus();
                }
            });
        }
    }

    /**
     * Toggle the create node input
     */
    createNewStepClicked() {

        // clear the create node title
        this.createNodeTitle = '';

        // show the create node view
        this.toggleView('createNode');

        if (this.showCreateNode) {
            /*
             * we are showing the create node view so we will give focus to the
             * createNodeTitle input element
             */
            this.$timeout(() => {
                var createNodeTitleInput = document.getElementById('createNodeTitle');

                if (createNodeTitleInput != null) {
                    createNodeTitleInput.focus();
                }
            });
        }
    }

    /**
     * Cancel the move mode
     */
    cancelMove() {
        this.insertGroupMode = false;
        this.insertNodeMode = false;

        // clear any new node that we might be inserting
        this.nodeToAdd = null;

        // turn off the modes
        this.createMode = false;
        this.moveMode = false;
        this.copyMode = false;
        this.importMode = false;

        // uncheck all the checkboxes
        this.unselectAllItems();
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
                        var confirmUpdateStartStep = this.$translate('confirmUpdateStartStep', { startStepTitle: firstChildTitle });

                        var answer = confirm(confirmUpdateStartStep);

                        if (answer) {
                            // change the project start node id
                            this.ProjectService.setStartNodeId(firstLeafNodeId);
                            resolve();
                        } else {
                            resolve();
                        }
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
     * Toggle the import view and load the project drop downs if necessary
     */
    importStepClicked() {

        // show the import step view
        this.toggleView('importStep');

        if (this.importMode) {
            if (this.myProjectsList == null) {
                // populate the authorable projects drop down
                this.myProjectsList = this.ConfigService.getAuthorableProjects();
            }

            if (this.libraryProjectsList == null) {
                // populate the library projects drop down
                this.ConfigService.getLibraryProjects().then((libraryProjectsList) => {
                    this.libraryProjectsList = libraryProjectsList;
                });
            }
        }
    }

    /**
     * The author has chosen an authorable project to import from
     * @param importProjectId the project id to import from
     */
    showMyImportProject(importProjectId) {

        // clear the select drop down for the library project
        this.importLibraryProjectId = null;

        // show the import project
        this.showImportProject(importProjectId);
    }

    /**
     * The author has chosen a library project to import from
     * @param importProjectId the project id to import from
     */
    showLibraryImportProject(importProjectId) {
        this.importMyProjectId = null;

        // show the import project
        this.showImportProject(importProjectId);
    }

    /**
     * Show the project we want to import steps from
     * @param importProjectId the import project id
     */
    showImportProject(importProjectId) {

        this.importProjectId = importProjectId;

        if (this.importProjectId == null) {
            // clear all the import project values
            this.importProjectIdToOrder = {};
            this.importProjectItems = [];
            this.importMyProjectId = null;
            this.importLibraryProjectId = null;
            this.importProjectId = null;
            this.importProject = null;
        } else {
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
     * Preview the import project
     */
    previewImportProject() {

        if (this.importProject != null) {
            // get the preview project url for the import project
            var previewProjectURL = this.importProject.previewProjectURL;

            // open the preview step in a new tab
            window.open(previewProjectURL);
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

        if (selectedNodes == null || selectedNodes.length == 0) {
            // the author did not select any steps to import
            alert('Please select a step to import.');
        } else {

            /*
             * hide the import view because we want to go back to the
             * project view so that the author can choose where to place
             * the new steps
             */
            this.showImportView = false;
            this.insertNodeMode = true;
            this.projectMode = true;
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

    /**
     * Show the view to edit the project rubric
     */
    editProjectRubricClicked() {

        // show the edit rubric view
        this.toggleView('rubric');
    }

    /**
     * Show the advanced view
     */
    advancedClicked() {

        // show the advanced authoring view
        this.toggleView('advanced');
    }

    /**
     * The show JSON button was clicked
     */
    showJSONClicked() {
        this.showJSONAuthoring = !this.showJSONAuthoring;

        if (this.showJSONAuthoring) {
            this.projectJSONString = angular.toJson(this.ProjectService.project, 4);
        }
    }

    /**
     * Save the project JSON string to the server
     */
    saveProjectJSONString() {
        // create the project object from the project JSON string
        let project = angular.fromJson(this.projectJSONString);
        this.ProjectService.setProject(project);

        // save and refresh the project
        this.checkPotentialStartNodeIdChangeThenSaveProject();
    }

    /**
     * The author has changed the rubric
     */
    summernoteRubricHTMLChanged() {

        // get the summernote rubric html
        var html = this.summernoteRubricHTML;

        /*
         * remove the absolute asset paths
         * e.g.
         * <img src='https://wise.berkeley.edu/curriculum/3/assets/sun.png'/>
         * will be changed to
         * <img src='sun.png'/>
         */
        html = this.ConfigService.removeAbsoluteAssetPaths(html);

        /*
         * replace <a> and <button> elements with <wiselink> elements when
         * applicable
         */
        html = this.UtilService.insertWISELinks(html);

        // update the project rubric
        this.ProjectService.setProjectRubric(html);

        this.ProjectService.saveProject();
    }

    /**
     * Check if the node is in any branch path
     * @param nodeId the node id of the node
     * @return whether the node is in any branch path
     */
    isNodeInAnyBranchPath(nodeId) {
        return this.ProjectService.isNodeInAnyBranchPath(nodeId);
    }

    /**
     * The project script file name changed
     */
    projectScriptFilenameChanged() {
        // update the project script file name in the project service
        this.ProjectService.setProjectScriptFilename(this.projectScriptFilename);

        if (this.showJSONAuthoring) {
            /*
             * we are showing the project JSON authoring so we need to update
             * the JSON string that we are showing in the textarea
             */
            this.projectJSONString = angular.toJson(this.ProjectService.project, 4);
        }

        // save the project
        this.ProjectService.saveProject();
    }

    /**
     * Show the asset popup to allow the author to choose an image for the
     * project script filename
     */
    chooseProjectScriptFilename() {
        // generate the parameters
        var params = {};
        params.popup = true;
        params.projectId = this.projectId;
        params.target = 'scriptFilename';

        // display the asset chooser
        this.$rootScope.$broadcast('openAssetChooser', params);
    }

    /**
     * Show the appropriate authoring view
     * @param view the view to show
     */
    toggleView(view) {

        // clear the input element for creating a new activity
        this.createGroupTitle = '';

        // clear the input element for creating a new step
        this.createNodeTitle = '';

        if (view == 'project') {
            // we are showing the regular project view
            this.showCreateGroup = false;
            this.showCreateNode = false;
            this.importMode = false;
            this.showImportView = false;
            this.editProjectRubricMode = false;
            this.advancedMode = false;
            this.showJSONAuthoring = false;
            this.projectMode = true;
        } else if (view == 'createGroup') {
            // toggle the create activity view
            this.showCreateGroup = !this.showCreateGroup;
            this.showCreateNode = false;
            this.importMode = false;
            this.showImportView = false;
            this.editProjectRubricMode = false;
            this.advancedMode = false;
            this.showJSONAuthoring = false;

            // also show the project view
            this.projectMode = true;
        } else if (view == 'createNode') {
            // toggle the create step view
            this.showCreateGroup = false;
            this.showCreateNode = !this.showCreateNode;
            this.importMode = false;
            this.showImportView = false;
            this.editProjectRubricMode = false;
            this.advancedMode = false;
            this.showJSONAuthoring = false;

            // also show the project view
            this.projectMode = true;
        } else if (view == 'importStep') {
            // toggle the import step view
            this.showCreateGroup = false;
            this.showCreateNode = false;
            this.importMode = !this.importMode;
            this.showImportView = !this.showImportView;
            this.editProjectRubricMode = false;
            this.advancedMode = false;
            this.showJSONAuthoring = false;

            // if the import view is shown, do not show the project view
            this.projectMode = !this.importMode;
        } else if (view == 'rubric') {
            // toggle the rubric view
            this.showCreateGroup = false;
            this.showCreateNode = false;
            this.importMode = false;
            this.showImportView = false;
            this.editProjectRubricMode = !this.editProjectRubricMode;
            this.advancedMode = false;
            this.showJSONAuthoring = false;

            // if the rubric view is shown, do not show the project view
            this.projectMode = !this.editProjectRubricMode;
        } else if (view == 'advanced') {
            // toggle the advanced view
            this.showCreateGroup = false;
            this.showCreateNode = false;
            this.importMode = false;
            this.showImportView = false;
            this.editProjectRubricMode = false;
            this.advancedMode = !this.advancedMode;
            this.showJSONAuthoring = false;

            // if the advanced view is shown, do not show the project view
            this.projectMode = !this.advancedMode;
        }
    }

    /**
     * The author has clicked the back button
     */
    backButtonClicked() {

        if (this.showImportView) {
            // we are in the import view so we will go back to the project view
            this.toggleView('project');
        } else if (this.editProjectRubricMode) {
            // we are in the edit rubric view so we will go back to the project view
            this.toggleView('project');
        } else if (this.advancedMode) {
            // we are in the advanced view so we will go back to the project view
            this.toggleView('project');
        } else {
            // we are in the project view so we will go back to the project list view
            this.$state.go('root.main');
        }
    }

    /**
     * Show the regular project view
     */
    projectHomeClicked() {
        // show the regular project view
        this.showProjectHome();
    }

    /**
     * Show the regular project view
     */
    showProjectHome() {
        // we are going to the project view so we will set the current node to null
        this.TeacherDataService.setCurrentNode(null);

        // show the regular project view
        this.toggleView('project');

        // scroll to the top of the page
        this.$anchorScroll('top');
    }

    /**
     * Creating a group was cancelled
     */
    cancelCreateGroupClicked() {
        // show the project regular project view
        this.toggleView('project');
    }

    /**
     * Creating a node was cancelled
     */
    cancelCreateNodeClicked() {
        // show the project regular project view
        this.toggleView('project');
    }

    /**
     * Temporarily highlight the new nodes
     * @param newNodes the new nodes to highlight
     */
    highlightNewNodes(newNodes) {

        this.$timeout(() => {

            if (newNodes != null) {

                // loop through all the new nodes
                for (let n = 0; n < newNodes.length; n++) {
                    let newNode = newNodes[n];

                    if (newNode != null) {

                        // get the node UI element
                        let nodeElement = $("#" + newNode.id);

                        // save the original background color
                        let originalBackgroundColor = nodeElement.css("backgroundColor");

                        // highlight the background briefly to draw attention to it
                        nodeElement.css("background-color", "#FFFF9C");

                        /*
                         * Use a timeout before starting to transition back to
                         * the original background color. For some reason the
                         * element won't get highlighted in the first place
                         * unless this timeout is used.
                         */
                        this.$timeout(() => {
                            // slowly fade back to original background color
                            nodeElement.css({
                                'transition': 'background-color 3s ease-in-out',
                                'background-color': originalBackgroundColor
                            });
                        });
                    }
                }
            }
        });
    }
}

ProjectController.$inject = [
    '$anchorScroll',
    '$filter',
    '$interval',
    '$mdDialog',
    '$q',
    '$rootScope',
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    'AuthorWebSocketService',
    'ConfigService',
    'ProjectAssetService',
    'ProjectService',
    'TeacherDataService',
    'UtilService'
];

export default ProjectController;
