'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { ConceptMapService } from './conceptMapService';
import ConceptMapController from './conceptMapController';
import ConceptMapAuthoringController from './conceptMapAuthoringController';

const conceptMapAuthoringComponentModule = angular
  .module('conceptMapAuthoringComponentModule', ['pascalprecht.translate'])
  .service('ConceptMapService', downgradeInjectable(ConceptMapService))
  .controller('ConceptMapController', ConceptMapController)
  .controller('ConceptMapAuthoringController', ConceptMapAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/conceptMap/i18n');
    }
  ]);

export default conceptMapAuthoringComponentModule;
