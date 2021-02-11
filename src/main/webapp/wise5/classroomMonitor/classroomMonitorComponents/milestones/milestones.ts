'use strict';

import MilestoneDetails from './milestoneDetails/milestoneDetails';
import * as angular from 'angular';

const Milestones = angular.module('milestones', []).component('milestoneDetails', MilestoneDetails);

export default Milestones;
