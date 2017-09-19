"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TopBarController = function () {
    function TopBarController($rootScope, ConfigService, ProjectService, TeacherDataService) {
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

        this.themePath = this.ProjectService.getThemePath();
    }

    /**
     * Navigate the teacher to the teacher home page
     */


    _createClass(TopBarController, [{
        key: 'goHome',
        value: function goHome() {
            // fire the goHome event
            this.$rootScope.$broadcast('goHome');
        }
    }, {
        key: 'logOut',


        /**
         * Log the teacher out of WISE
         */
        value: function logOut() {
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
        projectId: '<',
        projectTitle: '<',
        runId: '<'
    },
    controller: TopBarController,
    template: '<md-toolbar class="l-header">\n            <div class="md-toolbar-tools">\n                <span class="md-button logo-link">\n                    <img ng-src="{{ $ctrl.logoPath }}" alt="{{ \'WISE_LOGO\' | translate }}" class="logo" />\n                </span>\n                <h3>\n                    <span ng-if="$ctrl.projectTitle">{{ $ctrl.projectTitle }}</span>\n                    <span ng-if="!$ctrl.projectTitle">{{ \'authoringTool\' | translate }}</span>\n                    <span class="md-caption" ng-if="$ctrl.projectId">\n                        ({{ \'PROJECT_ID_DISPLAY\' | translate:{id: $ctrl.projectId} }}<span class="md-caption" ng-if="$ctrl.runId"> | {{ \'RUN_ID_DISPLAY\' | translate:{id: $ctrl.runId} }}</span>)\n                    </span>\n                </h3>\n                <span flex></span>\n                <md-menu id=\'accountMenu\' md-position-mode="target-right target" md-offset="8 26">\n                    <md-button aria-label="{{ \'USER_MENU\' | translate }}" class="md-icon-button" ng-click="$mdMenu.open($event)">\n                        <md-icon md-menu-origin> account_box </md-icon>\n                    </md-button>\n                    <md-menu-content width="5" class="account-menu">\n                        <ng-include src="$ctrl.themePath + \'/templates/teacherAccountMenu.html\'"></ng-include>\n                    </md-menu-content>\n                </md-menu>\n            </div>\n        </md-toolbar>'
};

exports.default = TopBar;
//# sourceMappingURL=topBar.js.map