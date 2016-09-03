'use strict';

class ComponentAnnotationsController {
    constructor($scope,
                $element,
                $translate,
                ConfigService,
                ProjectService,
                StudentDataService) {
        this.$scope = $scope;
        this.$translate = $translate;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;

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

        // watch for new component states
        this.$scope.$on('studentWorkSavedToServer', (event, args) => {
            let nodeId = args.studentWork.nodeId;
            let componentId = args.studentWork.componentId;
            if (nodeId === this.nodeId && componentId === this.componentId) {
                this.isNew = false;
            }
        });

        this.$onChanges = (changes) => {
            this.processAnnotations();
        };
    }

    /**
     * Get the most recent annotation (from the current score and comment annotations)
     * @return Object (latest annotation)
     */
    getLatestAnnotation() {
        let latest = null;

        if (this.commentAnnotation || this.scoreAnnotation) {
            let commentSaveTime = this.commentAnnotation ? this.commentAnnotation.serverSaveTime : 0;
            let scoreSaveTime = this.scoreAnnotation ? this.scoreAnnotation.serverSaveTime : 0;

            if (commentSaveTime >= scoreSaveTime) {
                latest = this.commentAnnotation;
            } else if (scoreSaveTime > commentSaveTime) {
                latest = this.scoreAnnotation;
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
    };

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
    };

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
    };

    /**
     * Set the label based on whether this is an automated or teacher annotation
     **/
    setLabelAndIcon() {
        let latest = this.getLatestAnnotation();

        if (latest) {
            if (latest.type === 'autoComment' || latest.type === 'autoScore') {
                this.$translate(['automatedFeedbackLabel']).then((translations) => {
                    this.label = translations.automatedFeedbackLabel;
                    this.icon = 'keyboard';
                });
            } else {
                this.$translate(['teacherFeedbackLabel']).then((translations) => {
                    this.label = translations.teacherFeedbackLabel;
                    this.icon = "person";
                });
            }
        }
    };

    processAnnotations() {
        if (this.commentAnnotation || this.scoreAnnotation) {
            this.nodeId = this.commentAnnotation ? this.commentAnnotation.nodeId : this.scoreAnnotation.nodeId;
            this.componentId = this.commentAnnotation ? this.commentAnnotation.componentId : this.scoreAnnotation.nodeId;

            // set the latest annotation time
            //this.latestAnnotationTime = this.getLatestAnnotationTime();

            // set whether the annotation is new or not
            //this.isNew = this.isNewAnnotation();

            // set the annotation label and icon
            this.setLabelAndIcon();
        }
    };
}

ComponentAnnotationsController.$inject = [
    '$scope',
    '$element',
    '$translate',
    'ConfigService',
    'ProjectService',
    'StudentDataService'
];

export default ComponentAnnotationsController;
