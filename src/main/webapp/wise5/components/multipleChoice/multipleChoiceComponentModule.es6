'use strict';

import MultipleChoiceService from './multipleChoiceService';
import MultipleChoiceController from './multipleChoiceController';

let multipleChoiceComponentModule = angular.module('multipleChoiceComponentModule', [])
    .service(MultipleChoiceService.name, MultipleChoiceService)
    .controller(MultipleChoiceController.name, MultipleChoiceController);

export default multipleChoiceComponentModule;
