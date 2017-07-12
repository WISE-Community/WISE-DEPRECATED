"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotificationsMenuController = function () {
    function NotificationsMenuController($filter, $mdDialog, NotificationService, ProjectService) {
        _classCallCheck(this, NotificationsMenuController);

        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.NotificationService = NotificationService;
        this.ProjectService = ProjectService;

        this.$translate = this.$filter('translate');
    }

    _createClass(NotificationsMenuController, [{
        key: 'getNodePositionAndTitleByNodeId',
        value: function getNodePositionAndTitleByNodeId(nodeId) {
            return this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
        }

        /**
         * Show confirmation dialog before dismissing all notifications
         */

    }, {
        key: 'confirmDismissAllNotifications',
        value: function confirmDismissAllNotifications(ev) {
            var _this = this;

            var confirm = this.$mdDialog.confirm().parent(angular.element($('._md-open-menu-container._md-active'))) // TODO: hack for now (showing md-dialog on top of md-menu)
            .ariaLabel(this.$translate('dismissNotificationsTitle')).textContent(this.$translate('dismissNotificationsMessage')).targetEvent(ev).ok(this.$translate('yes')).cancel(this.$translate('CANCEL'));

            this.$mdDialog.show(confirm).then(function () {
                _this.dismissAllNotifications();
            });
        }

        /**
         * Dismiss all new notifications
         */

    }, {
        key: 'dismissAllNotifications',
        value: function dismissAllNotifications() {
            var _this2 = this;

            this.newNotifications.map(function (newNotification) {
                _this2.dismissNotification(newNotification);
            });
        }

        /**
         * Dismiss the specified notification
         * @param notification
         */

    }, {
        key: 'dismissNotification',
        value: function dismissNotification(notification) {
            this.NotificationService.dismissNotification(notification);
        }

        /**
         * Dismiss the specified notification and visit the corresponding node
         * @param notification
         */

    }, {
        key: 'dismissNotificationAndVisitNode',
        value: function dismissNotificationAndVisitNode(notification) {}
    }]);

    return NotificationsMenuController;
}();

NotificationsMenuController.$inject = ['$filter', '$mdDialog', 'NotificationService', 'ProjectService'];

var NotificationsMenu = {
    bindings: {
        newNotifications: '<',
        dismissedNotifications: '<',
        withPause: '<'
    },
    template: '<div class="account-menu__caret account-menu__caret--notification"\n                     tabindex="0"\n                     ng-class="{ \'account-menu__caret--notification--with-pause\': $ctrl.withPause }"></div>\n        <div layout="column" class="account-menu--fixed-height account-menu--fixed-width">\n            <md-toolbar md-theme="light" class="account-menu__info md-subhead md-whiteframe-1dp" layout="row" layout-align="start center">\n                <span class="accent-1 account-menu__info__title" layout="row" layout-align="start center"><md-icon class="accent-1"> notifications </md-icon>&nbsp;<span translate="ALERTS"></span></span>\n                <span flex></span>\n                <!--<md-button class="md-icon-button"\n                           aria-label="Clear all notifications"\n                           md-prevent-menu-close="md-prevent-menu-close"\n                           ng-disabled="$ctrl.newNotifications.length < 1"\n                           ng-click="$ctrl.confirmDismissAllNotifications($event)">\n                    <md-icon> clear_all </md-icon>-->\n                </md-button>\n            </md-toolbar>\n            <md-content class="account-menu__actions" flex>\n                <div class="md-padding center" ng-if="!$ctrl.newNotifications.length"><span class="md-body-1" translate="NO_ALERTS"></span></div>\n                <md-list class="notification-list" ng-if="$ctrl.newNotifications.length">\n                    <md-list-item ng-repeat="notification in $ctrl.newNotifications track by $index"\n                                  ng-click="$ctrl.dismissNotificationAndVisitNode(notification)"\n                                  md-autofocus="$first"\n                                  class="md-2-line">\n                        <div class="md-list-item-text">\n                            <div class="md-body-1 primary">{{ notification.message }}</div>\n                            <h4 class="notification-list-item__source">{{ $ctrl.getNodePositionAndTitleByNodeId(notification.nodeId) }}</h4>\n                        </div>\n                        <md-button class="md-icon-button" md-prevent-menu-close="md-prevent-menu-close"\n                                   ng-click="$ctrl.dismissNotification(notification)">\n                            <md-icon>clear</md-icon>\n                        </md-button>\n                    </md-list-item>\n                </md-list>\n            </md-content>\n        </div>',
    controller: NotificationsMenuController
};

exports.default = NotificationsMenu;
//# sourceMappingURL=notificationsMenu.js.map