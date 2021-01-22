'use strict';

import * as angular from 'angular';
import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { ConceptMapService } from './conceptMapService';
import { EditConceptMapAdvancedComponent } from './edit-concept-map-advanced/edit-concept-map-advanced.component';
import { ConceptMapAuthoring } from './concept-map-authoring/concept-map-authoring.component';

const conceptMapAuthoringComponentModule = angular
  .module('conceptMapAuthoringComponentModule', ['pascalprecht.translate'])
  .service('ConceptMapService', downgradeInjectable(ConceptMapService))
  .directive(
    'conceptMapAuthoring',
    downgradeComponent({ component: ConceptMapAuthoring }) as angular.IDirectiveFactory
  )
  .component('editConceptMapAdvanced', EditConceptMapAdvancedComponent)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/conceptMap/i18n');
    }
  ]);

export default conceptMapAuthoringComponentModule;
