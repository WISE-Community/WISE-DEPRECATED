"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WorkgroupSelectController = function () {
    function WorkgroupSelectController($filter, $scope, orderBy, ConfigService, TeacherDataService) {
        var _this = this;

        _classCallCheck(this, WorkgroupSelectController);

        this.$filter = $filter;
        this.$scope = $scope;
        this.orderBy = orderBy;
        this.ConfigService = ConfigService;
        this.TeacherDataService = TeacherDataService;
        this.$translate = this.$filter('translate');

        this.$onInit = function () {
            _this.placeholder = _this.customPlaceholder ? _this.customPlaceholder : _this.$translate('findAStudent');
            _this.canViewStudentNames = _this.ConfigService.getPermissions().canViewStudentNames;
            _this.periodId = _this.TeacherDataService.getCurrentPeriod().periodId;
            _this.setWorkgroups();
        };

        /**
         * Listen for current workgroup changed event
         */
        this.$scope.$on('currentWorkgroupChanged', function (event, args) {
            var workgroup = args.currentWorkgroup;
            if (workgroup != null) {
                _this.setWorkgroups();
            }
        });

        /**
         * Listen for current period changed event
         */
        this.$scope.$on('currentPeriodChanged', function (event, args) {
            _this.periodId = args.currentPeriod.periodId;
            _this.setWorkgroups();
        });
    }

    _createClass(WorkgroupSelectController, [{
        key: 'setWorkgroups',


        /**
         * Setup the workgroups data model based on whether we're showing
         * individual students and whether current user can view student names
         */
        value: function setWorkgroups() {
            this.workgroups = angular.copy(this.ConfigService.getClassmateUserInfos());
            if (this.byStudent) {
                var students = [];
                var sortByStudentId = false;
                var n = this.workgroups.length;
                for (var i = 0; i < n; i++) {
                    var workgroup = this.workgroups[i];
                    if (this.periodId === -1 || this.periodId === workgroup.periodId) {
                        var ids = workgroup.userIds;
                        var names = workgroup.displayNames.split(',');
                        var l = ids.length;
                        for (var x = 0; x < l; x++) {
                            // get the id and name for the current student
                            var id = ids[x];
                            var current = angular.copy(workgroup);
                            current.userId = id;
                            if (this.canViewStudentNames) {
                                var name = names[x].trim();
                                // get the index of the first empty space
                                var indexOfSpace = name.indexOf(' ');

                                // get the student first name e.g. "Spongebob"
                                var firstName = name.substring(0, indexOfSpace);
                                var lastName = name.substring(indexOfSpace + 1);
                                current.displayNames = lastName + ', ' + firstName;
                            } else {
                                var _sortByStudentId = true;
                                current.displayNames = this.$translate('studentId', { id: id });
                            }
                            students.push(current);
                        }
                    }
                }
                this.workgroups = sortByStudentId ? this.orderBy(students, 'userId') : this.orderBy(students, 'displayNames');
            } else {
                var workgroups = [];
                var _n = this.workgroups.length;
                for (var _i = 0; _i < _n; _i++) {
                    var _workgroup = this.workgroups[_i];
                    if (this.periodId === -1 || this.periodId === _workgroup.periodId) {
                        if (this.canViewStudentNames) {
                            _workgroup.displayNames += ' (' + this.$translate('teamId', { id: _workgroup.workgroupId }) + ')';
                        }
                        workgroups.push(_workgroup);
                    }
                }
                this.workgroups = this.orderBy(workgroups, 'workgroupId');
            }
            this.selectedItem = this.getCurrentWorkgroup();
        }

        /**
         * Set the currently selected workgroup
         * @param workgroup the workgroup object
         */

    }, {
        key: 'setCurrentWorkgroup',
        value: function setCurrentWorkgroup(workgroup) {
            this.TeacherDataService.setCurrentWorkgroup(workgroup);
        }

        /**
         * Get the current workgroup
         * @return workgroup object
         */

    }, {
        key: 'getCurrentWorkgroup',
        value: function getCurrentWorkgroup() {
            var localGroup = null;
            var currentWorkgroup = this.TeacherDataService.getCurrentWorkgroup();
            if (currentWorkgroup) {
                var n = this.workgroups.length;
                for (var i = 0; i < n; i++) {
                    var workgroup = this.workgroups[i];
                    if (currentWorkgroup.workgroupId === workgroup.workgroupId) {
                        if (this.byStudent && currentWorkgroup.userId === workgroup.userId) {
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

    }, {
        key: 'querySearch',
        value: function querySearch(query) {
            var items = [];
            var n = this.workgroups.length;
            for (var i = 0; i < n; i++) {
                var workgroup = this.workgroups[i];
                var periodId = workgroup.periodId;
                if (this.periodId === -1 || periodId === this.periodId) {
                    var displayNames = workgroup.displayNames;
                    if (displayNames.search(new RegExp(query, 'i')) > -1 || !query) {
                        items.push(workgroup);
                    }
                }
            }
            return items;
        }
    }, {
        key: 'selectedItemChange',
        value: function selectedItemChange() {
            var currentWorkgroup = this.getCurrentWorkgroup();
            if (currentWorkgroup) {
                if (this.selectedItem) {
                    if (this.byStudent) {
                        if (currentWorkgroup.userId !== this.selectedItem.userId) {
                            this.setCurrentWorkgroup(this.selectedItem);
                        }
                    } else if (currentWorkgroup.workgroupId !== this.selectedItem.workgroupId) {
                        this.setCurrentWorkgroup(this.selectedItem);
                    }
                } else {
                    this.setCurrentWorkgroup(null);
                }
            } else {
                this.setCurrentWorkgroup(this.selectedItem);
            }
        }
    }, {
        key: 'clearSearchTerm',
        value: function clearSearchTerm() {
            this.searchTerm = '';
        }
    }]);

    return WorkgroupSelectController;
}();

WorkgroupSelectController.$inject = ['$filter', '$scope', 'orderByFilter', 'ConfigService', 'TeacherDataService'];

var WorkgroupSelect = {
    bindings: {
        byStudent: '<',
        customClass: '<',
        customPlaceholder: '<',
        useAutocomplete: '<'
    },
    template: '<md-autocomplete ng-if="$ctrl.useAutocomplete"\n                          class="autocomplete"\n                          ng-class="$ctrl.customClass"\n                          md-no-cache="true"\n                          md-selected-item="$ctrl.selectedItem"\n                          md-search-text="$ctrl.searchText"\n                          md-selected-item-change="$ctrl.selectedItemChange()"\n                          md-items="workgroup in $ctrl.querySearch($ctrl.searchText)"\n                          md-item-text="workgroup.displayNames"\n                          md-min-length="0"\n                          ng-init="$ctrl.searchText=$ctrl.selectedItem.displayNames"\n                          placeholder="{{ $ctrl.placeholder }}"\n                          title="{{ $ctrl.placeholder }}">\n            <md-item-template>\n                <span md-highlight-text="$ctrl.searchText"\n                      md-highlight-flags="ig">{{ workgroup.displayNames }}</span>\n            </md-item-template>\n            <md-not-found>\n                {{ \'noMatchesFound\' | translate }}\n            </md-not-found>\n        </md-autocomplete>\n        <md-select ng-if="!$ctrl.useAutocomplete"\n                   md-theme="default"\n                   ng-class="$ctrl.customClass"\n                   aria-label="{{ $ctrl.placeholder }}"\n                   ng-model="$ctrl.selectedItem"\n                   ng-change="$ctrl.selectedItemChange()"\n                   md-on-close="$ctrl.clearSearchTerm()"\n                   md-selected-text="$ctrl.selectedItem.displayNames">\n            <md-select-header class="select__header" layout="row" flex>\n                <input ng-model="$ctrl.searchTerm"\n                       type="search"\n                       placeholder="{{ \'findAStudent\' | translate }}"\n                       ng-keydown="$event.stopPropagation()">\n            </md-select-header>\n            <md-divider></md-divider>\n            <md-opt-group>\n                <md-option ng-repeat="workgroup in $ctrl.workgroups |\n                    filter:$ctrl.searchTerm"\n                    ng-value="workgroup">\n                    <!-- TODO: add avatar? -->\n                    <span class="node-select__text">{{ workgroup.displayNames }}</span>\n                </md-option>\n            </md-opt-group>\n        </md-select>',
    controller: WorkgroupSelectController
};

exports.default = WorkgroupSelect;
//# sourceMappingURL=workgroupSelect.js.map
