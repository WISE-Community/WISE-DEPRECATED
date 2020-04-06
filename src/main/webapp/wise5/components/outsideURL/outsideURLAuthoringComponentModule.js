'use strict';

import OutsideURLService from './outsideURLService';
import OutsideURLController from './outsideURLController';
import OutsideURLAuthoringController from './outsideURLAuthoringController';

const outsideURLAuthoringComponentModule = angular
  .module('outsideURLAuthoringComponentModule', [])
  .service('OutsideURLService', OutsideURLService)
  .controller('OutsideURLController', OutsideURLController)
  .controller('OutsideURLAuthoringController', OutsideURLAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/outsideURL/i18n');
    }
  ]);

export default outsideURLAuthoringComponentModule;
