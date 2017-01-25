'use strict';

class ComponentGradingController {
    constructor($filter,
                $mdDialog,
                $scope,
                AnnotationService,
                ConfigService,
                TeacherDataService,
                UtilService,) {
        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.$scope = $scope;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.TeacherDataService = TeacherDataService;
        this.UtilService = UtilService;

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
                this.hasMaxScore = (typeof this.maxScore === 'number');
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

        this.hasNewWork = this.hasNewWork();
    }

    hasNewWork() {
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
     * Returns true if the latest comment is an auto comment and it's
     * studentWorkId matches the latest component state's id
     */
    showAutoComment() {
        let result = false;
        let latestComment = this.latestAnnotations.comment;
        if (latestComment && latestComment.type === 'autoComment') {
            let n = this.componentStates.length;
            if (n > 0) {
                let latestComponentState = this.componentStates[n-1]
                if (latestComponentState.id === latestComment.studentWorkId) {
                    result = true;
                }
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
                `<md-dialog aria-label="Revisions for {{userNames}}" class="dialog--wider">
                    <md-toolbar md-theme="light">
                        <div class="md-toolbar-tools">
                            <h2 class="overflow--ellipsis">Revisions for {{userNames}}</h2>
                            <span flex></span>
                            <md-button class="md-icon-button" ng-click="close()">
                                <md-icon aria-label="Close dialog"> close </md-icon>
                            </md-button>
                        </div>
                    </md-toolbar>
                    <md-dialog-content class="md-dialog-content gray-light-bg">
                        <workgroup-component-revisions workgroup-id="workgroupId" component-id="{{componentId}}" max-score="maxScore"></workgroup-component-revisions>
                    </md-dialog-content>
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

            if ((type === 'comment' && value) || (type === 'score' && typeof value === 'number' && value >= 0)) {
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
                    /*let localAnnotation = result;

                    if (localAnnotation != null) {
                        if (this.annotationId == null) {
                            // set the annotation id if there was no annotation id
                            this.annotationId = localAnnotation.id;
                        }

                        this.processAnnotations();
                    }*/
                });
            }
        }
    }
}

ComponentGradingController.$inject = [
    '$filter',
    '$mdDialog',
    '$scope',
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
