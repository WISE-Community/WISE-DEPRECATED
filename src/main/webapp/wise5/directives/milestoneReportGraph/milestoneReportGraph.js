'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MilestoneReportGraphController = function MilestoneReportGraphController() {
    _classCallCheck(this, MilestoneReportGraphController);
};

MilestoneReportGraphController.$inject = [];

var MilestoneReportGraph = {
    bindings: {
        show: '@'
    },
    templateUrl: 'wise5/directives/milestoneReportGraph/milestoneReportGraph.html',
    controller: MilestoneReportGraphController,
    controllerAs: 'milestoneReportGraphCtrl'
};

exports.default = MilestoneReportGraph;
//# sourceMappingURL=milestoneReportGraph.js.map
