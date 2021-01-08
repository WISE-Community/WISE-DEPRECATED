'use strict';

import * as angular from 'angular';
import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { OutsideURLService } from './outsideURLService';
import OutsideURLAuthoring from './outsideURLAuthoring';
import { EditOutsideUrlAdvancedComponent } from './edit-outside-url-advanced/edit-outside-url-advanced.component';

const outsideURLAuthoringComponentModule = angular
  .module('outsideURLAuthoringComponentModule', [])
  .service('OutsideURLService', downgradeInjectable(OutsideURLService))
  .component('outsideUrlAuthoring', OutsideURLAuthoring)
  .directive(
    'editOutsideUrlAdvanced',
    downgradeComponent({ component: EditOutsideUrlAdvancedComponent }) as angular.IDirectiveFactory
  )
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/outsideURL/i18n');
    }
  ]);

export default outsideURLAuthoringComponentModule;
