'use strict';

class ComponentGradingController {
    constructor($scope,
                $translate,
                AnnotationService,
                ConfigService,
                TeacherDataService,
                UtilService,) {
        this.$scope = $scope;
        this.$translate = $translate;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.TeacherDataService = TeacherDataService;
        this.UtilService = UtilService;

        this.$onInit = () => {
            this.runId = this.ConfigService.getRunId();

            let toUserInfo = this.ConfigService.getUserInfoByWorkgroupId(this.toWorkgroupId);
            if (toUserInfo) {
                // set the period id
                this.periodId = toUserInfo.periodId;
            }
        };

        this.$onChanges = (changes) => {

            if (changes.maxScore) {
                this.hasMaxScore = (typeof this.maxScore === 'number');
            }

            this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.toWorkgroupId);
            this.processAnnotations();

            this.componentStates = this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(this.toWorkgroupId, this.componentId);
            this.latestComponentStateTime = this.getLatestComponentStateTime();
        };
    }

    processAnnotations() {
        if (this.latestAnnotations && this.latestAnnotations.comment) {
            if (this.latestAnnotations.comment.type === 'comment') {
                this.comment = this.latestAnnotations.comment.data.value;
            } else {
                this.comment = null;
            }
        }

        if (this.latestAnnotations && this.latestAnnotations.score) {
            this.score = this.latestAnnotations.score.data.value;
        }
    }

    hasNewWork() {
        if (this.latestComponentStateTime) {
            let latestAnnotationTime = this.getLatestAnnotationTime();
            if (latestAnnotationTime && this.latestComponentStateTime > latestAnnotationTime) {
                return true;
            }
        } else {
            return false;
        }
    }

    /**
     * Get the most recent annotation (from the current score and comment annotations)
     * @return Object (latest annotation)
     */
    getLatestAnnotation() {
        let latest = null;

        if (this.latestAnnotations.comment || this.latestAnnotations.score) {
            let commentSaveTime = this.latestAnnotations.comment ? this.latestAnnotations.comment.serverSaveTime : 0;
            let scoreSaveTime = this.latestAnnotations.score ? this.latestAnnotations.score.serverSaveTime : 0;

            if (commentSaveTime >= scoreSaveTime) {
                latest = this.latestAnnotations.comment;
            } else if (scoreSaveTime > commentSaveTime) {
                latest = this.latestAnnotations.score;
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
        let time = null;

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
     * @param type String to indicate which type of annotation to post
     */
    postAnnotation(type) {

        if (this.runId != null &&
            this.periodId != null &&
            this.nodeId != null &&
            this.componentId != null &&
            this.toWorkgroupId != null &&
            type) {

            // get the current time
            let clientSaveTime = new Date().getTime();

            // get the logged in teacher's id
            let fromWorkgroupId = this.ConfigService.getWorkgroupId();

            // get the value
            let value = null;
            if (type === 'score') {
                value = this.score;
                // convert the value to a number if possible
                value = this.UtilService.convertStringToNumber(value);
            } else if (type === 'comment') {
                value = this.comment;
            }

            if (value) {
                let data = {};
                data.value = value;

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
                    type,
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
        }
    }
}

ComponentGradingController.$inject = [
    '$scope',
    '$translate',
    'AnnotationService',
    'ConfigService',
    'TeacherDataService',
    'UtilService'
];

const ComponentGrading = {
    bindings: {
        nodeId: '<',
        componentId: '<',
        maxScore: '<',
        fromWorkgroupId: '<',
        toWorkgroupId: '<',
        componentStateId: '<',
        active: '<'
    },
    templateUrl: 'wise5/directives/componentGrading/componentGrading.html',
    controller: ComponentGradingController
};

export default ComponentGrading;
