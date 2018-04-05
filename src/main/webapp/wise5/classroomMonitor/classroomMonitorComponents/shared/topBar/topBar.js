"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TopBarController = function () {
    function TopBarController($rootScope, ConfigService, ProjectService, TeacherDataService) {
        var _this = this;

        _classCallCheck(this, TopBarController);

        this.$rootScope = $rootScope;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.TeacherDataService = TeacherDataService;

        // get the teacher workgroup id
        this.workgroupId = this.ConfigService.getWorkgroupId();

        if (this.workgroupId == null) {
            /*
             * the teacher doesn't have a workgroup id so we will use a random
             * number
             */
            this.workgroupId = parseInt(100 * Math.random());
        }

        // get the avatar color for the teacher
        this.avatarColor = this.ConfigService.getAvatarColorForWorkgroupId(this.workgroupId);

        // get the teacher name and user name
        this.userName = this.ConfigService.getMyUserName();

        this.$onChanges = function (changesObj) {
            if (changesObj.notifications) {
                _this.setNotifications();
            }
        };

        this.themePath = this.ProjectService.getThemePath();
        this.contextPath = this.ConfigService.getContextPath();
    }

    /**
     * Find all teacher notifications and separate into new and dismissed arrays
     * TODO: move to TeacherDataService?
     */


    _createClass(TopBarController, [{
        key: "setNotifications",
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

        /**
         * Check whether any period in the run is paused
         * @return Boolean whether any of the periods are paused
         */

    }, {
        key: "isAnyPeriodPaused",
        value: function isAnyPeriodPaused() {
            return this.TeacherDataService.isAnyPeriodPaused();
        }

        /**
         * Navigate the teacher to the teacher home page
         */

    }, {
        key: "goHome",
        value: function goHome() {
            // save goHome event
            var context = "ClassroomMonitor";
            var nodeId = null;
            var componentId = null;
            var componentType = null;
            var category = "Navigation";
            var event = "goHomeButtonClicked";
            var eventData = {};
            this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, eventData);

            // fire the goHome event
            this.$rootScope.$broadcast('goHome');
        }
    }, {
        key: "logOut",


        /**
         * Log the teacher out of WISE
         */
        value: function logOut() {
            // save logOut event
            var context = "ClassroomMonitor";
            var nodeId = null;
            var componentId = null;
            var componentType = null;
            var category = "Navigation";
            var event = "logOutButtonClicked";
            var eventData = {};
            this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, eventData);

            // fire the logOut event
            this.$rootScope.$broadcast('logOut');
        }
    }]);

    return TopBarController;
}();

TopBarController.$inject = ['$rootScope', 'ConfigService', 'ProjectService', 'TeacherDataService'];

var TopBar = {
    bindings: {
        logoPath: '@',
        notifications: '<',
        projectId: '<',
        projectTitle: '<',
        runId: '<'
    },
    controller: TopBarController,
    template: "<md-toolbar class=\"l-header\">\n            <div class=\"md-toolbar-tools\">\n                <span class=\"md-button logo-link\">\n                    <a href=\"{{$ctrl.contextPath}}/teacher\" target=\"_self\">\n                        <img ng-src=\"{{ $ctrl.logoPath }}\" alt=\"{{ 'WISE_LOGO' | translate }}\" class=\"logo\" />\n                    </a>\n                </span>\n                <h3>{{ $ctrl.projectTitle }} <span class=\"md-caption\">({{ 'RUN_ID_DISPLAY' | translate:{id: $ctrl.runId} }})</span></h3>\n                <span flex></span>\n                <md-menu md-position-mode=\"target-right target\" md-offset=\"52 26\">\n                    <md-button aria-label=\"{{ 'ALERTS' | translate }}\" class=\"md-icon-button notification-btn\" ng-click=\"$mdMenu.open($event)\">\n                        <span ng-show=\"$ctrl.newNotifications.length\" class=\"notification-count\">{{$ctrl.newNotifications.length}}</span>\n                        <md-icon md-menu-origin> notifications </md-icon>\n                    </md-button>\n                    <md-menu-content width=\"5\" class=\"account-menu\">\n                        <notifications-menu new-notifications=\"$ctrl.newNotifications\" dismissed-notifications=\"$ctrl.dismissedNotifications\" with-pause=\"true\"></notifications-menu>\n                    </md-menu-content>\n                </md-menu>\n                <md-menu md-position-mode=\"target-right target\" md-offset=\"40 26\">\n                    <md-button aria-label=\"{{ 'pauseStudentScreens' | translate }}\"\n                               class=\"md-icon-button\"\n                               ng-class=\"{ 'has-indicator has-indicator--icon-button': $ctrl.isAnyPeriodPaused() }\"\n                               ng-click=\"$mdMenu.open($event)\">\n                        <md-icon md-menu-origin ng-if=\"$ctrl.isAnyPeriodPaused()\"> lock </md-icon>\n                        <md-icon md-menu-origin ng-if=\"!$ctrl.isAnyPeriodPaused()\"> lock_open </md-icon>\n                    </md-button>\n                    <md-menu-content width=\"5\" class=\"account-menu\">\n                        <pause-screens-menu></pause-screens-menu>\n                    </md-menu-content>\n                </md-menu>\n                <md-menu id='accountMenu' md-position-mode=\"target-right target\" md-offset=\"8 26\">\n                    <md-button aria-label=\"{{ 'USER_MENU' | translate }}\" class=\"md-icon-button\" ng-click=\"$mdMenu.open($event)\">\n                        <md-icon md-menu-origin> account_box </md-icon>\n                    </md-button>\n                    <md-menu-content width=\"5\" class=\"account-menu\">\n                        <ng-include src=\"$ctrl.themePath + '/templates/teacherAccountMenu.html'\"></ng-include>\n                    </md-menu-content>\n                </md-menu>\n            </div>\n        </md-toolbar>\n"
};

exports.default = TopBar;
//# sourceMappingURL=topBar.js.map
