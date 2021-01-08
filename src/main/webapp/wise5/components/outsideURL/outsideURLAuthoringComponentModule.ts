'use strict';

import * as angular from 'angular';
import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { OutsideURLService } from './outsideURLService';
import { EditOutsideUrlAdvancedComponent } from './edit-outside-url-advanced/edit-outside-url-advanced.component';
import { OutsideUrlAuthoring } from './outside-url-authoring/outside-url-authoring.component';

const outsideURLAuthoringComponentModule = angular
  .module('outsideURLAuthoringComponentModule', [])
  .service('OutsideURLService', downgradeInjectable(OutsideURLService))
  .directive(
    'outsideUrlAuthoring',
    downgradeComponent({ component: OutsideUrlAuthoring }) as angular.IDirectiveFactory
  )
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
