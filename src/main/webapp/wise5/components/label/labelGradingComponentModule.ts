'use strict';

import * as angular from 'angular';
import { downgradeComponent } from '@angular/upgrade/static';
import { LabelGrading } from './label-grading/label-grading.component';

const labelGradingComponentModule = angular
  .module('labelGradingComponentModule', ['pascalprecht.translate'])
  .directive(
    'labelGrading',
    downgradeComponent({ component: LabelGrading }) as angular.IDirectiveFactory
  );

export default labelGradingComponentModule;
