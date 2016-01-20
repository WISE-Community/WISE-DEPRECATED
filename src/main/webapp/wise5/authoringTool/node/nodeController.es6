class NodeController {
    constructor($scope,
                $state,
                $stateParams,
                ProjectService) {
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.ProjectService = ProjectService;
        this.nodeId = $stateParams.nodeId;

        // get the node
        this.node = this.ProjectService.getNodeById(this.nodeId);

        // get the components in the node
        this.components = this.ProjectService.getComponentsByNodeId(this.nodeId);
    }
    showNormal() {
        this.$state.go('root.node.normal', {nodeId: this.nodeId});
    };

    showPreview() {
        this.$state.go('root.node.preview', {nodeId: this.nodeId});
    };

    showAdvanced() {
        this.$state.go('root.node.advanced', {nodeId: this.nodeId});
    };

    close() {
        this.$state.go('root.project');
    };

    /**
     * The node has changed in the authoring view
     */
    authoringViewNodeChanged() {
        this.ProjectService.saveProject();
    }
}

NodeController.$inject = ['$scope', '$state', '$stateParams', 'ProjectService'];

export default NodeController;
