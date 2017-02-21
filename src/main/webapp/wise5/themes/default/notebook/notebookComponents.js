'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _notebook = require('./notebook/notebook');

var _notebook2 = _interopRequireDefault(_notebook);

var _notebookItem = require('./notebookItem/notebookItem');

var _notebookItem2 = _interopRequireDefault(_notebookItem);

var _notebookNotes = require('./notebookNotes/notebookNotes');

var _notebookNotes2 = _interopRequireDefault(_notebookNotes);

var _notebookReport = require('./notebookReport/notebookReport');

var _notebookReport2 = _interopRequireDefault(_notebookReport);

var _notebookLauncher = require('./notebookLauncher/notebookLauncher');

var _notebookLauncher2 = _interopRequireDefault(_notebookLauncher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NotebookComponents = angular.module('theme.notebook', []);

NotebookComponents.component('notebook', _notebook2.default);
NotebookComponents.component('notebookItem', _notebookItem2.default);
NotebookComponents.component('notebookNotes', _notebookNotes2.default);
NotebookComponents.component('notebookReport', _notebookReport2.default);
NotebookComponents.component('notebookLauncher', _notebookLauncher2.default);

exports.default = NotebookComponents;
//# sourceMappingURL=notebookComponents.js.map