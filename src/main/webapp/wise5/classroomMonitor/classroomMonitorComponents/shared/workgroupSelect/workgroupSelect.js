"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WorkgroupSelectController = function () {
    function WorkgroupSelectController($scope, ConfigService, TeacherDataService) {
        var _this = this;

        _classCallCheck(this, WorkgroupSelectController);

        this.$scope = $scope;
        this.ConfigService = ConfigService;
        this.TeacherDataService = TeacherDataService;

        this.$onInit = function () {
            _this.workgroups = _this.ConfigService.getClassmateUserInfos();
            _this.periodId = _this.TeacherDataService.getCurrentPeriod().periodId;
            _this.selectedItem = _this.getCurrentWorkgroup();
        };

        /**
         * Listen for current period changed event
         */
        this.$scope.$on('currentPeriodChanged', function (event, args) {
            _this.periodId = args.currentPeriod.periodId;

            if (_this.selectedItem) {
                if (_this.periodId !== -1 && _this.periodId !== _this.selectedItem.periodId) {
                    _this.selectedItem = null;
                    _this.setCurrentWorkgroup(null);
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
         * Return workgroups with username(s) content that query text matches
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
            this.setCurrentWorkgroup(this.selectedItem);
        }
    }]);

    return WorkgroupSelectController;
}();

WorkgroupSelectController.$inject = ['$scope', 'ConfigService', 'TeacherDataService'];

var WorkgroupSelect = {
    bindings: {},
    template: '<md-autocomplete class="autocomplete"\n                          md-no-cache="true"\n                          md-selected-item="$ctrl.selectedItem"\n                          md-search-text="$ctrl.searchText"\n                          md-selected-item-change="$ctrl.selectedItemChange()"\n                          md-items="workgroup in $ctrl.querySearch($ctrl.searchText) | orderBy: \'displayNames\'"\n                          md-item-text="workgroup.displayNames"\n                          md-min-length="0"\n                          ng-init="$ctrl.searchText=$ctrl.selectedItem.displayNames"\n                          placeholder="{{\'findATeam\' | translate}}">\n            <md-item-template>\n                <span md-highlight-text="$ctrl.searchText" md-highlight-flags="ig">{{workgroup.displayNames}}</span>\n            </md-item-template>\n            <md-not-found>\n                {{\'noMatchesFound\' | translate}}\n            </md-not-found>\n        </md-autocomplete>',
    controller: WorkgroupSelectController
};

exports.default = WorkgroupSelect;
//# sourceMappingURL=workgroupSelect.js.map