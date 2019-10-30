'use strict';

import ConceptMapService from './conceptMapService';
import ConceptMapController from './conceptMapController';
import ConceptMapAuthoringController from './conceptMapAuthoringController';

let conceptMapAuthoringComponentModule = angular.module('conceptMapAuthoringComponentModule', [
    'pascalprecht.translate'
  ])
  .service('ConceptMapService', ConceptMapService)
  .controller('ConceptMapController', ConceptMapController)
  .controller('ConceptMapAuthoringController', ConceptMapAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/conceptMap/i18n');
    }
  ]);

export default conceptMapAuthoringComponentModule;
