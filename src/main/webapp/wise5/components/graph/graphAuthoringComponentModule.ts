'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { GraphService } from './graphService';
import GraphAuthoring from './graphAuthoring';
import { EditGraphAdvancedComponent } from './edit-graph-advanced/edit-graph-advanced.component';

const graphAuthoringComponentModule = angular
  .module('graphAuthoringComponentModule', ['pascalprecht.translate'])
  .service('GraphService', downgradeInjectable(GraphService))
  .component('graphAuthoring', GraphAuthoring)
  .component('editGraphAdvanced', EditGraphAdvancedComponent)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/graph/i18n');
    }
  ]);

export default graphAuthoringComponentModule;
