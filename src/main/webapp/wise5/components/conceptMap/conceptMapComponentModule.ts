'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { ConceptMapService } from './conceptMapService';
import ConceptMapController from './conceptMapController';

let conceptMapComponentModule = angular
  .module('conceptMapComponentModule', ['pascalprecht.translate'])
  .service('ConceptMapService', downgradeInjectable(ConceptMapService))
  .controller('ConceptMapController', ConceptMapController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/conceptMap/i18n');
    }
  ]);

export default conceptMapComponentModule;
