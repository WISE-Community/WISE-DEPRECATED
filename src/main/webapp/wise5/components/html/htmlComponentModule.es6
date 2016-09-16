'use strict';

import HTMLService from './htmlService';
import HTMLController from './htmlController';

let htmlComponentModule = angular.module('htmlComponentModule', [])
    .service(HTMLService.name, HTMLService)
    .controller(HTMLController.name, HTMLController);

export default htmlComponentModule;
