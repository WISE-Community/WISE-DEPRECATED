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
                _this.hasMaxScore = typeof changesObj.maxScore.currentValue === 'number';
            }

            if (changesObj.workgroupData) {
                var workgroupData = angular.copy(changesObj.workgroupData.currentValue);
                _this.hasAlert = workgroupData.hasAlert;
                _this.hasNewAlert = workgroupData.hasNewAlert;
                _this.status = workgroupData.completionStatus;
                _this.score = workgroupData.score > -1 ? workgroupData.score : '-';
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
        key: 'updateHiddenComponents',
        value: function updateHiddenComponents(value, event) {
            this.onUpdateHidden({ value: value, event: event });
        }
    }, {
        key: 'toggleExpand',
        value: function toggleExpand() {
            var expand = !this.expand;
            this.onUpdateExpand({ workgroupId: this.workgroupId, value: expand });
        }
    }]);

    return WorkgroupItemController;
}();

WorkgroupItemController.$inject = ['$filter', '$scope', 'ProjectService'];

var WorkgroupItem = {
    bindings: {
        canViewStudentNames: '<',
        expand: '<',
        maxScore: '<',
        nodeId: '<',
        workgroupId: '<',
        workgroupData: '<',
        hiddenComponents: '<',
        onUpdateHidden: '&',
        onUpdateExpand: '&'
    },
    controller: WorkgroupItemController,
    template: '<md-list-item class="list-item list-item-condensed md-whiteframe-z1"\n                       ng-class="{\'list-item--warn\': $ctrl.statusClass === \'warn\', \'list-item--info\': $ctrl.statusClass === \'info\', \'list-item--expanded\': $ctrl.showWork}"\n                       ng-click="$ctrl.toggleExpand()"\n                       layout-wrap>\n            <div class="md-list-item-text" layout="row" flex>\n                <div flex layout="row" layout-align="start center">\n                    <workgroup-info has-alert="$ctrl.hasAlert" has-new-alert="$ctrl.hasNewAlert" usernames="{{$ctrl.workgroupData.usernames}}" workgroup-id="$ctrl.workgroupId"></workgroup-info>\n                </div>\n                <div flex="30" layout="row" layout-align="center center">\n                    <workgroup-node-status status-text="{{$ctrl.statusText}}" status-class="{{$ctrl.statusClass}}"></workgroup-node-status>\n                </div>\n                <div ng-if="$ctrl.hasMaxScore" flex="20" layout="row" layout-align="center center">\n                    <workgroup-node-score score="{{$ctrl.score}}" max-score="{{$ctrl.maxScore}}"></workgroup-node-score>\n                </div>\n            </div>\n        </md-list-item>\n        <workgroup-node-grading workgroup-id="$ctrl.workgroupId"\n                                node-id="{{$ctrl.nodeId}}"\n                                ng-if="$ctrl.expand"\n                                hidden-components="$ctrl.hiddenComponents"\n                                on-update="$ctrl.updateHiddenComponents(value, event)"></workgroup-node-grading>'
};

exports.default = WorkgroupItem;
//# sourceMappingURL=workgroupItem.js.map