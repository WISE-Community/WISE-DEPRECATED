"use strict";

class PeriodSelectController {
    constructor($scope,
                $translate,
                TeacherDataService) {
        this.$scope = $scope;
        this.$translate = $translate;
        this.TeacherDataService = TeacherDataService;

        this.currentPeriod = null;
        this.periods = [];
        this.initializePeriods();

        /**
         * Listen for current period changed event
         */
        this.$scope.$on('currentPeriodChanged', (event, args) => {
            this.currentPeriod = args.currentPeriod;
        });
    };

    /**
     * Initialize the periods
     */
    initializePeriods() {
        this.periods = this.TeacherDataService.getPeriods();

        // set the current period if it hasn't been set yet
        if (this.getCurrentPeriod()) {
            this.currentPeriod = this.getCurrentPeriod();
        } else {
            if (this.periods != null && this.periods.length > 0) {
                // set it to the all periods option
                this.setCurrentPeriod(this.periods[0]);
            }
        }
    }

    /**
     * The current period was changed
     */
    currentPeriodChanged() {
        this.setCurrentPeriod(this.currentPeriod);
    }

    /**
     * Set the current period
     * @param period the period object
     */
    setCurrentPeriod(period) {
        this.TeacherDataService.setCurrentPeriod(period);
    }

    /**
     * Get the current period
     */
    getCurrentPeriod() {
        return this.TeacherDataService.getCurrentPeriod();
    }
}

PeriodSelectController.$inject = [
    '$scope',
    '$translate',
    'TeacherDataService'
];

const PeriodSelect = {
    template:
        `<md-select ng-model="$ctrl.currentPeriod"
                    ng-model-options="{trackBy: '$value.periodId'}"
                    class="md-no-underline md-button md-raised"
                    ng-change="$ctrl.currentPeriodChanged()"
                    placeholder="{{'selectPeriod' | translate}}">
            <md-option ng-repeat="period in $ctrl.periods" ng-value="period">
                <span ng-if="period.periodId === -1" translate="allPeriods"></span>
                <span ng-if="period.periodId != -1" translate="periodLabel" translate-value-name="{{period.periodName}}"></span>
            </md-option>
        </md-select>`,
    controller: PeriodSelectController
};

export default PeriodSelect;
