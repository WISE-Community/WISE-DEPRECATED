'use strict';

import ChooseStepController from './chooseStepController';
import ChooseLocationController from './chooseLocationController';
import * as angular from 'angular';

const importStepModule = angular
  .module('importStepModule', ['ui.router'])
  .controller('ChooseStepController', ChooseStepController)
  .controller('ChooseLocationController', ChooseLocationController)
  .config([
    '$stateProvider',
    $stateProvider => {
      $stateProvider
        .state('root.project.import-step', {
          url: '/import-step',
          abstract: true,
          resolve: {}
        })
        .state('root.project.import-step.choose-step', {
          url: '/choose-step',
          templateUrl: 'wise5/authoringTool/importStep/chooseStep.html',
          controller: 'ChooseStepController',
          controllerAs: 'chooseStepController',
          params: {
            selectedNodes: [],
            importFromProjectId: null
          }
        })
        .state('root.project.import-step.choose-location', {
          url: '/choose-location',
          templateUrl: 'wise5/authoringTool/importStep/chooseLocation.html',
          controller: 'ChooseLocationController',
          controllerAs: 'chooseLocationController',
          params: {
            selectedNodes: [],
            importFromProjectId: null
          }
        });
    }
  ]);

export default importStepModule;
