'use strict';

class AuthoringToolMainController {

  constructor($anchorScroll,
        $filter,
        $rootScope,
        $state,
        $timeout,
        ConfigService,
        ProjectService,
        TeacherDataService) {
    this.$anchorScroll = $anchorScroll;
    this.$filter = $filter;
    this.$rootScope = $rootScope;
    this.$state = $state;
    this.$timeout = $timeout;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.TeacherDataService = TeacherDataService;

    this.$translate = this.$filter('translate');
    this.projects = this.ConfigService.getConfigParam('projects');
    this.sharedProjects = this.ConfigService.getConfigParam('sharedProjects');
    this.showCreateProjectView = false;

    this.$rootScope.$on('goHome', () => {
      this.saveEvent('goToTeacherHome', 'Navigation', null, null);
    });
    this.$rootScope.$on('logOut', () => {
      this.saveEvent('logOut', 'Navigation', null, null);
    });
  }

  /**
   * Get my project or shared project by project id
   * @param projectId the project id
   * @return the project object that just contains the name and id and run id
   * if it is associated with a run. If none were found, return null.
   */
  getProjectByProjectId(projectId) {
    for (let project of this.projects) {
      if (project != null && project.id == projectId) {
        return project;
      }
    }

    for (let sharedProject of this.sharedProjects) {
      if (sharedProject != null && sharedProject.id == projectId) {
        return sharedProject;
      }
    }
    return null;
  }

  /**
   * Copy a project and highlight it to draw attention to it
   * @param projectId the project to copy
   */
  copyProject(projectId) {
    let project = this.getProjectByProjectId(projectId);
    let projectName = project.name;

    // get the project info that we will display in the confirm message
    let projectInfo = projectId + ' ' + projectName;
    let projectRunId = project.runId;

    if (projectRunId != null) {
      // add the run id to the info
      projectInfo += ' (Run ID: ' + projectRunId + ')';
    }

    /*
     * the message that we will use to confirm that the author wants to copy
     * the project
     */
    let doCopyConfirmMessage =
        this.$translate('areYouSureYouWantToCopyThisProject') +
        '\n\n' + projectInfo;
    let doCopy = confirm(doCopyConfirmMessage);
    if (doCopy) {
      this.ProjectService.copyProject(projectId).then((projectId) => {
        this.saveEvent('projectCopied', 'Authoring', null, projectId);

        // refresh the project list
        this.ConfigService.retrieveConfig(window.configURL).then(() => {
          this.projects = this.ConfigService.getConfigParam('projects');
          this.scrollToTopOfPage();

          // briefly highlight the new project to draw attention to it
          this.$timeout(() => {
            let componentElement = $('#' + projectId);

            // remember the original background color
            let originalBackgroundColor = componentElement.css('backgroundColor');

            // highlight the background briefly to draw attention to it
            componentElement.css('background-color', '#FFFF9C');

            /*
             * Use a timeout before starting to transition back to
             * the original background color. For some reason the
             * element won't get highlighted in the first place
             * unless this timeout is used.
             */
            this.$timeout(() => {
              // slowly fade back to original background color
              componentElement.css({
                'transition': 'background-color 3s ease-in-out',
                'background-color': originalBackgroundColor
              });

              /*
               * remove these styling fields after we perform
               * the fade otherwise the regular mouseover
               * background color change will not work
               */
              this.$timeout(() => {
                componentElement.css({
                  'transition': '',
                  'background-color': ''
                });
              }, 3000);
            });
          });
        });
      });
    }
  }

  createNewProjectButtonClicked() {
    this.project = this.ProjectService.getNewProjectTemplate();
    this.showCreateProjectView = true;

    // focus on the newProjectTitle input element
    this.$timeout(() => {
      let createGroupTitleInput = document.getElementById('newProjectTitle');
      if (createGroupTitleInput != null) {
        createGroupTitleInput.focus();
      }
    });
  }

  /**
   * Create a new project and open it
   */
  registerNewProject() {
    let projectTitle = this.project.metadata.title;
    if (projectTitle == null || projectTitle == '') {
      alert(this.$translate('pleaseEnterAProjectTitleForYourNewProject'));
    } else {
      let projectJSONString = angular.toJson(this.project, 4);
      let commitMessage =
          this.$translate('projectCreatedOn') + new Date().getTime();
      this.ProjectService.registerNewProject(projectJSONString, commitMessage)
          .then((projectId) => {
        this.showCreateProjectView = false;
        this.saveEvent('projectCreated', 'Authoring', null, projectId);
        this.$state.go('root.project', {projectId: projectId});
      });
    }
  }

  cancelRegisterNewProject() {
    // clear the project template
    this.project = null;
    this.showCreateProjectView = false;
  }

  /**
   * Open a project in the authoring tool
   * @param projectId the project id to open
   */
  openProject(projectId) {
    this.$state.go('root.project', {projectId:projectId});
  }

  /**
   * Launch the project in preview mode in a new tab
   */
  previewProject(projectId) {
    let data = { constraints: true };
    this.saveEvent('projectPreviewed', 'Authoring', data, projectId);
    window.open(this.ConfigService.getWISEBaseURL() + '/project/' + projectId);
  }

  /**
   * Send the user to the teacher home page
   */
  goHome() {
    window.location = this.ConfigService.getWISEBaseURL() + '/teacher';
  }

  /**
   * Save an Authoring Tool event
   * @param eventName the name of the event
   * @param category the category of the event
   * example 'Navigation' or 'Authoring'
   */
  saveEvent(eventName, category, data, projectId) {
    let context = 'AuthoringTool';
    let nodeId = null;
    let componentId = null;
    let componentType = null;
    if (data == null) {
      data = {};
    }
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
  '$rootScope',
  '$state',
  '$timeout',
  'ConfigService',
  'ProjectService',
  'TeacherDataService'
];

export default AuthoringToolMainController;
