'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { GraphService } from './graphService';
import GraphAuthoring from './graphAuthoring';

const graphAuthoringComponentModule = angular
  .module('graphAuthoringComponentModule', ['pascalprecht.translate'])
  .service('GraphService', downgradeInjectable(GraphService))
  .component('graphAuthoring', GraphAuthoring)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/graph/i18n');
    }
  ]);

export default graphAuthoringComponentModule;
