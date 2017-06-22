"use strict";

class TopBarController {
    constructor(ConfigService,
                TeacherDataService) {
        this.ConfigService = ConfigService;
        this.TeacherDataService = TeacherDataService;

        this.workgroupId = this.ConfigService.getWorkgroupId();

        this.$onChanges = (changesObj) => {
            if (changesObj.notifications) {
                this.setNotifications();
            }
        }
    }

    /**
     * Find all teacher notifications and separate into new and dismissed arrays
     * TODO: move to TeacherDataService?
     */
    setNotifications() {
        // get all notifications for the logged in teacher
        // TODO: take into account shared teacher users!
        let userNotifications = this.notifications.filter(
            notification => {
                return (notification.toWorkgroupId === this.workgroupId);
            }
        );

        this.newNotifications = userNotifications.filter(
            notification => {
                return (notification.timeDismissed == null);
            }
        );

        this.dismissedNotifications = userNotifications.filter(
            notification => {
                return (notification.timeDismissed != null);
            }
        );
    }

    /**
     * Check whether any period in the run is paused
     * @return Boolean whether any of the periods are paused
     */
    isAnyPeriodPaused() {
        return this.TeacherDataService.isAnyPeriodPaused();
    }
}

TopBarController.$inject = [
    'ConfigService',
    'TeacherDataService'
];

const TopBar = {
    bindings: {
        logoPath: '@',
        notifications: '<',
        projectId: '<',
        projectTitle: '<',
        runId: '<'
    },
    controller: TopBarController,
    template:
        `<md-toolbar class="l-header">
            <div class="md-toolbar-tools">
                <span class="md-button logo-link">
                    <img ng-src="{{ $ctrl.logoPath }}" alt="{{ 'WISE_LOGO' | translate }}" class="logo" />
                </span>
                <h3>{{ $ctrl.projectTitle }} <span class="md-caption">({{ 'RUN_ID_DISPLAY' | translate:{id: $ctrl.runId} }})</span></h3>
                <span flex></span>
                <md-menu md-position-mode="target-right target" md-offset="52 26">
                    <md-button aria-label="{{ 'USER_MENU' | translate }}"
                               class="md-icon-button"
                               ng-class="{ 'has-indicator has-indicator--icon-button': $ctrl.isAnyPeriodPaused() }"
                               ng-click="$mdMenu.open($event)">
                        <md-icon md-menu-origin ng-if="$ctrl.isAnyPeriodPaused()"> lock_outline </md-icon>
                        <md-icon md-menu-origin ng-if="!$ctrl.isAnyPeriodPaused()"> lock_open </md-icon>
                    </md-button>
                    <md-menu-content width="5" class="account-menu">
                        <pause-screens-menu></pause-screens-menu>
                    </md-menu-content>
                </md-menu>
                <md-menu md-position-mode="target-right target" md-offset="40 26">
                    <md-button aria-label="{{ 'ALERTS' | translate }}" class="md-icon-button notification-btn" ng-click="$mdMenu.open($event)">
                        <span ng-show="$ctrl.newNotifications.length" class="notification-count">{{$ctrl.newNotifications.length}}</span>
                        <md-icon md-menu-origin> notifications </md-icon>
                    </md-button>
                    <md-menu-content width="5" class="account-menu">
                        <notifications-menu new-notifications="$ctrl.newNotifications" dismissed-notifications="$ctrl.dismissedNotifications"></notifications-menu>
                    </md-menu-content>
                </md-menu>
                <md-menu id='accountMenu' md-position-mode="target-right target" md-offset="8 26">
                    <md-button aria-label="{{ 'USER_MENU' | translate }}" class="md-icon-button" ng-click="$mdMenu.open($event)">
                        <md-icon md-menu-origin> account_box </md-icon>
                    </md-button>
                    <md-menu-content width="5" class="account-menu">
                        <account-menu></account-menu>
                    </md-menu-content>
                </md-menu>
            </div>
        </md-toolbar>
`
};

export default TopBar;
