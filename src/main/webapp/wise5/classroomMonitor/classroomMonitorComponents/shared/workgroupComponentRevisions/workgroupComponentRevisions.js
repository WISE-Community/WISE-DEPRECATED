"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WorkgroupComponentRevisionsController = function () {
    function WorkgroupComponentRevisionsController(ConfigService, TeacherDataService) {
        var _this = this;

        _classCallCheck(this, WorkgroupComponentRevisionsController);

        this.ConfigService = ConfigService;
        this.TeacherDataService = TeacherDataService;

        this.$onInit = function () {
            _this.populateData();
        };
    }

    _createClass(WorkgroupComponentRevisionsController, [{
        key: 'populateData',


        /**
         * Get the component states and annotations for this workgroup and component
         */
        value: function populateData() {
            var _this2 = this;

            this.componentStates = this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(this.workgroupId, this.componentId);

            var workgroupAnnotations = this.TeacherDataService.getAnnotationsToWorkgroupId(this.workgroupId);
            var annotations = workgroupAnnotations.filter(function (annotation) {
                return annotation.toWorkgroupId === _this2.workgroupId;
            });

            // create a data object that holds the componentStates and accompanying annotations, keyed by componentState id
            this.data = {};

            // add componentStates to the data object
            var c = this.componentStates.length;
            for (var i = 0; i < c; i++) {
                var componentState = this.componentStates[i];
                var id = componentState.id;
                this.data[id] = {
                    clientSaveTime: this.convertToClientTimestamp(componentState.serverSaveTime),
                    componentState: componentState,
                    annotations: {
                        autoComment: null,
                        autoScore: null,
                        comment: null,
                        score: null
                    }
                };
            }

            // add annotations to the data object (only latest of each annotation type for each componentState)
            var a = annotations.length;
            for (var x = 0; x < a; x++) {
                var annotation = annotations[x];
                var type = annotation.type;
                var _id = annotation.studentWorkId;
                if (_id && this.data[_id]) {
                    var data = this.data[_id];
                    var existing = null;

                    switch (type) {
                        case 'autoComment':
                            existing = data.annotations.autoComment;
                            if (existing) {
                                if (annotation.serverSaveTime > existing.serverSaveTime) {
                                    data.annotations.autoComment = annotation;
                                }
                            } else {
                                data.annotations.autoComment = annotation;
                            }
                            break;
                        case 'autoScore':
                            existing = data.annotations.autoScore;
                            if (existing) {
                                if (annotation.serverSaveTime > existing.serverSaveTime) {
                                    data.annotations.autoScore = annotation;
                                }
                            } else {
                                data.annotations.autoScore = annotation;
                            }
                            break;
                        case 'comment':
                            existing = data.annotations.comment;
                            if (existing) {
                                if (annotation.serverSaveTime > existing.serverSaveTime) {
                                    data.annotations.comment = annotation;
                                }
                            } else {
                                data.annotations.comment = annotation;
                            }
                            break;
                        case 'score':
                            existing = data.annotations.score;
                            if (existing) {
                                if (annotation.serverSaveTime > existing.serverSaveTime) {
                                    data.annotations.score = annotation;
                                }
                            } else {
                                data.annotations.score = annotation;
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    }, {
        key: 'convertToClientTimestamp',
        value: function convertToClientTimestamp(time) {
            return this.ConfigService.convertToClientTimestamp(time);
        }
    }]);

    return WorkgroupComponentRevisionsController;
}();

WorkgroupComponentRevisionsController.$inject = ['ConfigService', 'TeacherDataService'];

var WorkgroupComponentRevisions = {
    bindings: {
        workgroupId: '<',
        componentId: '@',
        maxScore: '<'
    },
    template: '<md-list class="component-revisions">\n            <div ng-repeat="item in $ctrl.data | toArray | orderBy: \'-clientSaveTime\'">\n                <md-list-item class="list-item md-3-line md-whiteframe-1dp component-revisions__item" ng-class="{\'component-revisions__item--latest\': $first}">\n                    <div class="md-list-item-text component-revisions__item__text">\n                        <div layout="row">\n                            <span class="md-body-2 text-secondary">\n                                #{{$ctrl.componentStates.length - $index}}\n                                <span ng-if="$first"> (Latest)</span>\n                            </span>\n                            <span flex></span>\n                            <span>\n                                <span class="component__actions__info component__actions__more md-body-1" am-time-ago="item.clientSaveTime"></span>\n                                <md-tooltip md-direction="top">{{ item.clientSaveTime | amDateFormat:\'ddd, MMM D YYYY, h:mm a\' }}</md-tooltip>\n                            </span>\n                        </div>\n                        <div>\n                            <component component-state="{{item.componentState}}" mode="onlyShowWork">\n                        </div>\n                        <div ng-if="item.annotations.comment || item.annotations.score || item.annotations.autoComment || item.annotations.autoScore"\n                             class="annotations--grading annotations--grading--revision md-body-1">\n                            <div ng-if="item.annotations.comment || item.annotations.score">\n                                <div ng-if="item.annotations.comment" layout="row" layout-wrap>\n                                    <span class="component-revisions__annotation-label heavy">Teacher Comment: </span>{{item.annotations.comment.data.value}}\n                                </div>\n                                <div ng-if="item.annotations.score">\n                                    <span class="heavy">Score: </span>{{item.annotations.score.data.value}}/{{$ctrl.maxScore}}\n                                </div>\n                            </div>\n\n                            <div ng-if="item.annotations.autoComment || item.annotations.autoScore"\n                                 ng-class="{\'component-revisions__has-auto-and-teacher\': item.annotations.comment || item.annotations.score}">\n                                <div ng-if="item.annotations.autoComment">\n                                    <div class="component-revisions__annotation-label heavy">\n                                        Auto Comment:\n                                    </div>\n                                    <div class="annotations--grading__auto-comment">\n                                        <compile data="item.annotations.autoComment.data.value"></compile>\n                                    </div>\n                                </div>\n                                <div ng-if="item.annotations.autoScore">\n                                    <span class="heavy">Auto Score: </span>{{item.annotations.autoScore.data.value}}/{{$ctrl.maxScore}}\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                </md-list-item>\n            </div>\n        </md-list>',
    controller: WorkgroupComponentRevisionsController
};

exports.default = WorkgroupComponentRevisions;
//# sourceMappingURL=workgroupComponentRevisions.js.map