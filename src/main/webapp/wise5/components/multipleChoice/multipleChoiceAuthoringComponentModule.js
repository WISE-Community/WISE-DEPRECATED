'use strict';

import MultipleChoiceService from './multipleChoiceService';
import MultipleChoiceController from './multipleChoiceController';
import MultipleChoiceAuthoringController from './multipleChoiceAuthoringController';

let multipleChoiceAuthoringComponentModule = angular.module('multipleChoiceAuthoringComponentModule', [
  'pascalprecht.translate'
])
  .service('MultipleChoiceService', MultipleChoiceService)
  .controller('MultipleChoiceController', MultipleChoiceController)
  .controller('MultipleChoiceAuthoringController', MultipleChoiceAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/multipleChoice/i18n');
    }
  ]);

export default multipleChoiceAuthoringComponentModule;
