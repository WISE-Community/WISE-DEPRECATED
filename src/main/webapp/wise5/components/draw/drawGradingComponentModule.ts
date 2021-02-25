'use strict';

import * as angular from 'angular';
import { downgradeComponent } from '@angular/upgrade/static';
import { DrawGrading } from './draw-grading/draw-grading.component';

const drawGradingComponentModule = angular
  .module('drawGradingComponentModule', ['pascalprecht.translate'])
  .directive(
    'drawGrading',
    downgradeComponent({ component: DrawGrading }) as angular.IDirectiveFactory
  );

export default drawGradingComponentModule;
