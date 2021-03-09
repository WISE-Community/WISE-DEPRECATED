'use strict';

import ThemeController from './themeController';
import './themeComponents';

import './js/webfonts';

const themeModule = angular.module('theme', ['theme.components'])
    .controller('ThemeController', ThemeController);

export default themeModule;
