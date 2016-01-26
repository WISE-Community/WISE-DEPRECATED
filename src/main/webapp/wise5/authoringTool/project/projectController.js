"use strict";

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
        this.project = this.ProjectService.getProject();
        this.items = this.ProjectService.idToOrder;
        this.nodeIds = this.ProjectService.getFlattenedProjectAsNodeIds();

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

        this.showCommitHistory();
    }

    _createClass(ProjectController, [{
        key: "updateProjectAsText",

        // updates projectAsText field, which is the string representation of the project that we'll show in the textarea
        value: function updateProjectAsText() {
            this.projectAsText = JSON.stringify(this.project, null, 4);
        }
    }, {
        key: "previewProject",
        value: function previewProject() {
            var previewProjectURL = this.ConfigService.getConfigParam("previewProjectURL");
            window.open(previewProjectURL);
        }
    }, {
        key: "viewProjectAssets",
        value: function viewProjectAssets() {
            this.$state.go('root.asset', {});
        }
    }, {
        key: "saveProject",
        value: function saveProject() {
            var projectJSONString = JSON.stringify(this.project, null, 4);
            var commitMessage = $("#commitMessageInput").val();
            try {
                // if projectJSONString is bad json, it will throw an exception and not save.
                JSON.parse(projectJSONString);

                this.ProjectService.saveProject(projectJSONString, commitMessage).then(angular.bind(this, function (commitHistoryArray) {
                    this.commitHistory = commitHistoryArray;
                    $("#commitMessageInput").val(""); // clear field after commit
                }));
            } catch (error) {
                alert("Invalid JSON. Please check syntax. Aborting save.");
                return;
            }
        }
    }, {
        key: "showCommitHistory",
        value: function showCommitHistory() {
            this.ProjectService.getCommitHistory().then(angular.bind(this, function (commitHistoryArray) {
                this.commitHistory = commitHistoryArray;
            }));
        }

        /**
         * Get the node position
         * @param nodeId the node id
         * @returns the node position
         */

    }, {
        key: "getNodePositionById",
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
            this.$state.go('root.node', { nodeId: nodeId });
        }
    }]);

    return ProjectController;
}();

ProjectController.$inject = ['$scope', '$state', '$stateParams', 'ProjectService', 'ConfigService'];

exports.default = ProjectController;

//# sourceMappingURL=projectController.js.map