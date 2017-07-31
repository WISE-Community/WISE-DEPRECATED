'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ComponentRevisionsInfoController = function () {
    function ComponentRevisionsInfoController($filter, $mdDialog, $scope, AnnotationService, ConfigService, TeacherDataService) {
        var _this = this;

        _classCallCheck(this, ComponentRevisionsInfoController);

        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.$scope = $scope;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.TeacherDataService = TeacherDataService;

        this.$translate = this.$filter('translate');

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
                _this.maxScore = typeof changes.maxScore.currentValue === 'number' ? changes.maxScore.currentValue : 0;
            }

            // get all the componentStates for this workgroup
            _this.componentStates = _this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(_this.toWorkgroupId, _this.componentId);
            var total = _this.componentStates.length;

            if (total > 0) {
                var latest = _this.componentStates[total - 1];

                if (latest) {
                    // calculate the save time of the latest component state
                    var serverSaveTime = latest.serverSaveTime;
                    _this.latestComponentStateTime = _this.ConfigService.convertToClientTimestamp(serverSaveTime);

                    // check if the latest component state is a submit
                    _this.latestComponentStateIsSubmit = latest.isSubmit;
                }
            }

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

    _createClass(ComponentRevisionsInfoController, [{
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

            this.latestTeacherAnnotationTime = this.getLatestTeacherAnnotationTime();

            this.hasNewWork = this.checkHasNewWork();
        }
    }, {
        key: 'checkHasNewWork',
        value: function checkHasNewWork() {
            var result = false;

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
    }, {
        key: 'showRevisions',
        value: function showRevisions($event) {
            var workgroupId = this.toWorkgroupId;
            var componentId = this.componentId;
            var maxScore = this.maxScore;
            var userNames = this.userNames;

            this.$mdDialog.show({
                parent: angular.element(document.body),
                targetEvent: $event,
                fullscreen: true,
                template: '<md-dialog aria-label="{{ \'revisionsForTeam\' | translate:{teamNames: userNames} }}" class="dialog--wider">\n                    <md-toolbar>\n                        <div class="md-toolbar-tools">\n                            <h2 class="overflow--ellipsis">{{ \'revisionsForTeam\' | translate:{teamNames: userNames} }}</h2>\n                        </div>\n                    </md-toolbar>\n                    <md-dialog-content>\n                        <div class="md-dialog-content gray-lighter-bg">\n                            <workgroup-component-revisions workgroup-id="workgroupId" component-id="{{ componentId }}" max-score="maxScore"></workgroup-component-revisions>\n                        </div>\n                    </md-dialog-content>\n                    <md-dialog-actions layout="row" layout-align="end center">\n                        <md-button class="md-primary" ng-click="close()" aria-label="{{ \'close\' | translate }}">{{ \'close\' | translate }}</md-button>\n                    </md-dialog-actions>\n                </md-dialog>',
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
                $scope.close = function () {
                    $mdDialog.hide();
                };
            }
            RevisionsController.$inject = ["$scope", "$mdDialog", "workgroupId", "componentId", "maxScore", "userNames"];
        }
    }]);

    return ComponentRevisionsInfoController;
}();

ComponentRevisionsInfoController.$inject = ['$filter', '$mdDialog', '$scope', 'AnnotationService', 'ConfigService', 'TeacherDataService'];

var ComponentRevisionsInfo = {
    bindings: {
        nodeId: '<',
        componentId: '<',
        maxScore: '<',
        toWorkgroupId: '<',
        componentStateId: '<'
    },
    template: '<div class="component__actions__info component--grading__actions__info md-caption">\n            <span ng-if="$ctrl.componentStates.length > 0">\n                <span ng-if="$ctrl.latestComponentStateIsSubmit">{{ \'SUBMITTED\' | translate }} </span>\n                <span ng-if="!$ctrl.latestComponentStateIsSubmit">{{ \'SAVED\' | translate }} </span>\n                <span>\n                    <span class="component__actions__more" am-time-ago="$ctrl.latestComponentStateTime"></span>\n                    <md-tooltip md-direction="top">{{ $ctrl.latestComponentStateTime | amDateFormat:\'ddd, MMM D YYYY, h:mm a\' }}</md-tooltip>\n                </span>\n            </span>\n            <span ng-if="$ctrl.componentStates.length === 0">{{ \'TEAM_HAS_NOT_SAVED_ANY_WORK\' | translate }}</span>\n            <span ng-if="$ctrl.componentStates.length > 0">\n                &#8226;&nbsp;<a ng-click="$ctrl.showRevisions($event)" translate="SEE_REVISIONS" translate-value-number="{{($ctrl.componentStates.length - 1)}}"></a>\n           </span>\n    </div>',
    controller: ComponentRevisionsInfoController
};

exports.default = ComponentRevisionsInfo;
//# sourceMappingURL=componentRevisionsInfo.js.map