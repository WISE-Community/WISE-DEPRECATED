'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { ConceptMapService } from './conceptMapService';
import ConceptMapAuthoring from './conceptMapAuthoring';
import { EditConceptMapAdvancedComponent } from './edit-concept-map-advanced/edit-concept-map-advanced.component';

const conceptMapAuthoringComponentModule = angular
  .module('conceptMapAuthoringComponentModule', ['pascalprecht.translate'])
  .service('ConceptMapService', downgradeInjectable(ConceptMapService))
  .component('conceptMapAuthoring', ConceptMapAuthoring)
  .component('editConceptMapAdvanced', EditConceptMapAdvancedComponent)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/conceptMap/i18n');
    }
  ]);

export default conceptMapAuthoringComponentModule;
