'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { OutsideURLService } from './outsideURLService';
import OutsideURLAuthoring from './outsideURLAuthoring';

const outsideURLAuthoringComponentModule = angular
  .module('outsideURLAuthoringComponentModule', [])
  .service('OutsideURLService', downgradeInjectable(OutsideURLService))
  .component('outsideUrlAuthoring', OutsideURLAuthoring)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/outsideURL/i18n');
    }
  ]);

export default outsideURLAuthoringComponentModule;
