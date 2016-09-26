'use strict';

class WiselinkController {
    constructor($scope,
                $element,
                StudentDataService) {
        this.StudentDataService = StudentDataService;
    }

    follow() {
        this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
    }
}

WiselinkController.$inject = ['$scope','$element','StudentDataService'];

/**
 * Creates a link or button that the student can click on to navigate to
 * another step or activity in the project.
 */
const Wiselink = {
    bindings: {
        nodeId: '@',
        linkText: '@',
        tooltip: '@',
        linkClass: '@',
        type: '@'
    },
    templateUrl: 'wise5/directives/wiselink/wiselink.html',
    controller: WiselinkController,
    controllerAs: 'wiselinkCtrl'
};

export default Wiselink;
