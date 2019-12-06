'use strict';

import LabelService from './labelService';
import LabelController from './labelController';

let labelComponentModule = angular.module('labelComponentModule', [
    'pascalprecht.translate'
  ])
  .service('LabelService', LabelService)
  .controller('LabelController', LabelController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/label/i18n');
    }
  ]);

export default labelComponentModule;
