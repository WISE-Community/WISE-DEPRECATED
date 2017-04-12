"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var WorkgroupProgress = {
    bindings: {
        color: '@',
        completion: '<',
        displayNames: '@',
        maxScore: '<',
        numberOfStudents: '<',
        score: '<'
    },
    template: '<div class="accent-2" layout="row" layout-align="center center" layout-wrap>\n            <div><md-icon class="md-36 hide-xs" style="color: {{ $ctrl.color }};"> account_circle </md-icon></div>\n            <div class="content-head__item md-title">\n                {{ $ctrl.numberOfStudents }}\n                <span class="md-caption more-info">\n                    <ng-pluralize count="$ctrl.numberOfStudents"\n                        when="{\'0\': \'{{ &quot;students_0&quot; | translate }}\',\n                            \'one\': \'{{ &quot;students_1&quot; | translate }}\',\n                            \'other\': \'{{ &quot;students_other&quot; | translate }}\'}">\n                    </ng-pluralize>\n                </span>\n                <md-tooltip md-direction="top">{{ $ctrl.displayNames }}</md-tooltip>\n            </div>\n            <div class="content-head__item md-title">{{ $ctrl.completion.completionPct }}% <span class="md-caption" translate="completion"></span></div>\n            <div class="content-head__item md-title"><md-icon class="score md-24 hide-xs">grade</md-icon> {{ $ctrl.score }}/{{ $ctrl.maxScore }} <span class="md-caption" translate="totalScore"></span></div>\n        </div>'
};

exports.default = WorkgroupProgress;
//# sourceMappingURL=workgroupProgress.js.map