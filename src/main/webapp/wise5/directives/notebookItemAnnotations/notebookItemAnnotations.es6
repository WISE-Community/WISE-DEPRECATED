'use strict';

class NotebookItemAnnotationsController {
    constructor($scope,
                $filter,
                AnnotationService,
                ConfigService,
                NotebookService,
                ProjectService,
                StudentDataService) {

        this.$scope = $scope;
        this.$filter = $filter;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;

        this.$translate = this.$filter('translate');

        this.maxScore = 0;
        let localNotebookItemId = null;  // unique id that is local to this student, that identifies a note and its revisions. e.g. "finalReport", "xyzabc"
        if (this.notebookItem != null && this.notebookItem.content != null && this.notebookItem.content.reportId != null) {
            localNotebookItemId = this.notebookItem.localNotebookItemId;
            let reportNoteContent = this.NotebookService.getReportNoteContentByReportId(this.notebookItem.content.reportId);
            if (reportNoteContent != null && reportNoteContent.maxScore != null) {
                this.maxScore = reportNoteContent.maxScore;
            }
        }

        // get the latest annotation for this notebook item
        this.annotations = this.AnnotationService.getLatestNotebookItemAnnotations(this.workgroupId, localNotebookItemId);

        this.maxScoreDisplay = (parseInt(this.maxScore) > 0) ? '/' + this.maxScore : '';

        // the latest annotation time
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
        /*
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
        */
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
                this.label = this.$translate('automatedFeedbackLabel');
                this.icon = 'keyboard';
            } else {
                this.label = this.$translate('teacherFeedbackLabel');
                this.icon = "person";
            }
        }
    };

    processAnnotations() {
        if (this.annotations != null) {
            if (this.annotations.comment || this.annotations.score) {
                this.nodeId = this.annotations.comment ? this.annotations.comment.nodeId : this.annotations.score.nodeId;
                this.componentId = this.annotations.comment ? this.annotations.comment.componentId : this.annotations.score.nodeId;

                if (!this.ProjectService.displayAnnotation(this.annotations.score)) {
                    // we do not want to show the score
                    this.showScore = false;
                }

                if (!this.ProjectService.displayAnnotation(this.annotations.comment)) {
                    // we do not want to show the comment
                    this.showComment = false;
                }

                // set the annotation label and icon
                this.setLabelAndIcon();
            }
        }
    };
}

NotebookItemAnnotationsController.$inject = [
    '$scope',
    '$filter',
    'AnnotationService',
    'ConfigService',
    'NotebookService',
    'ProjectService',
    'StudentDataService'
];

const NotebookItemAnnotations = {
    bindings: {
        notebookItem: '<'
    },
    templateUrl: 'wise5/directives/notebookItemAnnotations/notebookItemAnnotations.html',
    controller: NotebookItemAnnotationsController,
    controllerAs: 'notebookItemAnnotationsCtrl'
};

export default NotebookItemAnnotations;
