'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _notebookController = require('./notebookController');

var _notebookController2 = _interopRequireDefault(_notebookController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var notebookModule = angular.module('notebook', []).directive('notebook', function () {
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
}).controller('NotebookController', _notebookController2.default);

exports.default = notebookModule;
//# sourceMappingURL=notebook.js.map