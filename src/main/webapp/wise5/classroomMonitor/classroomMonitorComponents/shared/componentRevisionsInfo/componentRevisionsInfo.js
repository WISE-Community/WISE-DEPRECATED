'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ComponentRevisionsInfoController = function () {
    function ComponentRevisionsInfoController($filter, $mdDialog, $scope, ConfigService, TeacherDataService) {
        var _this = this;

        _classCallCheck(this, ComponentRevisionsInfoController);

        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.$scope = $scope;
        this.ConfigService = ConfigService;
        this.TeacherDataService = TeacherDataService;

        this.$translate = this.$filter('translate');

        this.$onInit = function () {
            _this.runId = _this.ConfigService.getRunId();

            var toUserInfo = _this.ConfigService.getUserInfoByWorkgroupId(_this.toWorkgroupId);
            if (toUserInfo) {
                // set the period id
                _this.periodId = toUserInfo.periodId;
            }

            // get the workgroup user names
            var userNamesArray = _this.ConfigService.getUserNamesByWorkgroupId(_this.toWorkgroupId);
            _this.userNames = userNamesArray.map(function (obj) {
                return obj.name;
            }).join(', ');
        };

        this.$onChanges = function (changes) {
            var latest = null;

            if (_this.active) {
                // get all the componentStates for this workgroup
                _this.componentStates = _this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(_this.toWorkgroupId, _this.componentId);
                var total = _this.componentStates.length;

                if (total > 0) {
                    latest = _this.componentStates[total - 1];
                }
            } else if (_this.componentState) {
                // we're only showing info for a single component state
                latest = _this.componentState;
                _this.componentStates = [];
                _this.componentStates.push(latest);
            }

            if (latest) {
                // calculate the save time of the latest component state
                var serverSaveTime = latest.serverSaveTime;
                _this.latestComponentStateTime = _this.ConfigService.convertToClientTimestamp(serverSaveTime);

                // check if the latest component state is a submit
                _this.latestComponentStateIsSubmit = latest.isSubmit;
            }
        };
    }

    _createClass(ComponentRevisionsInfoController, [{
        key: 'showRevisions',
        value: function showRevisions($event) {
            var workgroupId = this.toWorkgroupId;
            var componentId = this.componentId;
            var userNames = this.userNames;
            var componentStates = this.componentStates;

            this.$mdDialog.show({
                parent: angular.element(document.body),
                targetEvent: $event,
                fullscreen: true,
                template: '<md-dialog aria-label="{{ \'revisionsForTeam\' | translate:{teamNames: userNames} }}" class="dialog--wider">\n                    <md-toolbar>\n                        <div class="md-toolbar-tools">\n                            <h2 class="overflow--ellipsis">{{ \'revisionsForTeam\' | translate:{teamNames: userNames} }}</h2>\n                        </div>\n                    </md-toolbar>\n                    <md-dialog-content>\n                        <div class="md-dialog-content gray-lighter-bg">\n                            <workgroup-component-revisions component-states="componentStates"\n                                                           workgroup-id="{{ workgroupId }}"></workgroup-component-revisions>\n                        </div>\n                    </md-dialog-content>\n                    <md-dialog-actions layout="row" layout-align="end center">\n                        <md-button class="md-primary" ng-click="close()" aria-label="{{ \'close\' | translate }}">{{ \'close\' | translate }}</md-button>\n                    </md-dialog-actions>\n                </md-dialog>',
                locals: {
                    workgroupId: workgroupId,
                    componentId: componentId,
                    userNames: userNames,
                    componentStates: componentStates
                },
                controller: RevisionsController
            });
            function RevisionsController($scope, $mdDialog, workgroupId, componentId, userNames, componentStates) {
                $scope.workgroupId = workgroupId;
                $scope.componentId = componentId;
                $scope.userNames = userNames;
                $scope.componentStates = componentStates;
                $scope.close = function () {
                    $mdDialog.hide();
                };
            }
            RevisionsController.$inject = ["$scope", "$mdDialog", "workgroupId", "componentId", "userNames", "componentStates"];
        }
    }]);

    return ComponentRevisionsInfoController;
}();

ComponentRevisionsInfoController.$inject = ['$filter', '$mdDialog', '$scope', 'ConfigService', 'TeacherDataService'];

var ComponentRevisionsInfo = {
    bindings: {
        active: '<',
        componentId: '<',
        componentState: '<',
        toWorkgroupId: '<'
    },
    template: '<div class="component__actions__info component--grading__actions__info md-caption">\n            <span ng-if="$ctrl.componentStates.length > 0">\n                <span ng-if="$ctrl.latestComponentStateIsSubmit">{{ \'SUBMITTED\' | translate }} </span>\n                <span ng-if="!$ctrl.latestComponentStateIsSubmit">{{ \'SAVED\' | translate }} </span>\n                <span ng-if="$ctrl.active">\n                    <span class="component__actions__more" am-time-ago="$ctrl.latestComponentStateTime"></span>\n                    <md-tooltip md-direction="top">{{ $ctrl.latestComponentStateTime | amDateFormat:\'ddd MMM D YYYY, h:mm a\' }}</md-tooltip>\n                </span>\n                <span ng-if="!$ctrl.active">{{ $ctrl.latestComponentStateTime | amDateFormat:\'ddd MMM D YYYY, h:mm a\' }}</span>\n            </span>\n            <span ng-if="$ctrl.componentStates.length === 0">{{ \'TEAM_HAS_NOT_SAVED_ANY_WORK\' | translate }}</span>\n            <span ng-if="$ctrl.active && $ctrl.componentStates.length > 0">\n                &#8226;&nbsp;<a ng-click="$ctrl.showRevisions($event)" translate="SEE_REVISIONS" translate-value-number="{{($ctrl.componentStates.length - 1)}}"></a>\n           </span>\n    </div>',
    controller: ComponentRevisionsInfoController
};

exports.default = ComponentRevisionsInfo;
//# sourceMappingURL=componentRevisionsInfo.js.map
