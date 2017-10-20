'use strict';

import OpenResponseService from './openResponseService';
import OpenResponseController from './openResponseController';

let openResponseComponentModule = angular.module('openResponseComponentModule', [
    'pascalprecht.translate'
  ])
  .service(OpenResponseService.name, OpenResponseService)
  .controller(OpenResponseController.name, OpenResponseController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/openResponse/i18n');
    }
  ]);

export default openResponseComponentModule;
