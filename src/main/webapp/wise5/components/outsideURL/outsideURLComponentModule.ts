'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { OutsideURLService } from './outsideURLService';
import OutsideURLController from './outsideURLController';

let outsideURLComponentModule = angular
  .module('outsideURLComponentModule', [])
  .service('OutsideURLService', downgradeInjectable(OutsideURLService))
  .controller('OutsideURLController', OutsideURLController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/outsideURL/i18n');
    }
  ]);

export default outsideURLComponentModule;
