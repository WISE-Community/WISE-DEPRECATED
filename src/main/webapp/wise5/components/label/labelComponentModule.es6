'use strict';

import LabelService from './labelService';
import LabelController from './labelController';

let labelComponentModule = angular.module('labelComponentModule', [])
    .service(LabelService.name, LabelService)
    .controller(LabelController.name, LabelController);

export default labelComponentModule;
