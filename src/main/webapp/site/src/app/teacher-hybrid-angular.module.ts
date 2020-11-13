import { NgModule } from '@angular/core';

import '../../../wise5/teacher/teacher-angular-js-module';
import { UpgradeModule } from '@angular/upgrade/static';
import { setUpLocationSync } from '@angular/router/upgrade';
import { ProjectService } from '../../../wise5/services/projectService';
import { MilestoneReportDataComponent } from './teacher/milestone/milestone-report-data/milestone-report-data.component';
import { TeacherProjectService } from '../../../wise5/services/teacherProjectService';
import { ProjectAssetService } from './services/projectAssetService';
import { SpaceService } from '../../../wise5/services/spaceService';
import { StudentStatusService } from '../../../wise5/services/studentStatusService';
import { TeacherDataService } from '../../../wise5/services/teacherDataService';
import { TeacherWebSocketService } from '../../../wise5/services/teacherWebSocketService';
import { DataService } from './services/data.service';
import { MilestoneService } from '../../../wise5/services/milestoneService';
import { WorkgroupNodeScoreComponent } from '../../../wise5/classroomMonitor/classroomMonitorComponents/shared/workgroupNodeScore/workgroup-node-score.component';
import { NavItemScoreComponent } from '../../../wise5/classroomMonitor/classroomMonitorComponents/nodeProgress/navItemScore/nav-item-score.component';
import { ManageStudentsComponent } from '../../../wise5/classroomMonitor/manageStudents/manage-students-component';
import { AdvancedProjectAuthoringComponent } from '../../../wise5/authoringTool/advanced/advanced-project-authoring.component';
import { ChooseNewComponent } from './authoring-tool/add-component/choose-new-component/choose-new-component.component';
import { ChooseNewComponentLocation } from './authoring-tool/add-component/choose-new-component-location/choose-new-component-location.component';
import { ChooseImportStepComponent } from './authoring-tool/import-step/choose-import-step/choose-import-step.component';
import { ChooseImportStepLocationComponent } from './authoring-tool/import-step/choose-import-step-location/choose-import-step-location.component';
import { ComponentNewWorkBadgeComponent } from './classroom-monitor/component-new-work-badge/component-new-work-badge.component';
import { StatusIconComponent } from './classroom-monitor/status-icon/status-icon.component';
import { AngularJSModule } from './common-hybrid-angular.module';
import { NodeAdvancedJsonAuthoringComponent } from '../../../wise5/authoringTool/node/advanced/json/node-advanced-json-authoring.component';
import { WorkgroupInfoComponent } from '../../../wise5/classroomMonitor/classroomMonitorComponents/nodeGrading/workgroupInfo/workgroup-info.component';
import { NodeAdvancedGeneralAuthoringComponent } from '../../../wise5/authoringTool/node/advanced/general/node-advanced-general-authoring.component';

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
    NodeAdvancedGeneralAuthoringComponent,
    NodeAdvancedJsonAuthoringComponent,
    StatusIconComponent,
    WorkgroupInfoComponent,
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
  upgrade.bootstrap(document.body, [moduleType]);
  setUpLocationSync(upgrade);
}
