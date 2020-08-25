'use strict';

const WorkgroupProgress = {
  bindings: {
    color: '@',
    completion: '<',
    displayNames: '@',
    maxScore: '<',
    numberOfStudents: '<',
    score: '<'
  },
  template: `<div class="accent-1" layout="row" layout-align="center center" layout-wrap>
            <div><md-icon class="md-36 hide-xs" style="color: {{ $ctrl.color }};"> account_circle </md-icon></div>
            <div class="content-head__item md-title">
                {{ $ctrl.numberOfStudents }}
                <span class="md-caption more-info">
                    <ng-pluralize count="$ctrl.numberOfStudents"
                        when="{'0': '{{ &quot;students_0&quot; | translate }}',
                            'one': '{{ &quot;students_1&quot; | translate }}',
                            'other': '{{ &quot;students_other&quot; | translate }}'}">
                    </ng-pluralize>
                </span>
                <md-tooltip md-direction="top">{{ $ctrl.displayNames }}</md-tooltip>
            </div>
            <div class="content-head__item md-title">{{ $ctrl.completion.completionPct }}% <span class="md-caption" translate="completion"></span></div>
            <div class="content-head__item md-title"><md-icon class="score md-24 hide-xs">grade</md-icon> {{ $ctrl.score }}/{{ $ctrl.maxScore }} <span class="md-caption" translate="totalScore"></span></div>
        </div>`
};

export default WorkgroupProgress;
