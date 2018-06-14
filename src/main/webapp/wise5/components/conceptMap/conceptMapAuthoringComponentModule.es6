'use strict';

import ConceptMapService from './conceptMapService';
import ConceptMapController from './conceptMapController';
import ConceptMapAuthoringController from './conceptMapAuthoringController';

let conceptMapAuthoringComponentModule = angular.module('conceptMapAuthoringComponentModule', [
    'pascalprecht.translate'
  ])
  .service(ConceptMapService.name, ConceptMapService)
  .controller(ConceptMapController.name, ConceptMapController)
  .controller(ConceptMapAuthoringController.name, ConceptMapAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/conceptMap/i18n');
    }
  ]);

export default conceptMapAuthoringComponentModule;
