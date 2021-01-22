'use strict';

import * as angular from 'angular';
import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { HTMLService } from './htmlService';
import { EditHTMLAdvancedComponent } from './edit-html-advanced/edit-html-advanced.component';
import { HtmlAuthoring } from './html-authoring/html-authoring.component';

const htmlComponentModule = angular
  .module('htmlAuthoringComponentModule', [])
  .service('HTMLService', downgradeInjectable(HTMLService))
  .directive(
    'htmlAuthoring',
    downgradeComponent({ component: HtmlAuthoring }) as angular.IDirectiveFactory
  )
  .directive(
    'editHtmlAdvanced',
    downgradeComponent({ component: EditHTMLAdvancedComponent }) as angular.IDirectiveFactory
  )
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/html/i18n');
    }
  ]);

export default htmlComponentModule;
