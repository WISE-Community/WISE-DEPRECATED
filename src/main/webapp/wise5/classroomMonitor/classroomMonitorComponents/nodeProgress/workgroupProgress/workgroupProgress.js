"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var WorkgroupProgress = {
    bindings: {
        completion: '<',
        maxScore: '<',
        score: '<'
    },
    template: '<div class="accent-2" layout="row" layout-align="center center" layout-wrap>\n            <div class="content-head__item md-title">{{$ctrl.completion.completionPct}}% <span class="md-caption" translate="completion"></span></div>\n            <div class="content-head__item md-title"><md-icon class="score md-24">grade</md-icon> {{$ctrl.score}}/{{$ctrl.maxScore}} <span class="md-caption" translate="totalScore"></span></div>\n        </div>'
};

exports.default = WorkgroupProgress;
//# sourceMappingURL=workgroupProgress.js.map