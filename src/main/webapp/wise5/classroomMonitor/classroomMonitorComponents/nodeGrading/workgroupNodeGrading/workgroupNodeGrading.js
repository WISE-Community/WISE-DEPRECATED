"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WorkgroupNodeGradingController = function () {
    function WorkgroupNodeGradingController(ConfigService, ProjectService, TeacherDataService) {
        var _this = this;

        _classCallCheck(this, WorkgroupNodeGradingController);

        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.TeacherDataService = TeacherDataService;

        this.$onInit = function () {
            _this.nodeContent = _this.getNodeContent();
            _this.components = _this.getComponents();
            _this.teacherWorkgroupId = _this.ConfigService.getWorkgroupId();
            _this.latestWork = _this.latestWorkTime;
        };

        this.$onChanges = function (changesObj) {
            if (changesObj.latestWorkTime) {
                _this.latestWork = _this.convertToClientTimestamp(changesObj.latestWorkTime.currentValue);
            }
        };
    }

    _createClass(WorkgroupNodeGradingController, [{
        key: 'getNodeContent',
        value: function getNodeContent() {
            var result = null;

            var node = this.ProjectService.getNodeById(this.nodeId);
            if (node != null) {
                // field that will hold the node content
                result = node;
            }

            return result;
        }

        /**
         * Get the components for this node.
         * @return an array that contains the content for the components
         */

    }, {
        key: 'getComponents',
        value: function getComponents() {
            var components = null;

            if (this.nodeContent) {
                components = this.nodeContent.components;
            }

            if (components && this.isDisabled) {
                for (var c = 0; c < components.length; c++) {
                    var component = components[c];

                    component.isDisabled = true;
                }
            }

            if (components && this.nodeContent.lockAfterSubmit) {
                for (c = 0; c < components.length; c++) {
                    component = components[c];

                    component.lockAfterSubmit = true;
                }
            }

            return components;
        }

        /**
         * Get the student data for a specific part
         * @param the componentId
         * @param the workgroupId id of Workgroup who created the component state
         * @return the student data for the given component
         */

    }, {
        key: 'getLatestComponentStateByWorkgroupIdAndComponentId',
        value: function getLatestComponentStateByWorkgroupIdAndComponentId(workgroupId, componentId) {
            var componentState = null;

            if (workgroupId != null && componentId != null) {
                // get the latest component state for the component
                componentState = this.TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(workgroupId, this.nodeId, componentId);
            }

            return componentState;
        }

        /**
         * Get the student data for a specific part
         * @param the componentId
         * @param the workgroupId id of Workgroup who created the component state
         * @return the student data for the given component
         */

    }, {
        key: 'getLatestComponentStateByWorkgroupIdAndNodeIdAndComponentId',
        value: function getLatestComponentStateByWorkgroupIdAndNodeIdAndComponentId(workgroupId, nodeId, componentId) {
            var componentState = null;

            if (workgroupId != null && nodeId != null && componentId != null) {

                // get the latest component state for the component
                componentState = this.TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(workgroupId, nodeId, componentId);
            }

            return componentState;
        }
    }, {
        key: 'convertToClientTimestamp',
        value: function convertToClientTimestamp(time) {
            return this.ConfigService.convertToClientTimestamp(time);
        }
    }]);

    return WorkgroupNodeGradingController;
}();

WorkgroupNodeGradingController.$inject = ['ConfigService', 'ProjectService', 'TeacherDataService'];

var WorkgroupNodeGrading = {
    bindings: {
        workgroupId: '<',
        nodeId: '@',
        latestWorkTime: '<'
    },
    template: '<div class="nav-item__grading md-whiteframe-1dp">\n            <!--<div class="nav-item__grading__info md-body-1 accent-2">\n                <span ng-if="$ctrl.latestWork">\n                    <span translate="latestWork"></span>&nbsp;<span class="nav-item__grading__timestamp" am-time-ago="$ctrl.latestWork"></span>\n                    <md-tooltip md-direction="right">{{ $ctrl.latestWork | amDateFormat:\'ddd, MMM D YYYY, h:mm a\' }}</md-tooltip>\n                </span>\n                <span ng-if="!$ctrl.latestWork" translate="teamNoWorkSubmitted"></span>\n            </div>-->\n            <div id="{{component.id}}_{{$ctrl.workgroupId}}" class="component--grading" ng-repeat=\'component in $ctrl.components\'>\n                <component ng-if=\'component.showPreviousWorkNodeId != null && component.showPreviousWorkComponentId != null && component.showPreviousWorkNodeId != "" && component.showPreviousWorkComponentId != ""\'\n                           node-id=\'{{component.showPreviousWorkNodeId}}\'\n                           component-id=\'{{component.showPreviousWorkComponentId}}\'\n                           component-state=\'{{$ctrl.getLatestComponentStateByWorkgroupIdAndNodeIdAndComponentId($ctrl.workgroupId, component.showPreviousWorkNodeId, component.showPreviousWorkComponentId)}}\'\n                           workgroup-id=\'{{$ctrl.workgroupId}}\'\n                           teacher-workgroup-id=\'{{$ctrl.teacherWorkgroupId}}\'\n                           mode=\'grading\'></component>\n                <component ng-if=\'component.showPreviousWorkNodeId == null || component.showPreviousWorkComponentId == null || component.showPreviousWorkNodeId == "" || component.showPreviousWorkComponentId == ""\'\n                           node-id=\'{{$ctrl.nodeId}}\'\n                           component-id=\'{{component.id}}\'\n                           component-state=\'{{$ctrl.getLatestComponentStateByWorkgroupIdAndComponentId($ctrl.workgroupId, component.id)}}\'\n                           workgroup-id=\'{{$ctrl.workgroupId}}\'\n                           teacher-workgroup-id=\'{{$ctrl.teacherWorkgroupId}}\'\n                           mode=\'grading\'></component>\n\n            </div>\n        </div>',
    controller: WorkgroupNodeGradingController
};

exports.default = WorkgroupNodeGrading;
//# sourceMappingURL=workgroupNodeGrading.js.map