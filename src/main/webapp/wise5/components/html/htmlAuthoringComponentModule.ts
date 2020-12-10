'use strict';

import * as angular from 'angular';
import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { HTMLService } from './htmlService';
import HTMLAuthoring from './htmlAuthoring';
import { EditHTMLAdvancedComponent } from './edit-html-advanced/edit-html-advanced.component';

const htmlComponentModule = angular.module('htmlAuthoringComponentModule', [])
  .service('HTMLService', downgradeInjectable(HTMLService))
  .component('htmlAuthoring', HTMLAuthoring)
  .directive('editHtmlAdvanced', downgradeComponent(
      { component: EditHTMLAdvancedComponent }) as angular.IDirectiveFactory)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/html/i18n');
    }
  ]);

export default htmlComponentModule;
