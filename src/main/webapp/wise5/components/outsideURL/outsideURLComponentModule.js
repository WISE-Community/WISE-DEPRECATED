'use strict';

import OutsideURLService from './outsideURLService';
import OutsideURLController from './outsideURLController';

let outsideURLComponentModule = angular.module('outsideURLComponentModule', [])
  .service('OutsideURLService', OutsideURLService)
  .controller('OutsideURLController', OutsideURLController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/outsideURL/i18n');
    }
  ]);

export default outsideURLComponentModule;
