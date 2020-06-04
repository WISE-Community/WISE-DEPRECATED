'use strict';

import ClassResponse from './classResponse';
import ClassResponseController from './classResponseController';
import DiscussionService from './discussionService';
import DiscussionController from './discussionController';
import * as angular from 'angular';

const discussionComponentModule = angular
  .module('discussionComponentModule', ['pascalprecht.translate'])
  .service('DiscussionService', DiscussionService)
  .controller('DiscussionController', DiscussionController)
  .controller('ClassResponseController', ClassResponseController)
  .component('classResponse', ClassResponse)
  .config([
    '$translatePartialLoaderProvider',
    $translatePartialLoaderProvider => {
      $translatePartialLoaderProvider.addPart('components/discussion/i18n');
    }
  ]);

export default discussionComponentModule;
