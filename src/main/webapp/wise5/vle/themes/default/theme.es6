'use strict';

import ThemeController from './themeController';
import ThemeComponents from './themeComponents';

import './js/webfonts';

let themeModule = angular.module('theme', ['theme.components'])
    .controller(ThemeController.name, ThemeController);

export default themeModule;
