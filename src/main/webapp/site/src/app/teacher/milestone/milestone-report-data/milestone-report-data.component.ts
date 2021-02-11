import { Component, Input } from '@angular/core';

@Component({
  selector: 'milestone-report-data',
  template: `{{ output }}`
})
export class MilestoneReportDataComponent {
  @Input()
  nodeId: string = '';

  @Input()
  componentId: string = '';

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
      this.output = this.getAverage();
    }
  }

  getPercent() {
    const count = this.getCount();
    const total = this.getComponentData().scoreCount;
    return `${Math.round((count / total) * 100)}%`;
  }

  getCount() {
    if (this.scoreValues && this.scoreValues.length) {
      return this.getScoreValuesCount();
    }
    return this.getComponentData().scoreCount;
  }

  getAverage() {
    return this.getComponentData().average;
  }

  getScoreValuesCount() {
    let count = 0;
    for (const [key, value] of Object.entries(this.getComponentData().counts)) {
      if (this.scoreValues.includes(Number(key))) {
        count += Number(value);
      }
    }
    return count;
  }

  getComponentData(
    data: any[] = this.data,
    nodeId: string = this.nodeId,
    componentId: string = this.componentId
  ): any {
    if (nodeId === '' && componentId === '') {
      return data[data.length - 1];
    } else {
      return this.getComponentDataByNodeIdAndComponentId(data, nodeId, componentId);
    }
  }

  getComponentDataByNodeIdAndComponentId(data: any[], nodeId: string, componentId: string): any {
    for (const componentData of data) {
      if (componentData.nodeId === nodeId && componentData.componentId === componentId) {
        return componentData;
      }
    }
    return null;
  }
}
