"use strict";

class MilestoneDetailsController {
    constructor($filter,
                ConfigService,
                ProjectService) {
        this.$filter = $filter;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;

        this.$translate = this.$filter('translate');

        this.$onInit = () => {
            this.requirements = this.getRequirementsText();
        }
    };

    /**
     * Loop through all the requirements for this milestone and return a
     * string that lists each one by number in the project
     * @return string List of requirements
     */
    getRequirementsText() {
        let requiredText = '';
        let requiredActivities = [];
        let requiredSteps = [];
        let items = this.milestone.items;

        angular.forEach(items, (value, key) => {
            if (value.checked) {
                let isGroupNode = this.ProjectService.isGroupNode(key);
                let itemNumber = this.ProjectService.nodeIdToNumber[key];
                let itemText = '';

                if (isGroupNode) {
                    itemText = this.$translate('activityLabelShort') + ' ' + itemNumber;
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
    getDisplayUserNamesByWorkgroupId(workgroupId) {
        return this.ConfigService.getDisplayUserNamesByWorkgroupId(workgroupId);
    }

    /**
     * Get the avatar coloer for a workgroup id
     * @param workgroupId the workgroup id
     * @return the avatar color for the workgroup
     */
    getAvatarColorForWorkgroupId(workgroupId) {
        return this.ConfigService.getAvatarColorForWorkgroupId(workgroupId);
    }

    showWorkgroup(workgroup) {
        this.onShowWorkgroup({ value: workgroup });
    }
}

MilestoneDetailsController.$inject = [
    '$filter',
    'ConfigService',
    'ProjectService'
];

const MilestoneDetails = {
    bindings: {
        milestone: '<',
        onShowWorkgroup: '&'
    },
    template:
        `<div class="milestone-details md-whiteframe-1dp" layout-padding>
            <p ng-if="$ctrl.milestone.description"><span class="heavy accent-2">{{ 'description' | translate }}: </span> {{ $ctrl.milestone.description }}</p>
            <p ng-if="$ctrl.milestone.params.targetDate"><span class="heavy accent-2">{{ 'dueDate' | translate }}: </span> {{ $ctrl.milestone.params.targetDate | date: 'EEE MMM d, yyyy' }}</p>
            <p><span class="heavy accent-2">{{ 'REQUIREMENTS' | translate }}: </span> {{ $ctrl.requirements }}</p>
        </div>
        <md-list class="user-list">
            <md-list-item class="thead md-whiteframe-1dp md-with-secondary">
                <p>{{ 'team' | translate }}</p>
                <div class="md-secondary-container">{{ 'completed' | translate }}</div>
            </md-list-item>
            <md-list-item class="list-item md-whiteframe-1dp md-with-secondary"
                          ng-repeat="workgroup in $ctrl.milestone.workgroups | orderBy:'-achievementTime'"
                          ng-click="$ctrl.showWorkgroup(workgroup)"
                          aria-label="{{ 'viewTeam' | translate }}">
                <div class="md-avatar" hide-xs>
                    <md-icon class="md-36" style="color: {{ $ctrl.getAvatarColorForWorkgroupId(workgroup.workgroupId) }};"> account_circle </md-icon>
                </div>
                <p class="heavy">{{ $ctrl.getDisplayUserNamesByWorkgroupId(workgroup.workgroupId) }}</p>
                <div class="md-secondary-container heavy">
                    <span ng-if="workgroup.achievementTime !== null" class="success">
                        {{ workgroup.achievementTime | amTimeAgo }}
                    </span>
                    <span ng-if="workgroup.achievementTime === null" class="warn">
                        {{ 'notCompleted' | translate }}
                    </span>
                </div>
            </md-list-item>
        </md-list>`,
    controller: MilestoneDetailsController
};

export default MilestoneDetails;
