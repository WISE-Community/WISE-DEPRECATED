'use strict';

const ProjectProgress = {
  bindings: {
    completed: '<',
    total: '<',
    percent: '<'
  },
  template: `<span layout="row" layout-align="start center">
            <span class="progress-wrapper" tabindex="0">
                <md-progress-linear class="nav-item__progress" md-mode="determinate" value="{{ $ctrl.percent }}"></md-progress-linear>
                <md-tooltip md-direction="top">
                    <span translate="completedStepsWithWork" translate-values="{ 'completed': $ctrl.completed, 'total': $ctrl.total }" />
                </md-tooltip>
            </span>
            <span class="nav-item__progress-value md-body-2 text-secondary">{{ $ctrl.percent }}%</span>
        </span>`
};

export default ProjectProgress;
