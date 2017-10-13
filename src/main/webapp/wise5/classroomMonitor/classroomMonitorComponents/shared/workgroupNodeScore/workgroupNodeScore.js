"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var WorkgroupNodeScore = {
    bindings: {
        score: '@',
        maxScore: '@'
    },
    template: '<div layout="row" layout-align="center center">\n            <span class="md-display-1">{{$ctrl.score}}</span>&nbsp;<span class="md-title text-secondary normal">/{{$ctrl.maxScore}}</span>\n        </div>'
};

exports.default = WorkgroupNodeScore;
//# sourceMappingURL=workgroupNodeScore.js.map