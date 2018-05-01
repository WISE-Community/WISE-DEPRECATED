'use strict';

import ThemeController from './themeController';
import ThemeComponents from './themeComponents';
import NotebookComponents from './notebook/notebookComponents';

import './js/webfonts';

const themeModule = angular.module('theme', ['theme.components', 'theme.notebook'])
    .controller(ThemeController.name, ThemeController);

export default themeModule;
