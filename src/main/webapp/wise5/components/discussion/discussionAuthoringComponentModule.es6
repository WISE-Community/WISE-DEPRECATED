'use strict';

import  { ClassResponseController, ClassResponseComponentOptions } from './classResponse';
import DiscussionService from './discussionService';
import DiscussionController from './discussionController';
import DiscussionAuthoringController from './discussionAuthoringController';

let discussionAuthoringComponentModule = angular.module('discussionAuthoringComponentModule', [
  'pascalprecht.translate'
])
  .service(DiscussionService.name, DiscussionService)
  .controller(DiscussionController.name, DiscussionController)
  .controller(DiscussionAuthoringController.name, DiscussionAuthoringController)
  .controller(ClassResponseController.name, ClassResponseController)
  .component('classResponse', ClassResponseComponentOptions)
  .config([
    '$translatePartialLoaderProvider',
    ($translatePartialLoaderProvider) => {
      $translatePartialLoaderProvider.addPart('components/discussion/i18n');
    }
  ]);

export default discussionAuthoringComponentModule;
