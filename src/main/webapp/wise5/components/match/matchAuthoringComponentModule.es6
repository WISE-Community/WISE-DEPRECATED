'use strict';

import MatchService from './matchService';
import MatchController from './matchController';
import MatchAuthoringController from './matchAuthoringController';

let matchAuthoringComponentModule = angular.module('matchAuthoringComponentModule', [
  'pascalprecht.translate'
])
  .service(MatchService.name, MatchService)
  .controller(MatchController.name, MatchController)
  .controller(MatchAuthoringController.name, MatchAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/match/i18n');
    }
  ]);

export default matchAuthoringComponentModule;
