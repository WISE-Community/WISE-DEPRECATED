'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookItemAnnotationsController = function () {
    function NotebookItemAnnotationsController($scope, $filter, AnnotationService, ConfigService, NotebookService, ProjectService, StudentDataService) {
        _classCallCheck(this, NotebookItemAnnotationsController);

        this.$scope = $scope;
        this.$filter = $filter;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;

        this.$translate = this.$filter('translate');

        this.maxScore = 0;
        var localNotebookItemId = null; // unique id that is local to this student, that identifies a note and its revisions. e.g. "finalReport", "xyzabc"
        if (this.notebookItem != null && this.notebookItem.content != null && this.notebookItem.content.reportId != null) {
            localNotebookItemId = this.notebookItem.localNotebookItemId;
            var reportNoteContent = this.NotebookService.getReportNoteContentByReportId(this.notebookItem.content.reportId);
            if (reportNoteContent != null && reportNoteContent.maxScore != null) {
                this.maxScore = reportNoteContent.maxScore;
            }
        }

        // get the latest annotation for this notebook item
        this.annotations = this.AnnotationService.getLatestNotebookItemAnnotations(this.workgroupId, localNotebookItemId);

        this.maxScoreDisplay = parseInt(this.maxScore) > 0 ? '/' + this.maxScore : '';

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


    _createClass(NotebookItemAnnotationsController, [{
        key: 'getLatestAnnotation',
        value: function getLatestAnnotation() {
            var latest = null;

            if (this.annotations.comment || this.annotations.score) {
                var commentSaveTime = this.annotations.comment ? this.annotations.comment.serverSaveTime : 0;
                var scoreSaveTime = this.annotations.score ? this.annotations.score.serverSaveTime : 0;

                if (commentSaveTime >= scoreSaveTime) {
                    latest = this.annotations.comment;
                } else if (scoreSaveTime > commentSaveTime) {
                    latest = this.annotations.score;
                }
            }

            return latest;
        }
    }, {
        key: 'getLatestAnnotationTime',


        /**
         * Calculate the save time of the latest annotation
         * @return Number (latest annotation post time)
         */
        value: function getLatestAnnotationTime() {
            var latest = this.getLatestAnnotation();
            var time = null;

            if (latest) {
                var serverSaveTime = latest.serverSaveTime;
                time = this.ConfigService.convertToClientTimestamp(serverSaveTime);
            }

            return time;
        }
    }, {
        key: 'getLatestVisitTime',


        /**
         * Find nodeExited time of the latest node visit for this component
         * @return Number (latest node exit time)
         */
        value: function getLatestVisitTime() {
            var nodeEvents = this.StudentDataService.getEventsByNodeId(this.nodeId);
            var n = nodeEvents.length - 1;
            var visitTime = null;

            for (var i = n; i > 0; i--) {
                var event = nodeEvents[i];
                if (event.event === 'nodeExited') {
                    visitTime = this.ConfigService.convertToClientTimestamp(event.serverSaveTime);
                    break;
                }
            }

            return visitTime;
        }
    }, {
        key: 'getLatestSaveTime',


        /**
         * Find and the latest save time for this component
         * @return Number (latest save time)
         */
        value: function getLatestSaveTime() {
            var latestState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
            var saveTime = null;

            if (latestState) {
                saveTime = this.ConfigService.convertToClientTimestamp(latestState.serverSaveTime);
            }

            return saveTime;
        }
    }, {
        key: 'isNewAnnotation',


        /**
         * Check whether the current annotation for this component is new to the
         * workgroup (i.e. if the workgroup hasn't seen the annotation on a previous
         * node visit and the latest annotation came after the latest component state)
         * @return Boolean (true or false)
         */
        value: function isNewAnnotation() {
            var latestVisitTime = this.getLatestVisitTime();
            var latestSaveTime = this.getLatestSaveTime();
            var latestAnnotationTime = this.getLatestAnnotationTime();
            var isNew = true;

            if (latestVisitTime && latestVisitTime > latestAnnotationTime) {
                isNew = false;
            }

            if (latestSaveTime && latestSaveTime > latestAnnotationTime) {
                isNew = false;
            }

            return isNew;
        }
    }, {
        key: 'setLabelAndIcon',


        /**
         * Set the label based on whether this is an automated or teacher annotation
         **/
        value: function setLabelAndIcon() {
            var latest = this.getLatestAnnotation();

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
    }, {
        key: 'processAnnotations',
        value: function processAnnotations() {
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
        }
    }]);

    return NotebookItemAnnotationsController;
}();

NotebookItemAnnotationsController.$inject = ['$scope', '$filter', 'AnnotationService', 'ConfigService', 'NotebookService', 'ProjectService', 'StudentDataService'];

var NotebookItemAnnotations = {
    bindings: {
        notebookItem: '<'
    },
    templateUrl: 'wise5/directives/notebookItemAnnotations/notebookItemAnnotations.html',
    controller: NotebookItemAnnotationsController,
    controllerAs: 'notebookItemAnnotationsCtrl'
};

exports.default = NotebookItemAnnotations;
//# sourceMappingURL=notebookItemAnnotations.js.map