'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookItemGradingController = function () {
    function NotebookItemGradingController($filter, $mdDialog, $scope, AnnotationService, ConfigService, NotebookService, TeacherDataService, UtilService) {
        var _this = this;

        _classCallCheck(this, NotebookItemGradingController);

        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.$scope = $scope;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.NotebookService = NotebookService;
        this.TeacherDataService = TeacherDataService;
        this.UtilService = UtilService;

        this.$translate = this.$filter('translate');

        this.notebookItemId = this.notebookItem.id;
        this.localNotebookItemId = this.notebookItem.localNotebookItemId;
        this.toWorkgroupId = this.notebookItem.workgroupId;
        this.maxScore = 0;
        if (this.notebookItem != null && this.notebookItem.content != null && this.notebookItem.content.reportId != null) {
            var reportNoteContent = this.NotebookService.getReportNoteContentByReportId(this.notebookItem.content.reportId);
            if (reportNoteContent != null && reportNoteContent.maxScore != null) {
                this.maxScore = reportNoteContent.maxScore;
            }
        }

        this.$onInit = function () {
            _this.runId = _this.ConfigService.getRunId();

            var toUserInfo = _this.ConfigService.getUserInfoByWorkgroupId(_this.toWorkgroupId);
            if (toUserInfo) {
                // set the period id
                _this.periodId = toUserInfo.periodId;
            }

            // get the workgroup user names
            var userNamesArray = _this.ConfigService.getUserNamesByWorkgroupId(_this.toWorkgroupId);
            _this.userNames = userNamesArray.map(function (obj) {
                return obj.name;
            }).join(', ');
        };

        this.$onChanges = function (changes) {

            if (changes.maxScore) {
                _this.hasMaxScore = typeof _this.notebookItem.maxScore === 'number' || _this.notebookItem.maxScore == null;
            }

            _this.componentStates = _this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(_this.toWorkgroupId, _this.componentId);
            _this.latestComponentStateTime = _this.getLatestComponentStateTime();

            _this.processAnnotations();
        };

        this.$scope.$on('annotationSavedToServer', function (event, args) {
            // TODO: we're watching this here and in the parent component's controller; probably want to optimize!
            if (args != null) {

                // get the annotation that was saved to the server
                var annotation = args.annotation;

                if (annotation != null) {

                    // get the node id and component id of the annotation
                    var annotationNodeId = annotation.nodeId;
                    var annotationComponentId = annotation.componentId;

                    // make sure the annotation was for this component
                    if (_this.nodeId === annotationNodeId && _this.componentId === annotationComponentId) {

                        // get latest score and comment annotations for this component
                        _this.processAnnotations();
                    }
                }
            }
        });
    }

    _createClass(NotebookItemGradingController, [{
        key: 'processAnnotations',
        value: function processAnnotations() {
            this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.toWorkgroupId);

            if (this.latestAnnotations && this.latestAnnotations.comment) {
                var latestComment = this.latestAnnotations.comment;
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
        }

        /**
         * Get the most recent teacher annotation (from the current score and comment annotations)
         * @return Object (latest teacher annotation)
         */

    }, {
        key: 'getLatestTeacherAnnotation',
        value: function getLatestTeacherAnnotation() {
            var latest = null;
            var latestComment = this.latestAnnotations.comment;
            var latestScore = this.latestAnnotations.score;
            var latestTeacherComment = latestComment && latestComment.type === 'comment' ? latestComment : null;
            var latestTeacherScore = latestScore && latestScore.type === 'score' ? latestScore : null;

            if (latestTeacherComment || latestTeacherScore) {
                var commentSaveTime = latestTeacherComment ? latestTeacherComment.serverSaveTime : 0;
                var scoreSaveTime = latestTeacherScore ? latestTeacherScore.serverSaveTime : 0;

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

    }, {
        key: 'getLatestTeacherAnnotationTime',
        value: function getLatestTeacherAnnotationTime() {
            var latest = this.getLatestTeacherAnnotation();
            var time = 0;

            if (latest) {
                var serverSaveTime = latest.serverSaveTime;
                time = this.ConfigService.convertToClientTimestamp(serverSaveTime);
            }

            return time;
        }

        /**
         * Calculate the save time of the latest component state
         * @return Number (latest annotation post time)
         */

    }, {
        key: 'getLatestComponentStateTime',
        value: function getLatestComponentStateTime() {
            var total = this.componentStates.length;
            var time = null;

            if (total) {
                var latest = this.componentStates[total - 1];

                if (latest) {
                    var serverSaveTime = latest.serverSaveTime;
                    time = this.ConfigService.convertToClientTimestamp(serverSaveTime);
                }
            }

            return time;
        }

        /**
         * Save the annotation to the server
         * @param type String to indicate which type of annotation to post [score,comment]
         */

    }, {
        key: 'postAnnotation',
        value: function postAnnotation(type) {

            if (this.runId != null && this.periodId != null && this.notebookItemId != null && this.toWorkgroupId != null && type) {

                // get the current time
                var clientSaveTime = new Date().getTime();

                // get the logged in teacher's id
                var fromWorkgroupId = this.ConfigService.getWorkgroupId();

                // get the value
                var value = null;
                if (type === 'score') {
                    value = this.score;
                    // convert the value to a number if possible
                    value = this.UtilService.convertStringToNumber(value);
                } else if (type === 'comment') {
                    value = this.comment;
                }

                if (type === 'comment' && value || type === 'score' && typeof value === 'number' && value >= 0) {
                    var data = {
                        value: value
                    };
                    var componentStateId = null; // we're not grading studentWork in this view, only notebook items

                    // create the annotation object
                    var annotation = this.AnnotationService.createAnnotation(this.annotationId, this.runId, this.periodId, fromWorkgroupId, this.toWorkgroupId, this.nodeId, this.componentId, componentStateId, this.localNotebookItemId, this.notebookItemId, type, data, clientSaveTime);

                    // save the annotation to the server
                    this.AnnotationService.saveAnnotation(annotation).then(function (result) {
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
    }]);

    return NotebookItemGradingController;
}();

NotebookItemGradingController.$inject = ['$filter', '$mdDialog', '$scope', 'AnnotationService', 'ConfigService', 'NotebookService', 'TeacherDataService', 'UtilService'];

var NotebookItemGrading = {
    bindings: {
        maxScore: '<',
        notebookItem: '<'
    },
    templateUrl: 'wise5/directives/notebookItemGrading/notebookItemGrading.html',
    controller: NotebookItemGradingController
};

exports.default = NotebookItemGrading;
//# sourceMappingURL=notebookItemGrading.js.map