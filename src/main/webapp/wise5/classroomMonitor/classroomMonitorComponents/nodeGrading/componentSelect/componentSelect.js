"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ComponentSelectController = function () {
    function ComponentSelectController($filter, ProjectService, UtilService) {
        var _this = this;

        _classCallCheck(this, ComponentSelectController);

        this.$filter = $filter;
        this.ProjectService = ProjectService;
        this.UtilService = UtilService;

        this.$translate = this.$filter('translate');

        this.$onInit = function () {
            _this.selectedComponents = [];
            _this.components = _this.getComponents();
        };
    }

    _createClass(ComponentSelectController, [{
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
            var nodeContent = this.getNodeContent();

            if (nodeContent) {
                components = nodeContent.components;

                if (components) {
                    for (var c = 0; c < components.length; c++) {
                        var component = components[c];

                        // set whether component captures student work (for filtering purposes)
                        component.hasWork = this.ProjectService.componentHasWork(component);

                        if (component.hasWork) {
                            // component has work, so add it to the initial selectedComponents array
                            this.selectedComponents.push(component.id);
                        }
                    }
                }
            }

            return components;
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

        /**
         * Get the text to display for the select dropdown
         * @return string selected text
         */

    }, {
        key: 'getSelectedText',
        value: function getSelectedText() {
            var nComponents = this.$filter('filter')(this.components, { hasWork: true }).length;
            return this.$translate('selectedComponentsLabel', { selected: this.selectedComponents.length, total: nComponents });
        }

        /**
         * Selected components have changed, so run the onChange function
         */

    }, {
        key: 'selectedComponentsChange',
        value: function selectedComponentsChange() {
            var hiddenComponents = [];

            for (var i = 0; i < this.components.length; i++) {
                var component = this.components[i];
                var id = component.id;

                if (this.selectedComponents.indexOf(id) < 0) {
                    // component isn't selected for view, so add to hiddenComponents
                    hiddenComponents.push(id);
                }
            }

            this.onChange({ value: hiddenComponents });
        }
    }]);

    return ComponentSelectController;
}();

ComponentSelectController.$inject = ['$filter', 'ProjectService', 'UtilService'];

var ComponentSelect = {
    bindings: {
        nodeId: '@',
        onChange: '&'
    },
    template: '<md-select class="md-no-underline md-button md-raised"\n                    ng-if="($ctrl.components | filter:{hasWork: true}).length > 1"\n                    ng-model="$ctrl.selectedComponents"\n                    ng-change="$ctrl.selectedComponentsChange()"\n                    md-selected-html="$ctrl.getSelectedText()"\n                    placeholder="{{ \'assessmentItemsToShow\' | translate }"\n                    multiple>\n            <md-optgroup label="{{ \'assessmentItemsToShow\' | translate }}">\n                <md-option ng-value="component.id" ng-repeat="component in $ctrl.components | filter:{hasWork: true}">\n                    {{ $index+1 }}: {{ $ctrl.getComponentTypeLabel(component.type) }}\n                </md-option>\n            </md-optgroup>\n        </md-select>\n        <md-button class="md-body-1 md-raised" aria-label="{{ \'assessmentItemsToShow\' | translate }" disabled\n                   ng-if="($ctrl.components | filter:{hasWork: true}).length === 0">\n            {{ \'numberOfAssessmentItems_0\' | translate }}\n        </md-button>\n        <md-button class="md-body-1 md-raised" aria-label="{{ \'assessmentItemsToShow\' | translate }" disabled\n                   ng-if="($ctrl.components | filter:{hasWork: true}).length === 1">\n            {{ \'numberOfAssessmentItems_1\' | translate }}\n        </md-button>',
    controller: ComponentSelectController
};

exports.default = ComponentSelect;
//# sourceMappingURL=componentSelect.js.map