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
            this.componentStates = this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(this.workgroupId, this.componentId);

            // create a data object that holds the componentStates and accompanying annotations, keyed by componentState id
            this.data = {};

            // add componentStates to the data object
            var c = this.componentStates.length;
            for (var i = 0; i < c; i++) {
                var componentState = this.componentStates[i];
                var id = componentState.id;
                this.data[id] = {
                    clientSaveTime: this.convertToClientTimestamp(componentState.serverSaveTime),
                    componentState: componentState
                };
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
        workgroupId: '@',
        componentId: '@'
    },
    template: '<md-list class="component-revisions">\n            <div ng-repeat="item in $ctrl.data | toArray | orderBy: \'-clientSaveTime\'">\n                <md-list-item class="list-item md-whiteframe-1dp component-revisions__item" ng-class="{\'component-revisions__item--latest\': $first}">\n                    <div class="md-list-item-text component-revisions__item__text" flex>\n                        <h3 class="accent-2 md-body-2 gray-lightest-bg component__header">\n                            #{{$ctrl.componentStates.length - $index}}\n                            <span ng-if="$first"> (Latest)</span>\n                        </h3>\n                        <div>\n                            <component component-state="{{ item.componentState }}" workgroup-id="{{ $ctrl.workgroupId }}" mode="gradingRevision">\n                        </div>\n                    </div>\n                </md-list-item>\n            </div>\n        </md-list>',
    controller: WorkgroupComponentRevisionsController
};

exports.default = WorkgroupComponentRevisions;
//# sourceMappingURL=workgroupComponentRevisions.js.map