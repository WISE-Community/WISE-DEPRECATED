'use strict';

//import StudentGradingTools from './studentGradingTools/studentGradingTools';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stepInfo = require('./stepInfo/stepInfo');

var _stepInfo2 = _interopRequireDefault(_stepInfo);

var _stepItem = require('./stepItem/stepItem');

var _stepItem2 = _interopRequireDefault(_stepItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var StudentGrading = angular.module('studentGrading', []);

//StudentGrading.component('studentGradingTools', StudentGradingTools);
StudentGrading.component('stepInfo', _stepInfo2.default);
StudentGrading.component('stepItem', _stepItem2.default);

exports.default = StudentGrading;
//# sourceMappingURL=studentGrading.js.map
