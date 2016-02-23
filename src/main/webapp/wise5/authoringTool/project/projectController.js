'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProjectController = function () {
    function ProjectController($scope, $state, $stateParams, ProjectService, ConfigService) {
        _classCallCheck(this, ProjectController);

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
        this.insertMode = false;

        this.updateProjectAsText();

        $scope.$watch(angular.bind(this, function () {
            return this.projectAsText;
        }), angular.bind(this, function () {
            try {
                this.project = JSON.parse(this.projectAsText);
            } catch (exp) {
                //Exception handler
            };
        }));
    }

    _createClass(ProjectController, [{
        key: "updateProjectAsText",

        // updates projectAsText field, which is the string representation of the project that we'll show in the textarea
        value: function updateProjectAsText() {
            this.projectAsText = JSON.stringify(this.project, null, 4);
        }
    }, {
        key: "previewProject",

        /**
         * Launch the project in preview mode
         */
        value: function previewProject() {
            var previewProjectURL = this.ConfigService.getConfigParam("previewProjectURL");
            window.open(previewProjectURL);
        }
    }, {
        key: "viewProjectAssets",
        value: function viewProjectAssets() {
            this.$state.go('root.project.asset', { projectId: this.projectId });
        }
    }, {
        key: "viewProjectHistory",
        value: function viewProjectHistory() {
            this.$state.go('root.project.history', { projectId: this.projectId });
        }
    }, {
        key: "saveProject",
        value: function saveProject() {
            var _this = this;

            //let projectJSONString = JSON.stringify(this.project, null, 4);
            var commitMessage = $("#commitMessageInput").val();
            try {
                // if projectJSONString is bad json, it will throw an exception and not save.
                this.ProjectService.project = this.project;

                this.ProjectService.saveProject(commitMessage).then(function (commitHistoryArray) {
                    _this.commitHistory = commitHistoryArray;
                    $("#commitMessageInput").val(""); // clear field after commit
                });
            } catch (error) {
                alert("Invalid JSON. Please check syntax. Aborting save.");
                return;
            }
        }
    }, {
        key: "getNodePositionById",

        /**
         * Get the node position
         * @param nodeId the node id
         * @returns the node position
         */
        value: function getNodePositionById(nodeId) {
            return this.ProjectService.getNodePositionById(nodeId);
        }
    }, {
        key: "getNodeTitleByNodeId",

        /**
         * Get the node title for a node
         * @param nodeId the node id
         * @returns the node title
         */
        value: function getNodeTitleByNodeId(nodeId) {
            return this.ProjectService.getNodeTitleByNodeId(nodeId);
        }
    }, {
        key: "isGroupNode",

        /**
         * Check if a node id is for a group
         * @param nodeId
         * @returns whether the node is a group node
         */
        value: function isGroupNode(nodeId) {
            return this.ProjectService.isGroupNode(nodeId);
        }
    }, {
        key: "nodeClicked",

        /**
         * A node was clicked so we will go to the node authoring view
         * @param nodeId
         */
        value: function nodeClicked(nodeId) {
            this.$state.go('root.project.node', { projectId: this.projectId, nodeId: nodeId });
        }
    }, {
        key: "createGroup",

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
            this.insertMode = true;

            // turn on create mode
            this.createMode = true;
        }

        /**
         * Create a new node (step)
         */

    }, {
        key: "createNode",
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
            this.insertMode = true;

            // turn on create mode
            this.createMode = true;
        }

        /**
         * Insert the node(s) inside
         * @param nodeId the node id of the group that we will insert into
         */

    }, {
        key: "insertInside",
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

                // save the project
                this.ProjectService.saveProject();

                // turn off create mode
                this.createMode = false;

                // turn off insert mode
                this.insertMode = false;

                // refresh the project
                this.ProjectService.parseProject();
                this.items = this.ProjectService.idToOrder;
            } else if (this.moveMode) {
                // we are in move mode

                // get the nodes that were selected
                var selectedNodeIds = this.getSelectedItems();

                // move the nodes into the group
                this.ProjectService.moveNodesInside(selectedNodeIds, nodeId);

                // save the project
                this.ProjectService.saveProject();

                // turn off move mode
                this.moveMode = false;

                // turn off insert mode
                this.insertMode = false;

                // refresh the project
                this.ProjectService.parseProject();
                this.items = this.ProjectService.idToOrder;

                this.unselectAllItems();
            }
        }

        /**
         * Insert the node(s) after
         * @param nodeId the node id of the node we will insert after
         */

    }, {
        key: "insertAfter",
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

                // save the project
                this.ProjectService.saveProject();

                // turn off create mode
                this.createMode = false;

                // turn off insert mode
                this.insertMode = false;

                // refresh the project
                this.ProjectService.parseProject();
                this.items = this.ProjectService.idToOrder;
            } else if (this.moveMode) {
                // we are in move mode

                // get the selected nodes
                var selectedNodeIds = this.getSelectedItems();

                // move the nodes after the node id
                this.ProjectService.moveNodesAfter(selectedNodeIds, nodeId);

                // save the project
                this.ProjectService.saveProject();

                // turn off move mode
                this.moveMode = false;

                // turn off insert mode
                this.insertMode = false;

                // refresh the project
                this.ProjectService.parseProject();
                this.items = this.ProjectService.idToOrder;

                this.unselectAllItems();
            }
        }

        /**
         * Turn on move mode
         */

    }, {
        key: "move",
        value: function move() {
            // turn on insert mode
            this.insertMode = true;

            // turn on move mode
            this.moveMode = true;
        }

        /**
         * Delete the selected nodes
         */

    }, {
        key: "delete",
        value: function _delete() {

            // ask the user to confirm the delete
            var answer = confirm('Are you sure you want to delete?');

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

        /**
         * Get the selected items
         * @returns an array of node ids that are selected
         */

    }, {
        key: "getSelectedItems",
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

            return selectedNodeIds;
        }

        /**
         * Unselect all the items
         */

    }, {
        key: "unselectAllItems",
        value: function unselectAllItems() {
            angular.forEach(this.items, function (value, key) {
                value.checked = false;
            });
        }
    }]);

    return ProjectController;
}();

;

ProjectController.$inject = ['$scope', '$state', '$stateParams', 'ProjectService', 'ConfigService'];

exports.default = ProjectController;
//# sourceMappingURL=projectController.js.map