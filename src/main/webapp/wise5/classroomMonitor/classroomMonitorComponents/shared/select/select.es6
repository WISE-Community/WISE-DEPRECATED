'use strict';

const Select = {
    bindings: {
        customClass: '@',
        options: '<',
        onChange: '&',
        placeholder: '@',
        selected: '<'
    },
    template:
        `<md-select ng-model="$ctrl.selected"
                    ng-model-options="{trackBy: '$value.value'}"
                    class="{{$ctrl.customClass}}"
                    ng-change="$ctrl.onChange($value)"
                    placeholder="{{$ctrl.placeholder}}">
            <md-option ng-repeat="option in $ctrl.options" ng-value="option.value">
                {{option.label}}
            </md-option>
        </md-select>`
};

export default Select;
