'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _annotation = require('./annotation/annotation');

var _annotation2 = _interopRequireDefault(_annotation);

var _componentAnnotations = require('./componentAnnotations/componentAnnotations');

var _componentAnnotations2 = _interopRequireDefault(_componentAnnotations);

var _compile = require('./compile/compile');

var _compile2 = _interopRequireDefault(_compile);

var _component = require('./component/component');

var _component2 = _interopRequireDefault(_component);

var _componentGrading = require('./componentGrading/componentGrading');

var _componentGrading2 = _interopRequireDefault(_componentGrading);

var _disableDeleteKeypress = require('./disableDeleteKeypress/disableDeleteKeypress');

var _disableDeleteKeypress2 = _interopRequireDefault(_disableDeleteKeypress);

var _draggable = require('./draggable/draggable');

var _draggable2 = _interopRequireDefault(_draggable);

var _globalAnnotations = require('./globalAnnotations/globalAnnotations');

var _globalAnnotations2 = _interopRequireDefault(_globalAnnotations);

var _globalAnnotationsList = require('./globalAnnotationsList/globalAnnotationsList');

var _globalAnnotationsList2 = _interopRequireDefault(_globalAnnotationsList);

var _listenForDeleteKeypress = require('./listenForDeleteKeypress/listenForDeleteKeypress');

var _listenForDeleteKeypress2 = _interopRequireDefault(_listenForDeleteKeypress);

var _possibleScore = require('./possibleScore/possibleScore');

var _possibleScore2 = _interopRequireDefault(_possibleScore);

var _wiselink = require('./wiselink/wiselink');

var _wiselink2 = _interopRequireDefault(_wiselink);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Components = angular.module('components', []);

Components.component('annotation', _annotation2.default);
Components.component('compile', _compile2.default);
Components.component('component', _component2.default);
Components.component('componentAnnotations', _componentAnnotations2.default);
Components.component('componentGrading', _componentGrading2.default);
Components.component('disableDeleteKeypress', _disableDeleteKeypress2.default);
Components.component('draggable', _draggable2.default);
Components.component('globalAnnotations', _globalAnnotations2.default);
Components.component('globalAnnotationsList', _globalAnnotationsList2.default);
Components.component('listenForDeleteKeypress', _listenForDeleteKeypress2.default);
Components.component('possibleScore', _possibleScore2.default);
Components.component('wiselink', _wiselink2.default);

exports.default = Components;
//# sourceMappingURL=components.js.map