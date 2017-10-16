"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StepItemController = function () {
  function StepItemController($filter) {
    var _this = this;

    _classCallCheck(this, StepItemController);

    this.$filter = $filter;
    this.$translate = this.$filter('translate');
    this.statusText = '';

    this.$onChanges = function (changesObj) {
      if (changesObj.maxScore) {
        _this.maxScore = typeof changesObj.maxScore.currentValue === 'number' ? changesObj.maxScore.currentValue : 0;
      }

      if (changesObj.stepData) {
        var stepData = angular.copy(changesObj.stepData.currentValue);
        _this.title = stepData.title;
        _this.hasAlert = stepData.hasAlert;
        _this.hasNewAlert = stepData.hasNewAlert;
        _this.status = stepData.completionStatus;
        _this.score = stepData.score >= 0 ? stepData.score : '-';
      }

      _this.update();
    };
  }

  _createClass(StepItemController, [{
    key: 'update',
    value: function update() {
      var completion = 0;

      switch (this.status) {
        case -1:
          this.statusClass = ' ';
          this.statusText = this.$translate('notAssigned');
          break;
        case 2:
          this.statusClass = 'success';

          if (this.showScore) {
            this.statusText = this.$translate('completed');
          } else {
            this.statusText = this.$translate('visited');
          }
          break;
        case 1:
          this.statusClass = 'text';

          this.statusText = this.$translate('partiallyCompleted');
          break;
        default:
          this.statusClass = 'text-secondary';

          if (this.showScore) {
            this.statusText = this.$translate('noWork');
          } else {
            this.statusText = this.$translate('notVisited');
          }
      }

      if (this.hasNewAlert) {
        this.statusClass = 'warn';
      }

      this.disabled = this.status === -1;
    }
  }, {
    key: 'toggleExpand',
    value: function toggleExpand() {
      if (this.showScore) {
        var expand = !this.expand;
        this.onUpdateExpand({ nodeId: this.nodeId, value: expand });
      }
    }
  }]);

  return StepItemController;
}();

StepItemController.$inject = ['$filter'];

var StepItem = {
  bindings: {
    expand: '<',
    maxScore: '<',
    nodeId: '<',
    showScore: '<',
    workgroupId: '<',
    stepData: '<',
    onUpdateExpand: '&'
  },
  controller: StepItemController,
  template: '<div class="md-whiteframe-1dp"\n          ng-class="{ \'list-item--warn\': $ctrl.statusClass === \'warn\',\n            \'list-item--info\': $ctrl.statusClass === \'info\' }">\n      <md-subheader class="list-item md-whiteframe-1dp">\n        <button class="md-button md-ink-ripple list-item__subheader-button"\n                aria-label="{{ toggleTeamWorkDisplay | translate }}"\n                ng-class="{ \'list-item--noclick\': !$ctrl.showScore ||\n                  $ctrl.disabled }"\n                ng-click="$ctrl.toggleExpand()"\n                ng-disabled="$ctrl.disabled"\n                layout-wrap>\n          <div layout="row" flex>\n            <div flex layout="row" layout-align="start center">\n              <step-info has-alert="$ctrl.hasAlert"\n                         has-new-alert="$ctrl.hasNewAlert"\n                         has-new-work="$ctrl.hasNewWork"\n                         node-id="$ctrl.nodeId"\n                         node-title="{{ $ctrl.title }}"\n                         show-position="true"></step-info>\n            </div>\n            <div flex="{{ $ctrl.showScore ? 30 : 20 }}" layout="row"\n                 layout-align="center center">\n              <workgroup-node-status status-text="{{ $ctrl.statusText }}"\n                                     status-class="{{ $ctrl.statusClass }}">\n              </workgroup-node-status>\n            </div>\n            <div ng-if="$ctrl.showScore" flex="20" layout="row"\n                 layout-align="center center">\n              <workgroup-node-score score="{{ $ctrl.score }}"\n                                    max-score="{{ $ctrl.maxScore }}">\n              </workgroup-node-score>\n            </div>\n          </div>\n        </button>\n      </md-subheader>\n      <md-list-item ng-if="$ctrl.expand && !$ctrl.disabled"\n                    class="grading__item-container">\n        <workgroup-node-grading workgroup-id="$ctrl.workgroupId"\n                                class="workgroup-node-grading"\n                                node-id="{{ $ctrl.nodeId }}"\n                                hidden-components="[]"\n                                flex></workgroup-node-grading>\n      </md-list-item>\n    </div>'
};

exports.default = StepItem;
//# sourceMappingURL=stepItem.js.map
