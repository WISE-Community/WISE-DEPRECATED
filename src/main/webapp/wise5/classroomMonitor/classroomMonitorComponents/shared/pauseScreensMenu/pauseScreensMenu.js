"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PauseScreensMenuController = function () {
    function PauseScreensMenuController($scope, TeacherDataService) {
        var _this = this;

        _classCallCheck(this, PauseScreensMenuController);

        this.$scope = $scope;
        this.TeacherDataService = TeacherDataService;

        this.periods = this.TeacherDataService.getRunStatus().periods;
        this.allPeriodsPaused = this.getAllPeriodsPaused();

        /**
         * Listen for pause screens changed event
         */
        this.$scope.$on('pauseScreensChanged', function (event, args) {
            _this.periods = args.periods;
            _this.allPeriodsPaused = _this.getAllPeriodsPaused();
        });
    }

    _createClass(PauseScreensMenuController, [{
        key: 'togglePeriod',


        /**
         * Toggle the paused status for the given period
         * TODO: sync with actual pause statuses in TeacherDataService
         * @param period the period object to toggle paused status
         */
        value: function togglePeriod(period) {
            if (period.periodId === -1) {
                var n = this.periods.length;
                for (var i = 0; i < n; i++) {
                    var _period = this.periods[i];
                    if (_period.id !== -1) {
                        this.TeacherDataService.pauseScreensChanged(_period.periodId, this.allPeriodsPaused);
                    }
                }
            } else {
                this.TeacherDataService.pauseScreensChanged(period.periodId, period.paused);
            }
        }

        /**
         * Check whether all the periods in the run are paused
         * @return boolean whether all periods are paused
         */

    }, {
        key: 'getAllPeriodsPaused',
        value: function getAllPeriodsPaused() {
            var isPaused = true;
            var n = this.periods.length,
                i = 0;

            for (; i < n; i++) {
                var period = this.periods[i];
                if (period.periodId !== -1 && !period.paused) {
                    isPaused = false;
                    break;
                }
            }

            return isPaused;
        }
    }]);

    return PauseScreensMenuController;
}();

PauseScreensMenuController.$inject = ['$scope', 'TeacherDataService'];

var PauseScreensMenu = {
    template: '<div class="account-menu__caret account-menu__caret--pause" tabindex="0"></div>\n        <div layout="column" class="account-menu--fixed-height">\n            <md-toolbar md-theme="light" class="account-menu__info md-subhead md-whiteframe-1dp" layout="row" layout-align="start center">\n                <div class="accent-1 account-menu__info__title" layout="row" layout-align="start center"><md-icon class="accent-1"> lock </md-icon>&nbsp;\n                    <span translate="lockStudentScreens"></span>\n                </div>\n            </md-toolbar>\n            <md-content flex>\n                <md-switch ng-repeat="period in $ctrl.periods"\n                           ng-if="period.periodId === -1"\n                           class="md-primary account-menu__control"\n                           aria-label="{{ \'lockPeriodLabel\' | translate: { periodName: (\'allPeriods\' | translate) } }}"\n                           ng-model="$ctrl.allPeriodsPaused"\n                           ng-change="$ctrl.togglePeriod(period)">\n                    {{ period.periodName }}\n                </md-switch>\n                <md-divider></md-divider>\n                <md-switch ng-repeat="period in $ctrl.periods"\n                           ng-if="period.periodId !== -1"\n                           class="md-primary account-menu__control"\n                           aria-label="{{ \'lockPeriodLabel\' | translate: { periodName: period.periodName } }}"\n                           ng-model="period.paused"\n                           ng-change="$ctrl.togglePeriod(period)">\n                    {{ \'periodLabel\' | translate:{ name: period.periodName } }}\n                </md-switch>\n            </md-content>\n        </div>',
    controller: PauseScreensMenuController
};

exports.default = PauseScreensMenu;
//# sourceMappingURL=pauseScreensMenu.js.map