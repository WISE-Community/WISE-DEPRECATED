'use strict';

import { AnnotationService } from '../../../../services/annotationService';
import { ConfigService } from '../../../../services/configService';
import { TeacherDataService } from '../../../../services/teacherDataService';
import { UtilService } from '../../../../services/utilService';
import * as angular from 'angular';
import { TeacherProjectService } from '../../../../services/teacherProjectService';
import { Directive } from '@angular/core';

@Directive()
class ComponentGradingController {
  $translate: any;
  annotationId: number;
  canAuthorProject: boolean;
  canGradeStudentWork: boolean;
  comment: string;
  componentId: string;
  componentStateId: number;
  componentStates: any;
  edit: boolean;
  fromWorkgroupId: number;
  latestAnnotations: any;
  latestAnnotationTime: any;
  maxScore: any;
  nodeId: string;
  periodId: number;
  runId: number;
  score: number;
  showAllAnnotations: boolean;
  toWorkgroupId: number;
  annotationSavedToServerSubscription: any;

  static $inject = [
    '$filter',
    '$scope',
    '$timeout',
    'AnnotationService',
    'ConfigService',
    'ProjectService',
    'TeacherDataService',
    'UtilService'
  ];
  constructor(
    $filter: any,
    private $scope: any,
    private $timeout: any,
    private AnnotationService: AnnotationService,
    private ConfigService: ConfigService,
    private ProjectService: TeacherProjectService,
    private TeacherDataService: TeacherDataService,
    private UtilService: UtilService
  ) {
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.TeacherDataService = TeacherDataService;
    this.UtilService = UtilService;
    this.$translate = $filter('translate');

    this.annotationSavedToServerSubscription = this.AnnotationService.annotationSavedToServer$.subscribe(
      ({ annotation }) => {
        // TODO: we're watching this here and in the parent component's controller; probably want to optimize!
        const annotationNodeId = annotation.nodeId;
        const annotationComponentId = annotation.componentId;
        if (this.nodeId === annotationNodeId && this.componentId === annotationComponentId) {
          this.processAnnotations();
        }
      }
    );

    this.$scope.$on('projectSaved', (event, args) => {
      this.maxScore = this.ProjectService.getMaxScoreForComponent(this.nodeId, this.componentId);
    });

    this.$scope.$on('$destroy', () => {
      this.ngOnDestroy();
    });
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.annotationSavedToServerSubscription.unsubscribe();
  }

  $onInit() {
    this.runId = this.ConfigService.getRunId();

    const permissions = this.ConfigService.getPermissions();
    this.canGradeStudentWork = permissions.canGradeStudentWork;
    this.canAuthorProject = permissions.canAuthorProject;
    let toUserInfo = this.ConfigService.getUserInfoByWorkgroupId(this.toWorkgroupId);
    if (toUserInfo) {
      this.periodId = toUserInfo.periodId;
    }
  }

  $onChanges(changes) {
    if (changes.maxScore) {
      this.maxScore =
        typeof changes.maxScore.currentValue === 'number' ? changes.maxScore.currentValue : 0;
    }

    this.componentStates = this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(
      this.toWorkgroupId,
      this.componentId
    );

    this.processAnnotations();
  }

  processAnnotations() {
    if (this.showAllAnnotations) {
      // we want to show all the latest annotation types (both teacher- and auto-generated)
      this.latestAnnotations = {};
      this.latestAnnotations.score = this.AnnotationService.getLatestTeacherScoreAnnotationByStudentWorkId(
        this.componentStateId
      );
      this.latestAnnotations.autoScore = this.AnnotationService.getLatestAutoScoreAnnotationByStudentWorkId(
        this.componentStateId
      );
      this.latestAnnotations.comment = this.AnnotationService.getLatestTeacherCommentAnnotationByStudentWorkId(
        this.componentStateId
      );
      this.latestAnnotations.autoComment = this.AnnotationService.getLatestAutoCommentAnnotationByStudentWorkId(
        this.componentStateId
      );
    } else {
      // we only want to show the latest score and comment annotations (either teacher- or auto-generated)
      this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(
        this.nodeId,
        this.componentId,
        this.toWorkgroupId
      );

      if (this.latestAnnotations && this.latestAnnotations.comment) {
        let latestComment = this.latestAnnotations.comment;
        if (latestComment.type === 'comment') {
          this.comment = latestComment.data.value;
        }
      }

      if (this.latestAnnotations && this.latestAnnotations.score) {
        this.score = this.latestAnnotations.score.data.value;
      }

      this.latestAnnotationTime = this.getLatestAnnotationTime();
    }
  }

  /**
   * Returns true if the latest comment is an auto comment and it's
   * studentWorkId matches the latest component state's id
   */
  showAutoComment() {
    let result = false;
    if (this.latestAnnotations) {
      let latestComment = this.latestAnnotations.comment;
      if (latestComment && latestComment.type === 'autoComment') {
        let n = this.componentStates.length;
        if (n > 0) {
          let latestComponentState = this.componentStates[n - 1];
          if (latestComponentState.id === latestComment.studentWorkId) {
            result = true;
          }
        }
      }
    }

    return result;
  }

  /**
   * Returns true if there are both teacher and auto annotations for this component state
   */
  hasTeacherAndAutoAnnotations() {
    return (
      (this.latestAnnotations.score || this.latestAnnotations.comment) &&
      (this.latestAnnotations.autoScore || this.latestAnnotations.autoComment)
    );
  }

  /**
   * Returns true if there are any teacher annotations for this component state
   */
  hasTeacherAnnotations() {
    return this.latestAnnotations.score || this.latestAnnotations.comment;
  }

  /**
   * Returns true if there are any auto annotations for this component state
   */
  hasAutoAnnotations() {
    return this.latestAnnotations.autoScore || this.latestAnnotations.autoComment;
  }

  /**
   * Returns true if there are no annotations for this component state
   */
  hasNoAnnotations() {
    return (
      !this.latestAnnotations.score &&
      !this.latestAnnotations.comment &&
      !this.latestAnnotations.autoScore &&
      !this.latestAnnotations.autoComment
    );
  }

  /**
   * Get the most recent annotation (from the current score and comment annotations)
   * @return Object (latest annotation)
   */
  getLatestAnnotation() {
    let latest = null;
    let latestComment = this.latestAnnotations.comment;
    let latestScore = this.latestAnnotations.score;

    if (latestComment || latestScore) {
      let commentSaveTime = latestComment ? latestComment.serverSaveTime : 0;
      let scoreSaveTime = latestScore ? latestScore.serverSaveTime : 0;

      if (commentSaveTime >= scoreSaveTime) {
        latest = latestComment;
      } else if (scoreSaveTime > commentSaveTime) {
        latest = latestScore;
      }
    }

    return latest;
  }

  /**
   * Calculate the save time of the latest annotation
   * @return Number (latest annotation post time)
   */
  getLatestAnnotationTime() {
    let latest = this.getLatestAnnotation();
    let time = 0;

    if (latest) {
      let serverSaveTime = latest.serverSaveTime;
      time = this.ConfigService.convertToClientTimestamp(serverSaveTime);
    }

    return time;
  }

  /**
   * Save the annotation to the server
   * @param type String to indicate which type of annotation to post
   */
  postAnnotation(type) {
    if (
      this.runId != null &&
      this.periodId != null &&
      this.nodeId != null &&
      this.componentId != null &&
      this.toWorkgroupId != null &&
      type
    ) {
      let clientSaveTime = new Date().getTime();
      let fromWorkgroupId = this.ConfigService.getWorkgroupId();
      let value = null;
      if (type === 'score') {
        value = this.score;
        value = this.UtilService.convertStringToNumber(value);
      } else if (type === 'comment') {
        value = this.comment;
      }

      if (
        (type === 'comment' && value) ||
        (type === 'score' && typeof value === 'number' && value >= 0)
      ) {
        const data = {
          value: value
        };
        const localNotebookItemId = null; // we're not grading notebook item in this view.
        const notebookItemId = null; // we're not grading notebook item in this view.
        const annotation = this.AnnotationService.createAnnotation(
          this.annotationId,
          this.runId,
          this.periodId,
          this.fromWorkgroupId,
          this.toWorkgroupId,
          this.nodeId,
          this.componentId,
          this.componentStateId,
          localNotebookItemId,
          notebookItemId,
          type,
          data,
          clientSaveTime
        );
        this.AnnotationService.saveAnnotation(annotation).then((result) => {});
      }
    }
  }

  /**
   * Save the maxScore of this component to the server
   */
  updateMaxScore() {
    if (
      this.runId != null &&
      this.periodId != null &&
      this.nodeId != null &&
      this.componentId != null
    ) {
      // get the new maxScore
      let maxScore = this.maxScore;
      // convert to number if possible
      maxScore = this.UtilService.convertStringToNumber(maxScore);

      if (typeof maxScore === 'number' && maxScore >= 0) {
        this.ProjectService.setMaxScoreForComponent(this.nodeId, this.componentId, maxScore);
        this.ProjectService.saveProject();
      }
    }
  }

  /**
   * Shows (or hides) the teacher comment field when user wants to override an automated comment
   */
  editComment() {
    this.edit = !this.edit;

    if (this.edit) {
      let componentId = this.componentId;
      let toWorkgroupId = this.toWorkgroupId;
      // if we're showing the comment field, focus it
      this.$timeout(() => {
        angular
          .element(document.querySelector('#commentInput_' + componentId + '_' + toWorkgroupId))
          .focus();
      }, 100);
    }
  }

  /**
   * Focuses the score input when user wants to override an automated score
   * @param an angular trigger event
   */
  editScore($event) {
    angular
      .element(document.querySelector('#scoreInput_' + this.componentId + '_' + this.toWorkgroupId))
      .focus();
  }
}

const ComponentGrading = {
  bindings: {
    componentId: '<',
    componentStateId: '<',
    isDisabled: '<',
    fromWorkgroupId: '<',
    maxScore: '<',
    nodeId: '<',
    showAllAnnotations: '<',
    toWorkgroupId: '<'
  },
  templateUrl:
    '/wise5/classroomMonitor/classroomMonitorComponents/shared/componentGrading/componentGrading.html',
  controller: ComponentGradingController
};

export default ComponentGrading;
