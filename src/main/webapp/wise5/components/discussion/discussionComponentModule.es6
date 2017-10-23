'use strict';

import  { ClassResponseController, ClassResponseComponentOptions } from './classResponse';
import DiscussionService from './discussionService';
import DiscussionController from './discussionController';

let discussionComponentModule = angular.module('discussionComponentModule', [
    'pascalprecht.translate'
  ])
  .service(DiscussionService.name, DiscussionService)
  .controller(DiscussionController.name, DiscussionController)
  .controller(ClassResponseController.name, ClassResponseController)
  .component('classResponse', ClassResponseComponentOptions)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/discussion/i18n');
    }
  ]);

export default discussionComponentModule;
