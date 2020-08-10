'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import ClassResponseController from './classResponseController';
import { DiscussionService } from './discussionService';
import DiscussionController from './discussionController';
import DiscussionAuthoringController from './discussionAuthoringController';

const discussionAuthoringComponentModule = angular
  .module('discussionAuthoringComponentModule', ['pascalprecht.translate'])
  .service('DiscussionService', downgradeInjectable(DiscussionService))
  .controller('DiscussionController', DiscussionController)
  .controller('DiscussionAuthoringController', DiscussionAuthoringController)
  .controller('ClassResponseController', ClassResponseController)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/discussion/i18n');
    }
  ]);

export default discussionAuthoringComponentModule;
