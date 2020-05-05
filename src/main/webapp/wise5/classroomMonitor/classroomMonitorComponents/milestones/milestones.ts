'use strict';

import MilestoneDetails from './milestoneDetails/milestoneDetails';
import MilestoneEdit from './milestoneEdit/milestoneEdit';
import * as angular from 'angular';

const Milestones = angular
  .module('milestones', [])
  .component('milestoneDetails', MilestoneDetails)
  .component('milestoneEdit', MilestoneEdit);

export default Milestones;
