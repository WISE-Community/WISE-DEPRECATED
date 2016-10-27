'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nodeGrading = require('./classroomMonitorComponents/nodeGrading/nodeGrading');

var _nodeGrading2 = _interopRequireDefault(_nodeGrading);

var _nodeProgress = require('./classroomMonitorComponents/nodeProgress/nodeProgress');

var _nodeProgress2 = _interopRequireDefault(_nodeProgress);

var _shared = require('./classroomMonitorComponents/shared/shared');

var _shared2 = _interopRequireDefault(_shared);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ClassroomMonitorComponents = angular.module('classroomMonitor.components', ['nodeGrading', 'nodeProgress', 'shared']);

exports.default = ClassroomMonitorComponents;
//# sourceMappingURL=classroomMonitorComponents.js.map