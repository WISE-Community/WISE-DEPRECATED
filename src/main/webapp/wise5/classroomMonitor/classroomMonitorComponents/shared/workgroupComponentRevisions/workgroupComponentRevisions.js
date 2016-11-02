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
                    time: componentState.serverSaveTime,
                    componentState: componentState,
                    annotations: []
                };
            }

            // add annotations to the data object
            var a = annotations.length;
            for (var x = 0; x < a; x++) {
                var annotation = annotations[x];
                var _id = annotation.studentWorkId;
                if (_id && this.data[_id]) {
                    this.data[_id].annotations.push(annotation);
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
    template: '<div class="component-revisions" ng-repeat="item in $ctrl.data | toArray | orderBy: \'-time\'">\n            <md-card>\n                <md-card-content>\n                    <div class="md-card-title">\n                        Version {{$ctrl.componentStates.length - $index}}\n                        <span ng-if="$first"> (Latest Work)</span>\n                    </div>\n                    <div>\n                        <component component-state="{{item.componentState}}" mode="onlyShowWork">\n                    </div>\n                    <div>\n                        <div ng-repeat="annotation in item.annotations | orderBy: \'-serverSaveTime\'">\n                            <div ng-if="annotation.type === \'comment\'">\n                                Teacher Comment: {{annotation.data.value}}\n                            </div>\n                            <div ng-if="annotation.type === \'autoComment\'">\n                                Auto Comment:\n                                <compile data="annotation.data.value"></compile>\n                            </div>\n                            <div ng-if="annotation.type === \'score\'">\n                                Teacher Score: {{annotation.data.value}}/{{$ctrl.maxScore}}\n                            </div>\n                            <div ng-if="annotation.type === \'autoScore\'">\n                                Auto Score: {{annotation.data.value}}/{{$ctrl.maxScore}}\n                            </div>\n                        </div>\n                    </div>\n                </md-card-content>\n            </md-card>\n            <md-divider ng-if="$first" class="component-revisions__divider"></md-divider>\n        </div>',
    controller: WorkgroupComponentRevisionsController
};

exports.default = WorkgroupComponentRevisions;
//# sourceMappingURL=workgroupComponentRevisions.js.map