'use strict';

import NotebookController from './notebookController';
import NotebookItemController from './notebookItemController';
import NotebookItemReportController from './notebookItemReportController';

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
                itemId: '@',
                isEditAllowed: '=',
                isEditMode: '=',
                templateUrl: '=',
                componentController: '='
            },
            template: '<ng-include src="notebookItemController.getTemplateUrl()"></ng-include>',
            controller: 'NotebookItemController',
            controllerAs: 'notebookItemController',
            bindToController: true
        };
    })
    .directive('notebookitemreport', () => {
        return {
            scope: {
                reportId: '=',
                isEditAllowed: '=',
                templateUrl: '=',
                themePath: '='
            },
            template: '<ng-include src="notebookItemReportController.getTemplateUrl()"></ng-include>',
            controller: 'NotebookItemReportController',
            controllerAs: 'notebookItemReportController',
            bindToController: true
        };
    })
    .controller('NotebookController', NotebookController)
    .controller('NotebookItemController', NotebookItemController)
    .controller('NotebookItemReportController', NotebookItemReportController);

export default notebookModule;