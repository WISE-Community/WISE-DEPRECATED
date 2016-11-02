'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ComponentGradingController = function () {
    function ComponentGradingController($scope, $translate, AnnotationService, ConfigService, TeacherDataService, UtilService) {
        var _this = this;

        _classCallCheck(this, ComponentGradingController);

        this.$scope = $scope;
        this.$translate = $translate;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.TeacherDataService = TeacherDataService;
        this.UtilService = UtilService;

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
                _this.hasMaxScore = typeof _this.maxScore === 'number';
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

    _createClass(ComponentGradingController, [{
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
        }
    }, {
        key: 'hasNewWork',
        value: function hasNewWork() {
            var result = false;

            if (this.latestComponentStateTime) {
                // there is work for this component

                var latestTeacherAnnotationTime = this.getLatestTeacherAnnotationTime();
                if (latestTeacherAnnotationTime) {
                    if (this.latestComponentStateTime > latestTeacherAnnotationTime) {
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

    }, {
        key: 'showAutoComment',
        value: function showAutoComment() {
            var result = false;
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

            return result;
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
         * @param type String to indicate which type of annotation to post
         */

    }, {
        key: 'postAnnotation',
        value: function postAnnotation(type) {
            var _this2 = this;

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

                    // create the annotation object
                    var annotation = this.AnnotationService.createAnnotation(this.annotationId, this.runId, this.periodId, this.fromWorkgroupId, this.toWorkgroupId, this.nodeId, this.componentId, this.componentStateId, type, data, clientSaveTime);

                    // save the annotation to the server
                    this.AnnotationService.saveAnnotation(annotation).then(function (result) {
                        var localAnnotation = result;

                        if (localAnnotation != null) {
                            if (_this2.annotationId == null) {
                                // set the annotation id if there was no annotation id
                                _this2.annotationId = localAnnotation.id;
                            }

                            _this2.processAnnotations();
                        }
                    });
                }
            }
        }
    }]);

    return ComponentGradingController;
}();

ComponentGradingController.$inject = ['$scope', '$translate', 'AnnotationService', 'ConfigService', 'TeacherDataService', 'UtilService'];

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
    templateUrl: 'wise5/directives/componentGrading/componentGrading.html',
    controller: ComponentGradingController
};

exports.default = ComponentGrading;
//# sourceMappingURL=componentGrading.js.map