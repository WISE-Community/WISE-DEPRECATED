"use strict";

class WorkgroupSelectController {
    constructor($filter,
                $scope,
                orderBy,
                ConfigService,
                TeacherDataService) {
        this.$filter = $filter;
        this.$scope = $scope;
        this.orderBy = orderBy;
        this.ConfigService = ConfigService;
        this.TeacherDataService = TeacherDataService;

        this.$translate = this.$filter('translate');

        this.$onInit = () => {
            this.canViewStudentNames = this.ConfigService.getPermissions().canViewStudentNames;
            this.workgroups = angular.copy(this.ConfigService.getClassmateUserInfos());
            this.periodId = this.TeacherDataService.getCurrentPeriod().periodId;
            this.selectedItem = this.getCurrentWorkgroup();
            let n = this.workgroups.length;
            for (let i = 0; i < n; i++) {
                let workgroup = this.workgroups[i];
                if (this.canViewStudentNames) {
                    workgroup.displayNames += ' (' + this.$translate('teamId', { id: workgroup.workgroupId}) + ')';
                }
            }
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
        let sortByStudentId = false;

        for (let i = 0; i < n; i++) {
            let workgroup = this.workgroups[i];
            let periodId = workgroup.periodId;
            if (this.periodId === -1 || periodId === this.periodId) {
                let displayNames = workgroup.displayNames;
                if (this.byTeam) {
                    if (displayNames.search(new RegExp(query, 'i')) > -1 || !query) {
                        items.push(workgroup);
                    }
                } else {
                    if (this.canViewStudentNames) {
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
                        sortByStudentId = true;
                        let ids = workgroup.userIds;
                        let l = ids.length;
                        for (let x = 0; x < l; x++) {
                            let id = ids[x];
                            let name = this.$translate('studentId', { id: id });

                            let current = angular.copy(workgroup);
                            current.displayNames = name;
                            current.userId = id;
                            if (current.displayNames.search(new RegExp(query, 'i')) > -1 || !query) {
                                items.push(current);
                            }
                        }
                    }
                }
            }
        }

        let orderedItems = sortByStudentId ? this.orderBy(items, 'userId') : this.orderBy(items, 'workgroupId');

        return orderedItems;
    }

    selectedItemChange() {
        this.setCurrentWorkgroup(this.selectedItem);
    }
}

WorkgroupSelectController.$inject = [
    '$filter',
    '$scope',
    'orderByFilter',
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
                          md-items="workgroup in $ctrl.querySearch($ctrl.searchText)"
                          md-item-text="workgroup.displayNames"
                          md-min-length="0"
                          ng-init="$ctrl.searchText=$ctrl.selectedItem.displayNames"
                          placeholder="{{'findAStudent' | translate}}"
                          title="{{'findAStudent' | translate}}">
            <md-item-template>
                <span md-highlight-text="$ctrl.searchText"
                      md-highlight-flags="ig">{{ workgroup.displayNames }}</span>
            </md-item-template>
            <md-not-found>
                {{'noMatchesFound' | translate}}
            </md-not-found>
        </md-autocomplete>`,
    controller: WorkgroupSelectController
};

export default WorkgroupSelect;
