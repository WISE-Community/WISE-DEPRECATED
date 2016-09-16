'use strict';

import ConceptMapService from './conceptMapService';
import ConceptMapController from './conceptMapController';

let conceptMapComponentModule = angular.module('conceptMapComponentModule', [])
    .service(ConceptMapService.name, ConceptMapService)
    .controller(ConceptMapController.name, ConceptMapController);

export default conceptMapComponentModule;
