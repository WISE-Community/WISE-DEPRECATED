'use strict';

import OutsideURLService from './outsideURLService';
import OutsideURLController from './outsideURLController';
import OutsideURLAuthoringController from './outsideURLAuthoringController';

let outsideURLAuthoringComponentModule = angular.module('outsideURLAuthoringComponentModule', [])
  .service(OutsideURLService.name, OutsideURLService)
  .controller(OutsideURLController.name, OutsideURLController)
  .controller(OutsideURLAuthoringController.name, OutsideURLAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/outsideURL/i18n');
    }
  ]);

export default outsideURLAuthoringComponentModule;
