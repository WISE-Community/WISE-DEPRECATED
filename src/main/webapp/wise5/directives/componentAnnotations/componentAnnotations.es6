'use strict';

class ComponentAnnotationsController {
    constructor($scope,
                $element,   // TODO remove after verifying that this is not being used
                $filter,
                $mdDialog,
                $timeout,
                ConfigService,
                ProjectService,
                StudentDataService) {
        this.$scope = $scope;
        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;

        this.$translate = this.$filter('translate');

        this.maxScoreDisplay = (parseInt(this.maxScore) > 0) ? '/' + this.maxScore : '';

        this.themeSettings = this.ProjectService.getThemeSettings();
        this.hideComponentScores = this.themeSettings.hideComponentScores;

        this.nodeId = null;
        this.componentId = null;

        // the latest annoation time
        this.latestAnnotationTime = null;

        // whether the annotation is new or not
        this.isNew = false;

        // the annotation label
        this.label = '';

        // the avatar icon (default to person/teacher)
        this.icon = 'person';

        this.showScore = true;
        this.showComment = true;

        // watch for new component states
        this.$scope.$on('studentWorkSavedToServer', (event, args) => {
            let nodeId = args.studentWork.nodeId;
            let componentId = args.studentWork.componentId;
            if (nodeId === this.nodeId && componentId === this.componentId) {
                this.isNew = false;
            }
        });

        /* used to pop up annotation
        $timeout(() => {
            this.$mdDialog.show({
                contentElement: '#componentAnnotationsCard',
                parent: angular.element(document.body)
            });
        });
        */

        /* uncomment me and use me instead of timeout when we switch to angular 2
        this.$onAfterViewInit = () => {
            this.$mdDialog.show({
                contentElement: '#componentAnnotationsCard',
                parent: angular.element(document.body)
            });
        };
        */

        this.$onChanges = (changes) => {
            //if (changes.annotations) {
                //this.annotations = angular.copy(changes.annotations.currentValue);
                this.processAnnotations();
            //}
        };
    }

    closeDialog() {
        this.$mdDialog.hide();
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
     * Find nodeExited time of the latest node visit for this component
     * @return Number (latest node exit time)
     */
    getLatestVisitTime() {
        let nodeEvents = this.StudentDataService.getEventsByNodeId(this.nodeId);
        let n = nodeEvents.length - 1;
        let visitTime = null;

        for (let i = n; i > 0; i--) {
            let event = nodeEvents[i];
            if (event.event === 'nodeExited') {
                visitTime = this.ConfigService.convertToClientTimestamp(event.serverSaveTime);
                break;
            }
        }

        return visitTime;
    }

    /**
     * Find and the latest save time for this component
     * @return Number (latest save time)
     */
    getLatestSaveTime() {
        let latestState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
        let saveTime = null;

        if (latestState) {
            saveTime = this.ConfigService.convertToClientTimestamp(latestState.serverSaveTime);
        }

        return saveTime;
    }

    /**
     * Check whether the current annotation for this component is new to the
     * workgroup (i.e. if the workgroup hasn't seen the annotation on a previous
     * node visit and the latest annotation came after the latest component state)
     * @return Boolean (true or false)
     */
    isNewAnnotation() {
        let latestVisitTime = this.getLatestVisitTime();
        let latestSaveTime = this.getLatestSaveTime();
        let latestAnnotationTime = this.getLatestAnnotationTime();
        let isNew = true;

        if (latestVisitTime && (latestVisitTime > latestAnnotationTime)) {
            isNew = false;
        }

        if (latestSaveTime && (latestSaveTime > latestAnnotationTime)) {
            isNew = false;
        }

        return isNew;
    }

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
    }

    processAnnotations() {
        if (this.annotations != null) {
            if (this.annotations.comment || this.annotations.score) {
                this.nodeId = this.annotations.comment ?
                        this.annotations.comment.nodeId : this.annotations.score.nodeId;
                this.componentId = this.annotations.comment ?
                        this.annotations.comment.componentId : this.annotations.score.nodeId;
                this.showScore = this.annotations.score != null &&
                        this.ProjectService.displayAnnotation(this.annotations.score);
                this.showComment = this.annotations.comment != null &&
                        this.ProjectService.displayAnnotation(this.annotations.comment);
                this.setLabelAndIcon();
            }
        }
    }
}

ComponentAnnotationsController.$inject = [
    '$scope',
    '$element',
    '$filter',
    '$mdDialog',
    '$timeout',
    'ConfigService',
    'ProjectService',
    'StudentDataService'
];

const ComponentAnnotations = {
    bindings: {
        annotations: '<',
        maxScore: '<'
    },
    templateUrl: 'wise5/directives/componentAnnotations/componentAnnotations.html',
    controller: ComponentAnnotationsController,
    controllerAs: 'componentAnnotationsCtrl'
};

export default ComponentAnnotations;
