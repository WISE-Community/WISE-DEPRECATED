'use strict';

import ThemeController from './themeController';
import './themeComponents';
import './notebook/notebookComponents';

import './js/webfonts';

const themeModule = angular.module('theme', ['theme.components', 'theme.notebook'])
    .controller('ThemeController', ThemeController);

export default themeModule;
