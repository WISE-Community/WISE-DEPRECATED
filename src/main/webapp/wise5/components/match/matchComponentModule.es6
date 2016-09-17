'use strict';

import MatchService from './matchService';
import MatchController from './matchController';

let matchComponentModule = angular.module('matchComponentModule', [])
    .service(MatchService.name, MatchService)
    .controller(MatchController.name, MatchController);

export default matchComponentModule;
