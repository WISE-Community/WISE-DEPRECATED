'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { LabelService } from './labelService';
import LabelController from './labelController';

let labelComponentModule = angular
  .module('labelComponentModule', ['pascalprecht.translate'])
  .service('LabelService', downgradeInjectable(LabelService))
  .controller('LabelController', LabelController)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/label/i18n');
    }
  ]);

export default labelComponentModule;
