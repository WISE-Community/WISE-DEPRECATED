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

            /**
             * Set a constant specifying the number of additional component
             * states to show each time more states are shown
             */
            _this.increment = 5;
            _this.totalShown = _this.increment;
        };
    }

    _createClass(WorkgroupComponentRevisionsController, [{
        key: 'populateData',


        /**
         * Get the component states and annotations for this workgroup and component
         */
        value: function populateData() {
            // create a data object that holds the componentStates and accompanying annotations, keyed by componentState id
            this.data = {};

            // add componentStates to the data object
            if (this.componentStates) {
                for (var i = 0; i < this.componentStates.length; i++) {
                    var componentState = this.componentStates[i];
                    var id = componentState.id;
                    this.data[id] = {
                        clientSaveTime: this.convertToClientTimestamp(componentState.serverSaveTime),
                        componentState: componentState
                    };
                }
            }
        }
    }, {
        key: 'convertToClientTimestamp',
        value: function convertToClientTimestamp(time) {
            return this.ConfigService.convertToClientTimestamp(time);
        }

        /**
         * Increase the number of component states shown by 5
         */

    }, {
        key: 'showMore',
        value: function showMore() {
            this.totalShown += this.increment;
        }

        /**
         * The show more element has come into or out of view
         * @param inview whether the element is in view or not
         */

    }, {
        key: 'moreInView',
        value: function moreInView(inview) {
            if (inview && this.totalShown > this.increment) {
                // automatically show more component states
                this.showMore();
            }
        }
    }]);

    return WorkgroupComponentRevisionsController;
}();

WorkgroupComponentRevisionsController.$inject = ['ConfigService', 'TeacherDataService'];

var WorkgroupComponentRevisions = {
    bindings: {
        componentStates: '<',
        workgroupId: '@'
    },
    template: '<md-list class="component-revisions">\n            <div ng-repeat="item in $ctrl.data | toArray | orderBy: \'-clientSaveTime\'"\n                 ng-if="$index < $ctrl.totalShown">\n                <md-list-item class="list-item md-whiteframe-1dp component-revisions__item"\n                              ng-class="{\'component-revisions__item--latest\': $first}">\n                    <div class="md-list-item-text component-revisions__item__text"\n                         flex>\n                        <h3 class="accent-2 md-body-2 gray-lightest-bg component__header">\n                            #{{$ctrl.componentStates.length - $index}}\n                            <span ng-if="$first"> (Latest)</span>\n                        </h3>\n                        <div>\n                            <component component-state="{{ item.componentState }}"\n                                       workgroup-id="{{ $ctrl.workgroupId }}"\n                                       mode="gradingRevision">\n                        </div>\n                    </div>\n                </md-list-item>\n            </div>\n            <div ng-if="$ctrl.totalShown > $ctrl.increment"\n                 in-view="$ctrl.moreInView($inview)"></div>\n            <div class="md-padding center">\n                <md-button class="md-raised"\n                           ng-if="$ctrl.totalShown <= $ctrl.increment"\n                           ng-click="$ctrl.showMore()"\n                           translate="SHOW_MORE">\n                </md-button>\n            </div>\n        </md-list>',
    controller: WorkgroupComponentRevisionsController
};

exports.default = WorkgroupComponentRevisions;
//# sourceMappingURL=workgroupComponentRevisions.js.map
