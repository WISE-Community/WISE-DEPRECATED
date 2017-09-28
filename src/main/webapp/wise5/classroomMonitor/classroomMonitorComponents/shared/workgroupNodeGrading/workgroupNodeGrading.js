"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WorkgroupNodeGradingController = function () {
    function WorkgroupNodeGradingController(ConfigService, ProjectService, TeacherDataService, UtilService) {
        var _this = this;

        _classCallCheck(this, WorkgroupNodeGradingController);

        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.TeacherDataService = TeacherDataService;
        this.UtilService = UtilService;

        this.$onInit = function () {
            _this.nodeContent = _this.getNodeContent();
            _this.components = _this.getComponents();
            _this.teacherWorkgroupId = _this.ConfigService.getWorkgroupId();
        };

        this.$onChanges = function (changesObj) {
            if (changesObj.hiddenComponents) {
                _this.hiddenComponents = changesObj.hiddenComponents.currentValue;
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
         * Get the components for this node
         * @return an array that contains the content for the components
         */

    }, {
        key: 'getComponents',
        value: function getComponents() {
            var components = null;

            if (this.nodeContent) {
                components = this.nodeContent.components;

                for (var c = 0; c < components.length; c++) {
                    var component = components[c];

                    if (this.isDisabled) {
                        component.isDisabled = true;
                    }

                    if (this.nodeContent.lockAfterSubmit) {
                        component.lockAfterSubmit = true;
                    }

                    // set whether component captures student work (for filtering purposes)
                    component.hasWork = this.ProjectService.componentHasWork(component);
                }
            }

            return components;
        }

        /**
         * Get the student data for a specific component
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
    }, {
        key: 'isComponentVisible',
        value: function isComponentVisible(componentId) {
            var result = true;

            var index = this.hiddenComponents.indexOf(componentId);
            if (index > -1) {
                result = false;
            }

            return result;
        }

        /**
         * Get the component type label for the given component type
         * @param componentType string
         * @return string of the component type label
         */

    }, {
        key: 'getComponentTypeLabel',
        value: function getComponentTypeLabel(componentType) {
            return this.UtilService.getComponentTypeLabel(componentType);
        }
    }]);

    return WorkgroupNodeGradingController;
}();

WorkgroupNodeGradingController.$inject = ['ConfigService', 'ProjectService', 'TeacherDataService', 'UtilService'];

var WorkgroupNodeGrading = {
    bindings: {
        workgroupId: '<',
        nodeId: '@',
        hiddenComponents: '<'
    },
    template: '<div class="grading__item">\n            <div id="component_{{component.id}}_{{$ctrl.workgroupId}}" class="component component--grading" ng-repeat=\'component in $ctrl.components | filter:{hasWork: true}\'>\n                <div ng-show="$ctrl.isComponentVisible(component.id)">\n                    <h3 class="accent-2 md-body-2 gray-lightest-bg component__header">\n                        {{ $index+1 + \'. \' + $ctrl.getComponentTypeLabel(component.type) }}&nbsp;\n                        <component-new-work-badge component-id="component.id"\n                                                  workgroup-id="$ctrl.workgroupId"\n                                                  node-id="$ctrl.nodeId"></component-new-work-badge>\n                    </h3>\n                    <component ng-if=\'component.showPreviousWorkNodeId != null && component.showPreviousWorkComponentId != null && component.showPreviousWorkNodeId != "" && component.showPreviousWorkComponentId != ""\'\n                               class="component-container"\n                               node-id=\'{{component.showPreviousWorkNodeId}}\'\n                               component-id=\'{{component.showPreviousWorkComponentId}}\'\n                               component-state=\'{{$ctrl.getLatestComponentStateByWorkgroupIdAndNodeIdAndComponentId($ctrl.workgroupId, component.showPreviousWorkNodeId, component.showPreviousWorkComponentId)}}\'\n                               workgroup-id=\'{{$ctrl.workgroupId}}\'\n                               teacher-workgroup-id=\'{{$ctrl.teacherWorkgroupId}}\'\n                               mode=\'grading\'></component>\n                    <component ng-if=\'component.showPreviousWorkNodeId == null || component.showPreviousWorkComponentId == null || component.showPreviousWorkNodeId == "" || component.showPreviousWorkComponentId == ""\'\n                               class="component-container"\n                               node-id=\'{{$ctrl.nodeId}}\'\n                               component-id=\'{{component.id}}\'\n                               component-state=\'{{$ctrl.getLatestComponentStateByWorkgroupIdAndComponentId($ctrl.workgroupId, component.id)}}\'\n                               workgroup-id=\'{{$ctrl.workgroupId}}\'\n                               teacher-workgroup-id=\'{{$ctrl.teacherWorkgroupId}}\'\n                               mode=\'grading\'></component>\n                </div>\n            </div>\n        </div>',
    controller: WorkgroupNodeGradingController
};

exports.default = WorkgroupNodeGrading;
//# sourceMappingURL=workgroupNodeGrading.js.map