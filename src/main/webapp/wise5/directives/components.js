'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _annotation = _interopRequireDefault(require("./annotation/annotation"));

var _compile = _interopRequireDefault(require("./compile/compile"));

var _component = _interopRequireDefault(require("./component/component"));

var _componentAnnotations = _interopRequireDefault(require("./componentAnnotations/componentAnnotations"));

var _disableDeleteKeypress = _interopRequireDefault(require("./disableDeleteKeypress/disableDeleteKeypress"));

var _draggable = _interopRequireDefault(require("./draggable/draggable"));

var _globalAnnotations = _interopRequireDefault(require("./globalAnnotations/globalAnnotations"));

var _globalAnnotationsList = _interopRequireDefault(require("./globalAnnotationsList/globalAnnotationsList"));

var _listenForDeleteKeypress = _interopRequireDefault(require("./listenForDeleteKeypress/listenForDeleteKeypress"));

var _milestoneReportGraph = _interopRequireDefault(require("./milestoneReportGraph/milestoneReportGraph"));

var _possibleScore = _interopRequireDefault(require("./possibleScore/possibleScore"));

var _summaryDisplay = _interopRequireDefault(require("./summaryDisplay/summaryDisplay"));

var _wiselink = _interopRequireDefault(require("./wiselink/wiselink"));

var _sticky = _interopRequireDefault(require("./sticky/sticky"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var Components = angular.module('components', []);
Components.component('annotation', _annotation["default"]);
Components.component('compile', _compile["default"]);
Components.component('component', _component["default"]);
Components.component('componentAnnotations', _componentAnnotations["default"]);
Components.component('disableDeleteKeypress', _disableDeleteKeypress["default"]);
Components.component('draggable', _draggable["default"]);
Components.component('globalAnnotations', _globalAnnotations["default"]);
Components.component('globalAnnotationsList', _globalAnnotationsList["default"]);
Components.component('listenForDeleteKeypress', _listenForDeleteKeypress["default"]);
Components.component('milestoneReportGraph', _milestoneReportGraph["default"]);
Components.component('possibleScore', _possibleScore["default"]);
Components.component('summaryDisplay', _summaryDisplay["default"]);
Components.component('wiselink', _wiselink["default"]);
Components.directive('sticky', _sticky["default"]);
var _default = Components;
exports["default"] = _default;
//# sourceMappingURL=components.js.map
