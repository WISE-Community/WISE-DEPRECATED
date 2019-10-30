'use strict';

import OpenResponseService from './openResponseService';
import OpenResponseController from './openResponseController';

const openResponseComponentModule = angular.module('openResponseComponentModule', [
    'pascalprecht.translate'
  ])
  .service('OpenResponseService', OpenResponseService)
  .controller('OpenResponseController', OpenResponseController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/openResponse/i18n');
    }
  ]);

export default openResponseComponentModule;
