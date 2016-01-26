class ProjectController {

    constructor($scope, $state, $stateParams, ProjectService, ConfigService) {
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

        $scope.$watch(angular.bind(this, function() {
            return this.projectAsText;
        }), angular.bind(this, function () {
            try {
                this.project = JSON.parse(this.projectAsText);
            } catch(exp) {
                //Exception handler
            };
        }));

        this.showCommitHistory();
    };

    // updates projectAsText field, which is the string representation of the project that we'll show in the textarea
    updateProjectAsText() {
        this.projectAsText = JSON.stringify(this.project, null, 4);
    };

    previewProject() {
        let previewProjectURL = this.ConfigService.getConfigParam("previewProjectURL");
        window.open(previewProjectURL);
    };

    viewProjectAssets() {
        this.$state.go('root.asset', {});
    };

    saveProject() {
        let projectJSONString = JSON.stringify(this.project, null, 4);
        let commitMessage = $("#commitMessageInput").val();
        try {
            // if projectJSONString is bad json, it will throw an exception and not save.
            JSON.parse(projectJSONString);

            this.ProjectService.saveProject(projectJSONString, commitMessage).then(angular.bind(this, function(commitHistoryArray) {
                this.commitHistory = commitHistoryArray;
                $("#commitMessageInput").val("");  // clear field after commit
            }));
        } catch (error) {
            alert("Invalid JSON. Please check syntax. Aborting save.");
            return;
        }
    };

    showCommitHistory() {
        this.ProjectService.getCommitHistory().then(angular.bind(this, function (commitHistoryArray) {
            this.commitHistory = commitHistoryArray;
        }));
    }

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
        this.$state.go('root.node', {nodeId:nodeId});
    };
}

ProjectController.$inject = ['$scope', '$state', '$stateParams', 'ProjectService', 'ConfigService'];

export default ProjectController;
