'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookReportAnnotationsController = function () {
    function NotebookReportAnnotationsController($scope, $filter, ConfigService, ProjectService, StudentDataService) {
        var _this = this;

        _classCallCheck(this, NotebookReportAnnotationsController);

        this.$scope = $scope;
        this.$filter = $filter;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;

        this.$translate = this.$filter('translate');

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

        this.$onChanges = function (changes) {
            if (changes.annotations) {
                _this.annotations = angular.copy(changes.annotations.currentValue);
                _this.processAnnotations();
            }
        };
    }

    /**
     * Get the most recent annotation (from the current score and comment annotations)
     * @return Object (latest annotation)
     */


    _createClass(NotebookReportAnnotationsController, [{
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

                this.latestAnnotationTime = this.getLatestAnnotationTime();

                this.show = this.showScore && this.annotations.score || this.showComment && this.annotations.comment;
            }
        }
    }]);

    return NotebookReportAnnotationsController;
}();

NotebookReportAnnotationsController.$inject = ['$scope', '$filter', 'ConfigService', 'ProjectService', 'StudentDataService'];

var NotebookReportAnnotations = {
    bindings: {
        annotations: '<',
        hasNew: '<',
        maxScore: '<'
    },
    template: '<div class="md-padding gray-lightest-bg annotations-container--student--report" ng-if="$ctrl.show">\n            <md-card class="annotations annotations--report">\n                <md-card-title class="annotations__header">\n                    <div class="annotations__avatar avatar--icon avatar--square md-36 avatar md-whiteframe-1dp">\n                        <md-icon class="annotations__icon md-36">{{$ctrl.icon}}</md-icon>\n                    </div>\n                    <div class="annotations__title" layout="row" flex>\n                        <span>{{$ctrl.label}}</span>\n                        <span flex></span>\n                        <span ng-if="$ctrl.hasNew" class="badge annotations__status animate-fade" translate="new"></span>\n                    </div>\n                </md-card-title>\n                <md-card-content class="annotations__body md-body-1">\n                    <div ng-if="$ctrl.showComment && $ctrl.annotations.comment.data.value"><compile data="$ctrl.annotations.comment.data.value"></compile></div>\n                    <hr ng-if="$ctrl.annotations.comment" />\n                    <div layout="row" laoyut-align="start center">\n                        <span ng-if="$ctrl.showScore && $ctrl.annotations.score"\n                              class="annotations__score"\n                              translate="SCORE_LABEL_AND_VALUE"\n                              translate-value-score="{{$ctrl.annotations.score.data.value}}{{$ctrl.maxScoreDisplay}}"></span>\n                        <span flex></span>\n                        <span>\n                            <span class="annotations__info" am-time-ago="$ctrl.latestAnnotationTime"></span>\n                            <md-tooltip md-direction="top">{{ $ctrl.latestAnnotationTime | amDateFormat:\'ddd, MMM D YYYY, h:mm a\' }}</md-tooltip>\n                        </span>\n                    </div>\n                </md-card-content>\n            </md-card>\n        </div>',
    controller: NotebookReportAnnotationsController
};

exports.default = NotebookReportAnnotations;
//# sourceMappingURL=notebookReportAnnotations.js.map