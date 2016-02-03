class NodeController {
    constructor($scope,
                $state,
                $stateParams,
                ProjectService) {
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.ProjectService = ProjectService;
        this.projectId = $stateParams.projectId;
        this.nodeId = $stateParams.nodeId;
        this.showCreateComponent = false;
        this.selectedComponent = null;

        // the array of component types that can be created
        this.componentTypes = [
            {componentType: 'Discussion', componentName: 'Discussion'},
            {componentType: 'Draw', componentName: 'Draw'},
            {componentType: 'Embedded', componentName: 'Embedded'},
            {componentType: 'Graph', componentName: 'Graph'},
            {componentType: 'HTML', componentName: 'HTML'},
            {componentType: 'Label', componentName: 'Label'},
            {componentType: 'Match', componentName: 'Match'},
            {componentType: 'MultipleChoice', componentName: 'Multiple Choice'},
            {componentType: 'OpenResponse', componentName: 'Open Response'},
            {componentType: 'OutsideURL', componentName: 'Outside URL'},
            {componentType: 'Table', componentName: 'Table'}
        ];

        // set the drop down to the first item
        this.selectedComponent = this.componentTypes[0].componentType;

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
        this.$state.go('root.project', {projectId: this.projectId});
    };

    /**
     * Create a component in this node
     */
    createComponent() {

        // create a component and add it to this node
        this.ProjectService.createComponent(this.nodeId, this.selectedComponent);

        // save the project
        this.ProjectService.saveProject();

        // hide the create component elements
        this.showCreateComponent = false;
    }

    /**
     * The node has changed in the authoring view
     */
    authoringViewNodeChanged() {
        this.ProjectService.saveProject();
    }
}

NodeController.$inject = ['$scope', '$state', '$stateParams', 'ProjectService'];

export default NodeController;
