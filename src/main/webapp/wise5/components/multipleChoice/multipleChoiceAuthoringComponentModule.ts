'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { MultipleChoiceService } from './multipleChoiceService';
import MultipleChoiceAuthoring from './multipleChoiceAuthoring';
import { EditMultipleChoiceAdvancedComponent } from './edit-multiple-choice-advanced/edit-multiple-choice-advanced.component';

const multipleChoiceAuthoringComponentModule = angular
  .module('multipleChoiceAuthoringComponentModule', ['pascalprecht.translate'])
  .service('MultipleChoiceService', downgradeInjectable(MultipleChoiceService))
  .component('multipleChoiceAuthoring', MultipleChoiceAuthoring)
  .component('editMultipleChoiceAdvanced', EditMultipleChoiceAdvancedComponent)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/multipleChoice/i18n');
    }
  ]);

export default multipleChoiceAuthoringComponentModule;
