'use strict';

import GraphService from './graphService';
import GraphController from './graphController';

let graphComponentModule = angular.module('graphComponentModule', [
        'pascalprecht.translate'
    ])
    .service(GraphService.name, GraphService)
    .controller(GraphController.name, GraphController)
    .config([
        '$translatePartialLoaderProvider',
        ($translatePartialLoaderProvider) => {
            $translatePartialLoaderProvider.addPart('components/graph/i18n');
        }
    ]);

export default graphComponentModule;
