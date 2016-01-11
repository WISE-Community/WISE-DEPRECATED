
class ProjectStatusController {
    constructor($scope,
                projectStatus,
                userNames) {

        this.$scope = $scope;
        this.projectStatus = projectStatus;
        this.userNames = userNames;

        $scope.projectStatus = projectStatus;
        $scope.userNames = userNames;
    }
}

ProjectStatusController.$inject = [
    '$scope',
    'projectStatus',
    'userNames'
];

export default ProjectStatusController;