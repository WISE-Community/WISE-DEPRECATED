'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { LabelService } from './labelService';
import LabelAuthoring from './labelAuthoring';

const labelAuthoringComponentModule = angular
  .module('labelAuthoringComponentModule', ['pascalprecht.translate'])
  .service('LabelService', downgradeInjectable(LabelService))
  .component('labelAuthoring', LabelAuthoring)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/label/i18n');
    }
  ]);

export default labelAuthoringComponentModule;
