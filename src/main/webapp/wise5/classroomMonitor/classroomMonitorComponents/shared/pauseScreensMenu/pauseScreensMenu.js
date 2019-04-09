'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PauseScreensMenuController = function () {
  function PauseScreensMenuController($scope, TeacherDataService) {
    _classCallCheck(this, PauseScreensMenuController);

    this.$scope = $scope;
    this.TeacherDataService = TeacherDataService;
    this.periods = this.TeacherDataService.getPeriods();
    this.allPeriodsPaused = false;
  }

  /**
   * Toggle the paused status for the given period
   * TODO: sync with actual pause statuses in TeacherDataService
   * @param period the period object to toggle paused status
   */


  _createClass(PauseScreensMenuController, [{
    key: 'togglePeriod',
    value: function togglePeriod(period) {
      this.TeacherDataService.pauseScreensChanged(period.periodId, period.paused);
    }
  }, {
    key: 'toggleAllPeriods',
    value: function toggleAllPeriods() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.periods[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var period = _step.value;

          if (period.periodId !== -1) {
            this.TeacherDataService.pauseScreensChanged(period.periodId, this.allPeriodsPaused);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }]);

  return PauseScreensMenuController;
}();

PauseScreensMenuController.$inject = ['$scope', 'TeacherDataService'];

var PauseScreensMenu = {
  template: '<div class="account-menu__caret account-menu__caret--pause" tabindex="0"></div>\n        <div layout="column" class="account-menu--fixed-height">\n            <md-toolbar md-theme="light" class="account-menu__info md-subhead md-whiteframe-1dp" layout="row" layout-align="start center">\n                <div class="accent-1 account-menu__info__title" layout="row" layout-align="start center"><md-icon class="accent-1"> lock </md-icon>&nbsp;\n                    <span translate="lockStudentScreens"></span>\n                </div>\n            </md-toolbar>\n            <md-content flex>\n                <md-switch class="md-primary account-menu__control"\n                           aria-label="{{ \'lockPeriodLabel\' | translate: { periodName: (\'allPeriods\' | translate) } }}"\n                           ng-model="$ctrl.allPeriodsPaused"\n                           ng-change="$ctrl.toggleAllPeriods()">\n                    {{ \'allPeriods\' | translate }}\n                </md-switch>\n                <md-divider></md-divider>\n                <md-switch ng-repeat="period in $ctrl.periods"\n                           ng-if="period.periodId !== -1"\n                           class="md-primary account-menu__control"\n                           aria-label="{{ \'lockPeriodLabel\' | translate: { periodName: period.periodName } }}"\n                           ng-model="period.paused"\n                           ng-change="$ctrl.togglePeriod(period)">\n                    {{ \'periodLabel\' | translate:{ name: period.periodName } }}\n                </md-switch>\n            </md-content>\n        </div>',
  controller: PauseScreensMenuController
};

exports.default = PauseScreensMenu;
//# sourceMappingURL=pauseScreensMenu.js.map
