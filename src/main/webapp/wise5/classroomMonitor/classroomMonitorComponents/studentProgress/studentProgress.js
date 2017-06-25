'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _projectProgress = require('./projectProgress/projectProgress');

var _projectProgress2 = _interopRequireDefault(_projectProgress);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var StudentProgress = angular.module('studentProgress', []);

StudentProgress.component('projectProgress', _projectProgress2.default);

exports.default = StudentProgress;
//# sourceMappingURL=studentProgress.js.map