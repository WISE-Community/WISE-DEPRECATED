"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TopBarController = function () {
    function TopBarController(ConfigService) {
        var _this = this;

        _classCallCheck(this, TopBarController);

        this.ConfigService = ConfigService;

        this.workgroupId = this.ConfigService.getWorkgroupId();

        this.$onChanges = function (changesObj) {
            if (changesObj.notifications) {
                _this.setNotifications();
            }
        };
    }

    /**
     * Find all teacher notifications and separate into new and dismissed arrays
     * TODO: move to TeacherDataService?
     */


    _createClass(TopBarController, [{
        key: 'setNotifications',
        value: function setNotifications() {
            var _this2 = this;

            // get all notifications for the logged in teacher
            // TODO: take into account shared teacher users!
            var userNotifications = this.notifications.filter(function (notification) {
                return notification.toWorkgroupId === _this2.workgroupId;
            });

            this.newNotifications = userNotifications.filter(function (notification) {
                return notification.timeDismissed == null;
            });

            this.dismissedNotifications = userNotifications.filter(function (notification) {
                return notification.timeDismissed != null;
            });
        }
    }]);

    return TopBarController;
}();

TopBarController.$inject = ['ConfigService'];

var TopBar = {
    bindings: {
        logoPath: '@',
        notifications: '<',
        projectId: '<',
        projectTitle: '<',
        runId: '<'
    },
    controller: TopBarController,
    template: '<md-toolbar class="l-header">\n            <div class="md-toolbar-tools">\n                <span class="md-button logo-link">\n                    <img ng-src="{{ $ctrl.logoPath }}" alt="{{ \'WISE_LOGO\' | translate }}" class="logo" />\n                </span>\n                <h3>{{ $ctrl.projectTitle }} <span class="md-caption">({{ \'RUN_ID_DISPLAY\' | translate:{id: $ctrl.runId} }})</span></h3>\n                <span flex></span>\n                <md-menu md-position-mode="target-right target" md-offset="40 26">\n                    <md-button aria-label="{{ \'ALERTS\' | translate }}" class="md-icon-button notification-btn" ng-click="$mdMenu.open($event)">\n                        <span ng-show="$ctrl.newNotifications.length" class="notification-count">{{$ctrl.newNotifications.length}}</span>\n                        <md-icon md-menu-origin> notifications </md-icon>\n                    </md-button>\n                    <md-menu-content width="5" class="account-menu">\n                        <notifications-menu new-notifications="$ctrl.newNotifications" dismissed-notifications="$ctrl.dismissedNotifications"></notifications-menu>\n                    </md-menu-content>\n                </md-menu>\n                <md-menu id=\'accountMenu\' md-position-mode="target-right target" md-offset="8 26">\n                    <md-button aria-label="{{ \'USER_MENU\' | translate }}" class="md-icon-button" ng-click="$mdMenu.open($event)">\n                        <md-icon md-menu-origin> account_box </md-icon>\n                    </md-button>\n                    <md-menu-content width="5" class="account-menu">\n                        <account-menu></account-menu>\n                    </md-menu-content>\n                </md-menu>\n            </div>\n        </md-toolbar>\n'
};

exports.default = TopBar;
//# sourceMappingURL=topBar.js.map