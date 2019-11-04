'use strict';

import GraphService from './graphService';
import GraphController from './graphController';

let graphComponentModule = angular.module('graphComponentModule', [
    'pascalprecht.translate'
  ])
  .service('GraphService', GraphService)
  .controller('GraphController', GraphController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/graph/i18n');
    }
  ]);

export default graphComponentModule;
