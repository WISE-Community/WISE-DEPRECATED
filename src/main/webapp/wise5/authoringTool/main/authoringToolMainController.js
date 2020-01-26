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

  /**
   * Get my project or shared project by project id
   * @param projectId the project id
   * @return the project object that just contains the name and id and run id
   * if it is associated with a run. If none were found, return null.
   */
  getProjectByProjectId(projectId) {
    for (const project of this.projects) {
      if (project.id == projectId) {
        return project;
      }
    }

    for (const sharedProject of this.sharedProjects) {
      if (sharedProject.id == projectId) {
        return sharedProject;
      }
    }
    return null;
  }

  /**
   * Copy a project after confirming and highlight to draw attention to it
   * @param projectId the project to copy
   */
  copyProject(projectId) {
    const project = this.getProjectByProjectId(projectId);
    let projectInfo = `${projectId} ${project.name}`;
    const projectRunId = project.runId;
    if (projectRunId != null) {
      projectInfo += ` (Run ID: ${projectRunId})`;
    }

    const confirmCopyMessage =
        `${this.$translate('areYouSureYouWantToCopyThisProject')}\n\n${projectInfo}`;
    if (confirm(confirmCopyMessage)) {
      this.ProjectService.copyProject(projectId).then((project) => {
        const projectId = project.id;
        this.showCopyingProjectMessage();
        this.saveEvent('projectCopied', 'Authoring', {}, projectId);

        // refresh the project list and highlight the newly copied project
        this.ConfigService.retrieveConfig(`/author/config`).then(() => {
          this.projects = this.ConfigService.getConfigParam('projects');
          this.scrollToTopOfPage();
          // the timeout is necessary for new element to appear on the page
          this.$timeout(() => {
            const highlightDuration = 3000;
            this.UtilService.temporarilyHighlightElement(projectId, highlightDuration);
          });
          this.$mdDialog.hide();
        });
      });
    }
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
    const projectName = this.project.metadata.title;
    if (projectName == null || projectName === '') {
      alert(this.$translate('pleaseEnterAProjectTitleForYourNewProject'));
    } else {
      /*
       * Make sure we are not already in the process of creating a project.
       * This is used to make sure the author does not inadvertently click
       * the register button twice which can lead to problems in the back
       * end.
       */
      if (!this.isInProcessOfCreatingProject()) {
        this.turnOnInProcessOfCreatingProject();
        this.turnOnCreatingProjectMessage();
        this.startErrorCreatingProjectTimeout();
        const projectJSONString = angular.toJson(this.project, 4);
        this.ProjectService.registerNewProject(projectName, projectJSONString)
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
  }

  turnOnInProcessOfCreatingProject() {
    this.inProcessOfCreatingProject = true;
  }

  turnOffInProcessOfCreatingProject() {
    this.inProcessOfCreatingProject = false;
  }

  /**
   * @returns {boolean} Whether we have made a request to the server to create
   * a project and are now waiting for a response.
   */
  isInProcessOfCreatingProject() {
    return this.inProcessOfCreatingProject;
  }

  /**
   * Show the message that says "Creating Project..." after the author clicks
   * the "Create" button that makes the request to create the project on the
   * server.
   */
  turnOnCreatingProjectMessage() {
    this.showCreatingProjectMessage = true;
    this.showErrorCreatingProjectMessage = false;
  }

  /**
   * Show the message that says "Error Creating Project".
   */
  turnOnErrorCreatingProjectMessage() {
    this.showCreatingProjectMessage = false;
    this.showErrorCreatingProjectMessage = true;
  }

  /**
   * Hide the messages that say "Creating Project..." and "Error Creating Project".
   */
  clearAllCreatingProjectMessages() {
    this.showCreatingProjectMessage = false;
    this.showErrorCreatingProjectMessage = false;
  }

  /**
   * Create a timeout to display the "Error Creating Project" message in case
   * an error occurs and the server does not respond.
   */
  startErrorCreatingProjectTimeout() {
    this.errorCreatingProjectTimeout = this.$timeout(() => {
      this.turnOffInProcessOfCreatingProject();
      this.turnOnErrorCreatingProjectMessage();
    }, 10000);
  }

  /**
   * Cancel the timeout for displaying the "Error Creating Project" message.
   */
  cancelErrorCreatingProjectTimeout() {
    this.$timeout.cancel(this.errorCreatingProjectTimeout);
  }

  cancelRegisterNewProject() {
    this.project = null;
    this.showCreateProjectView = false;
    this.clearAllCreatingProjectMessages();
  }

  /**
   * Open a project in the authoring tool, replacing any current view
   * @param projectId the project id to open
   */
  openProject(projectId) {
    this.showLoadingProjectMessage();
    this.$state.go('root.project', {projectId:projectId});
  }

  /**
   * Launch the project in preview mode in a new tab
   */
  previewProject(projectId) {
    let data = { constraints: true };
    this.saveEvent('projectPreviewed', 'Authoring', data, projectId);
    window.open(`${this.ConfigService.getWISEBaseURL()}/project/${projectId}#!/project/${projectId}`);
  }

  /**
   * Send the user to the teacher home page
   */
  goHome() {
    this.saveEvent('goToTeacherHome', 'Navigation', {}, null);
    window.location = this.ConfigService.getWISEBaseURL() + '/teacher';
  }

  /**
   * Save an Authoring Tool event
   * @param eventName the name of the event
   * @param category the category of the event
   * example 'Navigation' or 'Authoring'
   */
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
