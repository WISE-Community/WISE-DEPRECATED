
import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { createModule } from '../../../../wise5/vle/vlePreviewCommonModule';
import { UpgradeModule } from '@angular/upgrade/static';
import { setUpLocationSync } from '@angular/router/upgrade';
import { UtilService } from '../../../../wise5/services/utilService';
import { ConfigService } from '../../../../wise5/services/configService';
import { ProjectService } from '../../../../wise5/services/projectService';
import { VLEProjectService } from '../../../../wise5/vle/vleProjectService';
import { CRaterService } from '../../../../wise5/services/cRaterService';
import { SessionService } from '../../../../wise5/services/sessionService';
import { StudentAssetService } from '../../../../wise5/services/studentAssetService';
import { TagService } from '../../../../wise5/services/tagService';
import { AudioRecorderService } from '../../../../wise5/services/audioRecorderService';
import { PossibleScoreComponent } from '../possible-score/possible-score.component';
import { AnnotationService } from '../../../../wise5/services/annotationService';
import { CommonModule } from '@angular/common';
import { StudentWebSocketService } from '../../../../wise5/services/studentWebSocketService';
import { StudentDataService } from '../../../../wise5/services/studentDataService';

@Component({template: ``})
export class EmptyComponent {}

@NgModule({
  declarations: [
    EmptyComponent,
    PossibleScoreComponent
  ],
  imports: [
    UpgradeModule,
    CommonModule,
    RouterModule.forChild([
      {path: '**', component: EmptyComponent}
    ])
  ],
  providers: [
    AnnotationService,
    AudioRecorderService,
    UtilService,
    ConfigService,
    CRaterService,
    { provide: ProjectService, useExisting: VLEProjectService },
    SessionService,
    StudentAssetService,
    StudentDataService,
    StudentWebSocketService,
    TagService,
    VLEProjectService
  ],
  entryComponents: [
    PossibleScoreComponent
  ]
})
export class StudentAngularJSModule {
}

@NgModule({
  imports: [
    StudentAngularJSModule
  ]
})
export class StudentVLEAngularJSModule {
  constructor(upgrade: UpgradeModule) {
    bootstrapAngularJSModule(upgrade, 'vle');
  }
}

@NgModule({
  imports: [
    StudentAngularJSModule
  ]
})
export class PreviewAngularJSModule {
  constructor(upgrade: UpgradeModule) {
    bootstrapAngularJSModule(upgrade, 'preview');
  }
}

function bootstrapAngularJSModule(upgrade: UpgradeModule, moduleType: string) {
  const module = createModule(moduleType);
  upgrade.bootstrap(document.body, [module.name]);
  setUpLocationSync(upgrade);
}

