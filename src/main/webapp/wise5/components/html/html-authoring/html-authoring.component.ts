import { Component } from '@angular/core';
import { ComponentAuthoring } from '../../../authoringTool/components/component-authoring.component';
import { ConfigService } from '../../../services/configService';
import { NodeService } from '../../../services/nodeService';
import { TeacherProjectService } from '../../../services/teacherProjectService';
import { UtilService } from '../../../services/utilService';

@Component({
  selector: 'html-authoring',
  templateUrl: 'html-authoring.component.html'
})
export class HtmlAuthoring extends ComponentAuthoring {
  html: string = '';

  constructor(
    protected ConfigService: ConfigService,
    protected NodeService: NodeService,
    protected ProjectService: TeacherProjectService,
    protected UtilService: UtilService
  ) {
    super(ConfigService, NodeService, ProjectService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.html = this.UtilService.replaceWISELinks(this.componentContent.html);
  }

  htmlChanged(): void {
    this.authoringComponentContent.html = this.UtilService.insertWISELinks(
      this.ConfigService.removeAbsoluteAssetPaths(this.html)
    );
    this.componentChanged();
  }
}
