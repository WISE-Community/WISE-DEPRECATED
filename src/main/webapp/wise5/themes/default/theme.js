'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _themeController = _interopRequireDefault(require("./themeController"));

var _themeComponents = _interopRequireDefault(require("./themeComponents"));

var _notebookComponents = _interopRequireDefault(require("./notebook/notebookComponents"));

require("./js/webfonts");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var themeModule = angular.module('theme', ['theme.components', 'theme.notebook']).controller('ThemeController', _themeController["default"]);
var _default = themeModule;
exports["default"] = _default;
//# sourceMappingURL=theme.js.map
