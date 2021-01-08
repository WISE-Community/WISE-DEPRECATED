'use strict';
import * as angular from 'angular';
import StudentAssetController from './studentAssetController';

const studentAssetModule = angular
  .module('studentAsset', [])
  .directive('studentassets', function () {
    return {
      scope: {
        filter: '=',
        templateUrl: '=',
        componentController: '='
      },
      template: '<ng-include src="::studentAssetController.getTemplateUrl()"></ng-include>',
      controller: 'StudentAssetController',
      controllerAs: 'studentAssetController',
      bindToController: true
    };
  })
  .controller('StudentAssetController', StudentAssetController);

export default studentAssetModule;
