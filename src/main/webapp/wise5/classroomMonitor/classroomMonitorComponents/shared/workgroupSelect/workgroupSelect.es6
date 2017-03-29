"use strict";

class WorkgroupSelectController {
    constructor($scope,
                ConfigService,
                TeacherDataService) {
        this.$scope = $scope;
        this.ConfigService = ConfigService;
        this.TeacherDataService = TeacherDataService;

        this.$onInit = () => {
            this.workgroups = this.ConfigService.getClassmateUserInfos();
            this.periodId = this.TeacherDataService.getCurrentPeriod().periodId;
            this.selectedItem = this.getCurrentWorkgroup();
        };

        /**
         * Listen for current period changed event
         */
        this.$scope.$on('currentPeriodChanged', (event, args) => {
            this.periodId = args.currentPeriod.periodId;

            if (this.selectedItem) {
                if (this.periodId !== -1 && this.periodId !== this.selectedItem.periodId) {
                    this.selectedItem = null;
                    this.setCurrentWorkgroup(null);
                }
            }
        });

        /**
         * Listen for current period changed event
         */
        //this.$scope.$on('currentWorkgroupChanged', (event, args) => {
            //this.currentWorkgroup = args.currentWorkgroup;
        //});

        /*this.$onChanges = (changesObj) => {
            if (changesObj.periodId) {
                let currentPeriodId = changesObj.periodId.currentValue;
                if (this.selectedItem) {
                    if (currentPeriodId !== -1 && currentPeriodId !== this.selectedItem.periodId) {
                        this.selectedItem = null;
                        this.setCurrentWorkgroup(null);
                    }
                }
            }
        };*/
    };

    /**
     * Set the currently selected workgroup
     * @param workgroup the workgroup object
     */
    setCurrentWorkgroup(workgroup) {
        this.TeacherDataService.setCurrentWorkgroup(workgroup);
    }

    /**
     * Get the current workgroup
     * @return workgroup object
     */
    getCurrentWorkgroup() {
        return this.TeacherDataService.getCurrentWorkgroup();
    }

    /**
     * Return workgroups with username(s) content that query text matches
     * @param query String to search for
     * @return Array of workgroups
     */
    querySearch(query) {
        let items = [];
        let n = this.workgroups.length;

        for (let i = 0; i < n; i++) {
            let workgroup = this.workgroups[i];
            let periodId = workgroup.periodId;
            if (this.periodId === -1 || periodId === this.periodId) {
                let displayNames = workgroup.displayNames;
                if (displayNames.search(new RegExp(query, 'i')) > -1 || !query) {
                    items.push(workgroup);
                }
            }
        }

        return items;
    }

    selectedItemChange() {
        this.setCurrentWorkgroup(this.selectedItem);
    }
}

WorkgroupSelectController.$inject = [
    '$scope',
    'ConfigService',
    'TeacherDataService'
];

const WorkgroupSelect = {
    bindings: {},
    template:
        `<md-autocomplete class="autocomplete"
                          md-no-cache="true"
                          md-selected-item="$ctrl.selectedItem"
                          md-search-text="$ctrl.searchText"
                          md-selected-item-change="$ctrl.selectedItemChange()"
                          md-items="workgroup in $ctrl.querySearch($ctrl.searchText) | orderBy: 'displayNames'"
                          md-item-text="workgroup.displayNames"
                          md-min-length="0"
                          ng-init="$ctrl.searchText=$ctrl.selectedItem.displayNames"
                          placeholder="{{'findATeam' | translate}}">
            <md-item-template>
                <span md-highlight-text="$ctrl.searchText" md-highlight-flags="ig">{{workgroup.displayNames}}</span>
            </md-item-template>
            <md-not-found>
                {{'noMatchesFound' | translate}}
            </md-not-found>
        </md-autocomplete>`,
    controller: WorkgroupSelectController
};

export default WorkgroupSelect;
