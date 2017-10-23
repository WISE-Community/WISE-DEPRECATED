'use strict';

import LabelService from './labelService';
import LabelController from './labelController';

let labelComponentModule = angular.module('labelComponentModule', [
    'pascalprecht.translate'
  ])
  .service(LabelService.name, LabelService)
  .controller(LabelController.name, LabelController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/label/i18n');
    }
  ]);

export default labelComponentModule;
