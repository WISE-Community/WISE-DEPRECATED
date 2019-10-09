"use strict";

class ComponentNewWorkBadgeController {
    constructor(AnnotationService,
                TeacherDataService,
                $scope) {
        this.AnnotationService = AnnotationService;
        this.TeacherDataService = TeacherDataService;
        this.$scope = $scope;

        this.$onInit = () => {
            this.hasNewWork = false;
            this.checkHasNewWork();
        };

        this.$scope.$on('annotationSavedToServer', (event, args) => {
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

                        // re-check for new work
                        this.checkHasNewWork();
                    }
                }
            }
        });
    };

    checkHasNewWork() {
        let latestComponentState = this.TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(this.workgroupId, this.nodeId, this.componentId);
        let latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId, null, 'comment');

        if (latestComponentState) {
            // there is work for this component

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
                // latest component state is newer than latest annotation, so work is new
                this.hasNewWork = true;
            }
        }
    }
}

ComponentNewWorkBadgeController.$inject = [
    'AnnotationService',
    'TeacherDataService',
    '$scope'
];

const ComponentNewWorkBadge = {
    bindings: {
        workgroupId: '<',
        componentId: '<',
        nodeId: '<'
    },
    template:
        `<span ng-if="$ctrl.hasNewWork" class="badge badge--info">{{ ::'NEW' | translate }}</span>`,
    controller: ComponentNewWorkBadgeController
};

export default ComponentNewWorkBadge;
