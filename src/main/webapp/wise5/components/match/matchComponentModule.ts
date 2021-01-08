'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { MatchService } from './matchService';
import MatchController from './matchController';

let matchComponentModule = angular
  .module('matchComponentModule', ['pascalprecht.translate'])
  .service('MatchService', downgradeInjectable(MatchService))
  .controller('MatchController', MatchController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/match/i18n');
    }
  ]);

export default matchComponentModule;
