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

WiselinkController.$inject = [
    '$scope',
    '$element',
    'StudentDataService'
];

export default WiselinkController;
