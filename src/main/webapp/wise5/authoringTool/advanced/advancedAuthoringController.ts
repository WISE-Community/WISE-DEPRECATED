import { ConfigService } from '../../services/configService';
import { AuthoringToolProjectService } from '../authoringToolProjectService';
import { UtilService } from '../../services/utilService';
import * as angular from 'angular';

class AdvancedAuthoringController {
  $translate: any;
  isJSONDisplayed: boolean = false;
  projectId: number;
  projectJSONString: string;
  projectScriptFilename: string;

  static $inject = [
    '$filter',
    '$rootScope',
    '$scope',
    '$state',
    '$stateParams',
    'ConfigService',
    'ProjectService',
    'UtilService'
  ];

  constructor(
    $filter,
    private $rootScope,
    private $scope,
    private $state,
    $stateParams: any,
    private ConfigService: ConfigService,
    private ProjectService: AuthoringToolProjectService,
    private UtilService: UtilService
  ) {
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.$state = $state;
    this.$translate = $filter('translate');
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.UtilService = UtilService;
    this.projectId = $stateParams.projectId;
  }

  $onInit() {
    this.setProjectScriptFilename();
    this.$scope.$on('assetSelected', (event, { assetItem, target }) => {
      if (target === 'scriptFilename') {
        this.projectScriptFilename = assetItem.fileName;
        this.projectScriptFilenameChanged();
      }
    });
  }

  showJSONClicked() {
    if (this.isJSONDisplayed) {
      this.hideJSON();
    } else {
      this.showJSON();
    }
  }

  hideJSON() {
    if (this.UtilService.isValidJSONString(this.projectJSONString)) {
      this.isJSONDisplayed = false;
      this.UtilService.hideJSONValidMessage();
    } else if (confirm(this.$translate('jsonInvalidErrorMessage'))) {
      this.isJSONDisplayed = false;
      this.UtilService.hideJSONValidMessage();
    }
  }

  showJSON() {
    this.isJSONDisplayed = true;
    this.projectJSONString = angular.toJson(this.ProjectService.project, 4);
    this.UtilService.showJSONValidMessage();
  }

  autoSaveProjectJSONString() {
    try {
      this.saveProjectJSON(this.projectJSONString);
      this.UtilService.showJSONValidMessage();
    } catch (e) {
      this.UtilService.showJSONInvalidMessage();
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
    const openAssetChooserParams = {
      isPopup: true,
      projectId: this.projectId,
      target: 'scriptFilename'
    };
    this.$rootScope.$broadcast('openAssetChooser', openAssetChooserParams);
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
    this.$state.go('root.at.project');
  }
}

export default AdvancedAuthoringController;
