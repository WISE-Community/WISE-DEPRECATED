import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

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
import { NotebookService } from '../../../wise5/services/notebookService';
import { NotificationService } from '../../../wise5/services/notificationService';
import { OutsideURLService } from '../../../wise5/components/outsideURL/outsideURLService';
import { MatchService } from '../../../wise5/components/match/matchService';
import { MultipleChoiceService } from '../../../wise5/components/multipleChoice/multipleChoiceService';
import { OpenResponseService } from '../../../wise5/components/openResponse/openResponseService';
import { NodeService } from '../../../wise5/services/nodeService';
import { MatDialogModule } from '@angular/material/dialog';
import { ChooseBranchPathDialogComponent } from './preview/modules/choose-branch-path-dialog/choose-branch-path-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { DataService } from './services/data.service';
import { DiscussionService } from '../../../wise5/components/discussion/discussionService';
import { DrawService } from '../../../wise5/components/draw/drawService';
import { EmbeddedService } from '../../../wise5/components/embedded/embeddedService';
import { HTMLService } from '../../../wise5/components/html/htmlService';
import { LabelService } from '../../../wise5/components/label/labelService';
import { AnimationService } from '../../../wise5/components/animation/animationService';
import { AudioOscillatorService } from '../../../wise5/components/audioOscillator/audioOscillatorService';
import { ConceptMapService } from '../../../wise5/components/conceptMap/conceptMapService';
import { MilestoneService } from '../../../wise5/services/milestoneService';
import { GraphService } from '../../../wise5/components/graph/graphService';
import { WorkgroupNodeScoreComponent } from '../../../wise5/classroomMonitor/classroomMonitorComponents/shared/workgroupNodeScore/workgroup-node-score.component';
import { NavItemScoreComponent } from '../../../wise5/classroomMonitor/classroomMonitorComponents/nodeProgress/navItemScore/nav-item-score.component';
import { NodeIconComponent } from '../../../wise5/classroomMonitor/classroomMonitorComponents/shared/nodeIcon/node-icon.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ManageStudentsComponent } from '../../../wise5/classroomMonitor/manageStudents/manage-students-component';
import { AdvancedProjectAuthoringComponent } from '../../../wise5/authoringTool/advanced/advanced-project-authoring.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { ChooseNewComponent } from './authoring-tool/add-component/choose-new-component/choose-new-component.component';
import { ChooseNewComponentLocation } from './authoring-tool/add-component/choose-new-component-location/choose-new-component-location.component';
import { ChooseImportStepComponent } from './authoring-tool/import-step/choose-import-step/choose-import-step.component';
import { ChooseImportStepLocationComponent } from './authoring-tool/import-step/choose-import-step-location/choose-import-step-location.component';
import { ComponentNewWorkBadgeComponent } from './classroom-monitor/component-new-work-badge/component-new-work-badge.component';
import { StatusIconComponent } from './classroom-monitor/status-icon/status-icon.component';
import { NodeAdvancedJsonAuthoringComponent } from '../../../wise5/authoringTool/node/advanced/json/node-advanced-json-authoring.component';

@Component({template: ``})
export class EmptyComponent {}

@NgModule({
  declarations: [
    EmptyComponent,
    NodeIconComponent,
  ],
  imports: [
    UpgradeModule,
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSelectModule,
    MatTooltipModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {path: '**', component: EmptyComponent}
    ])
  ],
  providers: [
    AchievementService,
    AnimationService,
    AnnotationService,
    AudioOscillatorService,
    AudioRecorderService,
    ConceptMapService,
    ConfigService,
    CRaterService,
    DiscussionService,
    DrawService,
    EmbeddedService,
    GraphService,
    HTMLService,
    LabelService,
    MatchService,
    MultipleChoiceService,
    NodeService,
    NotebookService,
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
    UtilService,
    VLEProjectService
  ],
  exports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSelectModule,
    MatTooltipModule,
    NodeIconComponent,
    ReactiveFormsModule
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
    { provide: DataService, useExisting: StudentDataService },
    { provide: ProjectService, useExisting: VLEProjectService },
    VLEProjectService
  ],
  exports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatListModule
  ]
})
export class StudentAngularJSModule {}

@NgModule({
  declarations: [
    ChooseBranchPathDialogComponent
  ],
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
    AdvancedProjectAuthoringComponent,
    ChooseImportStepComponent,
    ChooseImportStepLocationComponent,
    ChooseNewComponent,
    ChooseNewComponentLocation,
    ComponentNewWorkBadgeComponent,
    ManageStudentsComponent,
    MilestoneReportDataComponent,
    NodeAdvancedJsonAuthoringComponent,
    StatusIconComponent,
    WorkgroupNodeScoreComponent,
    NavItemScoreComponent
  ],
  imports: [
    AngularJSModule
  ],
  providers: [
    { provide: DataService, useExisting: TeacherDataService },
    MilestoneService,
    ProjectAssetService,
    SpaceService,
    StudentStatusService,
    { provide: ProjectService, useExisting: TeacherProjectService },
    TeacherDataService,
    TeacherProjectService,
    TeacherWebSocketService
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
