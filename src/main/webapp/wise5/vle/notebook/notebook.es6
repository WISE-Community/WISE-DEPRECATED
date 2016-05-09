'use strict';

import NotebookController from './notebookController';
import NotebookItemController from './notebookItemController';

let notebookModule = angular.module('notebook', [])
    .directive('notebook', () => {
        return {
            scope: {
                filter: '=',
                themePath: '=',
                templateUrl: '=',
                componentController: '='
            },
            template: '<ng-include src="notebookController.getTemplateUrl()"></ng-include>',
            controller: 'NotebookController',
            controllerAs: 'notebookController',
            bindToController: true
        };
    })
    .directive('notebookitem', () => {
        return {
            scope: {
                itemId: '=',
                isEditEnabled: '=',
                templateUrl: '=',
                componentController: '='
            },
            template: '<ng-include src="notebookItemController.getTemplateUrl()"></ng-include>',
            controller: 'NotebookItemController',
            controllerAs: 'notebookItemController',
            bindToController: true
        };
    })
    .controller('NotebookController', NotebookController)
    .controller('NotebookItemController', NotebookItemController);

export default notebookModule;