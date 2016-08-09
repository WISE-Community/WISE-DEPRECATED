"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProjectStatusController = function ProjectStatusController($scope, projectStatus, userNames) {
    _classCallCheck(this, ProjectStatusController);

    this.$scope = $scope;
    this.projectStatus = projectStatus;
    this.userNames = userNames;

    $scope.projectStatus = projectStatus;
    $scope.userNames = userNames;
};

ProjectStatusController.$inject = ['$scope', 'projectStatus', 'userNames'];

exports.default = ProjectStatusController;
//# sourceMappingURL=projectStatusController.js.map