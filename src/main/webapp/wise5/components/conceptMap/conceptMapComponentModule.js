'use strict';

import ConceptMapService from './conceptMapService';
import ConceptMapController from './conceptMapController';

let conceptMapComponentModule = angular.module('conceptMapComponentModule', [
    'pascalprecht.translate'
  ])
  .service('ConceptMapService', ConceptMapService)
  .controller('ConceptMapController', ConceptMapController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/conceptMap/i18n');
    }
  ]);

export default conceptMapComponentModule;
