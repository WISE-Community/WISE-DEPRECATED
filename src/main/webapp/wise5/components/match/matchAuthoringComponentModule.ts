'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { MatchService } from './matchService';
import MatchAuthoring from './matchAuthoring';

let matchAuthoringComponentModule = angular
  .module('matchAuthoringComponentModule', ['pascalprecht.translate'])
  .service('MatchService', downgradeInjectable(MatchService))
  .component('matchAuthoring', MatchAuthoring)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/match/i18n');
    }
  ]);

export default matchAuthoringComponentModule;
