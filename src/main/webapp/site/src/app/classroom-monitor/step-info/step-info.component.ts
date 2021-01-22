import { Component, Input } from '@angular/core';
import { TeacherProjectService } from '../../../../../wise5/services/teacherProjectService';

@Component({
  selector: 'step-info',
  templateUrl: 'step-info.component.html'
})
export class StepInfoComponent {
  $translate: any;
  alertIconClass: string;
  alertIconLabel: string;
  alertIconName: string;
  @Input()
  hasAlert: boolean;
  @Input()
  hasNewAlert: boolean;
  @Input()
  hasNewWork: boolean;
  hasRubrics: boolean;
  @Input()
  nodeId: string;
  rubricIconLabel: string;
  stepTitle: string;

  constructor(private ProjectService: TeacherProjectService) {}

  ngOnInit() {
    this.stepTitle = this.ProjectService.getNodePositionAndTitleByNodeId(this.nodeId);
    if (this.hasAlert) {
      this.alertIconClass = this.hasNewAlert ? 'warn' : 'text-disabled';
      this.alertIconName = 'notifications';
      this.alertIconLabel = this.hasNewAlert
        ? $localize`Has new alert(s)`
        : $localize`Has dismissed alert(s)`;
    }
    this.hasRubrics = this.ProjectService.getNumberOfRubricsByNodeId(this.nodeId) > 0;
    this.rubricIconLabel = $localize`Step has rubrics/teaching tips`;
  }
}
