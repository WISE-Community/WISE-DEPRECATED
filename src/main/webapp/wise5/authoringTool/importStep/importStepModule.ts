'use strict';

import { ChooseImportStepComponent } from '../../../site/src/app/authoring-tool/import-step/choose-import-step/choose-import-step.component';
import { ChooseImportStepLocationComponent } from '../../../site/src/app/authoring-tool/import-step/choose-import-step-location/choose-import-step-location.component';
import * as angular from 'angular';
import { downgradeComponent } from '@angular/upgrade/static';

const importStepModule = angular
  .module('importStepModule', ['ui.router'])
  .directive(
    'chooseImportStepComponent',
    downgradeComponent({ component: ChooseImportStepComponent }) as angular.IDirectiveFactory
  )
  .directive(
    'chooseImportStepLocationComponent',
    downgradeComponent({
      component: ChooseImportStepLocationComponent
    }) as angular.IDirectiveFactory
  )
  .config([
    '$stateProvider',
    ($stateProvider) => {
      $stateProvider
        .state('root.at.project.import-step', {
          url: '/import-step',
          abstract: true,
          resolve: {}
        })
        .state('root.at.project.import-step.choose-step', {
          url: '/choose-step',
          component: 'chooseImportStepComponent',
          params: {
            selectedNodes: [],
            importFromProjectId: null
          }
        })
        .state('root.at.project.import-step.choose-location', {
          url: '/choose-location',
          component: 'chooseImportStepLocationComponent',
          params: {
            selectedNodes: [],
            importFromProjectId: null
          }
        });
    }
  ]);

export default importStepModule;
