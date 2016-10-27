'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var Select = {
    bindings: {
        customClass: '@',
        options: '<',
        onChange: '&',
        placeholder: '@',
        selected: '<'
    },
    template: '<md-select ng-model="$ctrl.selected"\n                    ng-model-options="{trackBy: \'$value.value\'}"\n                    class="{{$ctrl.customClass}}"\n                    ng-change="$ctrl.onChange($value)"\n                    placeholder="{{$ctrl.placeholder}}">\n            <md-option ng-repeat="option in $ctrl.options" ng-value="option.value">\n                {{option.label}}\n            </md-option>\n        </md-select>'
};

exports.default = Select;
//# sourceMappingURL=select.js.map