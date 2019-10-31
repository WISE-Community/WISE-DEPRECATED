"use strict";

class PeriodSelectController {
    constructor($filter,
                $scope,
                ProjectService,
                StudentStatusService,
                TeacherDataService) {
        this.$filter = $filter;
        this.$scope = $scope;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;
        this.$translate = this.$filter('translate');

        let startNodeId = this.ProjectService.getStartNodeId();
        this.rootNodeId = this.ProjectService.getRootNode(startNodeId).id;

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

        // set the number of workgroups in each period
        let n = this.periods.length;
        for (let i = 0; i < n; i++) {
            let period = this.periods[i];
            let id = (i === 0) ? -1 : period.periodId;
            let numWorkgroupsInPeriod = this.getNumberOfWorkgroupsInPeriod(id);

            period.numWorkgroupsInPeriod = numWorkgroupsInPeriod;
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

    /**
     * Get the number of workgroups in period with the given periodId
     * @param periodId the period id
     * @returns the number of workgroups that are in the period
     */
    getNumberOfWorkgroupsInPeriod(periodId) {
        // get and return the number of workgroups that are in the period
        return this.StudentStatusService.getWorkgroupIdsOnNode(this.rootNodeId, periodId).length;
    }

    getSelectedText() {
        let text = '';
        if (this.currentPeriod.periodId === -1) {
            return this.currentPeriod.periodName;
        } else {
            return this.$translate('periodLabel', { name: this.currentPeriod.periodName });
        }
    }
}

PeriodSelectController.$inject = [
    '$filter',
    '$scope',
    'ProjectService',
    'StudentStatusService',
    'TeacherDataService'
];

const PeriodSelect = {
    bindings: {
        customClass: '<'
    },
    template:
        `<md-select md-theme="default"
                    ng-model="$ctrl.currentPeriod"
                    ng-model-options="{ trackBy: '$value.periodId' }"
                    ng-class="$ctrl.customClass"
                    ng-change="$ctrl.currentPeriodChanged()"
                    aria-label="{{ ::'selectPeriod' | translate }}"
                    md-selected-text="$ctrl.getSelectedText()">
            <md-option ng-repeat="period in $ctrl.periods"
                       ng-value="period"
                       ng-disabled="!period.numWorkgroupsInPeriod">
                <span ng-if="period.periodId === -1" translate="allPeriods"></span>
                <span ng-if="period.periodId != -1" translate="periodLabel" translate-value-name="{{ period.periodName }}"></span>
                <span class="text-secondary">
                    (<ng-pluralize count="period.numWorkgroupsInPeriod"
                        when="{'0': '{{ &quot;numberOfTeams_0&quot; | translate }}',
                            'one': '{{ &quot;numberOfTeams_1&quot; | translate }}',
                            'other': '{{ &quot;numberOfTeams_other&quot; | translate:{count: period.numWorkgroupsInPeriod} }}'}">
                    </ng-pluralize>)
                </span>
            </md-option>
        </md-select>`,
    controller: PeriodSelectController
};

export default PeriodSelect;
