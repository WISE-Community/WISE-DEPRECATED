'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _notebookController = require('./notebookController');

var _notebookController2 = _interopRequireDefault(_notebookController);

var _notebookItemController = require('./notebookItemController');

var _notebookItemController2 = _interopRequireDefault(_notebookItemController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
}).directive('notebookitem', function () {
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
}).controller('NotebookController', _notebookController2.default).controller('NotebookItemController', _notebookItemController2.default);

exports.default = notebookModule;
//# sourceMappingURL=notebook.js.map