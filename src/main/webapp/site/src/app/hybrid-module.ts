import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { createStudentAngularJSModule } from '../../../wise5/vle/student-angular-js-module';
import { createTeacherAngularJSModule } from '../../../wise5/teacher/teacher-angular-js-module';
import { UpgradeModule } from '@angular/upgrade/static';
import { setUpLocationSync } from '@angular/router/upgrade';
import { UtilService } from '../../../wise5/services/utilService';
import { ConfigService } from '../../../wise5/services/configService';
import { ProjectService } from '../../../wise5/services/projectService';
import { VLEProjectService } from '../../../wise5/vle/vleProjectService';
import { CRaterService } from '../../../wise5/services/cRaterService';
import { SessionService } from '../../../wise5/services/sessionService';
import { StudentAssetService } from '../../../wise5/services/studentAssetService';
import { TagService } from '../../../wise5/services/tagService';
import { AudioRecorderService } from '../../../wise5/services/audioRecorderService';
import { PossibleScoreComponent } from './possible-score/possible-score.component';
import { AnnotationService } from '../../../wise5/services/annotationService';
import { CommonModule } from '@angular/common';
import { StudentWebSocketService } from '../../../wise5/services/studentWebSocketService';
import { StudentDataService } from '../../../wise5/services/studentDataService';
import { AchievementService } from '../../../wise5/services/achievementService';
import { MilestoneReportDataComponent } from './teacher/milestone/milestone-report-data/milestone-report-data.component';
import { TeacherProjectService } from '../../../wise5/services/teacherProjectService';
import { ProjectAssetService } from './services/projectAssetService';
import { SpaceService } from '../../../wise5/services/spaceService';
import { StudentStatusService } from '../../../wise5/services/studentStatusService';
import { SummaryService } from '../../../wise5/components/summary/summaryService';
import { TeacherDataService } from '../../../wise5/services/teacherDataService';
import { TeacherWebSocketService } from '../../../wise5/services/teacherWebSocketService';
import { TableService } from '../../../wise5/components/table/tableService';
import { OutsideURLService } from '../../../wise5/components/outsideURL/outsideURLService';
import { NotificationService } from '../../../wise5/services/notificationService';
import { MultipleChoiceService } from '../../../wise5/components/multipleChoice/multipleChoiceService';
import { OpenResponseService } from '../../../wise5/components/openResponse/openResponseService';

@Component({template: ``})
export class EmptyComponent {}

@NgModule({
  declarations: [
    EmptyComponent,
  ],
  imports: [
    UpgradeModule,
    CommonModule,
    RouterModule.forChild([
      {path: '**', component: EmptyComponent}
    ])
  ],
  providers: [
    AchievementService,
    AnnotationService,
    AudioRecorderService,
    UtilService,
    ConfigService,
    CRaterService,
    MultipleChoiceService,
    NotificationService,
    OutsideURLService,
    OpenResponseService,
    { provide: ProjectService, useExisting: VLEProjectService },
    SessionService,
    StudentAssetService,
    StudentDataService,
    StudentWebSocketService,
    SummaryService,
    TableService,
    TagService,
    VLEProjectService
  ],
  entryComponents: [
  ]
})
export class AngularJSModule {}

@NgModule({
  declarations: [
    PossibleScoreComponent
  ],
  imports: [
    AngularJSModule
  ],
  providers: [
    { provide: ProjectService, useExisting: VLEProjectService },
    VLEProjectService
  ],
  entryComponents: [
    PossibleScoreComponent
  ]
})
export class StudentAngularJSModule {}

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

@NgModule({
  declarations: [
    MilestoneReportDataComponent
  ],
  imports: [
    AngularJSModule
  ],
  providers: [
    ProjectAssetService,
    SpaceService,
    StudentStatusService,
    { provide: ProjectService, useExisting: TeacherProjectService },
    TeacherDataService,
    TeacherProjectService,
    TeacherWebSocketService
  ],
  entryComponents: [
    MilestoneReportDataComponent
  ]
})
export class TeacherAngularJSModule {
  constructor(upgrade: UpgradeModule) {
    bootstrapAngularJSModule(upgrade, 'teacher');
  }
}

function bootstrapAngularJSModule(upgrade: UpgradeModule, moduleType: string) {
  let module;
  if (moduleType === 'teacher') {
    module = createTeacherAngularJSModule();
  } else {
    module = createStudentAngularJSModule(moduleType);
  }
  upgrade.bootstrap(document.body, [module.name]);
  setUpLocationSync(upgrade);
}
