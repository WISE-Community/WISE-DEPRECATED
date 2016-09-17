'use strict';

import DrawService from './drawService';
import DrawController from './drawController';

let drawComponentModule = angular.module('drawComponentModule', [])
    .service(DrawService.name, DrawService)
    .controller(DrawController.name, DrawController);

export default drawComponentModule;
