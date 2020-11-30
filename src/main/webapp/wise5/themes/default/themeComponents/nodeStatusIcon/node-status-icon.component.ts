import { Component, Input } from "@angular/core";
import { StudentDataService } from "../../../../services/studentDataService";

@Component({
  selector: 'node-status-icon',
  styleUrls: ['node-status-icon.component.scss'],
  templateUrl: 'node-status-icon.component.html'
})
export class NodeStatusIcon {
  label: string;

  @Input()
  nodeId: string;

  nodeStatus: any;

  constructor(private StudentDataService: StudentDataService) {}

  ngOnChanges() {
    this.nodeStatus = this.StudentDataService.nodeStatuses[this.nodeId];

    this.StudentDataService.nodeStatusesChanged$.subscribe(() => {
      this.updateLabel();
    });
  }

  updateLabel() {
    if (this.nodeStatus.isSuccess) {
      this.label = $localize`Completed with success`;
    } else if (this.nodeStatus.isCompleted) {
      this.label = $localize`Completed`;
    }

    if (this.nodeStatus.isWarn) {
      this.label = $localize`Warning`;
    }
  }
}
