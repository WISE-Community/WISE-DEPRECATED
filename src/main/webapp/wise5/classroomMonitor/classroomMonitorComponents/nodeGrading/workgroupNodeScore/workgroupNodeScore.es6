"use strict";

const WorkgroupNodeScore = {
    bindings: {
        score: '@',
        maxScore: '@'
    },
    template:
        `<div layout="row" layout-align="center center">
            <span class="md-display-1">{{$ctrl.score}}</span>&nbsp;<span class="md-title text-secondary normal">/{{$ctrl.maxScore}}</span>
        </div>`
};

export default WorkgroupNodeScore;
