"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WorkgroupInfoController = function WorkgroupInfoController($filter, ConfigService) {
    var _this = this;

    _classCallCheck(this, WorkgroupInfoController);

    this.$filter = $filter;
    this.ConfigService = ConfigService;

    this.$translate = this.$filter('translate');

    this.$onInit = function () {
        _this.avatarColor = _this.ConfigService.getAvatarColorForWorkgroupId(_this.workgroupId);
        _this.alertIconClass = _this.hasNewAlert ? 'warn' : 'text-disabled';
        _this.alertIconName = 'notifications';
        _this.alertLabel = _this.hasNewAlert ? _this.$translate('HAS_ALERTS_NEW') : _this.$translate('HAS_ALERTS_DISMISSED');
    };
};

WorkgroupInfoController.$inject = ['$filter', 'ConfigService'];

var WorkgroupInfo = {
    bindings: {
        hasAlert: '<',
        hasNewAlert: '<',
        workgroupId: '<',
        usernames: '@'
    },
    template: '<div layout="row" layout-align="start center">\n            <div class="md-avatar" hide-xs>\n                <md-icon class="md-36" style="color: {{ $ctrl.avatarColor }};"> account_circle </md-icon>\n            </div>\n            <div class="heavy">\n                {{ $ctrl.usernames }} <span class="md-caption text-secondary more">({{ \'teamId\' | translate:{ id: $ctrl.workgroupId} }})</span>\n                <status-icon ng-if="$ctrl.hasAlert"\n                             icon-label="$ctrl.alertLabel"\n                             icon-tooltip="$ctrl.alertLabel"\n                             icon-tooltip="$ctrl.alertMsg"\n                             icon-name="$ctrl.alertIconName"\n                             icon-class="$ctrl.alertIconClass"></status-icon>\n                <span ng-if="$ctrl.hasNewWork" class="badge badge--info animate-fade">{{ \'NEW\' | translate }}</span>\n            </div>\n        </div>',
    controller: WorkgroupInfoController
};

exports.default = WorkgroupInfo;
//# sourceMappingURL=workgroupInfo.js.map
