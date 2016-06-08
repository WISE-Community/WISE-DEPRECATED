'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _notebookController = require('./notebookController');

var _notebookController2 = _interopRequireDefault(_notebookController);

var _notebookItemController = require('./notebookItemController');

var _notebookItemController2 = _interopRequireDefault(_notebookItemController);

var _notebookItemReportController = require('./notebookItemReportController');

var _notebookItemReportController2 = _interopRequireDefault(_notebookItemReportController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NotebookItem = {
    bindings: {
        itemId: '<',
        isChooseMode: '<',
        templateUrl: '<',
        componentController: '<',
        onSelect: '&'
    },
    template: '<ng-include src="notebookItemController.getTemplateUrl()"></ng-include>',
    controller: 'NotebookItemController as notebookItemController'
};

var notebookModule = angular.module('notebook', []).directive('notebook', function () {
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
}).directive('notebookitemreport', function () {
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
}).controller('NotebookController', _notebookController2.default).controller('NotebookItemReportController', _notebookItemReportController2.default).controller(_notebookItemController2.default.name, _notebookItemController2.default).component('notebookItem', NotebookItem);

exports.default = notebookModule;
//# sourceMappingURL=notebook.js.map