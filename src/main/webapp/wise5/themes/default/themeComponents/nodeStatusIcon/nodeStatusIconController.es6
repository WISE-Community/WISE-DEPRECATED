class NodeStatusIconCtrl {
    constructor($scope,
                ProjectService,
                StudentDataService) {

        this.$scope = $scope;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;

        this.nodeStatuses = this.StudentDataService.nodeStatuses;
        this.nodeStatus = this.nodeStatuses[this.nodeId];

        this.$scope.$watch(
            () => { return this.nodeId; },
            (newId, oldId) => {
                if (newId !== oldId) {
                    // selected node id has changed, so update node status
                    this.nodeStatus = this.nodeStatuses[this.nodeId];
                }
            }
        );
    }

    getTemplateUrl(){
        return this.ProjectService.getThemePath() + '/themeComponents/nodeStatusIcon/nodeStatusIcon.html';
    }
}

NodeStatusIconCtrl.$inject = [
    '$scope',
    'ProjectService',
    'StudentDataService'
];

export default NodeStatusIconCtrl;
