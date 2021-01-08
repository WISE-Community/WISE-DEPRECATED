'use strict';

import * as angular from 'angular';
import { downgradeInjectable } from '@angular/upgrade/static';
import { DiscussionService } from './discussionService';
import DiscussionAuthoring from './discussionAuthoring';
import { EditDiscussionAdvancedComponent } from './edit-discussion-advanced/edit-discussion-advanced.component';

const discussionAuthoringComponentModule = angular
  .module('discussionAuthoringComponentModule', ['pascalprecht.translate'])
  .service('DiscussionService', downgradeInjectable(DiscussionService))
  .component('discussionAuthoring', DiscussionAuthoring)
  .component('editDiscussionAdvanced', EditDiscussionAdvancedComponent)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/discussion/i18n');
    }
  ]);

export default discussionAuthoringComponentModule;
