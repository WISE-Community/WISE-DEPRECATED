'use strict';

import * as angular from 'angular';
import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { LabelService } from './labelService';
import { EditLabelAdvancedComponent } from './edit-label-advanced/edit-label-advanced.component';
import { LabelAuthoring } from './label-authoring/label-authoring.component';

const labelAuthoringComponentModule = angular
  .module('labelAuthoringComponentModule', ['pascalprecht.translate'])
  .service('LabelService', downgradeInjectable(LabelService))
  .directive(
    'labelAuthoring',
    downgradeComponent({ component: LabelAuthoring }) as angular.IDirectiveFactory
  )
  .component('editLabelAdvanced', EditLabelAdvancedComponent)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/label/i18n');
    }
  ]);

export default labelAuthoringComponentModule;
