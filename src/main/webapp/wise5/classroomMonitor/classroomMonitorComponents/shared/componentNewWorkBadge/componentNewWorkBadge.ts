'use strict';

import { AnnotationService } from '../../../../services/annotationService';
import { TeacherDataService } from '../../../../services/teacherDataService';

class ComponentNewWorkBadgeController {
  componentId: string;
  hasNewWork: boolean;
  nodeId: string;
  workgroupId: number;

  static $inject = ['AnnotationService', 'TeacherDataService', '$scope'];

  constructor(
    private AnnotationService: AnnotationService,
    private TeacherDataService: TeacherDataService,
    $scope: any
  ) {
    $scope.$on('annotationSavedToServer', (event, args) => {
      if (args != null) {
        let annotation = args.annotation;
        if (annotation != null) {
          let annotationNodeId = annotation.nodeId;
          let annotationComponentId = annotation.componentId;
          if (this.nodeId === annotationNodeId && this.componentId === annotationComponentId) {
            this.checkHasNewWork();
          }
        }
      }
    });
  }

  $onInit() {
    this.hasNewWork = false;
    this.checkHasNewWork();
  }

  checkHasNewWork() {
    let latestComponentState = this.TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(
      this.workgroupId,
      this.nodeId,
      this.componentId
    );
    let latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(
      this.nodeId,
      this.componentId,
      this.workgroupId,
      null,
      'comment'
    );

    if (latestComponentState) {
      let latestComponentStateTime = latestComponentState.serverSaveTime;
      let latestTeacherComment = null;
      let latestTeacherScore = null;
      let latestTeacherAnnotationTime = 0;

      if (latestAnnotations && latestAnnotations.comment) {
        latestTeacherComment = latestAnnotations.comment;
      }

      if (latestAnnotations && latestAnnotations.score) {
        if (latestAnnotations.score !== 'autoScore') {
          latestTeacherScore = latestAnnotations.score;
        }
      }

      let commentSaveTime = latestTeacherComment ? latestTeacherComment.serverSaveTime : 0;
      let scoreSaveTime = latestTeacherScore ? latestTeacherScore.serverSaveTime : 0;

      if (commentSaveTime >= scoreSaveTime) {
        latestTeacherAnnotationTime = commentSaveTime;
      } else if (scoreSaveTime > commentSaveTime) {
        latestTeacherAnnotationTime = scoreSaveTime;
      }

      if (latestComponentStateTime > latestTeacherAnnotationTime) {
        this.hasNewWork = true;
      }
    }
  }
}

const ComponentNewWorkBadge = {
  bindings: {
    workgroupId: '<',
    componentId: '<',
    nodeId: '<'
  },
  template: `<span ng-if="$ctrl.hasNewWork" class="badge badge--info">{{ ::'NEW' | translate }}</span>`,
  controller: ComponentNewWorkBadgeController
};

export default ComponentNewWorkBadge;
