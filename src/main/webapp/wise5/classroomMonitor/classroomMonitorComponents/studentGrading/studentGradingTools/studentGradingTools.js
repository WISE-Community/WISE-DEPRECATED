"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StudentGradingToolsController = function () {
  function StudentGradingToolsController($filter, $scope, $state, orderBy, ConfigService, TeacherDataService) {
    var _this = this;

    _classCallCheck(this, StudentGradingToolsController);

    this.$filter = $filter;
    this.$scope = $scope;
    this.$state = $state;
    this.orderBy = orderBy;
    this.ConfigService = ConfigService;
    this.TeacherDataService = TeacherDataService;
    this.$translate = this.$filter('translate');

    this.$onInit = function () {
      _this.selectTeamPlaceholder = _this.$translate('selectATeam');
    };

    this.$onChanges = function () {
      _this.avatarColor = _this.ConfigService.getAvatarColorForWorkgroupId(_this.workgroupId);
      _this.periodId = _this.TeacherDataService.getCurrentPeriod().periodId;
      var workgroups = angular.copy(_this.ConfigService.getClassmateUserInfos());
      _this.workgroups = _this.orderBy(workgroups, 'workgroupId');
      _this.filterForPeriod();
    };

    /**
     * Listen for current period changed event
     */
    this.$scope.$on('currentPeriodChanged', function (event, args) {
      _this.periodId = args.currentPeriod.periodId;
      _this.filterForPeriod();
    });
  }

  _createClass(StudentGradingToolsController, [{
    key: 'filterForPeriod',
    value: function filterForPeriod() {
      var n = this.workgroups.length;
      for (var i = 0; i < n; i++) {
        var workgroup = this.workgroups[i];
        var periodId = workgroup.periodId;
        if (this.periodId === -1 || periodId === this.periodId) {
          workgroup.visible = true;
        } else {
          workgroup.visible = false;
        }
      }

      this.setNextAndPrev();
    }
  }, {
    key: 'setNextAndPrev',
    value: function setNextAndPrev() {
      var currentWorkgroupId = this.workgroupId;
      this.prevId = this.getPrevId(currentWorkgroupId);
      this.nextId = this.getNextId(currentWorkgroupId);
    }
  }, {
    key: 'getPrevId',
    value: function getPrevId(id) {
      var prevId = null;
      var n = this.workgroups.length;
      for (var i = 0; i < n; i++) {
        var workgroupId = this.workgroups[i].workgroupId;
        if (workgroupId === id) {
          if (i > 0) {
            var prevWorkgroup = this.workgroups[i - 1];
            if (prevWorkgroup.visible) {
              prevId = prevWorkgroup.workgroupId;
            } else {
              prevId = this.getPrevId(prevWorkgroup.workgroupId);
            }
          }
          break;
        }
      }
      return prevId;
    }
  }, {
    key: 'getNextId',
    value: function getNextId(id) {
      var nextId = null;
      var n = this.workgroups.length;
      for (var i = 0; i < n; i++) {
        var workgroupId = this.workgroups[i].workgroupId;
        if (workgroupId === id) {
          if (i < n - 1) {
            var nextWorkgroup = this.workgroups[i + 1];
            if (nextWorkgroup.visible) {
              nextId = nextWorkgroup.workgroupId;
            } else {
              nextId = this.getNextId(nextWorkgroup.workgroupId);
            }
          }
          break;
        }
      }
      return nextId;
    }
  }, {
    key: 'goToPrevTeam',
    value: function goToPrevTeam() {
      this.$state.go('root.team', { workgroupId: this.prevId });
    }
  }, {
    key: 'goToNextTeam',
    value: function goToNextTeam() {
      this.$state.go('root.team', { workgroupId: this.nextId });
    }
  }]);

  return StudentGradingToolsController;
}();

StudentGradingToolsController.$inject = ['$filter', '$scope', '$state', 'orderByFilter', 'ConfigService', 'TeacherDataService'];

var StudentGradingTools = {
  bindings: {
    workgroupId: '<'
  },
  template: '<div layout="row" layout-align="center center">\n      <md-button aria-label="{{ \'previousTeam\' | translate }}"\n                 class="md-icon-button toolbar__nav"\n                 ng-disabled="!$ctrl.prevId" ng-click="$ctrl.goToPrevTeam()">\n        <md-icon> chevron_left </md-icon>\n        <md-tooltip md-direction="bottom">{{ \'previousTeam\' | translate }}</md-tooltip>\n      </md-button>\n      <md-icon class="md-30" hide-xs\n               style="color: {{ $ctrl.avatarColor }};"> account_circle </md-icon>&nbsp;\n      <workgroup-select custom-class="\'md-button md-no-underline\n                          toolbar__select toolbar__select--fixedwidth\'"\n                        custom-placeholder="$ctrl.selectTeamPlaceholder"></workgroup-select>\n      <md-button aria-label="{{ \'nextTeam\' | translate }}"\n                 class="md-icon-button toolbar__nav"\n                 ng-disabled="!$ctrl.nextId" ng-click="$ctrl.goToNextTeam()">\n        <md-icon> chevron_right </md-icon>\n        <md-tooltip md-direction="bottom">{{ \'nextTeam\' | translate }}</md-tooltip>\n      </md-button>\n    </div>',
  controller: StudentGradingToolsController
};

exports.default = StudentGradingTools;
//# sourceMappingURL=studentGradingTools.js.map
