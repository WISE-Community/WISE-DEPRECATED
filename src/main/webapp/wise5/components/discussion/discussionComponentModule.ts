'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import ClassResponse from './classResponse';
import ClassResponseController from './classResponseController';
import { DiscussionService } from './discussionService';
import DiscussionController from './discussionController';

const discussionComponentModule = angular
  .module('discussionComponentModule', ['pascalprecht.translate'])
  .service('DiscussionService', downgradeInjectable(DiscussionService))
  .controller('DiscussionController', DiscussionController)
  .controller('ClassResponseController', ClassResponseController)
  .component('classResponse', ClassResponse)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/discussion/i18n');
    }
  ]);

export default discussionComponentModule;
