'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _workgroupsOnNode = require('./workgroupsOnNode/workgroupsOnNode');

var _workgroupsOnNode2 = _interopRequireDefault(_workgroupsOnNode);

var _navItem = require('./navItem/navItem');

var _navItem2 = _interopRequireDefault(_navItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NodeProgress = angular.module('nodeProgress', []);

NodeProgress.component('workgroupsOnNode', _workgroupsOnNode2.default);
NodeProgress.component('navItem', _navItem2.default);

exports.default = NodeProgress;
//# sourceMappingURL=nodeProgress.js.map