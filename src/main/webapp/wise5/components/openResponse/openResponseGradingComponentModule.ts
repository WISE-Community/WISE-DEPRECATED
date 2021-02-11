'use strict';

import * as angular from 'angular';
import { downgradeComponent } from '@angular/upgrade/static';
import { OpenResponseGrading } from './open-response-grading/open-response-grading.component';

const openResponseGradingComponentModule = angular
  .module('openResponseGradingComponentModule', ['pascalprecht.translate'])
  .directive(
    'openResponseGrading',
    downgradeComponent({ component: OpenResponseGrading }) as angular.IDirectiveFactory
  );

export default openResponseGradingComponentModule;
