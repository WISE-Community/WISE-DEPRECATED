"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MilestoneDetailsController = function () {
    function MilestoneDetailsController($filter, $scope, $state, ConfigService, ProjectService, TeacherDataService) {
        var _this = this;

        _classCallCheck(this, MilestoneDetailsController);

        this.$filter = $filter;
        this.$scope = $scope;
        this.$state = $state;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.TeacherDataService = TeacherDataService;

        this.$translate = this.$filter('translate');
        this.periodId = this.TeacherDataService.getCurrentPeriod().periodId;

        this.$onInit = function () {
            _this.requirements = _this.getRequirements();
        };

        this.$scope.$on('currentPeriodChanged', function (event, args) {
            _this.periodId = args.currentPeriod.periodId;
        });
    }

    _createClass(MilestoneDetailsController, [{
        key: 'getRequirements',
        value: function getRequirements() {
            var requirements = [];
            var items = this.milestone.items;

            angular.forEach(items, function (value, key) {
                if (value.checked) {
                    requirements.push(key);
                }
            });

            return requirements;
        }
    }, {
        key: 'getNodeNumberByNodeId',
        value: function getNodeNumberByNodeId(nodeId) {
            return this.ProjectService.nodeIdToNumber[nodeId];
        }
    }, {
        key: 'getNodeTitleByNodeId',
        value: function getNodeTitleByNodeId(nodeId) {
            return this.ProjectService.getNodeTitleByNodeId(nodeId);
        }

        /**
         * Get the user names for a workgroup id
         * @param workgroupId the workgroup id
         * @return the user names in the workgroup
         */

    }, {
        key: 'getDisplayUsernamesByWorkgroupId',
        value: function getDisplayUsernamesByWorkgroupId(workgroupId) {
            return this.ConfigService.getDisplayUsernamesByWorkgroupId(workgroupId);
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
    }, {
        key: 'visitNodeGrading',
        value: function visitNodeGrading() {
            this.onVisitNodeGrading();
        }
    }]);

    return MilestoneDetailsController;
}();

MilestoneDetailsController.$inject = ['$filter', '$scope', '$state', 'ConfigService', 'ProjectService', 'TeacherDataService'];

var MilestoneDetails = {
    bindings: {
        milestone: '<',
        onShowWorkgroup: '&',
        onVisitNodeGrading: '&'
    },
    template: '<div class="milestone-details md-whiteframe-1dp">\n            <span layout="row" layout-align="start center">\n                <period-select custom-class="\'md-no-underline md-button toolbar__select\'"></period-select>\n                <span flex></span>\n                <span layout="row" layout-align="start center">\n                    <md-progress-linear class="milestone-details__progress" md-mode="determinate" value="{{ $ctrl.milestone.percentageCompleted }}"></md-progress-linear>\n                    <span class="md-body-2 text-secondary ng-binding">\n                        {{ $ctrl.milestone.percentageCompleted }}%\n                    </span>\n                </span>\n            </span>\n            <p ng-if="$ctrl.milestone.description">\n              <span class="heavy">{{ \'description\' | translate }}: </span>&nbsp;\n              <compile data="$ctrl.milestone.description"></compile>\n            </p>\n            <p ng-if="$ctrl.milestone.params.targetDate"><span class="heavy">{{ \'dueDate\' | translate }}: </span> {{ $ctrl.milestone.params.targetDate | date: \'EEE MMM d, yyyy\' }}</p>\n            <p ng-if="$ctrl.requirements.length">\n                <span class="heavy">{{ \'REQUIREMENTS\' | translate }}: </span>\n                <a ng-repeat="requirement in $ctrl.requirements" ui-sref="root.project({nodeId: \'{{ requirement }}\'})" ng-click="$ctrl.visitNodeGrading(event)">\n                    {{ $ctrl.getNodeNumberByNodeId(requirement) }}: {{ $ctrl.getNodeTitleByNodeId(requirement) }}<span ng-if="!$last">, </span>\n                </a>\n            </p>\n        </div>\n        <div ng-if="$ctrl.milestone.type === \'milestoneReport\'"\n             class="milestone-details md-whiteframe-1dp">\n            <div class="milestone-details__header accent-2 md-body-2 gray-lightest-bg">{{ \'classReport\' | translate }}</div>\n            <div ng-if="!$ctrl.milestone.isReportAvailable"\n                class="center">\n                <p>{{ \'milestoneReportExplanation\' | translate }} {{ \'milestoneReportAvailability\' | translate }}</p>\n                <p class="bold" ng-if="$ctrl.milestone.satisfyConditional === \'any\'">\n                    {{ \'milestoneReportAvailabilityRequirementsAny\' | translate: { num: $ctrl.milestone.satisfyMinNumWorkgroups, percent: $ctrl.milestone.satisfyMinPercentage } }}\n                </p>\n                <p class="bold" ng-if="$ctrl.milestone.satisfyConditional === \'all\'">\n                    {{ \'milestoneReportAvailabilityRequirementsAll\' | translate: { num: $ctrl.milestone.satisfyMinNumWorkgroups, percent: $ctrl.milestone.satisfyMinPercentage } }}\n                </p>\n            </div>\n            <div ng-if="$ctrl.milestone.isReportAvailable">\n                <compile data="$ctrl.milestone.generatedReport"></compile>\n            </div>\n        </div>\n        <div class="milestone-details md-whiteframe-1dp">\n            <div class="milestone-details__header accent-2 md-body-2 gray-lightest-bg">{{ \'studentCompletion\' | translate }}</div>\n            <md-list class="user-list md-whiteframe-1dp">\n                <md-list-item class="thead md-with-secondary gray-lightest-bg md-body-1">\n                    <p>{{ \'team\' | translate }}</p>\n                    <div class="md-secondary-container">{{ \'completed\' | translate }}</div>\n                </md-list-item>\n                <md-list-item class="list-item md-with-secondary"\n                            ng-repeat="workgroup in $ctrl.milestone.workgroups | orderBy:\'-achievementTime\'">\n                    <div class="md-avatar" hide-xs>\n                        <md-icon class="md-36" style="color: {{ $ctrl.getAvatarColorForWorkgroupId(workgroup.workgroupId) }};"> account_circle </md-icon>\n                    </div>\n                    <p class="heavy">{{ $ctrl.getDisplayUsernamesByWorkgroupId(workgroup.workgroupId) }}</p>\n                    <div class="md-secondary-container heavy">\n                        <span ng-if="workgroup.achievementTime !== null" class="success">\n                            {{ workgroup.achievementTime | amTimeAgo }}\n                        </span>\n                        <span ng-if="workgroup.achievementTime === null" class="warn">\n                            {{ \'notCompleted\' | translate }}\n                        </span>\n                    </div>\n                </md-list-item>\n            </md-list>\n        </div>',
    controller: MilestoneDetailsController
};

exports.default = MilestoneDetails;
//# sourceMappingURL=milestoneDetails.js.map
