'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _milestoneDetails = require('./milestoneDetails/milestoneDetails');

var _milestoneDetails2 = _interopRequireDefault(_milestoneDetails);

var _milestoneEdit = require('./milestoneEdit/milestoneEdit');

var _milestoneEdit2 = _interopRequireDefault(_milestoneEdit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Milestones = angular.module('milestones', []);

Milestones.component('milestoneDetails', _milestoneDetails2.default);
Milestones.component('milestoneEdit', _milestoneEdit2.default);

exports.default = Milestones;
//# sourceMappingURL=milestones.js.map