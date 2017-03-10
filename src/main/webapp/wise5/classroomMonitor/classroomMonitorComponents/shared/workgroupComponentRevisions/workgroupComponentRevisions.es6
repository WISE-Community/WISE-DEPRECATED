"use strict";

class WorkgroupComponentRevisionsController {
    constructor(ConfigService,
                TeacherDataService) {
        this.ConfigService = ConfigService;
        this.TeacherDataService = TeacherDataService;

        this.$onInit = () => {
            this.populateData();
        };
    };

    /**
     * Get the component states and annotations for this workgroup and component
     */
    populateData() {
        this.componentStates = this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(this.workgroupId, this.componentId);

        let workgroupAnnotations = this.TeacherDataService.getAnnotationsToWorkgroupId(this.workgroupId);
        let annotations = workgroupAnnotations.filter((annotation) => {
            return annotation.toWorkgroupId === this.workgroupId;
        });

        // create a data object that holds the componentStates and accompanying annotations, keyed by componentState id
        this.data = {};

        // add componentStates to the data object
        let c = this.componentStates.length;
        for (let i = 0; i < c; i++) {
            let componentState = this.componentStates[i];
            let id = componentState.id;
            this.data[id] = {
                clientSaveTime: this.convertToClientTimestamp(componentState.serverSaveTime),
                componentState: componentState,
                annotations: {
                    autoComment: null,
                    autoScore: null,
                    comment: null,
                    score: null
                }
            };
        }

        // add annotations to the data object (only latest of each annotation type for each componentState)
        let a = annotations.length;
        for (let x = 0; x < a; x++) {
            let annotation = annotations[x];
            let type = annotation.type;
            let id = annotation.studentWorkId;
            if (id && this.data[id]) {
                let data = this.data[id];
                let existing = null;

                switch (type) {
                    case 'autoComment':
                        existing = data.annotations.autoComment;
                        if (existing) {
                            if (annotation.serverSaveTime > existing.serverSaveTime) {
                                data.annotations.autoComment = annotation;
                            }
                        } else {
                            data.annotations.autoComment = annotation;
                        }
                        break;
                    case 'autoScore':
                        existing = data.annotations.autoScore;
                        if (existing) {
                            if (annotation.serverSaveTime > existing.serverSaveTime) {
                                data.annotations.autoScore = annotation;
                            }
                        } else {
                            data.annotations.autoScore = annotation;
                        }
                        break;
                    case 'comment':
                        existing = data.annotations.comment;
                        if (existing) {
                            if (annotation.serverSaveTime > existing.serverSaveTime) {
                                data.annotations.comment = annotation;
                            }
                        } else {
                            data.annotations.comment = annotation;
                        }
                        break;
                    case 'score':
                        existing = data.annotations.score;
                        if (existing) {
                            if (annotation.serverSaveTime > existing.serverSaveTime) {
                                data.annotations.score = annotation;
                            }
                        } else {
                            data.annotations.score = annotation;
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    }

    convertToClientTimestamp(time) {
        return this.ConfigService.convertToClientTimestamp(time);
    }
}

WorkgroupComponentRevisionsController.$inject = [
    'ConfigService',
    'TeacherDataService'
];

const WorkgroupComponentRevisions = {
    bindings: {
        workgroupId: '<',
        componentId: '@',
        maxScore: '<'
    },
    template:
        `<md-list class="component-revisions">
            <div ng-repeat="item in $ctrl.data | toArray | orderBy: '-clientSaveTime'">
                <md-list-item class="list-item md-3-line md-whiteframe-1dp component-revisions__item" ng-class="{'component-revisions__item--latest': $first}">
                    <div class="md-list-item-text component-revisions__item__text">
                        <div layout="row">
                            <span class="md-body-2">
                                #{{$ctrl.componentStates.length - $index}}
                                <span ng-if="$first"> (Latest)</span>
                            </span>
                            <span flex></span>
                            <span>
                                <span class="component__actions__info component__actions__more md-body-1" am-time-ago="item.clientSaveTime"></span>
                                <md-tooltip md-direction="top">{{ item.clientSaveTime | amDateFormat:'ddd, MMM D YYYY, h:mm a' }}</md-tooltip>
                            </span>
                        </div>
                        <div>
                            <component component-state="{{item.componentState}}" mode="onlyShowWork">
                        </div>
                        <div ng-if="item.annotations.comment || item.annotations.score || item.annotations.autoComment || item.annotations.autoScore"
                             class="annotations--grading annotations--grading--revision md-body-1">
                            <div ng-if="item.annotations.comment || item.annotations.score">
                                <div ng-if="item.annotations.comment" layout="row" layout-wrap>
                                    <span class="component-revisions__annotation-label heavy">{{ 'TEACHER_COMMENT' | translate }}: </span>{{item.annotations.comment.data.value}}
                                </div>
                                <div ng-if="item.annotations.score">
                                    <span class="heavy">{{ 'SCORE' | translate }}: </span>{{item.annotations.score.data.value}}/{{$ctrl.maxScore}}
                                </div>
                            </div>

                            <div ng-if="item.annotations.autoComment || item.annotations.autoScore"
                                 ng-class="{'component-revisions__has-auto-and-teacher': item.annotations.comment || item.annotations.score}">
                                <div ng-if="item.annotations.autoComment">
                                    <div class="component-revisions__annotation-label heavy">
                                        {{ 'AUTO_COMMENT' | translate }}:
                                    </div>
                                    <div class="annotations--grading__auto-comment">
                                        <compile data="item.annotations.autoComment.data.value"></compile>
                                    </div>
                                </div>
                                <div ng-if="item.annotations.autoScore">
                                    <span class="heavy">{{ 'AUTO_SCORE' | translate }}: </span>{{item.annotations.autoScore.data.value}}/{{$ctrl.maxScore}}
                                </div>
                            </div>
                        </div>
                    </div>
                </md-list-item>
            </div>
        </md-list>`,
    controller: WorkgroupComponentRevisionsController
};

export default WorkgroupComponentRevisions;
