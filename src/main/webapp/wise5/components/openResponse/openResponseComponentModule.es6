'use strict';

import OpenResponseService from './openResponseService';
import OpenResponseController from './openResponseController';

let openResponseComponentModule = angular.module('openResponseComponentModule', [])
    .service(OpenResponseService.name, OpenResponseService)
    .controller(OpenResponseController.name, OpenResponseController);

export default openResponseComponentModule;
