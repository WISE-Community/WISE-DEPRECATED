import { NgModule } from '@angular/core';

import '../../../wise5/teacher/teacher-angular-js-module';
import { AlertStatusCornerComponent } from './classroom-monitor/alert-status-corner/alert-status-corner.component';
import { UpgradeModule } from '@angular/upgrade/static';
import { setUpLocationSync } from '@angular/router/upgrade';
import { ProjectService } from '../../../wise5/services/projectService';
import { MilestonesComponent } from './classroom-monitor/milestones/milestones.component';
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
import { WorkgroupNodeStatusComponent } from './classroom-monitor/workgroup-node-status/workgroup-node-status.component';
import { NavItemScoreComponent } from '../../../wise5/classroomMonitor/classroomMonitorComponents/nodeProgress/navItemScore/nav-item-score.component';
import { ManageStudentsComponent } from '../../../wise5/classroomMonitor/manageStudents/manage-students-component';
import { AdvancedProjectAuthoringComponent } from '../../../wise5/authoringTool/advanced/advanced-project-authoring.component';
import { ChooseNewComponent } from './authoring-tool/add-component/choose-new-component/choose-new-component.component';
import { ChooseNewComponentLocation } from './authoring-tool/add-component/choose-new-component-location/choose-new-component-location.component';
import { ChooseImportStepComponent } from './authoring-tool/import-step/choose-import-step/choose-import-step.component';
import { ChooseImportStepLocationComponent } from './authoring-tool/import-step/choose-import-step-location/choose-import-step-location.component';
import { ComponentNewWorkBadgeComponent } from './classroom-monitor/component-new-work-badge/component-new-work-badge.component';
import { ComponentSelectComponent } from './classroom-monitor/component-select/component-select.component';
import { StatusIconComponent } from './classroom-monitor/status-icon/status-icon.component';
import { StepInfoComponent } from './classroom-monitor/step-info/step-info.component';
import { AngularJSModule } from './common-hybrid-angular.module';
import { NodeAdvancedJsonAuthoringComponent } from '../../../wise5/authoringTool/node/advanced/json/node-advanced-json-authoring.component';
import { WorkgroupInfoComponent } from '../../../wise5/classroomMonitor/classroomMonitorComponents/nodeGrading/workgroupInfo/workgroup-info.component';
import { NodeAdvancedGeneralAuthoringComponent } from '../../../wise5/authoringTool/node/advanced/general/node-advanced-general-authoring.component';
import { WiseAuthoringTinymceEditorComponent } from '../../../wise5/directives/wise-tinymce-editor/wise-authoring-tinymce-editor.component';
import { EditComponentJsonComponent } from './authoring-tool/edit-component-json/edit-component-json.component';
import { EditComponentMaxScoreComponent } from './authoring-tool/edit-component-max-score/edit-component-max-score.component';
import { EditComponentRubricComponent } from './authoring-tool/edit-component-rubric/edit-component-rubric.component';
import { EditComponentTagsComponent } from './authoring-tool/edit-component-tags/edit-component-tags.component';
import { EditComponentWidthComponent } from './authoring-tool/edit-component-width/edit-component-width.component';
import { RubricAuthoringComponent } from '../../../wise5/authoringTool/rubric/rubric-authoring.component';
import { NavItemProgressComponent } from './classroom-monitor/nav-item-progress/nav-item-progress.component';
import { WorkgroupSelectDropdownComponent } from './classroom-monitor/workgroup-select/workgroup-select-dropdown/workgroup-select-dropdown.component';
import { WorkgroupSelectAutocompleteComponent } from './classroom-monitor/workgroup-select/workgroup-select-autocomplete/workgroup-select-autocomplete.component';
import { EditHTMLAdvancedComponent } from '../../../wise5/components/html/edit-html-advanced/edit-html-advanced.component';
import { EditOutsideUrlAdvancedComponent } from '../../../wise5/components/outsideURL/edit-outside-url-advanced/edit-outside-url-advanced.component';
import { OpenResponseAuthoring } from '../../../wise5/components/openResponse/open-response-authoring/open-response-authoring.component';
import { HtmlAuthoring } from '../../../wise5/components/html/html-authoring/html-authoring.component';
import { OutsideUrlAuthoring } from '../../../wise5/components/outsideURL/outside-url-authoring/outside-url-authoring.component';
import { MultipleChoiceAuthoring } from '../../../wise5/components/multipleChoice/multiple-choice-authoring/multiple-choice-authoring.component';
import { ConceptMapAuthoring } from '../../../wise5/components/conceptMap/concept-map-authoring/concept-map-authoring.component';
import { DrawAuthoring } from '../../../wise5/components/draw/draw-authoring/draw-authoring.component';
import { MatchAuthoring } from '../../../wise5/components/match/match-authoring/match-authoring.component';
import { LabelAuthoring } from '../../../wise5/components/label/label-authoring/label-authoring.component';
import { TableAuthoring } from '../../../wise5/components/table/table-authoring/table-authoring.component';
import { DiscussionAuthoring } from '../../../wise5/components/discussion/discussion-authoring/discussion-authoring.component';

@NgModule({
  declarations: [
    AdvancedProjectAuthoringComponent,
    AlertStatusCornerComponent,
    ChooseImportStepComponent,
    ChooseImportStepLocationComponent,
    ChooseNewComponent,
    ChooseNewComponentLocation,
    ComponentNewWorkBadgeComponent,
    ComponentSelectComponent,
    ConceptMapAuthoring,
    DrawAuthoring,
    DiscussionAuthoring,
    EditComponentRubricComponent,
    EditComponentJsonComponent,
    EditComponentMaxScoreComponent,
    EditComponentTagsComponent,
    EditComponentWidthComponent,
    EditHTMLAdvancedComponent,
    EditOutsideUrlAdvancedComponent,
    HtmlAuthoring,
    LabelAuthoring,
    ManageStudentsComponent,
    MatchAuthoring,
    MilestonesComponent,
    MilestoneReportDataComponent,
    MultipleChoiceAuthoring,
    NavItemProgressComponent,
    NodeAdvancedGeneralAuthoringComponent,
    NodeAdvancedJsonAuthoringComponent,
    OpenResponseAuthoring,
    OutsideUrlAuthoring,
    RubricAuthoringComponent,
    StatusIconComponent,
    StepInfoComponent,
    TableAuthoring,
    WorkgroupInfoComponent,
    WorkgroupNodeScoreComponent,
    WorkgroupSelectAutocompleteComponent,
    WorkgroupSelectDropdownComponent,
    NavItemScoreComponent,
    WiseAuthoringTinymceEditorComponent,
    WorkgroupNodeStatusComponent
  ],
  imports: [AngularJSModule],
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
