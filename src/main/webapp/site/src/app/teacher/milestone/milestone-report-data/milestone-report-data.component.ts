import { Component, Input } from '@angular/core';

@Component({
  selector: 'milestone-report-data',
  template: `{{ output }}`
})
export class MilestoneReportDataComponent {
  @Input()
  calc: string;

  @Input()
  scoreId: string;

  @Input()
  scoreValues: any = [];

  @Input()
  data: any;

  output: string = '';

  constructor() {}

  ngOnInit() {
    this.data = JSON.parse(this.data.replace(/\'/g, '"'));
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
    return `${Math.round((count / total) * 100)}%`;
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
        count += Number(value);
      }
    }
    return count;
  }
}
