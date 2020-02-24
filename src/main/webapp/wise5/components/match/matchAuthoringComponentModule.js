'use strict';

import MatchService from './matchService';
import MatchController from './matchController';
import MatchAuthoringController from './matchAuthoringController';

let matchAuthoringComponentModule = angular.module('matchAuthoringComponentModule', [
  'pascalprecht.translate'
])
  .service('MatchService', MatchService)
  .controller('MatchController', MatchController)
  .controller('MatchAuthoringController', MatchAuthoringController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/match/i18n');
    }
  ]);

export default matchAuthoringComponentModule;
