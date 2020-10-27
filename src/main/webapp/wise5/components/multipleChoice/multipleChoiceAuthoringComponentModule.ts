'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { MultipleChoiceService } from './multipleChoiceService';
import MultipleChoiceAuthoring from './multipleChoiceAuthoring';

const multipleChoiceAuthoringComponentModule = angular
  .module('multipleChoiceAuthoringComponentModule', ['pascalprecht.translate'])
  .service('MultipleChoiceService', downgradeInjectable(MultipleChoiceService))
  .component('multipleChoiceAuthoring', MultipleChoiceAuthoring)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/multipleChoice/i18n');
    }
  ]);

export default multipleChoiceAuthoringComponentModule;
