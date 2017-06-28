'use strict';

import MilestoneDetails from './milestoneDetails/milestoneDetails';
import MilestoneEdit from './milestoneEdit/milestoneEdit';

let Milestones = angular.module('milestones', []);

Milestones.component('milestoneDetails', MilestoneDetails);
Milestones.component('milestoneEdit', MilestoneEdit);

export default Milestones;
