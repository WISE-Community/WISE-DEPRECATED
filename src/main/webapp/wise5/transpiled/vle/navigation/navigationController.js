'use strict';

define(['app'], function (app) {
    app.$controllerProvider.register('NavigationController', function ($rootScope, $scope, $state, $stateParams, ConfigService, ProjectService, StudentDataService) {
        this.rootNode = ProjectService.rootNode;

        this.filterByName = function (filter) {
            return true; // TODO: create filter
        };

        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            var toNodeId = toParams.nodeId;
            var fromNodeId = fromParams.nodeId;
            if (toNodeId && fromNodeId && toNodeId !== fromNodeId) {
                StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(toNodeId);
            }
        });
    });
});