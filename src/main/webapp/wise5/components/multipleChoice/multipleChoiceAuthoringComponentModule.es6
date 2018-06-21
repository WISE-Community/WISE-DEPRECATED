'use strict';

import MultipleChoiceService from './multipleChoiceService';
import MultipleChoiceController from './multipleChoiceController';
import MultipleChoiceAuthoringController from './multipleChoiceAuthoringController';

let multipleChoiceAuthoringComponentModule = angular.module('multipleChoiceAuthoringComponentModule', [
  'pascalprecht.translate'
])
  .service(MultipleChoiceService.name, MultipleChoiceService)
  .controller(MultipleChoiceController.name, MultipleChoiceController)
  .controller(MultipleChoiceAuthoringController.name, MultipleChoiceAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/multipleChoice/i18n');
    }
  ]);

export default multipleChoiceAuthoringComponentModule;
