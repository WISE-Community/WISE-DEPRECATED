'use strict';

import HTMLService from './htmlService';
import HTMLController from './htmlController';

const htmlComponentModule = angular.module('htmlComponentModule', [])
  .service('HTMLService', HTMLService)
  .controller('HTMLController', HTMLController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/html/i18n');
    }
  ]);

export default htmlComponentModule;
