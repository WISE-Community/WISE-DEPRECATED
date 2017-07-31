'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ComponentGradingController = function () {
    function ComponentGradingController($filter, $mdDialog, $scope, $timeout, AnnotationService, ConfigService, ProjectService, TeacherDataService, UtilService) {
        var _this = this;

        _classCallCheck(this, ComponentGradingController);

        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.TeacherDataService = TeacherDataService;
        this.UtilService = UtilService;

        this.$translate = this.$filter('translate');

        this.$onInit = function () {
            _this.runId = _this.ConfigService.getRunId();

            var toUserInfo = _this.ConfigService.getUserInfoByWorkgroupId(_this.toWorkgroupId);
            if (toUserInfo) {
                // set the period id
                _this.periodId = toUserInfo.periodId;
            }
        };

        this.$onChanges = function (changes) {

            if (changes.maxScore) {
                _this.maxScore = typeof changes.maxScore.currentValue === 'number' ? changes.maxScore.currentValue : 0;
            }

            _this.componentStates = _this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(_this.toWorkgroupId, _this.componentId);

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

        this.$scope.$on('projectSaved', function (event, args) {
            // update maxScore
            _this.maxScore = _this.ProjectService.getMaxScoreForComponent(_this.nodeId, _this.componentId);
        });
    }

    _createClass(ComponentGradingController, [{
        key: 'processAnnotations',
        value: function processAnnotations() {
            this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.toWorkgroupId);

            if (this.latestAnnotations && this.latestAnnotations.comment) {
                var latestComment = this.latestAnnotations.comment;
                if (latestComment.type === 'comment') {
                    this.comment = latestComment.data.value;
                }
            }

            if (this.latestAnnotations && this.latestAnnotations.score) {
                this.score = this.latestAnnotations.score.data.value;
            }

            this.latestAnnotationTime = this.getLatestAnnotationTime();
        }

        /**
         * Returns true if the latest comment is an auto comment and it's
         * studentWorkId matches the latest component state's id
         */

    }, {
        key: 'showAutoComment',
        value: function showAutoComment() {
            var result = false;
            if (this.latestAnnotations) {
                var latestComment = this.latestAnnotations.comment;
                if (latestComment && latestComment.type === 'autoComment') {
                    var n = this.componentStates.length;
                    if (n > 0) {
                        var latestComponentState = this.componentStates[n - 1];
                        if (latestComponentState.id === latestComment.studentWorkId) {
                            result = true;
                        }
                    }
                }
            }

            return result;
        }

        /**
         * Get the most recent annotation (from the current score and comment annotations)
         * @return Object (latest annotation)
         */

    }, {
        key: 'getLatestAnnotation',
        value: function getLatestAnnotation() {
            var latest = null;
            var latestComment = this.latestAnnotations.comment;
            var latestScore = this.latestAnnotations.score;

            if (latestComment || latestScore) {
                var commentSaveTime = latestComment ? latestComment.serverSaveTime : 0;
                var scoreSaveTime = latestScore ? latestScore.serverSaveTime : 0;

                if (commentSaveTime >= scoreSaveTime) {
                    latest = latestComment;
                } else if (scoreSaveTime > commentSaveTime) {
                    latest = latestScore;
                }
            }

            return latest;
        }

        /**
         * Calculate the save time of the latest annotation
         * @return Number (latest annotation post time)
         */

    }, {
        key: 'getLatestAnnotationTime',
        value: function getLatestAnnotationTime() {
            var latest = this.getLatestAnnotation();
            var time = 0;

            if (latest) {
                var serverSaveTime = latest.serverSaveTime;
                time = this.ConfigService.convertToClientTimestamp(serverSaveTime);
            }

            return time;
        }

        /**
         * Save the annotation to the server
         * @param type String to indicate which type of annotation to post
         */

    }, {
        key: 'postAnnotation',
        value: function postAnnotation(type) {

            if (this.runId != null && this.periodId != null && this.nodeId != null && this.componentId != null && this.toWorkgroupId != null && type) {

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
                    var data = {};
                    data.value = value;
                    var localNotebookItemId = null; // we're not grading notebook item in this view.
                    var notebookItemId = null; // we're not grading notebook item in this view.

                    // create the annotation object
                    var annotation = this.AnnotationService.createAnnotation(this.annotationId, this.runId, this.periodId, this.fromWorkgroupId, this.toWorkgroupId, this.nodeId, this.componentId, this.componentStateId, localNotebookItemId, notebookItemId, type, data, clientSaveTime);

                    // save the annotation to the server
                    this.AnnotationService.saveAnnotation(annotation).then(function (result) {});
                }
            }
        }

        /**
         * Save the maxScore of this component to the server
         */

    }, {
        key: 'updateMaxScore',
        value: function updateMaxScore() {

            if (this.runId != null && this.periodId != null && this.nodeId != null && this.componentId != null) {

                // get the new maxScore
                var maxScore = this.maxScore;
                // convert to number if possible
                maxScore = this.UtilService.convertStringToNumber(maxScore);

                if (typeof maxScore === 'number' && maxScore >= 0) {
                    this.ProjectService.setMaxScoreForComponent(this.nodeId, this.componentId, maxScore);
                    this.ProjectService.saveProject();
                }
            }
        }

        /**
         * Shows (or hides) the teacher comment field when user wants to override an automated comment
         */

    }, {
        key: 'editComment',
        value: function editComment() {
            this.edit = !this.edit;

            if (this.edit) {
                var componentId = this.componentId;
                var toWorkgroupId = this.toWorkgroupId;
                // if we're showing the comment field, focus it
                this.$timeout(function () {
                    angular.element(document.querySelector('#commentInput_' + componentId + '_' + toWorkgroupId)).focus();
                }, 100);
            }
        }

        /**
         * Focuses the score input when user wants to override an automated score
         * @param an angular trigger event
         */

    }, {
        key: 'editScore',
        value: function editScore($event) {
            angular.element(document.querySelector('#scoreInput_' + this.componentId + '_' + this.toWorkgroupId)).focus();
        }
    }]);

    return ComponentGradingController;
}();

ComponentGradingController.$inject = ['$filter', '$mdDialog', '$scope', '$timeout', 'AnnotationService', 'ConfigService', 'ProjectService', 'TeacherDataService', 'UtilService'];

var ComponentGrading = {
    bindings: {
        nodeId: '<',
        componentId: '<',
        maxScore: '<',
        fromWorkgroupId: '<',
        toWorkgroupId: '<',
        componentStateId: '<',
        active: '<'
    },
    templateUrl: 'wise5/classroomMonitor/classroomMonitorComponents/shared/componentGrading/componentGrading.html',
    controller: ComponentGradingController
};

exports.default = ComponentGrading;
//# sourceMappingURL=componentGrading.js.map