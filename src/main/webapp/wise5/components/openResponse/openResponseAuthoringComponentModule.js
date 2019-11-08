'use strict';

import OpenResponseService from './openResponseService';
import OpenResponseController from './openResponseController';
import OpenResponseAuthoringController from './openResponseAuthoringController';

let openResponseAuthoringComponentModule = angular.module('openResponseAuthoringComponentModule', [
  'pascalprecht.translate'
])
  .service('OpenResponseService', OpenResponseService)
  .controller('OpenResponseController', OpenResponseController)
  .controller('OpenResponseAuthoringController', OpenResponseAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/openResponse/i18n');
    }
  ]);

export default openResponseAuthoringComponentModule;
