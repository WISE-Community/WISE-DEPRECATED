'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ComponentAnnotationsController = function () {
    function ComponentAnnotationsController($scope, $element, // TODO remove after verifying that this is not being used
    $filter, $mdDialog, $timeout, ConfigService, ProjectService, StudentDataService) {
        var _this = this;

        _classCallCheck(this, ComponentAnnotationsController);

        this.$scope = $scope;
        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;

        this.$translate = this.$filter('translate');

        this.maxScoreDisplay = parseInt(this.maxScore) > 0 ? '/' + this.maxScore : '';

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
        this.$scope.$on('studentWorkSavedToServer', function (event, args) {
            var nodeId = args.studentWork.nodeId;
            var componentId = args.studentWork.componentId;
            if (nodeId === _this.nodeId && componentId === _this.componentId) {
                _this.isNew = false;
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

        this.$onChanges = function (changes) {
            //if (changes.annotations) {
            //this.annotations = angular.copy(changes.annotations.currentValue);
            _this.processAnnotations();
            //}
        };
    }

    _createClass(ComponentAnnotationsController, [{
        key: 'closeDialog',
        value: function closeDialog() {
            this.$mdDialog.hide();
        }

        /**
         * Get the most recent annotation (from the current score and comment annotations)
         * @return Object (latest annotation)
         */

    }, {
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
                    } else {
                        this.showScore = true;
                    }

                    if (!this.ProjectService.displayAnnotation(this.annotations.comment)) {
                        // we do not want to show the comment
                        this.showComment = false;
                    } else {
                        this.showComment = true;
                    }

                    // set the annotation label and icon
                    this.setLabelAndIcon();
                }
            }
        }
    }]);

    return ComponentAnnotationsController;
}();

ComponentAnnotationsController.$inject = ['$scope', '$element', '$filter', '$mdDialog', '$timeout', 'ConfigService', 'ProjectService', 'StudentDataService'];

var ComponentAnnotations = {
    bindings: {
        annotations: '<',
        maxScore: '<'
    },
    templateUrl: 'wise5/directives/componentAnnotations/componentAnnotations.html',
    controller: ComponentAnnotationsController,
    controllerAs: 'componentAnnotationsCtrl'
};

exports.default = ComponentAnnotations;
//# sourceMappingURL=componentAnnotations.js.map