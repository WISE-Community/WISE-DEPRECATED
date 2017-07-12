"use strict";

class PauseScreensMenuController {
    constructor($scope,
                TeacherDataService) {
        this.$scope = $scope;
        this.TeacherDataService = TeacherDataService;

        this.periods = this.TeacherDataService.getPeriods();
        this.allPeriodsPaused = this.getAllPeriodsPaused();

        /**
         * Listen for pause screens changed event
         */
        this.$scope.$on('pauseScreensChanged', (event, args) => {
            this.periods = args.periods;
            this.allPeriodsPaused = this.getAllPeriodsPaused();
        });
    };

    /**
     * Toggle the paused status for the given period
     * TODO: sync with actual pause statuses in TeacherDataService
     * @param period the period object to toggle paused status
     */
    togglePeriod(period) {
        if (period.periodId === -1) {
            let n = this.periods.length;
            for (let i = 0; i < n; i++) {
                let thisPeriod = this.periods[i];
                if (thisPeriod.periodId !== -1) {
                    this.TeacherDataService.pauseScreensChanged(period.periodId, this.allPeriodsPaused);
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
    getAllPeriodsPaused() {
        let isPaused = true;
        let n = this.periods.length, i = 0;

        for (; i < n; i++) {
            let period = this.periods[i];
            if (period.periodId !== -1 && !period.paused) {
                isPaused = false;
                break;
            }
        }

        return isPaused;
    }
}

PauseScreensMenuController.$inject = [
    '$scope',
    'TeacherDataService'
];

const PauseScreensMenu = {
    template:
        `<div class="account-menu__caret account-menu__caret--pause" tabindex="0"></div>
        <div layout="column" class="account-menu--fixed-height">
            <md-toolbar md-theme="light" class="account-menu__info md-subhead md-whiteframe-1dp" layout="row" layout-align="start center">
                <div class="accent-1 account-menu__info__title" layout="row" layout-align="start center"><md-icon class="accent-1"> lock </md-icon>&nbsp;
                    <span translate="lockStudentScreens"></span>
                </div>
            </md-toolbar>
            <md-content flex>
                <md-switch ng-repeat="period in $ctrl.periods"
                           ng-if="period.periodId === -1"
                           class="md-primary account-menu__control"
                           aria-label="{{ 'lockPeriodLabel' | translate: { periodName: ('allPeriods' | translate) } }}"
                           ng-model="$ctrl.allPeriodsPaused"
                           ng-change="$ctrl.togglePeriod(period)">
                    {{ period.periodName }}
                </md-switch>
                <md-divider></md-divider>
                <md-switch ng-repeat="period in $ctrl.periods"
                           ng-if="period.periodId !== -1"
                           class="md-primary account-menu__control"
                           aria-label="{{ 'lockPeriodLabel' | translate: { periodName: period.periodName } }}"
                           ng-model="period.paused"
                           ng-change="$ctrl.togglePeriod(period)">
                    {{ 'periodLabel' | translate:{ name: period.periodName } }}
                </md-switch>
            </md-content>
        </div>`,
    controller: PauseScreensMenuController
};

export default PauseScreensMenu;
