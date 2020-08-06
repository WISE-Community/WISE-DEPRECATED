'use strict';

class AuthoringToolMainController {

  constructor(
      $anchorScroll,
      $filter,
      $mdDialog,
      $rootScope,
      $state,
      $timeout,
      ConfigService,
      ProjectService,
      TeacherDataService,
      UtilService) {
    this.$anchorScroll = $anchorScroll;
    this.$filter = $filter;
    this.$mdDialog = $mdDialog;
    this.$rootScope = $rootScope;
    this.$state = $state;
    this.$timeout = $timeout;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.TeacherDataService = TeacherDataService;
    this.UtilService = UtilService;
    this.$translate = this.$filter('translate');
    this.projects = this.ConfigService.getConfigParam('projects');
    this.sharedProjects = this.ConfigService.getConfigParam('sharedProjects');
    this.showCreateProjectView = false;
    this.inProcessOfCreatingProject = false;
    this.showCreatingProjectMessage = false;
    this.showErrorCreatingProjectMessage = false;
    this.is_rtl = ($('html').attr('dir')=='rtl');
    this.icons = {prev: 'arrow_back', next: 'arrow_forward'};
    if (this.is_rtl) {
      this.icons = {prev: 'arrow_forward', next: 'arrow_back'};
    }
    this.$rootScope.$on('logOut', () => {
      this.saveEvent('logOut', 'Navigation', {}, null);
    });
  }

  getProjectByProjectId(projectId) {
    for (const project of this.projects.concat(this.sharedProjects)) {
      if (project.id === projectId) {
        return project;
      }
    }
    return null;
  }

  copyProject(projectId) {
    const project = this.getProjectByProjectId(projectId);
    let projectInfo = `${projectId} ${project.name}`;
    if (project.runId != null) {
      projectInfo += ` (Run ID: ${project.runId})`;
    }

    const confirmCopyMessage =
        `${this.$translate('areYouSureYouWantToCopyThisProject')}\n\n${projectInfo}`;
    if (confirm(confirmCopyMessage)) {
      this.ProjectService.copyProject(projectId).then((project) => {
        this.showCopyingProjectMessage();
        this.saveEvent('projectCopied', 'Authoring', {}, project.id);
        this.highlightProject(project.id);
        this.$mdDialog.hide();
      });
    }
  }

  highlightProject(projectId) {
    this.ConfigService.retrieveConfig(`/author/config`).then(() => {
      this.projects = this.ConfigService.getConfigParam('projects');
      this.scrollToTopOfPage();
      this.$timeout(() => { // wait for new element to appear on the page
        const highlightDuration = 3000;
        this.UtilService.temporarilyHighlightElement(projectId, highlightDuration);
      });
    });
  }

  showCopyingProjectMessage() {
    this.showMessageInModalDialog(this.$translate('copyingProject'));
  }

  showLoadingProjectMessage() {
    this.showMessageInModalDialog(this.$translate('loadingProject'));
  }

  showMessageInModalDialog(message) {
    this.$mdDialog.show({
      template: `
        <div align="center">
          <div style="width: 200px; height: 100px; margin: 20px;">
            <span>${message}...</span>
            <br/>
            <br/>
            <md-progress-circular md-mode="indeterminate"></md-progress-circular>
          </div>
        </div>
      `,
      clickOutsideToClose: false
    });
  }

  showRegisterNewProjectView() {
    this.project = this.ProjectService.getNewProjectTemplate();
    this.showCreateProjectView = true;
    this.$timeout(() => {
      document.getElementById('newProjectTitle').focus();
    });
  }

  registerNewProject() {
    /*
     * Make sure we are not already in the process of creating a project.
     * This is used to make sure the author does not inadvertently click the register button twice,
     * which can lead to problems in the back end.
     */
    if (!this.isInProcessOfCreatingProject()) {
      this.turnOnInProcessOfCreatingProject();
      this.turnOnCreatingProjectMessage();
      this.startErrorCreatingProjectTimeout();
      const projectJSONString = angular.toJson(this.project, 4);
      this.ProjectService.registerNewProject(this.project.metadata.title, projectJSONString)
          .then((projectId) => {
            this.cancelErrorCreatingProjectTimeout();
            this.saveEvent('projectCreated', 'Authoring', {}, projectId);
            this.$state.go('root.project', {projectId: projectId});
          }).catch(() => {
            this.turnOffInProcessOfCreatingProject();
            this.turnOnErrorCreatingProjectMessage();
            this.cancelErrorCreatingProjectTimeout();
          });
    }
  }

  turnOnInProcessOfCreatingProject() {
    this.inProcessOfCreatingProject = true;
  }

  turnOffInProcessOfCreatingProject() {
    this.inProcessOfCreatingProject = false;
  }

  isInProcessOfCreatingProject() {
    return this.inProcessOfCreatingProject;
  }

  turnOnCreatingProjectMessage() {
    this.showCreatingProjectMessage = true;
    this.showErrorCreatingProjectMessage = false;
  }

  turnOnErrorCreatingProjectMessage() {
    this.showCreatingProjectMessage = false;
    this.showErrorCreatingProjectMessage = true;
  }

  clearAllCreatingProjectMessages() {
    this.showCreatingProjectMessage = false;
    this.showErrorCreatingProjectMessage = false;
  }

  startErrorCreatingProjectTimeout() {
    this.errorCreatingProjectTimeout = this.$timeout(() => {
      this.turnOffInProcessOfCreatingProject();
      this.turnOnErrorCreatingProjectMessage();
    }, 10000);
  }

  cancelErrorCreatingProjectTimeout() {
    this.$timeout.cancel(this.errorCreatingProjectTimeout);
  }

  cancelRegisterNewProject() {
    this.project = null;
    this.showCreateProjectView = false;
    this.clearAllCreatingProjectMessages();
  }

  openProject(projectId) {
    this.showLoadingProjectMessage();
    this.$state.go('root.project', {projectId:projectId});
  }

  previewProject(projectId) {
    let data = { constraints: true };
    this.saveEvent('projectPreviewed', 'Authoring', data, projectId);
    window.open(
        `${this.ConfigService.getWISEBaseURL()}/project/${projectId}#!/project/${projectId}`);
  }

  goHome() {
    this.saveEvent('goToTeacherHome', 'Navigation', {}, null);
    window.location = this.ConfigService.getWISEBaseURL() + '/teacher';
  }

  saveEvent(eventName, category, data = {}, projectId) {
    const context = 'AuthoringTool';
    const nodeId = null;
    const componentId = null;
    const componentType = null;
    this.TeacherDataService.saveEvent(context, nodeId, componentId,
        componentType, category, eventName, data, projectId);
  }

  scrollToTopOfPage() {
    this.$anchorScroll('top');
  }
};

AuthoringToolMainController.$inject = [
  '$anchorScroll',
  '$filter',
  '$mdDialog',
  '$rootScope',
  '$state',
  '$timeout',
  'ConfigService',
  'ProjectService',
  'TeacherDataService',
  'UtilService'
];

export default AuthoringToolMainController;
