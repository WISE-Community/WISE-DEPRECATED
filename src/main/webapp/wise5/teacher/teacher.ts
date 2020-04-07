'use strict';

import * as angular from 'angular';
import '../authoringTool/authoringTool';
import '../classroomMonitor/classroomMonitor';

const teacherModule = angular
  .module('teacher', ['authoring', 'classroomMonitor', 'ui.router'])
  .config([
    '$urlRouterProvider',
    '$stateProvider',
    ($urlRouterProvider, $stateProvider) => {
      $urlRouterProvider.otherwise('/');
      $stateProvider.state('root', {
        url: '',
        abstract: true
      });
    }
  ]);

export default teacherModule;
