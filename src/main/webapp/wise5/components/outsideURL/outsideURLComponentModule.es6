'use strict';

import OutsideURLService from './outsideURLService';
import OutsideURLController from './outsideURLController';

let outsideURLComponentModule = angular.module('outsideURLComponentModule', [])
    .service(OutsideURLService.name, OutsideURLService)
    .controller(OutsideURLController.name, OutsideURLController);

export default outsideURLComponentModule;
