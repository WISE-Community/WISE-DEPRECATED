'use strict';

import DiscussionService from './discussionService';
import DiscussionController from './discussionController';

let discussionComponentModule = angular.module('discussionComponentModule', [])
    .service(DiscussionService.name, DiscussionService)
    .controller(DiscussionController.name, DiscussionController);

export default discussionComponentModule;
