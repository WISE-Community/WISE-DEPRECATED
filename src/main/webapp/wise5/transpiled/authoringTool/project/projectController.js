'use strict';

define(['app'], function (app) {
    app.$controllerProvider.register('ProjectController', ['$scope', '$state', '$stateParams', 'ProjectService', 'ConfigService', function ($scope, $state, $stateParams, ProjectService, ConfigService) {

        this.title = "project controller title";

        this.project = ProjectService.getProject();

        this.items = ProjectService.idToOrder;

        // updates projectAsText field, which is the string representation of the project that we'll show in the textarea
        this.updateProjectAsText = function () {
            this.projectAsText = JSON.stringify(this.project, null, 4);
        };

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

        this.nodeIds = ProjectService.getFlattenedProjectAsNodeIds();

        this.previewProject = function () {
            var previewProjectURL = ConfigService.getConfigParam("previewProjectURL");
            window.open(previewProjectURL);
        };

        this.saveProject = function () {
            var projectJSONString = JSON.stringify(this.project, null, 4);
            var commitMessage = $("#commitMessageInput").val();
            try {
                // if projectJSONString is bad json, it will throw an exception and not save.
                JSON.parse(projectJSONString);

                ProjectService.saveProject(projectJSONString, commitMessage).then(angular.bind(this, function (commitHistoryArray) {
                    this.commitHistory = commitHistoryArray;
                    $("#commitMessageInput").val(""); // clear field after commit
                }));
            } catch (error) {
                alert("Invalid JSON. Please check syntax. Aborting save.");
                return;
            }
        };

        this.showCommitHistory = function () {
            ProjectService.getCommitHistory().then(angular.bind(this, function (commitHistoryArray) {
                this.commitHistory = commitHistoryArray;
            }));
        };

        /**
         * Get the node position
         * @param nodeId the node id
         * @returns the node position
         */
        this.getNodePositionById = function (nodeId) {
            return ProjectService.getNodePositionById(nodeId);
        };

        /**
         * Get the node title for a node
         * @param nodeId the node id
         * @returns the node title
         */
        this.getNodeTitleByNodeId = function (nodeId) {
            return ProjectService.getNodeTitleByNodeId(nodeId);
        };

        /**
         * Check if a node id is for a group
         * @param nodeId
         * @returns whether the node is a group node
         */
        this.isGroupNode = function (nodeId) {
            return ProjectService.isGroupNode(nodeId);
        };

        /**
         * A node was clicked so we will go to the node authoring view
         * @param nodeId
         */
        this.nodeClicked = function (nodeId) {
            $state.go('root.node', { nodeId: nodeId });
        };

        this.showCommitHistory();
    }]);
});