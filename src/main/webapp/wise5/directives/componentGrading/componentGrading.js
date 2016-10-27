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

            _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.toWorkgroupId);
            _this.processAnnotations();

            _this.componentStates = _this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(_this.toWorkgroupId, _this.componentId);
            _this.latestComponentStateTime = _this.getLatestComponentStateTime();
        };
    }

    _createClass(ComponentGradingController, [{
        key: 'processAnnotations',
        value: function processAnnotations() {
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
    }, {
        key: 'hasNewWork',
        value: function hasNewWork() {
            if (this.latestComponentStateTime) {
                var latestAnnotationTime = this.getLatestAnnotationTime();
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

    }, {
        key: 'getLatestAnnotation',
        value: function getLatestAnnotation() {
            var latest = null;

            if (this.latestAnnotations.comment || this.latestAnnotations.score) {
                var commentSaveTime = this.latestAnnotations.comment ? this.latestAnnotations.comment.serverSaveTime : 0;
                var scoreSaveTime = this.latestAnnotations.score ? this.latestAnnotations.score.serverSaveTime : 0;

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

    }, {
        key: 'getLatestAnnotationTime',
        value: function getLatestAnnotationTime() {
            var latest = this.getLatestAnnotation();
            var time = null;

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

                if (value) {
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