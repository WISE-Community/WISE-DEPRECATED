'use strict';

class MilestoneReportGraphController {
    constructor($filter) {
        this.$translate = $filter('translate');
    }

    $onInit() {
        const teamLabel = this.$translate('teams');
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
                        fontSize: '14px',
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
                        return `<b>${teamLabel}: ${this.point.count}</b>`;
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
            ],
            func: function(chart) {
                // temporary fix to ensure graphs are correctly resized to fit their container width
                setTimeout(function() {
                    chart.reflow();
                }, 250);
            }
        };
    }
}

MilestoneReportGraphController.$inject = ['$filter'];

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

