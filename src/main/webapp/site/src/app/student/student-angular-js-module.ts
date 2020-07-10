
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
import { AudioRecorderService } from '../../../../wise5/services/audioRecorderService';
import { PossibleScoreComponent } from '../possible-score/possible-score.component';
import { AnnotationService } from '../../../../wise5/services/annotationService';
import { CommonModule } from '@angular/common';

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
    const vle = createModule('vle');
    upgrade.bootstrap(document.body, [vle.name]);
    setUpLocationSync(upgrade);
  }
}

@NgModule({
  imports: [
    StudentAngularJSModule
  ]
})
export class PreviewAngularJSModule {
  constructor(upgrade: UpgradeModule) {
    const preview = createModule('preview');
    upgrade.bootstrap(document.body, [preview.name]);
    setUpLocationSync(upgrade);
  }
}
