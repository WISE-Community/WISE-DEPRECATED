import { Component, Input } from "@angular/core";
import { StudentDataService } from "../../../../services/studentDataService";

@Component({
  selector: 'node-status-icon',
  styleUrls: ['node-status-icon.component.scss'],
  templateUrl: 'node-status-icon.component.html'
})
export class NodeStatusIcon {

  @Input()
  nodeId: string;

  nodeStatus: any;

  ariaLabel: string;

  constructor(private StudentDataService: StudentDataService) {}

  ngOnChanges() {
    this.nodeStatus = this.StudentDataService.nodeStatuses[this.nodeId];
    this.ariaLabel = this.nodeStatus.isCompleted ? $localize`Completed` : '' +
        this.nodeStatus.isSuccess ? $localize` with Success` : '' +
        this.nodeStatus.isWarn ? $localize` with Warning` : '';
  }
}
