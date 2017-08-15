"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeInfoController = function () {
    function NodeInfoController(ProjectService) {
        var _this = this;

        _classCallCheck(this, NodeInfoController);

        this.ProjectService = ProjectService;

        this.$onInit = function () {
            _this.nodeContent = _this.getNodeContent();
            _this.components = _this.getComponents();

            _this.color = _this.ProjectService.getNodeIconByNodeId(_this.nodeId).color;
        };
    }

    _createClass(NodeInfoController, [{
        key: 'getNodeContent',


        /**
         * Get the content for this node
         * @return object with the node content
         */
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
         * Get the components for this node with student work.
         * @return array that contains the content for the components
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

                    component.hasWork = this.ProjectService.componentHasWork(component);
                }
            }

            return components;
        }

        /**
         * Get a rubric with the wise asset paths replaced
         * @param rubric string
         * @return string containing rubric html content
         */

    }, {
        key: 'getRubricWithAssetPaths',
        value: function getRubricWithAssetPaths(rubric) {
            return this.ProjectService.replaceAssetPaths(rubric);
        }
    }]);

    return NodeInfoController;
}();

NodeInfoController.$inject = ['ProjectService'];

var NodeInfo = {
    bindings: {
        nodeId: '@'
    },
    controller: NodeInfoController,
    template: '<md-card ng-if="$ctrl.nodeContent.rubric" class="annotations annotations--info">\n            <md-card-title class="annotations__header">\n                <div class="annotations__avatar md-avatar avatar--icon md-36 avatar md-whiteframe-1dp">\n                    <md-icon class="annotations__icon md-36">info</md-icon>\n                </div>\n                <div class="annotations__title" layout="row" flex>\n                    <span>{{ \'STEP_INFO\' | translate }}</span>\n                </div>\n            </md-card-title>\n            <md-card-content class="annotations__body md-body-1">\n                <div ng-bind-html="$ctrl.getRubricWithAssetPaths($ctrl.nodeContent.rubric)"></div>\n            </md-card-content>\n        </md-card>\n        <md-card class="node-info node-content" style="border-color: {{ $ctrl.color }};">\n            <md-card-content>\n                <div id="component_{{component.id}}" ng-repeat=\'component in $ctrl.components\' class="component">\n                    <md-divider class="divider divider--dashed" ng-if="!$first"></md-divider>\n                    <component ng-if=\'component.showPreviousWorkNodeId != null && component.showPreviousWorkComponentId != null && component.showPreviousWorkNodeId != "" && component.showPreviousWorkComponentId != ""\'\n                               node-id=\'{{component.showPreviousWorkNodeId}}\'\n                               component-id=\'{{component.showPreviousWorkComponentId}}\'\n                               original-node-id={{$ctrl.nodeId}}\n                               original-component-id={{component.id}}\n                               mode=\'student\'></component>\n                    <component ng-if=\'component.showPreviousWorkNodeId == null || component.showPreviousWorkComponentId == null || component.showPreviousWorkNodeId == "" || component.showPreviousWorkComponentId == ""\'\n                               node-id=\'{{$ctrl.nodeId}}\'\n                               component-id=\'{{component.id}}\'\n                               mode=\'student\'></component>\n                    <md-card class="annotations annotations--info" ng-if="component.rubric">\n                       <md-card-title class="annotations__header">\n                           <div class="annotations__avatar md-avatar avatar--icon md-36 avatar md-whiteframe-1dp">\n                               <md-icon class="annotations__icon md-36">info</md-icon>\n                           </div>\n                           <div class="annotations__title" layout="row" flex>\n                               <span>{{ \'ITEM_INFO\' | translate }}</span>\n                           </div>\n                       </md-card-title>\n                       <md-card-content class="annotations__body md-body-1">\n                           <div ng-bind-html="$ctrl.getRubricWithAssetPaths(component.rubric)"></div>\n                       </md-card-content>\n                    </md-card>\n                </div>\n            </md-card-content>\n        </md-card>'
};

exports.default = NodeInfo;
//# sourceMappingURL=nodeInfo.js.map