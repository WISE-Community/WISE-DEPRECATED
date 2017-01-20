'use strict';

import NotebookController from './notebookController';
import NotebookItemController from './notebookItemController';
import NotebookItemReportController from './notebookItemReportController';

const NotebookItem = {
    bindings: {
        itemId: '<',
        isChooseMode: '<',
        templateUrl: '<',
        componentController: '<',
        onDelete: '&',
        onRevive: '&',
        onSelect: '&',
        workgroupId: '='
    },
    template: '<ng-include src="notebookItemController.getTemplateUrl()"></ng-include>',
    controller: 'NotebookItemController as notebookItemController'
};

let notebookModule = angular.module('notebook', [])
    .directive('notebook', () => {
        return {
            scope: {
                componentController: '=',
                filter: '=',
                mode: '@',
                themePath: '=',
                templateUrl: '=',
                workgroupId: '='
            },
            template: '<ng-include src="notebookController.getTemplateUrl()"></ng-include>',
            controller: 'NotebookController',
            controllerAs: 'notebookController',
            bindToController: true
        };
    })
    .directive('notebookitemreport', () => {
        return {
            scope: {
                reportId: '=',
                isEditAllowed: '=',
                templateUrl: '=',
                themePath: '=',
                workgroupId: '='
            },
            template: '<ng-include src="notebookItemReportController.getTemplateUrl()"></ng-include>',
            controller: 'NotebookItemReportController',
            controllerAs: 'notebookItemReportController',
            bindToController: true
        };
    })
    .controller('NotebookController', NotebookController)
    .controller('NotebookItemReportController', NotebookItemReportController)
    .controller(NotebookItemController.name, NotebookItemController)
    .component('notebookItem', NotebookItem);

export default notebookModule;
