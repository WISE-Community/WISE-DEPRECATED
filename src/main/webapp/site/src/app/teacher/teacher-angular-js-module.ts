
import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import teacher from '../../../../wise5/teacher/teacher';
import { UpgradeModule } from '@angular/upgrade/static';
import { setUpLocationSync } from '@angular/router/upgrade';
import { UtilService } from '../../../../wise5/services/utilService';
import { ConfigService } from '../../../../wise5/services/configService';
import { ProjectService } from '../../../../wise5/services/projectService';
import { TeacherProjectService } from '../../../../wise5/services/teacherProjectService';
import { MilestoneReportDataComponent } from './milestone/milestone-report-data/milestone-report-data.component';
import { CRaterService } from '../../../../wise5/services/cRaterService';
import { SessionService } from '../../../../wise5/services/sessionService';
import { StudentAssetService } from '../../../../wise5/services/studentAssetService';
import { TagService } from '../../../../wise5/services/tagService';
import { AudioRecorderService } from '../../../../wise5/services/audioRecorderService';
import { AnnotationService } from '../../../../wise5/services/annotationService';
import { CommonModule } from '@angular/common';
import { ProjectAssetService } from '../services/projectAssetService';
import { StudentDataService } from '../../../../wise5/services/studentDataService';
import { StudentStatusService } from '../../../../wise5/services/studentStatusService';
import { SpaceService } from '../../../../wise5/services/spaceService';
import { TeacherWebSocketService } from '../../../../wise5/services/teacherWebSocketService';
import { TeacherDataService } from '../../../../wise5/services/teacherDataService';
import { NodeService } from '../../../../wise5/services/nodeService';
import { MatDialogModule } from '@angular/material/dialog';
import { DataService } from '../services/data.service';

@Component({template: ``})
export class EmptyComponent {}

@NgModule({
  declarations: [
    EmptyComponent,
    MilestoneReportDataComponent
  ],
  imports: [
    UpgradeModule,
    CommonModule,
    MatDialogModule,
    RouterModule.forChild([
      {path: '**', component: EmptyComponent}
    ])
  ],
  providers: [
    AnnotationService,
    AudioRecorderService,
    ConfigService,
    CRaterService,
    { provide: DataService, useExisting: TeacherDataService },
    NodeService,
    ProjectAssetService,
    TeacherProjectService,
    { provide: ProjectService, useExisting: TeacherProjectService },
    SessionService,
    SpaceService,
    StudentAssetService,
    StudentDataService,
    StudentStatusService,
    TagService,
    TeacherDataService,
    TeacherWebSocketService,
    UtilService
  ],
  entryComponents: [
    MilestoneReportDataComponent
  ]
})
export class TeacherAngularJSModule {
  // The constructor is called only once, so we bootstrap the application
  // only once, when we first navigate to the legacy part of the app.
  constructor(upgrade: UpgradeModule) {
    upgrade.bootstrap(document.body, [teacher.name]);
    setUpLocationSync(upgrade);
  }
}
