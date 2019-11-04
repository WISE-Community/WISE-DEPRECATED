'use strict';

import MatchService from './matchService';
import MatchController from './matchController';

let matchComponentModule = angular.module('matchComponentModule', [
    'pascalprecht.translate'
  ])
  .service('MatchService', MatchService)
  .controller('MatchController', MatchController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/match/i18n');
    }
  ]);

export default matchComponentModule;
