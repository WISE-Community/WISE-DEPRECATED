'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { ConceptMapService } from './conceptMapService';
import ConceptMapAuthoring from './conceptMapAuthoring';

const conceptMapAuthoringComponentModule = angular
  .module('conceptMapAuthoringComponentModule', ['pascalprecht.translate'])
  .service('ConceptMapService', downgradeInjectable(ConceptMapService))
  .component('conceptMapAuthoring', ConceptMapAuthoring)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/conceptMap/i18n');
    }
  ]);

export default conceptMapAuthoringComponentModule;
