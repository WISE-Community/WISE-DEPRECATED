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
                    height: 200,
                    style: {
                        fontFamily: 'Roboto,Helvetica Neue,sans-serif'
                    }
                },
                title: {
                    text: this.name,
                    style: {
                        fontSize: '16px',
                        fontWeight: '500'
                    }
                },
                plotOptions: {
                    series: {
                        dataLabels: {
                            enabled: true,
                            format: '{y}%'
                        }
                    }
                },
                legend: { symbolHeight: '0px' },
                tooltip: {
                    formatter: function() {
                        if (this.point.count === 1) {
                            return `<b>${this.point.count} workgroup</b>`;
                        } else {
                            return `<b>${this.point.count} workgroups</b>`;
                        }
                    }
                }
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

