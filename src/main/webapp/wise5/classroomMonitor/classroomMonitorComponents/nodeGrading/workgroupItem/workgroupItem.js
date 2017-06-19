"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WorkgroupItemController = function () {
    function WorkgroupItemController($filter, $scope, ProjectService) {
        var _this = this;

        _classCallCheck(this, WorkgroupItemController);

        this.$filter = $filter;
        this.$scope = $scope;
        this.ProjectService = ProjectService;

        this.$translate = this.$filter('translate');
        this.nodeHasWork = this.ProjectService.nodeHasWork(this.nodeId);
        this.statusText = '';

        this.$onChanges = function (changesObj) {
            if (changesObj.hiddenComponents) {
                _this.hiddenComponents = angular.copy(changesObj.hiddenComponents.currentValue);
            }

            if (changesObj.maxScore) {
                _this.maxScore = typeof changesObj.maxScore.currentValue === 'number' ? changesObj.maxScore.currentValue : 0;
            }

            if (changesObj.workgroupData) {
                var workgroupData = angular.copy(changesObj.workgroupData.currentValue);
                _this.hasAlert = workgroupData.hasAlert;
                _this.hasNewAlert = workgroupData.hasNewAlert;
                _this.status = workgroupData.completionStatus;
                _this.score = workgroupData.score >= 0 ? workgroupData.score : '-';
            }

            _this.update();
        };
    }

    _createClass(WorkgroupItemController, [{
        key: 'update',
        value: function update() {
            var completion = 0;

            switch (this.status) {
                case 2:
                    this.statusClass = 'success';

                    if (this.nodeHasWork) {
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

                    if (this.nodeHasWork) {
                        this.statusText = this.$translate('noWork');
                    } else {
                        this.statusText = this.$translate('notVisited');
                    }
            }

            if (this.hasNewAlert) {
                this.statusClass = 'warn';
            }
        }
    }, {
        key: 'toggleExpand',
        value: function toggleExpand() {
            if (this.showScore) {
                var expand = !this.expand;
                this.onUpdateExpand({ workgroupId: this.workgroupId, value: expand });
            }
        }
    }]);

    return WorkgroupItemController;
}();

WorkgroupItemController.$inject = ['$filter', '$scope', 'ProjectService'];

var WorkgroupItem = {
    bindings: {
        expand: '<',
        maxScore: '<',
        nodeId: '<',
        showScore: '<',
        workgroupId: '<',
        workgroupData: '<',
        hiddenComponents: '<',
        onUpdateExpand: '&'
    },
    controller: WorkgroupItemController,
    template: '<div class="md-whiteframe-1dp">\n            <md-subheader class="list-item md-whiteframe-1dp">\n                <button class="md-button md-ink-ripple list-item__subheader-button"\n                               aria-label="{{ toggleTeamWorkDisplay | translate }}"\n                               ng-class="{\'list-item--warn\': $ctrl.statusClass === \'warn\', \'list-item--info\': $ctrl.statusClass === \'info\', \'list-item--expanded\': $ctrl.showWork, \'list-item--noclick\': !$ctrl.showScore}"\n                               ng-click="$ctrl.toggleExpand()"\n                               layout-wrap>\n                    <div layout="row" flex>\n                        <div flex layout="row" layout-align="start center">\n                            <workgroup-info has-alert="$ctrl.hasAlert" has-new-alert="$ctrl.hasNewAlert" has-new-work="$ctrl.hasNewWork" usernames="{{$ctrl.workgroupData.displayNames}}" workgroup-id="$ctrl.workgroupId"></workgroup-info>\n                        </div>\n                        <div flex="{{$ctrl.showScore ? 30 : 20}}" layout="row" layout-align="center center">\n                            <workgroup-node-status status-text="{{$ctrl.statusText}}" status-class="{{$ctrl.statusClass}}"></workgroup-node-status>\n                        </div>\n                        <div ng-if="$ctrl.showScore" flex="20" layout="row" layout-align="center center">\n                            <workgroup-node-score score="{{$ctrl.score}}" max-score="{{$ctrl.maxScore}}"></workgroup-node-score>\n                        </div>\n                    </div>\n                </button>\n            </md-subheader>\n            <md-list-item ng-if="$ctrl.expand" class="node-grading-item">\n                <workgroup-node-grading workgroup-id="$ctrl.workgroupId"\n                                        node-id="{{$ctrl.nodeId}}"\n                                        hidden-components="$ctrl.hiddenComponents"\n                                        flex></workgroup-node-grading>\n            </md-list-item>\n        </div>'
};

exports.default = WorkgroupItem;
//# sourceMappingURL=workgroupItem.js.map