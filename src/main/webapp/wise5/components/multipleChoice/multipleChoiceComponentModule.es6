'use strict';

import MultipleChoiceService from './multipleChoiceService';
import MultipleChoiceController from './multipleChoiceController';

let multipleChoiceComponentModule = angular.module('multipleChoiceComponentModule', [
    'pascalprecht.translate'
  ])
  .service(MultipleChoiceService.name, MultipleChoiceService)
  .controller(MultipleChoiceController.name, MultipleChoiceController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/multipleChoice/i18n');
    }
  ]);

export default multipleChoiceComponentModule;
