'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { MultipleChoiceService } from './multipleChoiceService';
import MultipleChoiceController from './multipleChoiceController';
import MultipleChoiceAuthoringController from './multipleChoiceAuthoringController';

const multipleChoiceAuthoringComponentModule = angular
  .module('multipleChoiceAuthoringComponentModule', ['pascalprecht.translate'])
  .service('MultipleChoiceService', downgradeInjectable(MultipleChoiceService))
  .controller('MultipleChoiceController', MultipleChoiceController)
  .controller('MultipleChoiceAuthoringController', MultipleChoiceAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/multipleChoice/i18n');
    }
  ]);

export default multipleChoiceAuthoringComponentModule;
