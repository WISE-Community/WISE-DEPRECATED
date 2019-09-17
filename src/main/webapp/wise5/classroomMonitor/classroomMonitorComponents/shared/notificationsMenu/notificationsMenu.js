"use strict";

class NotificationsMenuController {
    constructor($filter,
                $mdDialog,
                NotificationService,
                ProjectService) {
        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.NotificationService = NotificationService;
        this.ProjectService = ProjectService;

        this.$translate = this.$filter('translate');
    };

    getNodePositionAndTitleByNodeId(nodeId) {
        return this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
    }

    /**
     * Show confirmation dialog before dismissing all notifications
     */
    confirmDismissAllNotifications(ev) {
        let confirm = this.$mdDialog.confirm()
            .parent(angular.element(document.querySelector('._md-open-menu-container._md-active')))// TODO: hack for now (showing md-dialog on top of md-menu)
            .ariaLabel(this.$translate('dismissNotificationsTitle'))
            .textContent(this.$translate('dismissNotificationsMessage'))
            .targetEvent(ev)
            .ok(this.$translate('yes'))
            .cancel(this.$translate('CANCEL'));

        this.$mdDialog.show(confirm).then(() => {
            this.dismissAllNotifications();
        });
    }

    /**
     * Dismiss all new notifications
     */
    dismissAllNotifications() {
        this.newNotifications.map((newNotification) => {
            this.dismissNotification(newNotification);
        });
    }

    /**
     * Dismiss the specified notification
     * @param notification
     */
    dismissNotification(notification) {
        this.NotificationService.dismissNotification(notification);
    }

    /**
     * Dismiss the specified notification and visit the corresponding node
     * @param notification
     */
    dismissNotificationAndVisitNode(notification) {

    }
}

NotificationsMenuController.$inject = [
    '$filter',
    '$mdDialog',
    'NotificationService',
    'ProjectService'
];

const NotificationsMenu = {
    bindings: {
        newNotifications: '<',
        dismissedNotifications: '<',
        withPause: '<'
    },
    template:
        `<div class="account-menu__caret account-menu__caret--notification"
                     tabindex="0"
                     ng-class="{ 'account-menu__caret--notification--with-pause': $ctrl.withPause }"></div>
        <div layout="column" class="account-menu--fixed-height account-menu--fixed-width">
            <md-toolbar md-theme="light" class="account-menu__info md-subhead md-whiteframe-1dp" layout="row" layout-align="start center">
                <span class="accent-1 account-menu__info__title" layout="row" layout-align="start center"><md-icon class="accent-1"> notifications </md-icon>&nbsp;<span translate="ALERTS"></span></span>
                <span flex></span>
                <!--<md-button class="md-icon-button"
                           aria-label="Clear all notifications"
                           md-prevent-menu-close="md-prevent-menu-close"
                           ng-disabled="$ctrl.newNotifications.length < 1"
                           ng-click="$ctrl.confirmDismissAllNotifications($event)">
                    <md-icon> clear_all </md-icon>-->
                </md-button>
            </md-toolbar>
            <md-content class="account-menu__actions" flex>
                <div class="md-padding center" ng-if="!$ctrl.newNotifications.length"><span class="md-body-1" translate="NO_ALERTS"></span></div>
                <md-list class="notification-list" ng-if="$ctrl.newNotifications.length">
                    <md-list-item ng-repeat="notification in $ctrl.newNotifications track by $index"
                                  ng-click="$ctrl.dismissNotificationAndVisitNode(notification)"
                                  md-autofocus="$first"
                                  class="md-2-line">
                        <div class="md-list-item-text">
                            <div class="md-body-1 primary">{{ notification.message }}</div>
                            <h4 class="notification-list-item__source">{{ $ctrl.getNodePositionAndTitleByNodeId(notification.nodeId) }}</h4>
                        </div>
                        <md-button class="md-icon-button" md-prevent-menu-close="md-prevent-menu-close"
                                   ng-click="$ctrl.dismissNotification(notification)">
                            <md-icon>clear</md-icon>
                        </md-button>
                    </md-list-item>
                </md-list>
            </md-content>
        </div>`,
    controller: NotificationsMenuController
};

export default NotificationsMenu;
