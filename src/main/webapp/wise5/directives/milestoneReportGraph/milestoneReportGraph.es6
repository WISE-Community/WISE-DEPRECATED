'use strict';

class MilestoneReportGraphController {
    constructor() {
        if (this.name == null) {
            this.name = this.id;
        }
        this.config = {
            options: {
                chart: {
                    type: 'column',
                    width: 400,
                    height: 200
                },
                title: {
                    text: this.name
                },
                plotOptions: {
                    series: {
                        dataLabels: {
                            enabled: true,
                            format: '{y}%'
                        }
                    }
                },
                legend: { symbolHeight: '0px' }
            },
            xAxis: {
                categories: this.categories
            },
            yAxis: {
                title: {
                    text: ''
                },
                labels: {
                    enabled: false
                }
            },
            series: [
                {
                    showInLegend: false,
                    data: this.data
                }
            ]
        };
    }
}

MilestoneReportGraphController.$inject = [];

const MilestoneReportGraph = {
    bindings: {
        id: '@',
        name: '@',
        categories: '<',
        data: '<'
    },
    templateUrl: 'wise5/directives/milestoneReportGraph/milestoneReportGraph.html',
    controller: MilestoneReportGraphController,
    controllerAs: 'milestoneReportGraphCtrl'
};

export default MilestoneReportGraph;

