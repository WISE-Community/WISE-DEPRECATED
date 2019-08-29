'use strict';

class NotebookItemGradingController {
    constructor($filter,
                $mdDialog,
                $scope,
                AnnotationService,
                ConfigService,
                NotebookService,
                TeacherDataService,
                UtilService,) {
        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.$scope = $scope;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.NotebookService = NotebookService;
        this.TeacherDataService = TeacherDataService;
        this.UtilService = UtilService;
        this.$translate = this.$filter('translate');

        this.$onInit = () => {
          this.notebookItemId = this.notebookItem.id;
          this.localNotebookItemId = this.notebookItem.localNotebookItemId;
          this.toWorkgroupId = this.notebookItem.workgroupId;
          this.maxScore = 0;
          if (this.notebookItem != null && this.notebookItem.content != null && this.notebookItem.content.reportId != null) {
            let reportNoteContent = this.NotebookService.getReportNoteContentByReportId(this.notebookItem.content.reportId);
            if (reportNoteContent != null && reportNoteContent.maxScore != null) {
                this.maxScore = reportNoteContent.maxScore;
            }
          }
          this.runId = this.ConfigService.getRunId();

          let toUserInfo = this.ConfigService.getUserInfoByWorkgroupId(this.toWorkgroupId);
          if (toUserInfo) {
              // set the period id
              this.periodId = toUserInfo.periodId;
          }

          // get the workgroup user names
          let usernamesArray = this.ConfigService.getUsernamesByWorkgroupId(this.toWorkgroupId);
          this.usernames = usernamesArray.map( (obj) => {
              return obj.name;
          }).join(', ');
        };

        this.$onChanges = (changes) => {
          if (changes.maxScore) {
            this.hasMaxScore = (typeof this.notebookItem.maxScore === 'number' || this.notebookItem.maxScore == null);
          }

          this.componentStates = this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(this.toWorkgroupId, this.componentId);
          this.latestComponentStateTime = this.getLatestComponentStateTime();

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
          } else {
              this.comment = null;
          }
      }

      if (this.latestAnnotations && this.latestAnnotations.score) {
          this.score = this.latestAnnotations.score.data.value;
      }

      this.latestTeacherAnnotationTime = this.getLatestTeacherAnnotationTime();
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

    /**
     * Calculate the save time of the latest component state
     * @return Number (latest annotation post time)
     */
    getLatestComponentStateTime() {
      let total = this.componentStates.length;
      let time = null;

      if (total) {
          let latest = this.componentStates[total-1];

          if (latest) {
              let serverSaveTime = latest.serverSaveTime;
              time = this.ConfigService.convertToClientTimestamp(serverSaveTime)
          }
      }

      return time;
    }

    /**
     * Save the annotation to the server
     * @param type String to indicate which type of annotation to post [score,comment]
     */
    postAnnotation(type) {

      if (this.runId != null &&
          this.periodId != null &&
          this.notebookItemId != null &&
          this.toWorkgroupId != null &&
          type) {
          let clientSaveTime = new Date().getTime();
          let fromWorkgroupId = this.ConfigService.getWorkgroupId();
          let value = null;
          if (type === 'score') {
              value = this.UtilService.convertStringToNumber(this.score);
          } else if (type === 'comment') {
              value = this.comment;
          }

          if ((type === 'comment' && value) || (type === 'score' && typeof value === 'number' && value >= 0)) {
              let data = {
                  value: value
              };
              let componentStateId = null;
              let annotation = this.AnnotationService.createAnnotation(
                  this.annotationId,
                  this.runId,
                  this.periodId,
                  fromWorkgroupId,
                  this.toWorkgroupId,
                  this.nodeId,
                  this.componentId,
                  componentStateId,
                  this.localNotebookItemId,
                  this.notebookItemId,
                  type,
                  data,
                  clientSaveTime);

              this.AnnotationService.saveAnnotation(annotation);
          }
      }
    }
}

NotebookItemGradingController.$inject = [
  '$filter',
  '$mdDialog',
  '$scope',
  'AnnotationService',
  'ConfigService',
  'NotebookService',
  'TeacherDataService',
  'UtilService'
];

const NotebookItemGrading = {
  bindings: {
      maxScore: '<',
      notebookItem: '<'
  },
  templateUrl: 'wise5/classroomMonitor/notebook/notebookItemGrading/notebookItemGrading.html',
  controller: NotebookItemGradingController
};

export default NotebookItemGrading;
