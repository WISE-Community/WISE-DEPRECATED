'use strict';

class MilestoneReportGraphController {
    constructor() {

    }
}

MilestoneReportGraphController.$inject = [];

const MilestoneReportGraph = {
    bindings: {
        show: '@'
    },
    templateUrl: 'wise5/directives/milestoneReportGraph/milestoneReportGraph.html',
    controller: MilestoneReportGraphController,
    controllerAs: 'milestoneReportGraphCtrl'
};

export default MilestoneReportGraph;

