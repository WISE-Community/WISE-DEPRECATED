'use strict';

class ComponentRevisionsInfoController {
    constructor($filter,
                $mdDialog,
                $scope,
                AnnotationService,
                ConfigService,
                TeacherDataService) {
        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.$scope = $scope;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.TeacherDataService = TeacherDataService;

        this.$translate = this.$filter('translate');

        this.$onInit = () => {
            this.runId = this.ConfigService.getRunId();

            let toUserInfo = this.ConfigService.getUserInfoByWorkgroupId(this.toWorkgroupId);
            if (toUserInfo) {
                // set the period id
                this.periodId = toUserInfo.periodId;
            }

            // get the workgroup user names
            let userNamesArray = this.ConfigService.getUserNamesByWorkgroupId(this.toWorkgroupId);
            this.userNames = userNamesArray.map( (obj) => {
                return obj.name;
            }).join(', ');
        };

        this.$onChanges = (changes) => {

            if (changes.maxScore) {
                this.maxScore = typeof changes.maxScore.currentValue === 'number' ? changes.maxScore.currentValue : 0;
            }

            // get all the componentStates for this workgroup
            this.componentStates = this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(this.toWorkgroupId, this.componentId);
            let total = this.componentStates.length;

            if (total > 0) {
                let latest = this.componentStates[total-1];

                if (latest) {
                    // calculate the save time of the latest component state
                    let serverSaveTime = latest.serverSaveTime;
                    this.latestComponentStateTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);

                    // check if the latest component state is a submit
                    this.latestComponentStateIsSubmit = latest.isSubmit;
                }
            }

            this.processAnnotations();
        };

        this.$scope.$on('annotationSavedToServer', (event, args) => {
            // TODO: we're watching this here and in the parent component's controller; probably want to optimize!
            if (args != null ) {

                // get the annotation that was saved to the server
                let annotation = args.annotation;

                if (annotation != null) {

                    // get the node id and component id of the annotation
                    let annotationNodeId = annotation.nodeId;
                    let annotationComponentId = annotation.componentId;

                    // make sure the annotation was for this component
                    if (this.nodeId === annotationNodeId &&
                        this.componentId === annotationComponentId) {

                        // get latest score and comment annotations for this component
                        this.processAnnotations();
                    }
                }
            }
        });

    }

    processAnnotations() {
        this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.toWorkgroupId);

        if (this.latestAnnotations && this.latestAnnotations.comment) {
            let latestComment = this.latestAnnotations.comment;
            if (latestComment.type === 'comment') {
                this.comment = latestComment.data.value;
            }
        }

        if (this.latestAnnotations && this.latestAnnotations.score) {
            this.score = this.latestAnnotations.score.data.value;
        }

        this.latestTeacherAnnotationTime = this.getLatestTeacherAnnotationTime();

        this.hasNewWork = this.checkHasNewWork();
    }

    checkHasNewWork() {
        let result = false;

        if (this.latestComponentStateTime) {
            // there is work for this component

            if (this.latestTeacherAnnotationTime) {
                if (this.latestComponentStateTime > this.latestTeacherAnnotationTime) {
                    // latest component state is newer than latest annotation, so work is new
                    result = true;
                    this.comment = null;
                }
            } else {
                // there are no annotations, so work is new
                result = true;
            }
        }

        return result;
    }

    /**
     * Get the most recent teacher annotation (from the current score and comment annotations)
     * @return Object (latest teacher annotation)
     */
    getLatestTeacherAnnotation() {
        let latest = null;
        let latestComment = this.latestAnnotations.comment;
        let latestScore = this.latestAnnotations.score;
        let latestTeacherComment = (latestComment && latestComment.type === 'comment') ? latestComment : null;
        let latestTeacherScore = (latestScore && latestScore.type === 'score') ? latestScore : null;

        if (latestTeacherComment || latestTeacherScore) {
            let commentSaveTime = latestTeacherComment ? latestTeacherComment.serverSaveTime : 0;
            let scoreSaveTime = latestTeacherScore ? latestTeacherScore.serverSaveTime : 0;

            if (commentSaveTime >= scoreSaveTime) {
                latest = latestTeacherComment;
            } else if (scoreSaveTime > commentSaveTime) {
                latest = latestTeacherScore;
            }
        }

        return latest;
    }

    /**
     * Calculate the save time of the latest teacher annotation
     * @return Number (latest teacher annotation post time)
     */
    getLatestTeacherAnnotationTime() {
        let latest = this.getLatestTeacherAnnotation();
        let time = 0;

        if (latest) {
            let serverSaveTime = latest.serverSaveTime;
            time = this.ConfigService.convertToClientTimestamp(serverSaveTime)
        }

        return time;
    }

    showRevisions($event) {
        let workgroupId = this.toWorkgroupId;
        let componentId = this.componentId;
        let maxScore  = this.maxScore;
        let userNames = this.userNames;

        this.$mdDialog.show({
            parent: angular.element(document.body),
            targetEvent: $event,
            fullscreen: true,
            template:
                `<md-dialog aria-label="{{ 'revisionsForTeam' | translate:{teamNames: userNames} }}" class="dialog--wider">
                    <md-toolbar>
                        <div class="md-toolbar-tools">
                            <h2 class="overflow--ellipsis">{{ 'revisionsForTeam' | translate:{teamNames: userNames} }}</h2>
                        </div>
                    </md-toolbar>
                    <md-dialog-content>
                        <div class="md-dialog-content gray-lighter-bg">
                            <workgroup-component-revisions workgroup-id="workgroupId" component-id="{{ componentId }}" max-score="maxScore"></workgroup-component-revisions>
                        </div>
                    </md-dialog-content>
                    <md-dialog-actions layout="row" layout-align="end center">
                        <md-button class="md-primary" ng-click="close()" aria-label="{{ 'close' | translate }}">{{ 'close' | translate }}</md-button>
                    </md-dialog-actions>
                </md-dialog>`,
            locals: {
                workgroupId: workgroupId,
                componentId: componentId,
                maxScore: maxScore,
                userNames: userNames
            },
            controller: RevisionsController
        });
        function RevisionsController($scope, $mdDialog, workgroupId, componentId, maxScore, userNames) {
            $scope.workgroupId = workgroupId;
            $scope.componentId = componentId;
            $scope.maxScore = maxScore;
            $scope.userNames = userNames;
            $scope.close = () => {
                $mdDialog.hide();
            };
        }
        RevisionsController.$inject = ["$scope", "$mdDialog", "workgroupId", "componentId", "maxScore", "userNames"];
    }
}

ComponentRevisionsInfoController.$inject = [
    '$filter',
    '$mdDialog',
    '$scope',
    'AnnotationService',
    'ConfigService',
    'TeacherDataService'
];

const ComponentRevisionsInfo = {
    bindings: {
        nodeId: '<',
        componentId: '<',
        maxScore: '<',
        toWorkgroupId: '<',
        componentStateId: '<'
    },
    template:
        `<div class="component__actions__info component--grading__actions__info md-caption">
            <span ng-if="$ctrl.componentStates.length > 0">
                <span ng-if="$ctrl.latestComponentStateIsSubmit">{{ 'SUBMITTED' | translate }} </span>
                <span ng-if="!$ctrl.latestComponentStateIsSubmit">{{ 'SAVED' | translate }} </span>
                <span>
                    <span class="component__actions__more" am-time-ago="$ctrl.latestComponentStateTime"></span>
                    <md-tooltip md-direction="top">{{ $ctrl.latestComponentStateTime | amDateFormat:'ddd, MMM D YYYY, h:mm a' }}</md-tooltip>
                </span>
            </span>
            <span ng-if="$ctrl.componentStates.length === 0">{{ 'TEAM_HAS_NOT_SAVED_ANY_WORK' | translate }}</span>
            <span ng-if="$ctrl.componentStates.length > 0">
                &#8226;&nbsp;<a ng-click="$ctrl.showRevisions($event)" translate="SEE_REVISIONS" translate-value-number="{{($ctrl.componentStates.length - 1)}}"></a>
           </span>
    </div>`,
    controller: ComponentRevisionsInfoController
};

export default ComponentRevisionsInfo;
