'use strict';

class MilestoneReportGraphController {
    constructor() {
        this.config = {
            options: {
                chart: {
                    type: 'column',
                    width: 400,
                    height: 200
                },
                title: {
                    text: ''
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
                categories: ['1', '2', '3', '4', '5']
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
                    name: 'KI Score',
                    data: [
                        { y: 10, color: 'red'},
                        { y: 20, color: 'orange'},
                        { y: 30, color: 'yellow'},
                        { y: 25, color: 'DarkSeaGreen'},
                        { y: 15, color: 'green'}
                    ]
                }
            ]
        };
        console.log(this.graph1);
    }
}

MilestoneReportGraphController.$inject = [];

const MilestoneReportGraph = {
    bindings: {
        name: '@',
        categories: '<',
        data: '<'
    },
    templateUrl: 'wise5/directives/milestoneReportGraph/milestoneReportGraph.html',
    controller: MilestoneReportGraphController,
    controllerAs: 'milestoneReportGraphCtrl'
};

export default MilestoneReportGraph;

