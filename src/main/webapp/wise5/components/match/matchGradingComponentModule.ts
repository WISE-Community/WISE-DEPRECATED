'use strict';

import * as angular from 'angular';
import { downgradeComponent } from '@angular/upgrade/static';
import { MatchGrading } from './match-grading/match-grading.component';

const matchGradingComponentModule = angular
  .module('matchGradingComponentModule', ['pascalprecht.translate'])
  .directive(
    'matchGrading',
    downgradeComponent({ component: MatchGrading }) as angular.IDirectiveFactory
  );

export default matchGradingComponentModule;
