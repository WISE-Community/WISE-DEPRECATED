'use strict';

import MatchService from './matchService';
import MatchController from './matchController';

let matchComponentModule = angular.module('matchComponentModule', [
        'pascalprecht.translate'
    ])
    .service(MatchService.name, MatchService)
    .controller(MatchController.name, MatchController)
    .config([
        '$translatePartialLoaderProvider',
        ($translatePartialLoaderProvider) => {
            $translatePartialLoaderProvider.addPart('components/match/i18n');
        }
    ]);

export default matchComponentModule;
