"use strict";

const NodeCompletionIcon = {
    bindings: {
        nodeStatus: '<'
    },
    template:
        `<md-icon ng-if="$ctrl.nodeStatus.isCompleted"
                  ng-class="[$ctrl.customClass, {'success': $ctrl.nodeStatus.isSuccess}]"
                  aria-label="{{'completed' | translate}}">
                  {{'check_circle'}}
        </md-icon>
        <md-icon ng-if="!$ctrl.nodeStatus.isCompleted"></md-icon>`
};

export default NodeCompletionIcon;
