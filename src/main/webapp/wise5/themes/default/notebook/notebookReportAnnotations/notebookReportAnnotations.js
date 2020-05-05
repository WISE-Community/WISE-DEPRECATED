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
    this.latestAnnotationTime = null;
    this.isNew = false;
    this.label = '';
    this.icon = 'person';
    this.showScore = true;
    this.showComment = true;

    this.$onChanges = (changes) => {
      if (changes.annotations) {
        this.annotations = angular.copy(changes.annotations.currentValue);
        this.processAnnotations();
      }
    };
  }

  /**
   * Get the most recent annotation (from the current score and comment annotations)
   * @return Object (latest annotation)
   */
  getLatestAnnotation() {
    let latestAnnotation = null;
    if (this.annotations.comment || this.annotations.score) {
      const commentSaveTime = this.annotations.comment ? this.annotations.comment.serverSaveTime : 0;
      const scoreSaveTime = this.annotations.score ? this.annotations.score.serverSaveTime : 0;
      if (commentSaveTime >= scoreSaveTime) {
        latestAnnotation = this.annotations.comment;
      } else if (scoreSaveTime > commentSaveTime) {
        latestAnnotation = this.annotations.score;
      }
    }
    return latestAnnotation;
  }

  /**
   * Calculate the save time of the latest annotation
   * @return Number (latest annotation post time)
   */
  getLatestAnnotationTime() {
    const latestAnnotation = this.getLatestAnnotation();
    if (latestAnnotation) {
      return this.ConfigService.convertToClientTimestamp(latestAnnotation.serverSaveTime);
    }
    return null;
  }

  /**
   * Set the label based on whether this is an automated or teacher annotation
   **/
  setLabelAndIcon() {
    const latestAnnotation = this.getLatestAnnotation();
    if (latestAnnotation) {
      if (latestAnnotation.type === 'autoComment' || latestAnnotation.type === 'autoScore') {
        this.label = this.$translate('automatedFeedbackLabel');
        this.icon = 'keyboard';
      } else {
        this.label = this.$translate('teacherFeedbackLabel');
        this.icon = 'person';
      }
    }
  }

  processAnnotations() {
    if (this.annotations.comment || this.annotations.score) {
      this.nodeId = this.annotations.comment ?
          this.annotations.comment.nodeId : this.annotations.score.nodeId;
      this.componentId = this.annotations.comment ?
          this.annotations.comment.componentId : this.annotations.score.nodeId;

      if (!this.ProjectService.displayAnnotation(this.annotations.score)) {
        this.showScore = false;
      }

      if (!this.ProjectService.displayAnnotation(this.annotations.comment)) {
        this.showComment = false;
      }

      this.setLabelAndIcon();
      this.latestAnnotationTime = this.getLatestAnnotationTime();
      this.show = (this.showScore && this.annotations.score) || (this.showComment && this.annotations.comment);
    }
  }
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
            <md-card class="annotations annotations--report">
                <md-card-title class="annotations__header">
                    <div class="annotations__avatar avatar--icon avatar--square md-36 avatar md-whiteframe-1dp">
                        <md-icon class="annotations__icon md-36">{{$ctrl.icon}}</md-icon>
                    </div>
                    <div class="annotations__title" layout="row" flex>
                        <span>{{$ctrl.label}}</span>
                        <span flex></span>
                        <span ng-if="$ctrl.hasNew" class="badge annotations__status animate-fade" translate="new"></span>
                    </div>
                </md-card-title>
                <md-card-content class="annotations__body md-body-1">
                    <div ng-if="$ctrl.showComment && $ctrl.annotations.comment.data.value"><compile data="$ctrl.annotations.comment.data.value"></compile></div>
                    <hr ng-if="$ctrl.annotations.comment" />
                    <div layout="row" laoyut-align="start center">
                        <span ng-if="$ctrl.showScore && $ctrl.annotations.score"
                              class="annotations__score"
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
