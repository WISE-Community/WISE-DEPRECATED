'use strict';

import HTMLService from './htmlService';
import HTMLController from './htmlController';

let htmlComponentModule = angular.module('htmlComponentModule', [])
  .service(HTMLService.name, HTMLService)
  .controller(HTMLController.name, HTMLController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/html/i18n');
    }
  ]);

export default htmlComponentModule;
