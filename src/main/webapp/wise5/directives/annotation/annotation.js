'use strict';

class AnnotationController {
    constructor($scope,
                $element,
                $attrs,
                AnnotationService,
                ConfigService,
                ProjectService,
                UtilService) {
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.UtilService = UtilService;
        this.component = null;
        this.value = null;

        this.runId = ConfigService.getRunId();

        if (this.nodeId != null && this.componentId != null) {
            // get the component
            this.component = this.ProjectService.getComponentByNodeIdAndComponentId(this.nodeId, this.componentId);
            if (this.component) {
                this.gradingMaxScore = this.component.maxScore;
            }
        }

        if (this.mode === 'student') {

            if (!this.annotation) {
                let annotationParams = {};
                annotationParams.nodeId = this.nodeId;
                annotationParams.componentId = this.componentId;
                annotationParams.fromWorkgroupId = this.fromWorkgroupId;
                annotationParams.toWorkgroupId = this.toWorkgroupId;
                annotationParams.type = this.type;
                annotationParams.studentWorkId = this.componentStateId;
                annotationParams.notebookItemId = this.notebookItemId;

                // get the latest annotation that matches the params
                this.annotation = this.AnnotationService.getLatestAnnotation(annotationParams);
            }

            if (this.annotation != null) {
                let data = this.annotation.data;
                let dataJSONObject = angular.fromJson(data);

                if (dataJSONObject) {
                    this.value = dataJSONObject.value;
                }
            }
        } else if (this.mode === 'grading') {

            let annotationParams = {};
            annotationParams.nodeId = this.nodeId;
            annotationParams.componentId = this.componentId;
            annotationParams.fromWorkgroupId = this.fromWorkgroupId;
            annotationParams.toWorkgroupId = this.toWorkgroupId;
            annotationParams.type = this.type;
            annotationParams.studentWorkId = this.componentStateId;
            annotationParams.notebookItemId = this.notebookItemId;

            if (this.active) {
                /*
                 * this directive instance is the active annotation that the teacher can use to
                 * grade so we will get the latest annotation for the student work
                 */
                this.annotation = this.AnnotationService.getLatestAnnotation(annotationParams);
            } else {
                /*
                 * this directive instance is not the active annotation so we will get the
                 * annotation directly associated with the student work
                 */
                this.annotation = this.AnnotationService.getAnnotation(annotationParams);
            }

            if (this.annotation != null) {
                if (this.componentStateId == this.annotation.studentWorkId) {
                    /*
                     * the annotation is for the component state that is being displayed.
                     * sometimes the annotation may not be for the component state that
                     * is being displayed which can happen when student submits work,
                     * the teacher annotates it, and then the student submits new work.
                     * when this happens, we will show the teacher annotation but the
                     * annotation is associated with the first student work and not the
                     * second student work. setting the annotationId in the scope will
                     * cause the server to update the annotation as opposed to creating
                     * a new annotation row in the database.
                     */
                    this.annotationId = this.annotation.id;
                }
            }

            let toUserInfo = this.ConfigService.getUserInfoByWorkgroupId(this.toWorkgroupId);

            if (toUserInfo != null) {
                // set the period id
                this.periodId = toUserInfo.periodId;
            }

            if (this.annotation != null) {

                if (this.annotation.data != null) {
                    this.value = this.annotation.data.value;
                }
            }
        }
    }

    /**
     * Save the annotation to the server
     */
    postAnnotation() {

        if (this.runId != null &&
            this.periodId != null &&
            this.nodeId != null &&
            this.componentId != null &&
            this.fromWorkgroupId != null &&
            this.toWorkgroupId != null &&
            this.type != null &&
            this.value != null) {

            // get the current time
            let clientSaveTime = new Date().getTime();

            // get the value
            let value = this.value;

            // convert the value to a number if possible
            value = this.UtilService.convertStringToNumber(value);

            let data = {
                value: value
            };

            // create the annotation object
            let annotation = this.AnnotationService.createAnnotation(
                this.annotationId,
                this.runId,
                this.periodId,
                this.fromWorkgroupId,
                this.toWorkgroupId,
                this.nodeId,
                this.componentId,
                this.componentStateId,
                this.localNotebookItemId,
                this.notebookItemId,
                this.type,
                data,
                clientSaveTime);

            // save the annotation to the server
            this.AnnotationService.saveAnnotation(annotation).then(result => {
                var localAnnotation = result;

                if (localAnnotation != null) {
                    if (this.annotationId == null) {
                        // set the annotation id if there was no annotation id
                        this.annotationId = localAnnotation.id;
                    }
                }
            });
        }
    };
}

AnnotationController.$inject = [
    '$scope',
    '$element',
    '$attrs',
    'AnnotationService',
    'ConfigService',
    'ProjectService',
    'UtilService'
];

const Annotation = {
    bindings: {
        annotation: '<',
        type: '@',
        mode: '<',
        nodeId: '<',
        componentId: '<',
        fromWorkgroupId: '<',
        toWorkgroupId: '<',
        componentStateId: '<',
        notebookItemId: '<',
        active: '<',
        maxScore: '<'
    },
    templateUrl: 'wise5/directives/annotation/annotation.html',
    controller: AnnotationController,
    controllerAs: 'annotationController'
};

export default Annotation;
