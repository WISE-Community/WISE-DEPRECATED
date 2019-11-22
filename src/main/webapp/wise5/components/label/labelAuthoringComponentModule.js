'use strict';

import LabelService from './labelService';
import LabelController from './labelController';
import LabelAuthoringController from './labelAuthoringController';

let labelAuthoringComponentModule = angular.module('labelAuthoringComponentModule', [
  'pascalprecht.translate'
])
  .service('LabelService', LabelService)
  .controller('LabelController', LabelController)
  .controller('LabelAuthoringController', LabelAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/label/i18n');
    }
  ]);

export default labelAuthoringComponentModule;
