import { Component, Input } from "@angular/core";
import { UpgradeModule } from "@angular/upgrade/static";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { ProjectAssetService } from "../../../../site/src/app/services/projectAssetService";
import { ComponentAuthoring } from "../../../authoringTool/components/component-authoring.component";
import { ConfigService } from "../../../services/configService";
import { NodeService } from "../../../services/nodeService";
import { NotificationService } from "../../../services/notificationService";
import { TeacherProjectService } from "../../../services/teacherProjectService";
import { UtilService } from "../../../services/utilService";

@Component({
  selector: 'open-response-authoring',
  templateUrl: 'open-response-authoring.component.html'
})
export class OpenResponseAuthoring extends ComponentAuthoring {

  @Input()
  nodeId: string;

  @Input()
  componentId: string;

  promptChange: Subject<string> = new Subject<string>();

  constructor(
    protected ConfigService: ConfigService,
    protected NodeService: NodeService,
    protected ProjectService: TeacherProjectService
  ) {
    super(
      ConfigService,
      NodeService,
      ProjectService
    );

    this.promptChange.pipe(debounceTime(1000), distinctUntilChanged())
        .subscribe((prompt: string) => {
          this.authoringComponentContent.prompt = prompt;
          this.authoringViewComponentChanged();
        });
  }

  promptChanged(prompt: string) {
    this.promptChange.next(prompt);
  }

}