"use strict";

class WorkgroupSelectController {
    constructor($scope,
                ConfigService,
                TeacherDataService) {
        this.$scope = $scope;
        this.ConfigService = ConfigService;
        this.TeacherDataService = TeacherDataService;

        this.$onInit = () => {
            this.canViewStudentNames = this.ConfigService.getPermissions().canViewStudentNames;
            this.workgroups = this.ConfigService.getClassmateUserInfos();
            this.periodId = this.TeacherDataService.getCurrentPeriod().periodId;
            this.selectedItem = this.getCurrentWorkgroup();
        };

        /**
         * Listen for current period changed event
         */
        this.$scope.$on('currentPeriodChanged', (event, args) => {
            this.periodId = args.currentPeriod.periodId;
            this.selectedItem = this.getCurrentWorkgroup();
        });
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
     * Return workgroups with username text that query string matches
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

                if (!this.byTeam && this.canViewStudentNames) {
                    let names = displayNames.split(',');
                    let l = names.length;
                    for (let x = 0; x < l; x++) {
                        let name = names[x].trim();
                        // get the index of the first empty space
                        let indexOfSpace = name.indexOf(' ');
                        // get the student first name e.g. "Spongebob"
                        let firstName = name.substring(0, indexOfSpace);
                        let lastName = name.substring(indexOfSpace+1);

                        let current = angular.copy(workgroup);
                        current.displayNames = lastName + ', ' + firstName;
                        if (current.displayNames.search(new RegExp(query, 'i')) > -1 || !query) {
                            items.push(current);
                        }
                    }
                } else {
                    if (displayNames.search(new RegExp(query, 'i')) > -1 || !query) {
                        items.push(workgroup);
                    }
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
    bindings: {
        byTeam: '<'
    },
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
                          placeholder="{{'findAStudent' | translate}}"
                          title="{{'findAStudent' | translate}}">
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
