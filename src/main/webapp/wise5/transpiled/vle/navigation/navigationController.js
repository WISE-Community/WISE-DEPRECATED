'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NavigationController = function NavigationController($rootScope, ProjectService, StudentDataService) {
    _classCallCheck(this, NavigationController);

    this.$rootScope = $rootScope;
    this.ProjectService = ProjectService;
    this.StudentDataService = StudentDataService;

    this.rootNode = this.ProjectService.rootNode;

    this.$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        var toNodeId = toParams.nodeId;
        var fromNodeId = fromParams.nodeId;
        if (toNodeId && fromNodeId && toNodeId !== fromNodeId) {
            this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(toNodeId);
        }
    }.bind(this));
};

NavigationController.$inject = ['$rootScope', 'ProjectService', 'StudentDataService'];

exports.default = NavigationController;