'use strict';

import  { ClassResponseController, ClassResponseComponentOptions } from './classResponse';
import DiscussionService from './discussionService';
import DiscussionController from './discussionController';

let discussionComponentModule = angular.module('discussionComponentModule', [])
    .service(DiscussionService.name, DiscussionService)
    .controller(DiscussionController.name, DiscussionController)
    .controller(ClassResponseController.name, ClassResponseController)
    .component('classResponse', ClassResponseComponentOptions);

export default discussionComponentModule;
