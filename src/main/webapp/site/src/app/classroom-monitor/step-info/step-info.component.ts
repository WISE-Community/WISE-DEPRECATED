import { Component, Input } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
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

  constructor(upgrade: UpgradeModule, private ProjectService: TeacherProjectService) {
    this.$translate = upgrade.$injector.get('$filter')('translate');
  }

  ngOnInit() {
    this.stepTitle = this.ProjectService.getNodePositionAndTitleByNodeId(this.nodeId);
    if (this.hasAlert) {
      this.alertIconClass = this.hasNewAlert ? 'warn' : 'text-disabled';
      this.alertIconName = 'notifications';
      this.alertIconLabel = this.hasNewAlert ? this.$translate('HAS_ALERTS_NEW') :
          this.$translate('HAS_ALERTS_DISMISSED');
    }
    this.hasRubrics = this.ProjectService.getNumberOfRubricsByNodeId(this.nodeId) > 0;
    this.rubricIconLabel = this.$translate('STEP_HAS_RUBRICS_TIPS');
  }
}
