'use strict';

import GraphService from './graphService';
import GraphController from './graphController';
import GraphAuthoringController from './graphAuthoringController';

let graphAuthoringComponentModule = angular.module('graphAuthoringComponentModule', [
  'pascalprecht.translate'
])
  .service('GraphService', GraphService)
  .controller('GraphController', GraphController)
  .controller('GraphAuthoringController', GraphAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/graph/i18n');
    }
  ]);

export default graphAuthoringComponentModule;
