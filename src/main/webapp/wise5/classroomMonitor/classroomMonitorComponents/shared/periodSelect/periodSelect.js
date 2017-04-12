"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PeriodSelectController = function () {
    function PeriodSelectController($scope, ProjectService, StudentStatusService, TeacherDataService) {
        var _this = this;

        _classCallCheck(this, PeriodSelectController);

        this.$scope = $scope;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;

        var startNodeId = this.ProjectService.getStartNodeId();
        this.rootNodeId = this.ProjectService.getRootNode(startNodeId).id;

        this.currentPeriod = null;
        this.periods = [];
        this.initializePeriods();

        /**
         * Listen for current period changed event
         */
        this.$scope.$on('currentPeriodChanged', function (event, args) {
            _this.currentPeriod = args.currentPeriod;
        });
    }

    _createClass(PeriodSelectController, [{
        key: 'initializePeriods',


        /**
         * Initialize the periods
         */
        value: function initializePeriods() {
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
            var n = this.periods.length;
            for (var i = 0; i < n; i++) {
                var period = this.periods[i];
                var id = i === 0 ? -1 : period.periodId;
                var numWorkgroupsInPeriod = this.getNumberOfWorkgroupsInPeriod(id);

                period.numWorkgroupsInPeriod = numWorkgroupsInPeriod;
            }
        }

        /**
         * The current period was changed
         */

    }, {
        key: 'currentPeriodChanged',
        value: function currentPeriodChanged() {
            this.setCurrentPeriod(this.currentPeriod);
        }

        /**
         * Set the current period
         * @param period the period object
         */

    }, {
        key: 'setCurrentPeriod',
        value: function setCurrentPeriod(period) {
            this.TeacherDataService.setCurrentPeriod(period);
        }

        /**
         * Get the current period
         */

    }, {
        key: 'getCurrentPeriod',
        value: function getCurrentPeriod() {
            return this.TeacherDataService.getCurrentPeriod();
        }

        /**
         * Get the number of workgroups in period with the given periodId
         * @param periodId the period id
         * @returns the number of workgroups that are in the period
         */

    }, {
        key: 'getNumberOfWorkgroupsInPeriod',
        value: function getNumberOfWorkgroupsInPeriod(periodId) {
            // get and return the number of workgroups that are in the period
            return this.StudentStatusService.getWorkgroupIdsOnNode(this.rootNodeId, periodId).length;
        }
    }]);

    return PeriodSelectController;
}();

PeriodSelectController.$inject = ['$scope', 'ProjectService', 'StudentStatusService', 'TeacherDataService'];

var PeriodSelect = {
    template: '<md-select ng-model="$ctrl.currentPeriod"\n                    ng-model-options="{trackBy: \'$value.periodId\'}"\n                    class="md-no-underline md-button md-raised"\n                    ng-change="$ctrl.currentPeriodChanged()"\n                    aria-label="{{\'selectPeriod\' | translate}}">\n            <md-option ng-repeat="period in $ctrl.periods" ng-value="period">\n                <span ng-if="period.periodId === -1" translate="allPeriods"></span>\n                <span ng-if="period.periodId != -1" translate="periodLabel" translate-value-name="{{ period.periodName }}"></span>\n                <span class="text-secondary">\n                    (<ng-pluralize count="period.numWorkgroupsInPeriod"\n                        when="{\'0\': \'{{&quot;numberOfTeams_0&quot; | translate}}\',\n                            \'one\': \'{{&quot;numberOfTeams_1&quot; | translate}}\',\n                            \'other\': \'{{&quot;numberOfTeams_other&quot; | translate:{count: period.numWorkgroupsInPeriod} }}\'}">\n                    </ng-pluralize>)\n                </span>\n            </md-option>\n        </md-select>',
    controller: PeriodSelectController
};

exports.default = PeriodSelect;
//# sourceMappingURL=periodSelect.js.map