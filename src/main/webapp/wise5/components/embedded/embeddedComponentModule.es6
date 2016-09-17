'use strict';

import EmbeddedService from './embeddedService';
import EmbeddedController from './embeddedController';

let embeddedComponentModule = angular.module('embeddedComponentModule', [])
    .service(EmbeddedService.name, EmbeddedService)
    .controller(EmbeddedController.name, EmbeddedController);

export default embeddedComponentModule;
