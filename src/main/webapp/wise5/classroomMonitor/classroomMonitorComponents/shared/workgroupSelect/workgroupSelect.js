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
            _this.canViewStudentNames = _this.ConfigService.getPermissions().canViewStudentNames;
            _this.workgroups = angular.copy(_this.ConfigService.getClassmateUserInfos());
            _this.periodId = _this.TeacherDataService.getCurrentPeriod().periodId;
            _this.selectedItem = _this.getCurrentWorkgroup();
            var n = _this.workgroups.length;
            for (var i = 0; i < n; i++) {
                var workgroup = _this.workgroups[i];
                if (_this.canViewStudentNames) {
                    workgroup.displayNames += ' (' + _this.$translate('teamId', { id: workgroup.workgroupId }) + ')';
                }
            }
        };

        /**
         * Listen for current period changed event
         */
        this.$scope.$on('currentPeriodChanged', function (event, args) {
            _this.periodId = args.currentPeriod.periodId;
            _this.selectedItem = _this.getCurrentWorkgroup();
        });
    }

    _createClass(WorkgroupSelectController, [{
        key: 'setCurrentWorkgroup',


        /**
         * Set the currently selected workgroup
         * @param workgroup the workgroup object
         */
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
            return this.TeacherDataService.getCurrentWorkgroup();
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
            var sortByStudentId = false;

            for (var i = 0; i < n; i++) {
                var workgroup = this.workgroups[i];
                var periodId = workgroup.periodId;
                if (this.periodId === -1 || periodId === this.periodId) {
                    var displayNames = workgroup.displayNames;
                    if (this.byTeam) {
                        if (displayNames.search(new RegExp(query, 'i')) > -1 || !query) {
                            items.push(workgroup);
                        }
                    } else {
                        if (this.canViewStudentNames) {
                            var names = displayNames.split(',');
                            var l = names.length;
                            for (var x = 0; x < l; x++) {
                                var name = names[x].trim();
                                // get the index of the first empty space
                                var indexOfSpace = name.indexOf(' ');
                                // get the student first name e.g. "Spongebob"
                                var firstName = name.substring(0, indexOfSpace);
                                var lastName = name.substring(indexOfSpace + 1);

                                var current = angular.copy(workgroup);
                                current.displayNames = lastName + ', ' + firstName;
                                if (current.displayNames.search(new RegExp(query, 'i')) > -1 || !query) {
                                    items.push(current);
                                }
                            }
                        } else {
                            sortByStudentId = true;
                            var ids = workgroup.userIds;
                            var _l = ids.length;
                            for (var _x = 0; _x < _l; _x++) {
                                var id = ids[_x];
                                var _name = this.$translate('studentId', { id: id });

                                var _current = angular.copy(workgroup);
                                _current.displayNames = _name;
                                _current.userId = id;
                                if (_current.displayNames.search(new RegExp(query, 'i')) > -1 || !query) {
                                    items.push(_current);
                                }
                            }
                        }
                    }
                }
            }

            var orderedItems = sortByStudentId ? this.orderBy(items, 'userId') : this.orderBy(items, 'workgroupId');

            return orderedItems;
        }
    }, {
        key: 'selectedItemChange',
        value: function selectedItemChange() {
            this.setCurrentWorkgroup(this.selectedItem);
        }
    }]);

    return WorkgroupSelectController;
}();

WorkgroupSelectController.$inject = ['$filter', '$scope', 'orderByFilter', 'ConfigService', 'TeacherDataService'];

var WorkgroupSelect = {
    bindings: {
        byTeam: '<'
    },
    template: '<md-autocomplete class="autocomplete"\n                          md-no-cache="true"\n                          md-selected-item="$ctrl.selectedItem"\n                          md-search-text="$ctrl.searchText"\n                          md-selected-item-change="$ctrl.selectedItemChange()"\n                          md-items="workgroup in $ctrl.querySearch($ctrl.searchText)"\n                          md-item-text="workgroup.displayNames"\n                          md-min-length="0"\n                          ng-init="$ctrl.searchText=$ctrl.selectedItem.displayNames"\n                          placeholder="{{\'findAStudent\' | translate}}"\n                          title="{{\'findAStudent\' | translate}}">\n            <md-item-template>\n                <span md-highlight-text="$ctrl.searchText"\n                      md-highlight-flags="ig">{{ workgroup.displayNames }}</span>\n            </md-item-template>\n            <md-not-found>\n                {{\'noMatchesFound\' | translate}}\n            </md-not-found>\n        </md-autocomplete>',
    controller: WorkgroupSelectController
};

exports.default = WorkgroupSelect;
//# sourceMappingURL=workgroupSelect.js.map
