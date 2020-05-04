'use strict';

import * as angular from 'angular';
import ClassResponse from './classResponse';
import ClassResponseController from './classResponseController';
import DiscussionService from './discussionService';
import DiscussionController from './discussionController';
import DiscussionAuthoringController from './discussionAuthoringController';

const discussionAuthoringComponentModule = angular
  .module('discussionAuthoringComponentModule', ['pascalprecht.translate'])
  .service('DiscussionService', DiscussionService)
  .controller('DiscussionController', DiscussionController)
  .controller('DiscussionAuthoringController', DiscussionAuthoringController)
  .controller('ClassResponseController', ClassResponseController)
  .component('classResponse', ClassResponse)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/discussion/i18n');
    }
  ]);

export default discussionAuthoringComponentModule;
