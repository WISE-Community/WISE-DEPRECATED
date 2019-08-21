'use strict';

import  { ClassResponseController, ClassResponseComponentOptions } from './classResponse';
import DiscussionService from './discussionService';
import DiscussionController from './discussionController';

let discussionComponentModule = angular.module('discussionComponentModule', [
    'pascalprecht.translate'
  ])
  .service('DiscussionService', DiscussionService)
  .controller('DiscussionController', DiscussionController)
  .controller('ClassResponseController', ClassResponseController)
  .component('classResponse', ClassResponseComponentOptions)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/discussion/i18n');
    }
  ]);

export default discussionComponentModule;
