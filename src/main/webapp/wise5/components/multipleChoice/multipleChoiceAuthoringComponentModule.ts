'use strict';

import * as angular from 'angular';
import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { MultipleChoiceService } from './multipleChoiceService';
import { EditMultipleChoiceAdvancedComponent } from './edit-multiple-choice-advanced/edit-multiple-choice-advanced.component';
import { MultipleChoiceAuthoring } from './multiple-choice-authoring/multiple-choice-authoring.component';

const multipleChoiceAuthoringComponentModule = angular
  .module('multipleChoiceAuthoringComponentModule', ['pascalprecht.translate'])
  .service('MultipleChoiceService', downgradeInjectable(MultipleChoiceService))
  .directive(
    'multipleChoiceAuthoring',
    downgradeComponent({ component: MultipleChoiceAuthoring }) as angular.IDirectiveFactory
  )
  .component('editMultipleChoiceAdvanced', EditMultipleChoiceAdvancedComponent)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/multipleChoice/i18n');
    }
  ]);

export default multipleChoiceAuthoringComponentModule;
