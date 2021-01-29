'use strict';

import { Component } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProjectAssetService } from '../../../../site/src/app/services/projectAssetService';
import { ComponentAuthoring } from '../../../authoringTool/components/component-authoring.component';
import { ConfigService } from '../../../services/configService';
import { NodeService } from '../../../services/nodeService';
import { TeacherProjectService } from '../../../services/teacherProjectService';

@Component({
  selector: 'embedded-authoring',
  templateUrl: 'embedded-authoring.component.html',
  styleUrls: ['embedded-authoring.component.scss']
})
export class EmbeddedAuthoring extends ComponentAuthoring {
  embeddedApplicationIFrameId: string;
  inputChange: Subject<string> = new Subject<string>();
  inputChangeSubscription: Subscription;

  constructor(
    protected ConfigService: ConfigService,
    protected NodeService: NodeService,
    protected ProjectAssetService: ProjectAssetService,
    protected ProjectService: TeacherProjectService
  ) {
    super(ConfigService, NodeService, ProjectAssetService, ProjectService);
    this.inputChangeSubscription = this.inputChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.componentChanged();
      });
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.embeddedApplicationIFrameId = 'componentApp_' + this.componentId;
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.inputChangeSubscription.unsubscribe();
  }

  showModelFileChooserPopup(): void {
    const params = {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: 'modelFile'
    };
    this.openAssetChooser(params);
  }

  assetSelected({ nodeId, componentId, assetItem, target }): void {
    super.assetSelected({ nodeId, componentId, assetItem, target });
    if (target === 'modelFile') {
      this.authoringComponentContent.url = assetItem.fileName;
      this.componentChanged();
    }
  }

  reloadModel(): void {
    const iframe: any = document.getElementById(this.embeddedApplicationIFrameId);
    const src = iframe.src;
    iframe.src = '';
    iframe.src = src;
  }
}
