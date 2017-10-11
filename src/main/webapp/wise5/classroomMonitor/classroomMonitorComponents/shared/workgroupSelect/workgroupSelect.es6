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
            this.placeholder = this.customPlaceholder ? this.customPlaceholder : this.$translate('findAStudent');
            this.canViewStudentNames = this.ConfigService.getPermissions().canViewStudentNames;
            this.workgroups = angular.copy(this.ConfigService.getClassmateUserInfos());
            this.periodId = this.TeacherDataService.getCurrentPeriod().periodId;
            this.selectedItem = this.getCurrentWorkgroup();
            this.setWorkgroups();
        };

        /**
         * Listen for current workgroup changed event
         */
        this.$scope.$on('currentWorkgroupChanged', (event, args) => {
            let workgroup = args.currentWorkgroup;
            if (workgroup != null) {
                this.selectedItem = this.getCurrentWorkgroup();
            }
        });

        /**
         * Listen for current period changed event
         */
        this.$scope.$on('currentPeriodChanged', (event, args) => {
            this.periodId = args.currentPeriod.periodId;
            this.selectedItem = this.getCurrentWorkgroup();
            this.setWorkgroups();
        });
    };

    /**
     * Setup the workgroups data model based on whether we're showing
     * individual students and whether current user can view student names
     */
    setWorkgroups() {
        if (this.byStudent) {
            let students = [];
            let sortByStudentId = false;
            let n = this.workgroups.length;
            for (let i = 0; i < n; i++) {
                let workgroup = this.workgroups[i];
                if (this.canViewStudentNames) {
                    let names = workgroup.displayNames.split(',');
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
                        students.push(current);
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
                        students.push(current);
                    }
                }
            }
            this.workgroups = sortByStudentId ? this.orderBy(students, 'userId') : this.orderBy(students, 'displayNames');
        } else {
            let n = this.workgroups.length;
            for (let i = 0; i < n; i++) {
                let workgroup = this.workgroups[i];
                if (this.canViewStudentNames) {
                    workgroup.displayNames += ' (' + this.$translate('teamId', { id: workgroup.workgroupId}) + ')';
                }
            }
            this.workgroups = this.orderBy(this.workgroups, 'workgroupId');
        }
    }

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
        let localGroup = null;
        let currentWorkgroup = this.TeacherDataService.getCurrentWorkgroup();
        if (currentWorkgroup) {
            let n = this.workgroups.length;
            for (let i = 0; i < n; i++) {
                let workgroup = this.workgroups[i];
                if (currentWorkgroup.workgroupId === workgroup.workgroupId) {
                    if (this.byStudent &&
                        (currentWorkgroup.displayNames === workgroup.displayNames)) {
                        localGroup = workgroup;
                    } else {
                        localGroup = workgroup;
                    }
                }
            }
        }
        return localGroup;
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

    clearSearchTerm() {
        this.searchTerm = '';
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
        byStudent: '<',
        customClass: '<',
        customPlaceholder: '<',
        useAutocomplete: '<'
    },
    template:
        `<md-autocomplete ng-if="$ctrl.useAutocomplete"
                          class="autocomplete"
                          ng-class="$ctrl.customClass"
                          md-no-cache="true"
                          md-selected-item="$ctrl.selectedItem"
                          md-search-text="$ctrl.searchText"
                          md-selected-item-change="$ctrl.selectedItemChange()"
                          md-items="workgroup in $ctrl.querySearch($ctrl.searchText)"
                          md-item-text="workgroup.displayNames"
                          md-min-length="0"
                          ng-init="$ctrl.searchText=$ctrl.selectedItem.displayNames"
                          placeholder="{{ $ctrl.placeholder }}"
                          title="{{ $ctrl.placeholder }}">
            <md-item-template>
                <span md-highlight-text="$ctrl.searchText"
                      md-highlight-flags="ig">{{ workgroup.displayNames }}</span>
            </md-item-template>
            <md-not-found>
                {{ 'noMatchesFound' | translate }}
            </md-not-found>
        </md-autocomplete>
        <md-select ng-if="!$ctrl.useAutocomplete"
                   md-theme="default"
                   ng-class="$ctrl.customClass"
                   aria-label="{{ $ctrl.placeholder }}"
                   ng-model="$ctrl.selectedItem"
                   ng-change="$ctrl.selectedItemChange()"
                   md-on-close="$ctrl.clearSearchTerm()"
                   md-selected-text="$ctrl.selectedItem.displayNames">
            <md-select-header class="select__header" layout="row" flex>
                <input ng-model="$ctrl.searchTerm"
                       type="search"
                       placeholder="{{ 'findAStudent' | translate }}"
                       ng-keydown="$event.stopPropagation()">
            </md-select-header>
            <md-divider></md-divider>
            <md-opt-group>
                <md-option ng-repeat="workgroup in $ctrl.workgroups |
                    filter:$ctrl.searchTerm"
                    ng-value="workgroup">
                    <!-- TODO: add avatar? -->
                    <span class="node-select__text">{{ workgroup.displayNames }}</span>
                </md-option>
            </md-opt-group>
        </md-select>`,
    controller: WorkgroupSelectController
};

export default WorkgroupSelect;
