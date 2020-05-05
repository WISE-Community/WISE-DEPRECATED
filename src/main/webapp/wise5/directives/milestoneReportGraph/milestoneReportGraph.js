'use strict';

class MilestoneReportGraphController {
  constructor($filter, UtilService) {
    this.$translate = $filter('translate');
    this.UtilService = UtilService;
  }

  $onInit() {
    this.graphData = [];
    this.categories = [];
    this.defaultColor = 'rgb(194, 24, 91)';
    if (this.name == null) {
      this.name = this.id;
    }
    this.calculateGraphDataAndCategories();
    this.setConfig();
  }

  setConfig() {
    const teamLabel = this.$translate('teams');
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
            fontWeight: '500',
            color: this.getTitleColor()
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
          data: this.graphData
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

  getTitleColor() {
    return this.titleColor ? this.titleColor : this.defaultColor;
  }

  calculateGraphDataAndCategories() {
    const color = this.barColor ? this.barColor : this.defaultColor;
    const scoreKeys = Object.keys(this.data.counts);
    const scoreKeysSorted = scoreKeys.sort((a, b) => {
      return parseInt(a) - parseInt(b);
    });
    const step = 100 / scoreKeysSorted.length / 100;
    let opacity = 0;
    for (const scoreKey of scoreKeysSorted) {
      this.categories.push(scoreKey.toString());
      opacity = opacity + step;
      const scoreKeyCount = this.data.counts[scoreKey];
      const scoreKeyPercentage = Math.floor((100 * scoreKeyCount) / this.data.scoreCount);
      const scoreKeyColor = this.UtilService.rgbToHex(color, opacity);
      const scoreData = {
        y: scoreKeyPercentage,
        color: scoreKeyColor,
        count: scoreKeyCount
      };
      this.graphData.push(scoreData);
    }
  }
}

MilestoneReportGraphController.$inject = ['$filter', 'UtilService'];

const MilestoneReportGraph = {
  bindings: {
    id: '@',
    name: '@',
    titleColor: '@',
    barColor: '@',
    data: '<'
  },
  templateUrl: 'wise5/directives/milestoneReportGraph/milestoneReportGraph.html',
  controller: MilestoneReportGraphController,
  controllerAs: 'milestoneReportGraphCtrl'
};

export default MilestoneReportGraph;
