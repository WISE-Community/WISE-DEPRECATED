'use strict';

import GraphService from './graphService';
import GraphController from './graphController';

let graphComponentModule = angular.module('graphComponentModule', [])
    .service(GraphService.name, GraphService)
    .controller(GraphController.name, GraphController);

export default graphComponentModule;
