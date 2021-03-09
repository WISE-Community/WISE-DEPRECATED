import * as angular from 'angular';
import { downgradeComponent } from '@angular/upgrade/static';
import { ClassResponse } from './class-response.component';

const classResponseComponentModule = angular
  .module('classResponseComponentModule', ['pascalprecht.translate'])
  .directive(
    'classResponse',
    downgradeComponent({ component: ClassResponse }) as angular.IDirectiveFactory
  );

export default classResponseComponentModule;
