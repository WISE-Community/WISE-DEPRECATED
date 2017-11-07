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
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.workgroups[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var workgroup = _step.value;

                        if (this.periodId === -1 || this.periodId === workgroup.periodId) {
                            var ids = workgroup.userIds;
                            var names = workgroup.displayNames.split(',');
                            for (var x = 0; x < ids.length; x++) {
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
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                this.workgroups = sortByStudentId ? this.orderBy(students, 'userId') : this.orderBy(students, 'displayNames');
            } else {
                var workgroups = [];
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this.workgroups[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var _workgroup = _step2.value;

                        if (this.periodId === -1 || this.periodId === _workgroup.periodId) {
                            _workgroup.displayNames += ' (' + this.$translate('teamId', { id: _workgroup.workgroupId }) + ')';
                            workgroups.push(_workgroup);
                        }
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
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
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = this.workgroups[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var workgroup = _step3.value;

                        if (currentWorkgroup.workgroupId === workgroup.workgroupId) {
                            if (this.byStudent) {
                                if (currentWorkgroup.userId === workgroup.userId) {
                                    localGroup = workgroup;
                                    break;
                                }
                            } else {
                                localGroup = workgroup;
                                break;
                            }
                        }
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
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
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this.workgroups[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var workgroup = _step4.value;

                    var periodId = workgroup.periodId;
                    if (this.periodId === -1 || periodId === this.periodId) {
                        var displayNames = workgroup.displayNames;
                        if (displayNames.search(new RegExp(query, 'i')) > -1 || !query) {
                            items.push(workgroup);
                        }
                    }
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
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
