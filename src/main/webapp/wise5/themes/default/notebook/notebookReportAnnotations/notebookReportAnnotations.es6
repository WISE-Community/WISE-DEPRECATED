'use strict';

class NotebookReportAnnotationsController {
    constructor($scope,
                $filter,
                ConfigService,
                ProjectService,
                StudentDataService) {

        this.$scope = $scope;
        this.$filter = $filter;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;

        this.$translate = this.$filter('translate');

        this.maxScoreDisplay = (parseInt(this.maxScore) > 0) ? '/' + this.maxScore : '';

        // the latest annotation time
        this.latestAnnotationTime = null;

        // whether the annotation is new or not
        this.isNew = false;

        // the annotation label
        this.label = '';

        // the avatar icon (default to person/teacher)
        this.icon = 'person';

        this.showScore = true;
        this.showComment = true;

        this.$onChanges = (changes) => {
            if (changes.annotations) {
                this.annotations = angular.copy(changes.annotations.currentValue);
                this.processAnnotations();
            }
        }
    }

    /**
     * Get the most recent annotation (from the current score and comment annotations)
     * @return Object (latest annotation)
     */
    getLatestAnnotation() {
        let latest = null;

        if (this.annotations.comment || this.annotations.score) {
            let commentSaveTime = this.annotations.comment ? this.annotations.comment.serverSaveTime : 0;
            let scoreSaveTime = this.annotations.score ? this.annotations.score.serverSaveTime : 0;

            if (commentSaveTime >= scoreSaveTime) {
                latest = this.annotations.comment;
            } else if (scoreSaveTime > commentSaveTime) {
                latest = this.annotations.score;
            }
        }

        return latest;
    };

    /**
     * Calculate the save time of the latest annotation
     * @return Number (latest annotation post time)
     */
    getLatestAnnotationTime() {
        let latest = this.getLatestAnnotation();
        let time = null;

        if (latest) {
            let serverSaveTime = latest.serverSaveTime;
            time = this.ConfigService.convertToClientTimestamp(serverSaveTime)
        }

        return time;
    };

    /**
     * Set the label based on whether this is an automated or teacher annotation
     **/
    setLabelAndIcon() {
        let latest = this.getLatestAnnotation();

        if (latest) {
            if (latest.type === 'autoComment' || latest.type === 'autoScore') {
                this.label = this.$translate('automatedFeedbackLabel');
                this.icon = 'keyboard';
            } else {
                this.label = this.$translate('teacherFeedbackLabel');
                this.icon = "person";
            }
        }
    };

    processAnnotations() {
        if (this.annotations.comment || this.annotations.score) {
            this.nodeId = this.annotations.comment ? this.annotations.comment.nodeId : this.annotations.score.nodeId;
            this.componentId = this.annotations.comment ? this.annotations.comment.componentId : this.annotations.score.nodeId;

            if (!this.ProjectService.displayAnnotation(this.annotations.score)) {
                // we do not want to show the score
                this.showScore = false;
            }

            if (!this.ProjectService.displayAnnotation(this.annotations.comment)) {
                // we do not want to show the comment
                this.showComment = false;
            }

            // set the annotation label and icon
            this.setLabelAndIcon();

            this.latestAnnotationTime = this.getLatestAnnotationTime();

            this.show = (this.showScore && this.annotations.score) || (this.showComment && this.annotations.comment);
        }
    };
}

NotebookReportAnnotationsController.$inject = [
    '$scope',
    '$filter',
    'ConfigService',
    'ProjectService',
    'StudentDataService'
];

const NotebookReportAnnotations = {
    bindings: {
        annotations: '<',
        hasNew: '<',
        maxScore: '<'
    },
    template:
        `<div class="md-padding gray-lightest-bg annotations-container--student--report" ng-if="$ctrl.show">
            <md-card class="annotations--student annotations--student--report">
                <md-card-title class="annotations--student__header gray-darker-bg">
                    <div class="annotations--student__avatar avatar--icon avatar--square md-36 avatar md-whiteframe-1dp">
                        <md-icon class="annotations--student__icon md-36">{{$ctrl.icon}}</md-icon>
                    </div>
                    <div class="annotations--student__title" layout="row" flex>
                        <span>{{$ctrl.label}}</span>
                        <span ng-if="$ctrl.hasNew" class="badge annotations--student__status info-bg animate-fade" translate="new"></span>
                    </div>
                </md-card-title>
                <md-card-content class="annotations--student__body md-body-1">
                    <div ng-if="$ctrl.showComment && $ctrl.annotations.comment.data.value"><compile data="$ctrl.annotations.comment.data.value"></compile></div>
                    <hr ng-if="$ctrl.annotations.comment" />
                    <div layout="row" laoyut-align="start center">
                        <span ng-if="$ctrl.showScore && $ctrl.annotations.score"
                              class="annotations--student__score"
                              translate="SCORE_LABEL_AND_VALUE"
                              translate-value-score="{{$ctrl.annotations.score.data.value}}{{$ctrl.maxScoreDisplay}}"></span>
                        <span flex></span>
                        <span>
                            <span class="annotations__info" am-time-ago="$ctrl.latestAnnotationTime"></span>
                            <md-tooltip md-direction="top">{{ $ctrl.latestAnnotationTime | amDateFormat:'ddd, MMM D YYYY, h:mm a' }}</md-tooltip>
                        </span>
                    </div>
                </md-card-content>
            </md-card>
        </div>`,
    controller: NotebookReportAnnotationsController
};

export default NotebookReportAnnotations;
