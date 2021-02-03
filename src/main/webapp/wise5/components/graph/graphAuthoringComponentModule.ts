'use strict';

import * as angular from 'angular';
import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { GraphService } from './graphService';
import { EditGraphAdvancedComponent } from './edit-graph-advanced/edit-graph-advanced.component';
import { GraphAuthoring } from './graph-authoring/graph-authoring.component';

const graphAuthoringComponentModule = angular
  .module('graphAuthoringComponentModule', ['pascalprecht.translate'])
  .service('GraphService', downgradeInjectable(GraphService))
  .directive(
    'graphAuthoring',
    downgradeComponent({ component: GraphAuthoring }) as angular.IDirectiveFactory
  )
  .component('editGraphAdvanced', EditGraphAdvancedComponent)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/graph/i18n');
    }
  ]);

export default graphAuthoringComponentModule;
