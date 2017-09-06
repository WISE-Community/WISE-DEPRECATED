'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProjectController = function () {
    function ProjectController($anchorScroll, $filter, $interval, $mdDialog, $q, $rootScope, $scope, $state, $stateParams, $timeout, AuthorWebSocketService, ConfigService, ProjectAssetService, ProjectService, TeacherDataService, UtilService) {
        var _this = this;

        _classCallCheck(this, ProjectController);

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
        this.currentAuthorsMessage = ""; // show a message when there is more than one author currently authoring this project

        this.projectMode = true;
        this.showCreateGroup = false;
        this.showCreateNode = false;
        this.showImportView = false;
        this.importMode = false;
        this.editProjectRubricMode = false;
        this.advancedMode = false;
        this.showJSONAuthoring = false;

        /*
         * The colors for the branch path steps. The colors are from
         * http://colorbrewer2.org/
         * http://colorbrewer2.org/export/colorbrewer.js
         * The colors chosen are from the "qualitative", "Set2".
         */
        this.stepBackgroundColors = ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494", "#b3b3b3"];

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
            toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['fontsize', ['fontsize']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertAssetButton']]],
            height: 300,
            disableDragAndDrop: true,
            buttons: {
                insertAssetButton: InsertAssetButton
            }
        };

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

        /*
         * Listen for the assetSelected event which occurs when the user
         * selects an asset from the choose asset popup
         */
        this.$scope.$on('assetSelected', function (event, args) {

            if (args != null) {

                // make sure the event was fired for this component
                if (args.projectId == _this.projectId) {
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
                            var assetsDirectoryPath = _this.ConfigService.getProjectAssetsDirectoryPath();
                            var fullAssetPath = assetsDirectoryPath + '/' + fileName;

                            var summernoteId = '';

                            if (args.target == 'rubric') {
                                // the target is the summernote rubric element
                                summernoteId = 'summernoteRubric_' + _this.projectId;

                                if (summernoteId != '') {
                                    if (_this.UtilService.isImage(fileName)) {
                                        /*
                                         * move the cursor back to its position when the asset chooser
                                         * popup was clicked
                                         */
                                        $('#' + summernoteId).summernote('editor.restoreRange');
                                        $('#' + summernoteId).summernote('editor.focus');

                                        // add the image html
                                        $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
                                    } else if (_this.UtilService.isVideo(fileName)) {
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
                                _this.projectScriptFilename = fileName;
                                _this.projectScriptFilenameChanged();
                            }
                        }
                    }
                }
            }

            // close the popup
            _this.$mdDialog.hide();
        });

        this.$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

            if (toState != null) {
                var stateName = toState.name;

                if (stateName == 'root.project') {
                    // save the project opened event to the server
                    _this.saveEvent('projectHomeViewOpened', 'Navigation');
                } else if (stateName == 'root.project.node') {} else if (stateName == 'root.project.asset') {
                    // save the assets viewed event to the server
                    _this.saveEvent('assetsViewOpened', 'Navigation');
                } else if (stateName == 'root.project.info') {
                    // save the project info viewed event to the server
                    _this.saveEvent('projectInfoViewOpened', 'Navigation');
                } else if (stateName == 'root.project.notebook') {
                    // save the notebook viewed event to the server
                    _this.saveEvent('notebookViewOpened', 'Navigation');
                }
            }
        });

        this.$rootScope.$on('projectSaved', function () {
            // save the project saved event to the server
            _this.saveEvent('projectSaved', 'Authoring');
        });

        // save the project opened event to the server
        this.saveEvent('projectOpened', 'Navigation');
    }

    _createClass(ProjectController, [{
        key: 'previewProject',


        /**
         * Launch the project in preview mode
         */
        value: function previewProject() {

            var data = {};
            data.constraints = true;

            // save the project previewed event to the server
            this.saveEvent('projectPreviewed', 'Navigation', data);

            var previewProjectURL = this.ConfigService.getConfigParam("previewProjectURL");
            window.open(previewProjectURL);
        }
    }, {
        key: 'previewProjectWithoutConstraints',


        /**
         * Launch the project in preview mode without constraints
         */
        value: function previewProjectWithoutConstraints() {

            var data = {};
            data.constraints = false;

            // save the project previewed event to the server
            this.saveEvent('projectPreviewed', 'Navigation', data);

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
        key: 'downloadProject',


        /**
         * Download this project as a zip file
         */
        value: function downloadProject() {
            // make a request to download the project as a zip file
            var exportProjectURL = this.ConfigService.getWISEBaseURL() + "/project/export/" + this.projectId;
            window.location.href = exportProjectURL;
        }

        /**
         * Close authoring for the current project and bring user back to main AT page
         */

    }, {
        key: 'closeProject',
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
            this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
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
            var _this3 = this;

            // TODO check that we are inserting into a group

            if (this.createMode) {
                // we are in create mode

                // create the node inside the group
                this.ProjectService.createNodeInside(this.nodeToAdd, nodeId);

                var newNodes = [this.nodeToAdd];

                // remember the new node
                var newNode = this.nodeToAdd;

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
                this.checkPotentialStartNodeIdChangeThenSaveProject().then(function () {
                    if (newNode != null) {

                        var data = {};
                        data.nodeId = newNode.id;
                        data.title = _this3.ProjectService.getNodePositionAndTitleByNodeId(newNode.id);

                        if (_this3.ProjectService.isGroupNode(newNode.id)) {
                            // save the activity created event to the server
                            _this3.saveEvent('activityCreated', 'Authoring', data);
                        } else {
                            // save the step created event to the server
                            _this3.saveEvent('stepCreated', 'Authoring', data);
                        }
                    }
                });
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
                    // perform the move

                    /*
                     * an array of nodes that will be saved in the data for the move
                     * event
                     */
                    var nodes = [];

                    // loop through all the selected node ids
                    for (var n = 0; n < selectedNodeIds.length; n++) {
                        var selectedNodeId = selectedNodeIds[n];

                        // create an object that contains the id and title
                        var node = {};
                        node.nodeId = selectedNodeId;
                        node.fromTitle = this.ProjectService.getNodePositionAndTitleByNodeId(selectedNodeId);

                        nodes.push(node);
                    }

                    // move the nodes into the group
                    var _newNodes = this.ProjectService.moveNodesInside(selectedNodeIds, nodeId);

                    // turn off move mode
                    this.moveMode = false;

                    // turn off insert mode
                    this.insertGroupMode = false;
                    this.insertNodeMode = false;

                    // temporarily highlight the new nodes
                    this.highlightNewNodes(_newNodes);

                    // save and refresh the project
                    this.checkPotentialStartNodeIdChangeThenSaveProject().then(function () {
                        if (_newNodes != null && _newNodes.length > 0) {
                            var firstNewNode = _newNodes[0];

                            if (firstNewNode != null && firstNewNode.id != null) {

                                // loop through all the nodes that will be saved in the event data
                                for (var _n = 0; _n < nodes.length; _n++) {
                                    var _node = nodes[_n];

                                    // get the new node object
                                    var _newNode = _newNodes[_n];

                                    if (_node != null && _newNode != null) {

                                        // set the new title
                                        _node.toTitle = _this3.ProjectService.getNodePositionAndTitleByNodeId(_newNode.id);
                                    }
                                }

                                if (_this3.ProjectService.isGroupNode(firstNewNode.id)) {
                                    var data = {};
                                    data.activitiesMoved = nodes;

                                    // save the activity moved event to the server
                                    _this3.saveEvent('activityMoved', 'Authoring', data);
                                } else {
                                    var _data = {};
                                    _data.stepsMoved = nodes;

                                    // save the step moved event to the server
                                    _this3.saveEvent('stepMoved', 'Authoring', _data);
                                }
                            }
                        }
                    });
                }
            } else if (this.copyMode) {
                // We are in copy mode

                // get the nodes that were selected
                var _selectedNodeIds = this.getSelectedItems();

                /*
                 * an array of nodes that will be saved in the data for the move
                 * event
                 */
                var _nodes = [];

                // loop through the selected node ids
                for (var _n2 = 0; _n2 < _selectedNodeIds.length; _n2++) {
                    var _selectedNodeId = _selectedNodeIds[_n2];

                    // create an object that contains the id and title
                    var _node2 = {};
                    _node2.fromNodeId = _selectedNodeId;
                    _node2.fromTitle = this.ProjectService.getNodePositionAndTitleByNodeId(_selectedNodeId);

                    _nodes.push(_node2);
                }

                // copy the nodes into the group
                var _newNodes2 = this.ProjectService.copyNodesInside(_selectedNodeIds, nodeId);

                // turn off copy mode
                this.copyMode = false;

                // turn off insert mode
                this.insertGroupMode = false;
                this.insertNodeMode = false;

                // temporarily highlight the new nodes
                this.highlightNewNodes(_newNodes2);

                // save and refresh the project
                this.checkPotentialStartNodeIdChangeThenSaveProject().then(function () {
                    if (_newNodes2 != null && _newNodes2.length > 0) {
                        var firstNewNode = _newNodes2[0];

                        if (firstNewNode != null && firstNewNode.id != null) {

                            // loop through all the nodes that will be saved in the event data
                            for (var _n3 = 0; _n3 < _nodes.length; _n3++) {
                                var _node3 = _nodes[_n3];
                                var _newNode2 = _newNodes2[_n3];

                                if (_node3 != null && _newNode2 != null) {

                                    // set the new id
                                    _node3.toNodeId = _newNode2.id;

                                    // set the new title
                                    _node3.toTitle = _this3.ProjectService.getNodePositionAndTitleByNodeId(_newNode2.id);
                                }
                            }

                            if (_this3.ProjectService.isGroupNode(firstNewNode.id)) {
                                var data = {};
                                data.activitiesCopied = _nodes;

                                // save the activity moved event to the server
                                _this3.saveEvent('activityCopied', 'Authoring', data);
                            } else {
                                var _data2 = {};
                                _data2.stepsCopied = _nodes;

                                // save the step moved event to the server
                                _this3.saveEvent('stepCopied', 'Authoring', _data2);
                            }
                        }
                    }
                });
            } else if (this.importMode) {
                // we are in import mode

                // import the selected nodes
                this.importSelectedNodes(nodeId);
            }
        }

        /**
         * Insert the node(s) after
         * @param nodeId the node id of the node we will insert after
         */

    }, {
        key: 'insertAfter',
        value: function insertAfter(nodeId) {
            var _this4 = this;

            if (this.createMode) {
                // we are in create mode

                // create the node after the node id
                this.ProjectService.createNodeAfter(this.nodeToAdd, nodeId);

                var newNodes = [this.nodeToAdd];

                var newNode = this.nodeToAdd;

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
                this.checkPotentialStartNodeIdChangeThenSaveProject().then(function () {
                    if (newNode != null) {

                        var data = {};
                        data.nodeId = newNode.id;
                        data.title = _this4.ProjectService.getNodePositionAndTitleByNodeId(newNode.id);

                        if (_this4.ProjectService.isGroupNode(newNode.id)) {
                            // save the activity created event to the server
                            _this4.saveEvent('activityCreated', 'Authoring', data);
                        } else {
                            // save the step created event to the server
                            _this4.saveEvent('stepCreated', 'Authoring', data);
                        }
                    }
                });
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
                        alert(this.$translate('youAreNotAllowedToInsertTheSelectedItemAfterItself'));
                    } else if (selectedNodeIds.length > 1) {
                        alert(this.$translate('youAreNotAllowedToInsertTheSelectedItemsAfterItself'));
                    }
                } else {
                    // perform the move

                    /*
                     * an array of nodes that will be saved in the data for the move
                     * event
                     */
                    var nodes = [];

                    // loop through all the selected node ids
                    for (var n = 0; n < selectedNodeIds.length; n++) {
                        var selectedNodeId = selectedNodeIds[n];

                        // create an object that contains the id and title
                        var node = {};
                        node.nodeId = selectedNodeId;
                        node.fromTitle = this.ProjectService.getNodePositionAndTitleByNodeId(selectedNodeId);

                        nodes.push(node);
                    }

                    // move the nodes after the node id
                    var _newNodes3 = this.ProjectService.moveNodesAfter(selectedNodeIds, nodeId);

                    // turn off move mode
                    this.moveMode = false;

                    // turn off insert mode
                    this.insertGroupMode = false;
                    this.insertNodeMode = false;

                    // temporarily highlight the new nodes
                    this.highlightNewNodes(_newNodes3);

                    // save and refresh the project
                    this.checkPotentialStartNodeIdChangeThenSaveProject().then(function () {
                        if (_newNodes3 != null && _newNodes3.length > 0) {
                            var firstNewNode = _newNodes3[0];

                            if (firstNewNode != null && firstNewNode.id != null) {

                                // loop through all the nodes that will be saved in the event data
                                for (var _n4 = 0; _n4 < nodes.length; _n4++) {
                                    var _node4 = nodes[_n4];

                                    // get the new node object
                                    var _newNode3 = _newNodes3[_n4];

                                    if (_node4 != null && _newNode3 != null) {

                                        // set the new title
                                        _node4.toTitle = _this4.ProjectService.getNodePositionAndTitleByNodeId(_newNode3.id);
                                    }
                                }

                                if (_this4.ProjectService.isGroupNode(firstNewNode.id)) {
                                    var data = {};
                                    data.activitesMoved = nodes;

                                    // save the activity moved event to the server
                                    _this4.saveEvent('activityMoved', 'Authoring', data);
                                } else {
                                    var _data3 = {};
                                    _data3.stepsMoved = nodes;

                                    // save the step moved event to the server
                                    _this4.saveEvent('stepMoved', 'Authoring', _data3);
                                }
                            }
                        }
                    });
                }
            } else if (this.copyMode) {
                // We are in copy mode

                // get the selected nodes
                var _selectedNodeIds2 = this.getSelectedItems();

                /*
                 * an array of nodes that will be saved in the data for the move
                 * event
                 */
                var _nodes2 = [];

                // loop through the selected node ids
                for (var _n5 = 0; _n5 < _selectedNodeIds2.length; _n5++) {
                    var _selectedNodeId2 = _selectedNodeIds2[_n5];

                    // create an object that contains the id and title
                    var _node5 = {};
                    _node5.fromNodeId = _selectedNodeId2;
                    _node5.fromTitle = this.ProjectService.getNodePositionAndTitleByNodeId(_selectedNodeId2);

                    _nodes2.push(_node5);
                }

                // copy the nodes and put them after the node id
                var _newNodes4 = this.ProjectService.copyNodesAfter(_selectedNodeIds2, nodeId);

                // turn off copy mode
                this.copyMode = false;

                // turn off insert mode
                this.insertGroupMode = false;
                this.insertNodeMode = false;

                // temporarily highlight the new nodes
                this.highlightNewNodes(_newNodes4);

                // save and refresh the project
                this.checkPotentialStartNodeIdChangeThenSaveProject().then(function () {
                    if (_newNodes4 != null && _newNodes4.length > 0) {
                        var firstNewNode = _newNodes4[0];

                        if (firstNewNode != null && firstNewNode.id != null) {

                            // loop through all the nodes that will be saved in the event data
                            for (var _n6 = 0; _n6 < _nodes2.length; _n6++) {
                                var _node6 = _nodes2[_n6];
                                var _newNode4 = _newNodes4[_n6];

                                if (_node6 != null && _newNode4 != null) {

                                    // set the new id
                                    _node6.toNodeId = _newNode4.id;

                                    // set the new title
                                    _node6.toTitle = _this4.ProjectService.getNodePositionAndTitleByNodeId(_newNode4.id);
                                }
                            }

                            if (_this4.ProjectService.isGroupNode(firstNewNode.id)) {

                                var data = {};
                                data.activitiesCopied = _nodes2;

                                // save the activity moved event to the server
                                _this4.saveEvent('activityCopied', 'Authoring', data);
                            } else {

                                var _data4 = {};
                                _data4.stepsCopied = _nodes2;

                                // save the step moved event to the server
                                _this4.saveEvent('stepCopied', 'Authoring', _data4);
                            }
                        }
                    }
                });
            } else if (this.importMode) {
                // we are in import mode

                // import the selected nodes
                this.importSelectedNodes(nodeId);
            }
        }

        /**
         * Import the step and then create a stepImported event
         * @param nodeIdToInsertInsideOrAfter If this is a group, we will make the
         * new step the first step in the group. If this is a step, we will place
         * the new step after it.
         */

    }, {
        key: 'importSelectedNodes',
        value: function importSelectedNodes(nodeIdToInsertInsideOrAfter) {
            var _this5 = this;

            // get the selected nodes
            var selectedNodes = this.getSelectedNodesToImport();

            // get the node titles that we are importing
            var selectedNodeTitles = this.getSelectedNodeTitlesToImport();

            // get the project id we are importing into
            var toProjectId = this.ConfigService.getConfigParam('projectId');

            // get the project id we are importing from
            var fromProjectId = this.importProjectId;

            // import the selected nodes and place them after the given group
            this.performImport(nodeIdToInsertInsideOrAfter).then(function (newNodes) {
                // save and refresh the project
                _this5.checkPotentialStartNodeIdChangeThenSaveProject().then(function () {

                    // the data for the step imported event
                    var data = {};
                    data.stepsImported = [];

                    // loop through all the steps that were imported
                    for (var n = 0; n < selectedNodes.length; n++) {
                        var selectedNode = selectedNodes[n];

                        // get the old step title
                        var selectedNodeTitle = selectedNodeTitles[n];

                        var newNode = newNodes[n];

                        // set the from and to ids and titles
                        var tempNode = {};
                        tempNode.fromProjectId = parseInt(fromProjectId);
                        tempNode.fromNodeId = selectedNode.id;
                        tempNode.fromTitle = selectedNodeTitle;
                        tempNode.toNodeId = newNode.id;
                        tempNode.toTitle = _this5.ProjectService.getNodePositionAndTitleByNodeId(newNode.id);

                        data.stepsImported.push(tempNode);
                    }

                    // save the step imported event to the server
                    _this5.saveEvent('stepImported', 'Authoring', data);
                });
            });
        }

        /**
         * Import the step and place it in the chosen location
         * @param nodeIdToInsertInsideOrAfter If this is a group, we will make the
         * new step the first step in the group. If this is a step, we will place
         * the new step after it.
         */

    }, {
        key: 'performImport',
        value: function performImport(nodeIdToInsertInsideOrAfter) {
            var _this6 = this;

            var selectedNodes = this.getSelectedNodesToImport();

            // get the project id we are importing into
            var toProjectId = this.ConfigService.getConfigParam('projectId');

            // get the project id we are importing from
            var fromProjectId = this.importProjectId;

            // copy the nodes into the project
            return this.ProjectService.copyNodes(selectedNodes, fromProjectId, toProjectId, nodeIdToInsertInsideOrAfter).then(function (newNodes) {

                // save the project
                //this.ProjectService.saveProject();

                // refresh the project
                _this6.ProjectService.parseProject();
                _this6.items = _this6.ProjectService.idToOrder;

                // turn off the insert node mode
                _this6.insertNodeMode = false;

                // go back to the project view
                _this6.toggleView('project');

                // clear the import fields
                _this6.importProjectIdToOrder = {};
                _this6.importProjectItems = [];
                _this6.importMyProjectId = null;
                _this6.importLibraryProjectId = null;
                _this6.importProjectId = null;
                _this6.importProject = null;

                // go back to the project view
                _this6.showProjectHome();

                /*
                 * refresh the project assets in case any of the imported
                 * steps also imported assets
                 */
                _this6.ProjectAssetService.retrieveProjectAssets();

                return newNodes;
            });
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

                        var activityDeleted = false;
                        var stepDeleted = false;

                        var stepsDeleted = [];
                        var activitiesDeleted = [];

                        // loop through each node id
                        for (var n = 0; n < selectedNodeIds.length; n++) {
                            var nodeId = selectedNodeIds[n];

                            var node = this.ProjectService.getNodeById(nodeId);

                            var tempNode = {};

                            if (node != null) {
                                tempNode.nodeId = node.id;
                                tempNode.title = this.ProjectService.getNodePositionAndTitleByNodeId(node.id);
                            }

                            if (this.ProjectService.isStartNodeId(nodeId)) {
                                // we have deleted the start node id
                                deletedStartNodeId = true;
                            }

                            if (this.ProjectService.isGroupNode(nodeId)) {
                                // we are deleting an activity
                                activityDeleted = true;

                                var stepsInActivityDeleted = [];

                                // loop through all the steps in the activity
                                for (var s = 0; s < node.ids.length; s++) {
                                    var stepNodeId = node.ids[s];

                                    // get the step title
                                    var stepTitle = this.ProjectService.getNodePositionAndTitleByNodeId(stepNodeId);

                                    // create an object with the step id and title
                                    var stepObject = {};
                                    stepObject.nodeId = stepNodeId;
                                    stepObject.title = stepTitle;

                                    stepsInActivityDeleted.push(stepObject);
                                }

                                tempNode.stepsInActivityDeleted = stepsInActivityDeleted;

                                activitiesDeleted.push(tempNode);
                            } else {
                                // we are deleting a step
                                stepDeleted = true;

                                stepsDeleted.push(tempNode);
                            }

                            // delete the node
                            this.ProjectService.deleteNode(nodeId);
                        }

                        // update start node id if necesary
                        if (deletedStartNodeId) {
                            this.updateStartNodeId();
                        }

                        if (activityDeleted) {
                            var data = {};
                            data.activitiesDeleted = activitiesDeleted;
                            this.saveEvent('activityDeleted', 'Authoring', data);
                        }

                        if (stepDeleted) {
                            var data = {};
                            data.stepsDeleted = stepsDeleted;
                            this.saveEvent('stepDeleted', 'Authoring', data);
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
         * Show the create group input
         */

    }, {
        key: 'creatNewActivityClicked',
        value: function creatNewActivityClicked() {

            // clear the create group title
            this.createGroupTitle = '';

            // show the create group view
            this.toggleView('createGroup');

            if (this.showCreateGroup) {
                /*
                 * we are showing the create node view so we will give focus to the
                 * createGroupTitle input element
                 */
                this.$timeout(function () {
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

    }, {
        key: 'createNewStepClicked',
        value: function createNewStepClicked() {

            // clear the create node title
            this.createNodeTitle = '';

            // show the create node view
            this.toggleView('createNode');

            if (this.showCreateNode) {
                /*
                 * we are showing the create node view so we will give focus to the
                 * createNodeTitle input element
                 */
                this.$timeout(function () {
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

    }, {
        key: 'cancelMove',
        value: function cancelMove() {
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
            var _this7 = this;

            return this.$q(function (resolve, reject) {
                // get the current start node id
                var currentStartNodeId = _this7.ProjectService.getStartNodeId();

                // get the first leaf node id
                var firstLeafNodeId = _this7.ProjectService.getFirstLeafNodeId();

                if (firstLeafNodeId == null) {
                    // there are no steps in the project

                    // set the start node id to empty string
                    _this7.ProjectService.setStartNodeId('');

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
                        var firstLeafNode = _this7.ProjectService.getNodeById(firstLeafNodeId);

                        if (firstLeafNode != null) {
                            var firstChildTitle = firstLeafNode.title;

                            // ask the user if they would like to change the start step to the step that is now the first child in the group
                            var confirmUpdateStartStep = _this7.$translate('confirmUpdateStartStep', { startStepTitle: firstChildTitle });

                            var answer = confirm(confirmUpdateStartStep);

                            if (answer) {
                                // change the project start node id
                                _this7.ProjectService.setStartNodeId(firstLeafNodeId);
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
            var _this8 = this;

            // check if the project start node id should be changed
            return this.checkPotentialStartNodeIdChange().then(function () {
                // save the project
                _this8.ProjectService.saveProject();

                // refresh the project
                _this8.ProjectService.parseProject();
                _this8.items = _this8.ProjectService.idToOrder;

                _this8.unselectAllItems();
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
        key: 'importStepClicked',
        value: function importStepClicked() {
            var _this9 = this;

            // show the import step view
            this.toggleView('importStep');

            if (this.importMode) {
                if (this.myProjectsList == null) {
                    // populate the authorable projects drop down
                    this.myProjectsList = this.ConfigService.getAuthorableProjects();
                }

                if (this.libraryProjectsList == null) {
                    // populate the library projects drop down
                    this.ConfigService.getLibraryProjects().then(function (libraryProjectsList) {
                        _this9.libraryProjectsList = libraryProjectsList;
                    });
                }
            }
        }

        /**
         * The author has chosen an authorable project to import from
         * @param importProjectId the project id to import from
         */

    }, {
        key: 'showMyImportProject',
        value: function showMyImportProject(importProjectId) {

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
            this.importMyProjectId = null;

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
            var _this10 = this;

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
                this.ProjectService.retrieveProjectById(this.importProjectId).then(function (projectJSON) {

                    // create the mapping of node id to order for the import project
                    _this10.importProjectIdToOrder = {};
                    _this10.importProject = projectJSON;

                    // calculate the node order of the import project
                    var result = _this10.ProjectService.getNodeOrderOfProject(_this10.importProject);
                    _this10.importProjectIdToOrder = result.idToOrder;
                    _this10.importProjectItems = result.nodes;
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

        /**
         * Show the view to edit the project rubric
         */

    }, {
        key: 'editProjectRubricClicked',
        value: function editProjectRubricClicked() {

            // show the edit rubric view
            this.toggleView('rubric');
        }

        /**
         * Show the advanced view
         */

    }, {
        key: 'advancedClicked',
        value: function advancedClicked() {

            // show the advanced authoring view
            this.toggleView('advanced');
        }

        /**
         * The show JSON button was clicked
         */

    }, {
        key: 'showJSONClicked',
        value: function showJSONClicked() {
            this.showJSONAuthoring = !this.showJSONAuthoring;

            if (this.showJSONAuthoring) {
                this.projectJSONString = angular.toJson(this.ProjectService.project, 4);
            }
        }

        /**
         * Save the project JSON string to the server
         */

    }, {
        key: 'saveProjectJSONString',
        value: function saveProjectJSONString() {
            // create the project object from the project JSON string
            var project = angular.fromJson(this.projectJSONString);
            this.ProjectService.setProject(project);

            // save and refresh the project
            this.checkPotentialStartNodeIdChangeThenSaveProject();
        }

        /**
         * The author has changed the rubric
         */

    }, {
        key: 'summernoteRubricHTMLChanged',
        value: function summernoteRubricHTMLChanged() {

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

    }, {
        key: 'isNodeInAnyBranchPath',
        value: function isNodeInAnyBranchPath(nodeId) {
            return this.ProjectService.isNodeInAnyBranchPath(nodeId);
        }

        /**
         * The project script file name changed
         */

    }, {
        key: 'projectScriptFilenameChanged',
        value: function projectScriptFilenameChanged() {
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

    }, {
        key: 'chooseProjectScriptFilename',
        value: function chooseProjectScriptFilename() {
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

    }, {
        key: 'toggleView',
        value: function toggleView(view) {

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

    }, {
        key: 'backButtonClicked',
        value: function backButtonClicked() {

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

    }, {
        key: 'projectHomeClicked',
        value: function projectHomeClicked() {
            // show the regular project view
            this.showProjectHome();
        }

        /**
         * Show the regular project view
         */

    }, {
        key: 'showProjectHome',
        value: function showProjectHome() {
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

    }, {
        key: 'cancelCreateGroupClicked',
        value: function cancelCreateGroupClicked() {
            // show the project regular project view
            this.toggleView('project');
        }

        /**
         * Creating a node was cancelled
         */

    }, {
        key: 'cancelCreateNodeClicked',
        value: function cancelCreateNodeClicked() {
            // show the project regular project view
            this.toggleView('project');
        }

        /**
         * Temporarily highlight the new nodes
         * @param newNodes the new nodes to highlight
         */

    }, {
        key: 'highlightNewNodes',
        value: function highlightNewNodes(newNodes) {
            var _this11 = this;

            this.$timeout(function () {

                if (newNodes != null) {

                    // loop through all the new nodes
                    for (var n = 0; n < newNodes.length; n++) {
                        var newNode = newNodes[n];

                        if (newNode != null) {
                            (function () {

                                // get the node UI element
                                var nodeElement = $("#" + newNode.id);

                                // save the original background color
                                var originalBackgroundColor = nodeElement.css("backgroundColor");

                                // highlight the background briefly to draw attention to it
                                nodeElement.css("background-color", "#FFFF9C");

                                /*
                                 * Use a timeout before starting to transition back to
                                 * the original background color. For some reason the
                                 * element won't get highlighted in the first place
                                 * unless this timeout is used.
                                 */
                                _this11.$timeout(function () {
                                    // slowly fade back to original background color
                                    nodeElement.css({
                                        'transition': 'background-color 3s ease-in-out',
                                        'background-color': originalBackgroundColor
                                    });
                                });
                            })();
                        }
                    }
                }
            });
        }

        /**
         * Save an Authoring Tool event
         * @param eventName the name of the event
         * @param category the category of the event
         * example 'Navigation' or 'Authoring'
         * @param data (optional) an object that contains more specific data about
         * the event
         */

    }, {
        key: 'saveEvent',
        value: function saveEvent(eventName, category, data) {

            var context = 'AuthoringTool';
            var nodeId = null;
            var componentId = null;
            var componentType = null;

            if (data == null) {
                data = {};
            }

            // save the event to the server
            this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, eventName, data);
        }

        /**
         * Get the selected node titles that we are importing
         * @return an array of node titles that may include the step numbers
         */

    }, {
        key: 'getSelectedNodeTitlesToImport',
        value: function getSelectedNodeTitlesToImport() {

            var selectedNodeTitles = [];

            // get the selected nodes
            var selectedNodes = this.getSelectedNodesToImport();

            // loop through all the selected nodes
            for (var n = 0; n < selectedNodes.length; n++) {
                var selectedNode = selectedNodes[n];

                if (selectedNode != null) {

                    // get the step number and title from the import project
                    var tempNode = this.importProjectIdToOrder[selectedNode.id];
                    var stepNumber = tempNode.stepNumber;
                    var title = '';

                    if (stepNumber == null) {
                        title = selectedNode.title;
                    } else {
                        title = stepNumber + ': ' + selectedNode.title;
                    }

                    selectedNodeTitles[n] = title;
                }
            }

            return selectedNodeTitles;
        }

        /**
         * Get the background color for a step
         * @param nodeId get the background color for a step in the project view
         * @return If the node is in a branch path it will return a color. If the
         * ndoe is not in a branch path it will return null.
         */

    }, {
        key: 'getStepBackgroundColor',
        value: function getStepBackgroundColor(nodeId) {

            var color = null;

            // get the branch path letter if the node is in a branch path
            var branchPathLetter = this.ProjectService.getBranchPathLetter(nodeId);

            if (branchPathLetter != null) {
                // the node is in a branch path

                // get the ascii code for the letter. example A=65, B=66, C=67, etc.
                var letterASCIICode = branchPathLetter.charCodeAt(0);

                // get the branch path number A=0, B=1, C=2, etc.
                var branchPathNumber = letterASCIICode - 65;

                // get the color for the branch path number
                color = this.stepBackgroundColors[branchPathNumber];
            }

            return color;
        }
    }]);

    return ProjectController;
}();

ProjectController.$inject = ['$anchorScroll', '$filter', '$interval', '$mdDialog', '$q', '$rootScope', '$scope', '$state', '$stateParams', '$timeout', 'AuthorWebSocketService', 'ConfigService', 'ProjectAssetService', 'ProjectService', 'TeacherDataService', 'UtilService'];

exports.default = ProjectController;
//# sourceMappingURL=projectController.js.map