"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PeriodSelectController = function () {
    function PeriodSelectController($scope, TeacherDataService) {
        var _this = this;

        _classCallCheck(this, PeriodSelectController);

        this.$scope = $scope;
        this.TeacherDataService = TeacherDataService;

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
    }]);

    return PeriodSelectController;
}();

PeriodSelectController.$inject = ['$scope', 'TeacherDataService'];

var PeriodSelect = {
    template: '<md-select ng-model="$ctrl.currentPeriod"\n                    ng-model-options="{trackBy: \'$value.periodId\'}"\n                    class="md-no-underline md-button md-raised"\n                    ng-change="$ctrl.currentPeriodChanged()"\n                    placeholder="{{\'selectPeriod\' | translate}}">\n            <md-option ng-repeat="period in $ctrl.periods" ng-value="period">\n                <span ng-if="period.periodId === -1" translate="allPeriods"></span>\n                <span ng-if="period.periodId != -1" translate="periodLabel" translate-value-name="{{period.periodName}}"></span>\n            </md-option>\n        </md-select>',
    controller: PeriodSelectController
};

exports.default = PeriodSelect;
//# sourceMappingURL=periodSelect.js.map