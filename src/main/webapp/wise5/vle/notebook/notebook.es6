'use strict';

import NotebookController from './notebookController';

let notebookModule = angular.module('notebook', [])
    .directive('notebook', function() {
        return {
            scope: {
                filter: '=',
                templateUrl: '=',
                componentController: '='
            },
            template: '<ng-include src="notebookController.getTemplateUrl()"></ng-include>',
            controller: 'NotebookController',
            controllerAs: 'notebookController',
            bindToController: true
        };
    })
    .controller('NotebookController', NotebookController);

export default notebookModule;