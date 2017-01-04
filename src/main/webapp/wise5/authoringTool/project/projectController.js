'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProjectController = function () {
    function ProjectController($filter, $interval, $q, $scope, $state, $stateParams, AuthorWebSocketService, ConfigService, ProjectService, UtilService) {
        var _this = this;

        _classCallCheck(this, ProjectController);

        this.$filter = $filter;
        this.$interval = $interval;
        this.$q = $q;
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$translate = this.$filter('translate');
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
        this.currentAuthorsMessage = ""; // show a message when there is more than one author currently authoring this project

        // notify others that this project is being authored
        this.ProjectService.notifyAuthorProjectBegin(this.projectId);

        this.$scope.$on('currentAuthorsReceived', function (event, args) {
            var currentAuthorsUsernames = args.currentAuthorsUsernames;
            // get the user name of the signed in user
            var myUserName = _this.ConfigService.getMyUserName();
            // remove my username from the currentAuthors
            currentAuthorsUsernames.splice(currentAuthorsUsernames.indexOf(myUserName), 1);
            if (currentAuthorsUsernames.length > 0) {
                _this.currentAuthorsMessage = _this.$translate('concurrentAuthorsWarning', { currentAuthors: currentAuthorsUsernames.join(", ") });
            } else {
                _this.currentAuthorsMessage = "";
            }
        });

        this.$scope.$on("$destroy", function () {
            // notify others that this project is no longer being authored
            _this.ProjectService.notifyAuthorProjectEnd(_this.projectId);
        });
    }

    _createClass(ProjectController, [{
        key: 'updateProjectAsText',


        // updates projectAsText field, which is the string representation of the project that we'll show in the textarea
        value: function updateProjectAsText() {
            this.projectAsText = JSON.stringify(this.ProjectService.project, null, 4);
        }
    }, {
        key: 'previewProject',


        /**
         * Launch the project in preview mode
         */
        value: function previewProject() {
            var previewProjectURL = this.ConfigService.getConfigParam("previewProjectURL");
            window.open(previewProjectURL);
        }
    }, {
        key: 'previewProjectWithoutConstraints',


        /**
         * Launch the project in preview mode without constraints
         */
        value: function previewProjectWithoutConstraints() {
            var previewProjectURL = this.ConfigService.getConfigParam("previewProjectURL");
            previewProjectURL = previewProjectURL + '?constraints=false';
            window.open(previewProjectURL);
        }
    }, {
        key: 'viewProjectAssets',
        value: function viewProjectAssets() {
            this.$state.go('root.project.asset', { projectId: this.projectId });
        }
    }, {
        key: 'viewProjectHistory',
        value: function viewProjectHistory() {
            this.$state.go('root.project.history', { projectId: this.projectId });
        }
    }, {
        key: 'viewNotebookSettings',
        value: function viewNotebookSettings() {
            this.$state.go('root.project.notebook', { projectId: this.projectId });
        }
    }, {
        key: 'saveProject',
        value: function saveProject() {
            var _this2 = this;

            //let projectJSONString = JSON.stringify(this.project, null, 4);
            //let commitMessage = $("#commitMessageInput").val();
            var commitMessage = "Made changes to Project.";
            try {
                // if projectJSONString is bad json, it will throw an exception and not save.
                //this.ProjectService.project = this.project;

                this.ProjectService.saveProject(commitMessage).then(function (commitHistoryArray) {
                    _this2.commitHistory = commitHistoryArray;
                    $("#commitMessageInput").val(""); // clear field after commit
                });
            } catch (error) {
                alert("Invalid JSON. Please check syntax. Aborting save.");
                return;
            }
        }
    }, {
        key: 'closeProject',


        /**
         * Close authoring for the current project and bring user back to main AT page
         */
        value: function closeProject() {
            this.$state.go('root.main');
        }
    }, {
        key: 'getNodePositionById',


        /**
         * Get the node position
         * @param nodeId the node id
         * @returns the node position
         */
        value: function getNodePositionById(nodeId) {
            return this.ProjectService.getNodePositionById(nodeId);
        }
    }, {
        key: 'getComponentsByNodeId',


        /**
         * The the components in the specified node id.
         * @param nodeId the node id
         * @returns components in the node
         */
        value: function getComponentsByNodeId(nodeId) {
            return this.ProjectService.getComponentsByNodeId(nodeId);
        }

        /**
         * Returns a list of possible criteria for the specified node and component
         * @param nodeId the node id
         * @param componentId the component id in the node
         */

    }, {
        key: 'getPossibleTransitionCriteria',
        value: function getPossibleTransitionCriteria(nodeId, componentId) {
            return this.ProjectService.getPossibleTransitionCriteria(nodeId, componentId);
        }

        /**
         * Get the node title for a node
         * @param nodeId the node id
         * @returns the node title
         */

    }, {
        key: 'getNodeTitleByNodeId',
        value: function getNodeTitleByNodeId(nodeId) {
            return this.ProjectService.getNodeTitleByNodeId(nodeId);
        }
    }, {
        key: 'isGroupNode',


        /**
         * Check if a node id is for a group
         * @param nodeId
         * @returns whether the node is a group node
         */
        value: function isGroupNode(nodeId) {
            return this.ProjectService.isGroupNode(nodeId);
        }
    }, {
        key: 'nodeClicked',


        /**
         * A node was clicked so we will go to the node authoring view
         * @param nodeId
         */
        value: function nodeClicked(nodeId) {
            this.$state.go('root.project.node', { projectId: this.projectId, nodeId: nodeId });
        }
    }, {
        key: 'createGroup',


        /**
         * Create a new group (activity)
         */
        value: function createGroup() {

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

    }, {
        key: 'createNode',
        value: function createNode() {

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

    }, {
        key: 'insertInside',
        value: function insertInside(nodeId) {

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
                var _selectedNodeIds = this.getSelectedItems();

                // copy the nodes into the group
                this.ProjectService.copyNodesInside(_selectedNodeIds, nodeId);

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

    }, {
        key: 'insertAfter',
        value: function insertAfter(nodeId) {

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
                var _selectedNodeIds2 = this.getSelectedItems();

                // copy the nodes and put them after the node id
                this.ProjectService.copyNodesAfter(_selectedNodeIds2, nodeId);

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

    }, {
        key: 'copy',
        value: function copy() {

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

    }, {
        key: 'move',
        value: function move() {

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

    }, {
        key: 'delete',
        value: function _delete() {

            // get the selected items
            var selectedNodeIds = this.getSelectedItems();

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
        }

        /**
         * Get the selected items
         * @returns an array of node ids that are selected
         */

    }, {
        key: 'getSelectedItems',
        value: function getSelectedItems() {

            // an array to hold the node ids of the nodes that are selected
            var selectedNodeIds = [];

            // loop through all the node checkboxes
            angular.forEach(this.items, function (value, key) {
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

    }, {
        key: 'getSelectedItemTypes',
        value: function getSelectedItemTypes() {

            var selectedItemTypes = [];

            // loop through all the node checkboxes
            angular.forEach(this.items, function (value, key) {
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

    }, {
        key: 'unselectAllItems',
        value: function unselectAllItems() {
            angular.forEach(this.items, function (value, key) {
                value.checked = false;
            });
        }

        /**
         * Toggle the create group input
         */

    }, {
        key: 'toggleCreateGroup',
        value: function toggleCreateGroup() {
            this.hideCreateNode();
            this.showCreateGroup = !this.showCreateGroup;
            this.createGroupTitle = '';
        }

        /**
         * Hide the create group input
         */

    }, {
        key: 'hideCreateGroup',
        value: function hideCreateGroup() {
            this.showCreateGroup = false;
            this.createGroupTitle = '';
        }

        /**
         * Toggle the create node input
         */

    }, {
        key: 'toggleCreateNode',
        value: function toggleCreateNode() {
            this.hideCreateGroup();
            this.showCreateNode = !this.showCreateNode;
            this.createNodeTitle = '';
        }

        /**
         * Hide the create group input
         */

    }, {
        key: 'hideCreateNode',
        value: function hideCreateNode() {
            this.showCreateNode = false;
            this.createNodeTitle = '';
        }

        /**
         * Cancel the move mode
         */

    }, {
        key: 'cancelMove',
        value: function cancelMove() {
            this.insertGroupMode = false;
            this.insertNodeMode = false;
        }

        /**
         * Update the start node id by traversing start ids until a
         * node id is found.
         */

    }, {
        key: 'updateStartNodeId',
        value: function updateStartNodeId() {

            var newStartNodeId = null;

            // get the start group id
            var startGroupId = this.ProjectService.getStartGroupId();
            var node = this.ProjectService.getNodeById(startGroupId);

            var done = false;

            // recursively traverse the start ids
            while (!done) {

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

    }, {
        key: 'checkPotentialStartNodeIdChange',
        value: function checkPotentialStartNodeIdChange() {
            var _this3 = this;

            return this.$q(function (resolve, reject) {
                // get the current start node id
                var currentStartNodeId = _this3.ProjectService.getStartNodeId();

                // get the first leaf node id
                var firstLeafNodeId = _this3.ProjectService.getFirstLeafNodeId();

                if (firstLeafNodeId == null) {
                    // there are no steps in the project

                    // set the start node id to empty string
                    _this3.ProjectService.setStartNodeId('');

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
                        var firstLeafNode = _this3.ProjectService.getNodeById(firstLeafNodeId);

                        if (firstLeafNode != null) {
                            var firstChildTitle = firstLeafNode.title;

                            // ask the user if they would like to change the start step to the step that is now the first child in the group
                            var confirmUpdateStartStep = _this3.$translate('confirmUpdateStartStep', { startStepTitle: firstChildTitle });

                            var answer = confirm(confirmUpdateStartStep);

                            if (answer) {
                                // change the project start node id
                                _this3.ProjectService.setStartNodeId(firstLeafNodeId);
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

    }, {
        key: 'checkPotentialStartNodeIdChangeThenSaveProject',
        value: function checkPotentialStartNodeIdChangeThenSaveProject() {
            var _this4 = this;

            // check if the project start node id should be changed
            this.checkPotentialStartNodeIdChange().then(function () {
                // save the project
                _this4.ProjectService.saveProject();

                // refresh the project
                _this4.ProjectService.parseProject();
                _this4.items = _this4.ProjectService.idToOrder;

                _this4.unselectAllItems();
            });
        }

        /**
         * The project title changed so we will update the project title in the 
         * project service
         */

    }, {
        key: 'projectTitleChanged',
        value: function projectTitleChanged() {

            // update the project title in the project service
            this.ProjectService.setProjectTitle(this.projectTitle);

            // save the project
            this.ProjectService.saveProject();
        }

        /**
         * Toggle the import view and load the project drop downs if necessary
         */

    }, {
        key: 'toggleImportView',
        value: function toggleImportView() {
            this.importMode = !this.importMode;

            if (this.authorableProjectsList == null) {
                // populate the authorable projects drop down
                this.getAuthorableProjects();
            }

            if (this.libraryProjectsList == null) {
                // populate the library projects drop down
                this.getLibraryProjects();
            }
        }

        /**
         * Get all the authorable projects
         */

    }, {
        key: 'getAuthorableProjects',
        value: function getAuthorableProjects() {
            this.authorableProjectsList = this.ConfigService.getConfigParam('projects');
        }

        /**
         * Get all the library projects
         */

    }, {
        key: 'getLibraryProjects',
        value: function getLibraryProjects() {
            var _this5 = this;

            this.ConfigService.getLibraryProjects().then(function (libraryProjectsList) {
                _this5.libraryProjectsList = libraryProjectsList;
            });
        }

        /**
         * The author has chosen an authorable project to import from
         * @param importProjectId the project id to import from
         */

    }, {
        key: 'showAuthorableImportProject',
        value: function showAuthorableImportProject(importProjectId) {

            // clear the select drop down for the library project
            this.importLibraryProjectId = null;

            // show the import project
            this.showImportProject(importProjectId);
        }

        /**
         * The author has chosen a library project to import from
         * @param importProjectId the project id to import from
         */

    }, {
        key: 'showLibraryImportProject',
        value: function showLibraryImportProject(importProjectId) {
            this.importAuthorableProjectId = null;

            // show the import project
            this.showImportProject(importProjectId);
        }

        /**
         * Show the project we want to import steps from
         * @param importProjectId the import project id
         */

    }, {
        key: 'showImportProject',
        value: function showImportProject(importProjectId) {
            var _this6 = this;

            this.importProjectId = importProjectId;

            if (this.importProjectId == null) {
                // clear all the import project values
                this.importProjectIdToOrder = {};
                this.importProjectItems = [];
                this.importAuthorableProjectId = null;
                this.importLibraryProjectId = null;
                this.importProjectId = null;
                this.importProject = null;
            } else {
                // get the import project
                this.ProjectService.retrieveProjectById(this.importProjectId).then(function (projectJSON) {

                    // create the mapping of node id to order for the import project
                    _this6.importProjectIdToOrder = {};
                    _this6.importProject = projectJSON;

                    // calculate the node order of the import project
                    var result = _this6.ProjectService.getNodeOrderOfProject(_this6.importProject);
                    _this6.importProjectIdToOrder = result.idToOrder;
                    _this6.importProjectItems = result.nodes;
                });
            }
        }

        /**
         * Preview the import project
         */

    }, {
        key: 'previewImportProject',
        value: function previewImportProject() {

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

    }, {
        key: 'previewImportNode',
        value: function previewImportNode(node) {

            if (node != null) {

                // get the node id
                var nodeId = node.id;

                // get the preview project url for the import project
                var previewProjectURL = this.importProject.previewProjectURL;

                // create the url to preview the step
                var previewStepURL = previewProjectURL + "#/vle/" + nodeId;

                // open the preview step in a new tab
                window.open(previewStepURL);
            }
        }

        /**
         * Import the selected steps
         */

    }, {
        key: 'importSteps',
        value: function importSteps() {
            var _this7 = this;

            // get the nodes that were selected
            var selectedNodes = this.getSelectedNodesToImport();

            if (selectedNodes == null || selectedNodes.length == 0) {
                // the author did not select any steps to import
                alert('Please select a step to import.');
            } else {
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

                var message = '';

                if (selectedNodes.length == 1) {
                    // one step is being imported
                    message = 'Are you sure you want to import this step?\n\n' + selectedNodeTitles + '\n\nThe imported step will be placed in the Inactive Steps section.';
                } else {
                    // multiple steps are being imported
                    message = 'Are you sure you want to import these steps?\n\n' + selectedNodeTitles + '\n\nThe imported steps will be placed in the Inactive Steps section.';
                }

                // ask the author if they are sure they want to import these steps
                var answer = confirm(message);

                if (answer) {
                    // the author answered yes to import

                    // get the project id we are importing into
                    var toProjectId = this.ConfigService.getConfigParam('projectId');

                    // get the project id we are importing from
                    var fromProjectId = this.importProjectId;

                    // copy the nodes into the project
                    this.ProjectService.copyNodes(selectedNodes, fromProjectId, toProjectId, this.importProjectIdToOrder).then(function () {

                        // save the project
                        _this7.ProjectService.saveProject();

                        // refresh the project
                        _this7.ProjectService.parseProject();
                        _this7.items = _this7.ProjectService.idToOrder;

                        // turn off import mode
                        _this7.importMode = false;

                        // clear the import fields
                        _this7.importProjectIdToOrder = {};
                        _this7.importProjectItems = [];
                        _this7.importAuthorableProjectId = null;
                        _this7.importLibraryProjectId = null;
                        _this7.importProjectId = null;
                        _this7.importProject = null;
                    });
                }
            }
        }

        /**
         * Get the selected nodes to import
         * @return an array of selected nodes
         */

    }, {
        key: 'getSelectedNodesToImport',
        value: function getSelectedNodesToImport() {
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
    }]);

    return ProjectController;
}();

ProjectController.$inject = ['$filter', '$interval', '$q', '$scope', '$state', '$stateParams', 'AuthorWebSocketService', 'ConfigService', 'ProjectService', 'UtilService'];

exports.default = ProjectController;
//# sourceMappingURL=projectController.js.map