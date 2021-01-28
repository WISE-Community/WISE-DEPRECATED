'use strict';

import { Component } from '@angular/core';
import { ProjectAssetService } from '../../../../site/src/app/services/projectAssetService';
import { ComponentAuthoring } from '../../../authoringTool/components/component-authoring.component';
import { ConfigService } from '../../../services/configService';
import { NodeService } from '../../../services/nodeService';
import { TeacherProjectService } from '../../../services/teacherProjectService';

@Component({
  selector: 'discussion-authoring',
  templateUrl: 'discussion-authoring.component.html',
  styleUrls: ['discussion-authoring.component.scss']
})
export class DiscussionAuthoring extends ComponentAuthoring {
  constructor(
    protected ConfigService: ConfigService,
    protected NodeService: NodeService,
    protected ProjectAssetService: ProjectAssetService,
    protected ProjectService: TeacherProjectService
  ) {
    super(ConfigService, NodeService, ProjectAssetService, ProjectService);
  }
}
