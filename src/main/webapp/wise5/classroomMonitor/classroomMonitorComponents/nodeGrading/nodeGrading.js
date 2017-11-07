'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _componentSelect = require('./componentSelect/componentSelect');

var _componentSelect2 = _interopRequireDefault(_componentSelect);

var _stepTools = require('./stepTools/stepTools');

var _stepTools2 = _interopRequireDefault(_stepTools);

var _workgroupInfo = require('./workgroupInfo/workgroupInfo');

var _workgroupInfo2 = _interopRequireDefault(_workgroupInfo);

var _workgroupItem = require('./workgroupItem/workgroupItem');

var _workgroupItem2 = _interopRequireDefault(_workgroupItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NodeGrading = angular.module('nodeGrading', []);

NodeGrading.component('componentSelect', _componentSelect2.default);
NodeGrading.component('stepTools', _stepTools2.default);
NodeGrading.component('workgroupInfo', _workgroupInfo2.default);
NodeGrading.component('workgroupItem', _workgroupItem2.default);

exports.default = NodeGrading;
//# sourceMappingURL=nodeGrading.js.map
