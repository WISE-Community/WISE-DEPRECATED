'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { MultipleChoiceService } from './multipleChoiceService';
import MultipleChoiceController from './multipleChoiceController';
import { EditMultipleChoiceAdvancedComponent } from './edit-multiple-choice-advanced/edit-multiple-choice-advanced.component';

let multipleChoiceComponentModule = angular
  .module('multipleChoiceComponentModule', ['pascalprecht.translate'])
  .service('MultipleChoiceService', downgradeInjectable(MultipleChoiceService))
  .component('editMultipleChoiceAdvanced', EditMultipleChoiceAdvancedComponent)
  .controller('MultipleChoiceController', MultipleChoiceController)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/multipleChoice/i18n');
    }
  ]);

export default multipleChoiceComponentModule;
