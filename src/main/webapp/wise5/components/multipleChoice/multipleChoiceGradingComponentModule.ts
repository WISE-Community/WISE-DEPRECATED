'use strict';

import * as angular from 'angular';
import { downgradeComponent } from '@angular/upgrade/static';
import { MultipleChoiceGrading } from './multiple-choice-grading/multiple-choice-grading.component';

const multipleChoiceGradingComponentModule = angular
  .module('multipleChoiceGradingComponentModule', ['pascalprecht.translate'])
  .directive(
    'multipleChoiceGrading',
    downgradeComponent({ component: MultipleChoiceGrading }) as angular.IDirectiveFactory
  );

export default multipleChoiceGradingComponentModule;
