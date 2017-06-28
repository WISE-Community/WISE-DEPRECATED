"use strict";

const ProjectProgress = {
    bindings: {
        completion: '<'
    },
    template:
        `<span layout="row" layout-align="start center">
            <span class="progress-wrapper" tabindex="0">
                <md-progress-linear class="nav-item__progress" md-mode="determinate" value="{{$ctrl.completion}}"></md-progress-linear>
            </span>
            <span class="nav-item__progress-value md-body-2 text-secondary">{{$ctrl.completion}}%</span>
        </span>`
};

export default ProjectProgress;
