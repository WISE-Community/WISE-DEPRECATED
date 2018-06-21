'use strict';

import GraphService from './graphService';
import GraphController from './graphController';
import GraphAuthoringController from './graphAuthoringController';

let graphAuthoringComponentModule = angular.module('graphAuthoringComponentModule', [
  'pascalprecht.translate'
])
  .service(GraphService.name, GraphService)
  .controller(GraphController.name, GraphController)
  .controller(GraphAuthoringController.name, GraphAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/graph/i18n');
    }
  ]);

export default graphAuthoringComponentModule;
