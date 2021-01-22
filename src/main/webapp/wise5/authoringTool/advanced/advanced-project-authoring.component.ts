import { ConfigService } from '../../services/configService';
import { TeacherProjectService } from '../../services/teacherProjectService';
import { UtilService } from '../../services/utilService';
import * as angular from 'angular';
import { ProjectAssetService } from '../../../site/src/app/services/projectAssetService';
import { NotificationService } from '../../services/notificationService';
import { Component } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';

@Component({
  selector: 'advanced-project-authoring',
  templateUrl: 'advanced-project-authoring.component.html'
})
export class AdvancedProjectAuthoringComponent {
  isJSONDisplayed: boolean = false;
  projectId: number;
  projectJSONString: string;
  projectScriptFilename: string;

  constructor(
    private upgrade: UpgradeModule,
    private ConfigService: ConfigService,
    private NotificationService: NotificationService,
    private ProjectAssetService: ProjectAssetService,
    private ProjectService: TeacherProjectService,
    private UtilService: UtilService
  ) {
    this.projectId = this.ConfigService.getProjectId();
  }

  ngOnInit() {
    this.setProjectScriptFilename();
  }

  toggleJSON() {
    if (this.isJSONDisplayed) {
      this.hideJSON();
    } else {
      this.showJSON();
    }
  }

  hideJSON() {
    if (this.UtilService.isValidJSONString(this.projectJSONString)) {
      this.isJSONDisplayed = false;
      this.NotificationService.hideJSONValidMessage();
    } else if (
      confirm(
        $localize`The JSON is invalid. Invalid JSON will not be saved.\nClick "OK" to revert back to the last valid JSON.\nClick "Cancel" to keep the invalid JSON open so you can fix it.`
      )
    ) {
      this.isJSONDisplayed = false;
      this.NotificationService.hideJSONValidMessage();
    }
  }

  showJSON() {
    this.isJSONDisplayed = true;
    this.projectJSONString = angular.toJson(this.ProjectService.project, 4);
    this.NotificationService.showJSONValidMessage();
  }

  autoSaveProjectJSONString() {
    try {
      this.saveProjectJSON(this.projectJSONString);
      this.NotificationService.showJSONValidMessage();
    } catch (e) {
      this.NotificationService.showJSONInvalidMessage();
    }
  }

  saveProjectJSON(projectJSONString) {
    const project = angular.fromJson(projectJSONString);
    this.ProjectService.setProject(project);
    this.setProjectScriptFilename();
    this.ProjectService.checkPotentialStartNodeIdChangeThenSaveProject();
  }

  setProjectScriptFilename() {
    this.projectScriptFilename = this.ProjectService.getProjectScriptFilename();
  }

  chooseProjectScriptFile() {
    const params = {
      isPopup: true,
      projectId: this.projectId,
      target: 'scriptFilename'
    };
    this.ProjectAssetService.openAssetChooser(params).then((data: any) => {
      this.assetSelected(data);
    });
  }

  assetSelected({ assetItem }) {
    this.projectScriptFilename = assetItem.fileName;
    this.projectScriptFilenameChanged();
  }

  downloadProject() {
    window.location.href = `${this.ConfigService.getWISEBaseURL()}/project/export/${
      this.projectId
    }`;
  }

  openProjectURLInNewTab() {
    window.open(this.getProjectURL(), '_blank');
  }

  copyProjectURL() {
    const textArea = document.createElement('textarea');
    textArea.value = this.getProjectURL();
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }

  getProjectURL() {
    return window.location.origin + this.ConfigService.getConfigParam('projectURL');
  }

  projectScriptFilenameChanged() {
    this.ProjectService.setProjectScriptFilename(this.projectScriptFilename);
    if (this.showJSON) {
      this.projectJSONString = angular.toJson(this.ProjectService.project, 4);
    }
    this.ProjectService.saveProject();
  }

  goBack() {
    this.upgrade.$injector.get('$state').go('root.at.project');
  }
}
