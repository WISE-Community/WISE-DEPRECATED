'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { MatchService } from './matchService';
import MatchAuthoring from './matchAuthoring';
import { EditMatchAdvancedComponent } from './edit-match-advanced/edit-match-advanced.component';

let matchAuthoringComponentModule = angular
  .module('matchAuthoringComponentModule', ['pascalprecht.translate'])
  .service('MatchService', downgradeInjectable(MatchService))
  .component('matchAuthoring', MatchAuthoring)
  .component('editMatchAdvanced', EditMatchAdvancedComponent)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/match/i18n');
    }
  ]);

export default matchAuthoringComponentModule;
