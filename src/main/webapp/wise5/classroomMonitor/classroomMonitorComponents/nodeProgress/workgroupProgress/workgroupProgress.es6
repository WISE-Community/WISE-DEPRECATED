"use strict";

const WorkgroupProgress= {
    bindings: {
        completion: '<',
        maxScore: '<',
        score:'<'
    },
    template:
        `<div class="accent-2" layout="row" layout-align="center center" layout-wrap>
            <div class="content-head__item md-title">{{$ctrl.completion.completionPct}}% <span class="md-caption" translate="completion"></span></div>
            <div class="content-head__item md-title"><md-icon class="score md-24">grade</md-icon> {{$ctrl.score}}/{{$ctrl.maxScore}} <span class="md-caption" translate="totalScore"></span></div>
        </div>`
};

export default WorkgroupProgress;
