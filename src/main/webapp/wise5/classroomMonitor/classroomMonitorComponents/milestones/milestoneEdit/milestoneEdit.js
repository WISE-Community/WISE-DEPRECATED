"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MilestoneDetailsController = function () {
    function MilestoneDetailsController($filter, $scope, AchievementService, ProjectService, UtilService, moment) {
        var _this = this;

        _classCallCheck(this, MilestoneDetailsController);

        this.$filter = $filter;
        this.$scope = $scope;
        this.AchievementService = AchievementService;
        this.ProjectService = ProjectService;
        this.UtilService = UtilService;
        this.moment = moment;

        this.$translate = this.$filter('translate');

        this.$onInit = function () {
            if (!_this.milestone) {
                // no milestone was passed in, so we'll create a new one
                _this.createMilestone();
            }

            // set the date object that we'll use with md-datepicker
            if (_this.milestone) {
                _this.date = new Date(_this.milestone.params.targetDate);
            }
        };
    }

    _createClass(MilestoneDetailsController, [{
        key: 'createMilestone',


        /**
         * Create a new milestone
         */
        value: function createMilestone() {

            // get the project achievements
            var projectAchievements = this.ProjectService.getAchievementItems();

            if (projectAchievements != null) {

                // get the time of tomorrow at 3pm
                var tomorrow = this.moment().add('days', 1).hours(23).minutes(11).seconds(59);

                // create a new milestone object
                this.milestone = {
                    id: this.AchievementService.getAvailableAchievementId(),
                    name: '',
                    description: '',
                    type: "milestone",
                    params: {
                        nodeIds: [],
                        targetDate: tomorrow.valueOf()
                    },
                    icon: {
                        image: ""
                    },
                    items: this.UtilService.makeCopyOfJSONObject(this.ProjectService.idToOrder),
                    isVisible: true
                };
            }
        }

        /**
         * The checkbox for an activity or step was clicked
         * @param milestone the milestone that is being edited
         * @param item the activity or step that was clicked
         */

    }, {
        key: 'itemChanged',
        value: function itemChanged(item) {

            if (this.milestone && this.milestone.params && this.milestone.params.nodeIds) {

                // get the node ids that are currently required for the milestone
                var nodeIds = this.milestone.params.nodeIds;

                // get the node id of the item that was clicked
                var nodeId = item.$key;

                if (item.checked) {
                    if (nodeIds.indexOf(nodeId) == -1) {
                        // add the node id
                        this.milestone.params.nodeIds.push(nodeId);
                    }
                } else {
                    // remove the node id

                    // loop through all the node ids and remove the node id
                    for (var n = nodeIds.length - 1; n >= 0; n--) {
                        if (nodeId == nodeIds[n]) {
                            nodeIds.splice(n, 1);
                        }
                    }
                }

                this.change();
            }
        }

        /**
         * Show the steps for an activity
         * @param groupId the node id for the activity
         */

    }, {
        key: 'toggleSteps',
        value: function toggleSteps(groupId) {

            if (groupId) {
                var showSteps = !this.milestone.items[groupId].showSteps;
                this.milestone.items[groupId].showSteps = showSteps;

                // get all the child ids of the group
                var childIds = this.ProjectService.getChildNodeIdsById(groupId);

                // loop through all the child ids
                for (var c = 0; c < childIds.length; c++) {
                    var childId = childIds[c];

                    if (this.milestone.items[childId] != null) {
                        // show the step
                        this.milestone.items[childId].show = showSteps;
                    }
                }
            }
        }

        /**
         * Check if a node id is for a group
         * @param nodeId
         * @returns whether the node is a group node
         */

    }, {
        key: 'isGroupNode',
        value: function isGroupNode(nodeId) {
            return this.ProjectService.isGroupNode(nodeId);
        }
    }, {
        key: 'getNodePositionAndTitleByNodeId',


        /**
         * Get the node position and title
         * @param nodeId
         * @returns whether node position and id display
         */
        value: function getNodePositionAndTitleByNodeId(nodeId) {
            return this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
        }
    }, {
        key: 'dateChange',


        /**
         * The date input for this milestone has changed, update in milestone object
         */
        value: function dateChange() {
            this.milestone.params.targetDate = this.date.getTime();
            this.change();
        }

        /**
         * Data for this milestone has changed, so run the onChange callback
         */

    }, {
        key: 'change',
        value: function change() {
            var _this2 = this;

            var itemsArray = Object.keys(this.milestone.items).map(function (it) {
                return _this2.milestone.items[it];
            });
            var valid = this.$scope.milestoneEditForm.$valid && this.$filter('filter')(itemsArray, { 'checked': true }).length > 0;
            this.onChange({ milestone: this.milestone, valid: valid });
        }
    }]);

    return MilestoneDetailsController;
}();

MilestoneDetailsController.$inject = ['$filter', '$scope', 'AchievementService', 'ProjectService', 'UtilService', 'moment'];

var MilestoneDetails = {
    bindings: {
        milestone: '<',
        onChange: '&'
    },
    template: '<div class="milestone-details md-whiteframe-1dp" layout-padding>\n            <form name="milestoneEditForm">\n                <h6>{{ \'DETAILS\' | translate }}</h6>\n                <div layout-gt-xs="row">\n                    <md-input-container class="md-block" flex>\n                        <label>{{ \'name\' | translate }}</label>\n                        <input name="milestoneName" ng-model="$ctrl.milestone.name" ng-change="$ctrl.change()" required>\n                    </md-input-container>\n\n                    <md-input-container>\n                        <label>{{ \'dueDate\' | translate }}</label>\n                        <md-datepicker name="date" ng-model="$ctrl.date" ng-change="$ctrl.dateChange()" required></md-datepicker>\n                    </md-input-container>\n                </div>\n                <md-input-container class="md-block" flex>\n                    <label>{{ \'DESCRIPTION\' | translate }}</label>\n                    <textarea ng-model="$ctrl.milestone.description" ng-change="$ctrl.change()" rows="1" md-select-on-focus></textarea>\n                </md-input-container>\n            </form>\n        </div>\n        <div class="milestone-details md-whiteframe-1dp" layout-padding>\n            <form name="milestoneRequirementsForm">\n                <h6>{{ \'REQUIREMENTS\' | translate }}</h6>\n                <div ng-repeat="item in $ctrl.milestone.items | toArray | orderBy : \'order\'"\n                     ng-class="{ \'layout-margin\': !$ctrl.isGroupNode(item.$key) }"\n                     ng-show="$ctrl.isGroupNode(item.$key) || item.show">\n\n                    <md-checkbox ng-model="item.checked"\n                                 ng-if="item.order !== 0"\n                                 ng-change="$ctrl.itemChanged(item)"\n                                 aria-label="{{ $ctrl.getNodePositionAndTitleByNodeId(item.$key) }}">\n                        <span class="md-body-2">{{ $ctrl.getNodePositionAndTitleByNodeId(item.$key) }}</span>\n                    </md-checkbox>\n                    <md-button class="md-primary md-icon-button"\n                               ng-if="item.order!==0 && $ctrl.isGroupNode(item.$key)"\n                               ng-click="$ctrl.toggleSteps(item.$key)"\n                               aria-label="{{ $ctrl.milestone.items[item.$key].showSteps ? (\'hideSteps\' | translate) : (\'showSteps\' | translate) }}">\n                        <md-icon ng-if="!$ctrl.milestone.items[item.$key].showSteps"> add </md-icon>\n                        <md-icon ng-if="$ctrl.milestone.items[item.$key].showSteps"> remove </md-icon>\n                    </button>\n                </div>\n            </form>\n        </div>',
    controller: MilestoneDetailsController
};

exports.default = MilestoneDetails;
//# sourceMappingURL=milestoneEdit.js.map