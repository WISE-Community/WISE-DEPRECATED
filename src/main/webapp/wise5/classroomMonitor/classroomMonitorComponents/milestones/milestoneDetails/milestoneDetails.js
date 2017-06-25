"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MilestoneDetailsController = function () {
    function MilestoneDetailsController($filter, ConfigService, ProjectService) {
        var _this = this;

        _classCallCheck(this, MilestoneDetailsController);

        this.$filter = $filter;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;

        this.$translate = this.$filter('translate');

        this.$onInit = function () {
            _this.requirements = _this.getRequirementsText();
        };
    }

    _createClass(MilestoneDetailsController, [{
        key: 'getRequirementsText',


        /**
         * Loop through all the requirements for this milestone and return a
         * string that lists each one by number in the project
         * @return string List of requirements
         */
        value: function getRequirementsText() {
            var _this2 = this;

            var requiredText = '';
            var requiredActivities = [];
            var requiredSteps = [];
            var items = this.milestone.items;

            angular.forEach(items, function (value, key) {
                if (value.checked) {
                    var isGroupNode = _this2.ProjectService.isGroupNode(key);
                    var itemNumber = _this2.ProjectService.nodeIdToNumber[key];
                    var itemText = '';

                    if (isGroupNode) {
                        itemText = _this2.$translate('activityLabelShort') + ' ' + itemNumber;
                    } else {
                        itemText = itemNumber;
                    }

                    if (requiredText === '') {
                        requiredText += itemText;
                    } else {
                        requiredText += ', ' + itemText;
                    }
                }
            });

            return requiredText;
        }

        /**
         * Get the user names for a workgroup id
         * @param workgroupId the workgroup id
         * @return the user names in the workgroup
         */

    }, {
        key: 'getDisplayUserNamesByWorkgroupId',
        value: function getDisplayUserNamesByWorkgroupId(workgroupId) {
            return this.ConfigService.getDisplayUserNamesByWorkgroupId(workgroupId);
        }

        /**
         * Get the avatar coloer for a workgroup id
         * @param workgroupId the workgroup id
         * @return the avatar color for the workgroup
         */

    }, {
        key: 'getAvatarColorForWorkgroupId',
        value: function getAvatarColorForWorkgroupId(workgroupId) {
            return this.ConfigService.getAvatarColorForWorkgroupId(workgroupId);
        }
    }, {
        key: 'showWorkgroup',
        value: function showWorkgroup(workgroup) {
            this.onShowWorkgroup({ value: workgroup });
        }
    }]);

    return MilestoneDetailsController;
}();

MilestoneDetailsController.$inject = ['$filter', 'ConfigService', 'ProjectService'];

var MilestoneDetails = {
    bindings: {
        milestone: '<',
        onShowWorkgroup: '&'
    },
    template: '<div class="milestone-details md-whiteframe-1dp" layout-padding>\n            <p ng-if="$ctrl.milestone.description"><span class="heavy accent-2">{{ \'description\' | translate }}: </span> {{ $ctrl.milestone.description }}</p>\n            <p ng-if="$ctrl.milestone.params.targetDate"><span class="heavy accent-2">{{ \'dueDate\' | translate }}: </span> {{ $ctrl.milestone.params.targetDate | date: \'EEE MMM d, yyyy\' }}</p>\n            <p><span class="heavy accent-2">{{ \'REQUIREMENTS\' | translate }}: </span> {{ $ctrl.requirements }}</p>\n        </div>\n        <md-list class="user-list">\n            <md-list-item class="thead md-whiteframe-1dp md-with-secondary">\n                <p>{{ \'team\' | translate }}</p>\n                <div class="md-secondary-container">{{ \'completed\' | translate }}</div>\n            </md-list-item>\n            <md-list-item class="list-item md-whiteframe-1dp md-with-secondary"\n                          ng-repeat="workgroup in $ctrl.milestone.workgroups | orderBy:\'-achievementTime\'"\n                          ng-click="$ctrl.showWorkgroup(workgroup)"\n                          aria-label="{{ \'viewTeam\' | translate }}">\n                <div class="md-avatar" hide-xs>\n                    <md-icon class="md-36" style="color: {{ $ctrl.getAvatarColorForWorkgroupId(workgroup.workgroupId) }};"> account_circle </md-icon>\n                </div>\n                <p class="heavy">{{ $ctrl.getDisplayUserNamesByWorkgroupId(workgroup.workgroupId) }}</p>\n                <div class="md-secondary-container heavy">\n                    <span ng-if="workgroup.achievementTime !== null" class="success">\n                        {{ workgroup.achievementTime | amTimeAgo }}\n                    </span>\n                    <span ng-if="workgroup.achievementTime === null" class="warn">\n                        {{ \'notCompleted\' | translate }}\n                    </span>\n                </div>\n            </md-list-item>\n        </md-list>',
    controller: MilestoneDetailsController
};

exports.default = MilestoneDetails;
//# sourceMappingURL=milestoneDetails.js.map