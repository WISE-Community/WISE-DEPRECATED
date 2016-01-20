class NodeStatusIconCtrl {
    constructor($scope,
                ProjectService,
                StudentDataService) {

        this.$scope = $scope;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;

        this.nodeStatuses = this.StudentDataService.nodeStatuses;
        this.nodeStatus = this.nodeStatuses[this.nodeId];
    }

    getTemplateUrl(){
        return this.ProjectService.getThemePath() + '/templates/nodeStatusIcon.html';
    }
}

NodeStatusIconCtrl.$inject = [
    '$scope',
    'ProjectService',
    'StudentDataService'
];

export default NodeStatusIconCtrl;