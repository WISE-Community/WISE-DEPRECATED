export default class ProjectListPage {
  constructor() {
    this.createNewProjectButton = element(by.id('createNewProjectButton'));
    this.goHomeButton = element(by.id('goHomeButton'));
    this.createProjectButton = element(by.id('createProjectButton'));
    this.cancelCreateProjectButton = element(by.id('cancelCreateProjectButton'));
    this.newProjectTitleInput = element(by.model('authoringToolMainController.project.metadata.title'));
    this.projects = element.all(by.css('.projectItem'));
  }

  /**
   * Start the process of creating a new project by showing a project title
   * input.
   */
  createNewProject() {
    this.createNewProjectButton.click();
  }

  /**
   * Create the new project.
   */
  createProject() {
    this.createProjectButton.click();
  }

  /**
   * Cancel the process of creating a new project.
   */
  cancelCreateProject() {
    this.cancelCreateProjectButton.click();
  }

  /**
   * Set the project title when in the process of creating a new project.
   */
  setNewProjectTitle(title) {
    this.newProjectTitleInput.sendKeys(title);
  }
}
