'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { GraphService } from './graphService';
import GraphController from './graphController';
import GraphAuthoringController from './graphAuthoringController';

const graphAuthoringComponentModule = angular
  .module('graphAuthoringComponentModule', ['pascalprecht.translate'])
  .service('GraphService', downgradeInjectable(GraphService))
  .controller('GraphController', GraphController)
  .controller('GraphAuthoringController', GraphAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/graph/i18n');
    }
  ]);

export default graphAuthoringComponentModule;
