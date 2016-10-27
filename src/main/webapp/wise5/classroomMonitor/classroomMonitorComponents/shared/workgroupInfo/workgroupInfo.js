"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WorkgroupInfoController = function WorkgroupInfoController(ConfigService, StudentStatusService) {
    var _this = this;

    _classCallCheck(this, WorkgroupInfoController);

    this.ConfigService = ConfigService;
    this.StudentStatusService = StudentStatusService;

    this.$onInit = function () {
        _this.avatarColor = _this.StudentStatusService.getAvatarColorForWorkgroupId(_this.workgroupId);
        _this.userNames = [];
        if (_this.canViewStudentNames) {
            _this.userNames = _this.ConfigService.getUserNamesByWorkgroupId(_this.workgroupId);
        } else {
            _this.userNames = 'WorkgroupId: ' + _this.workgroupId;
        }
    };
};

WorkgroupInfoController.$inject = ['ConfigService', 'StudentStatusService'];

var WorkgroupInfo = {
    bindings: {
        workgroupId: '<',
        canViewStudentNames: '<',
        alertStatus: '@',
        statusMsg: '@'
    },
    template: '<div layout="row" layout-align="start center">\n            <div class="md-avatar" hide-xs>\n                <md-icon class="md-36" style="color: {{$ctrl.avatarColor}};"> account_circle </md-icon>\n            </div>\n            <div ng-if=\'$ctrl.canViewStudentNames\' layout="row" layout-align="start center" class="heavy">\n                <div>\n                    <span ng-repeat="userName in $ctrl.userNames">{{userName.name}}<span ng-if="!$last">,&nbsp;</span></span>\n                    <md-tooltip md-direction="top" ng-if=\'$ctrl.canViewStudentNames\'>Workgroup ID: {{$ctrl.workgroupId}}</md-tooltip>\n                </div>\n                <workgroup-status-icon message="$ctrl.statusMsg" alert-status="$ctrl.alertStatus"></workgroup-status-icon>\n            </div>\n            <div ng-if=\'!$ctrl.canViewStudentNames\' class="heavy">\n                {{$ctrl.userNames}}\n                <workgroup-status-icon message="$ctrl.statusMsg" alert-status="$ctrl.alertStatus"></workgroup-status-icon>\n            </div>\n        </div>',
    controller: WorkgroupInfoController
};

exports.default = WorkgroupInfo;
//# sourceMappingURL=workgroupInfo.js.map