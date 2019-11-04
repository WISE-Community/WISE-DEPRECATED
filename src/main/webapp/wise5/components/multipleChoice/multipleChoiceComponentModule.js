'use strict';

import MultipleChoiceService from './multipleChoiceService';
import MultipleChoiceController from './multipleChoiceController';

let multipleChoiceComponentModule = angular.module('multipleChoiceComponentModule', [
    'pascalprecht.translate'
  ])
  .service('MultipleChoiceService', MultipleChoiceService)
  .controller('MultipleChoiceController', MultipleChoiceController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/multipleChoice/i18n');
    }
  ]);

export default multipleChoiceComponentModule;
