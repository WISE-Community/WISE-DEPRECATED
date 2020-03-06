'use strict';

class MilestoneReportDataController {
  constructor() {
    this.output = '';
    this.scoreValues = [];
  }

  $onInit() {
    if (this.calc === 'percent') {
      this.output = this.getPercent();
    }
    if (this.calc === 'count') {
      this.output = this.getCount();
    }
    if (this.calc === 'average') {
      this.output = this.data.average;
    }
  }

  getPercent() {
    const count = this.getCount();
    const total = this.data.scoreCount;
    return `${(count / total) * 100}%`;
  }

  getCount() {
    if (this.scoreValues && this.scoreValues.length) {
      return this.getScoreValuesCount();
    }
    return this.data.scoreCount;
  }

  getScoreValuesCount() {
    let count = 0;
    for (const [key, value] of Object.entries(this.data.counts)) {
      if (this.scoreValues.includes(Number(key))) {
        count += value;
      }
    }
    return count;
  }
}

MilestoneReportDataController.$inject = [];

const MilestoneReportData = {
  bindings: {
    scoreId: '@',
    scoreValues: '<',
    calc: '@',
    data: '<'
  },
  templateUrl: 'wise5/directives/milestoneReportData/milestoneReportData.html',
  controller: MilestoneReportDataController
};

export default MilestoneReportData;
