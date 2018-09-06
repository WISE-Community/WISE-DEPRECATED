export default class ProjectPage {
  constructor() {
    this.projectTitleSpan = element(by.id('projectTitleSpan'));

    // side bar buttons
    this.projectHomeButton = element(by.id('projectHomeButton'));
    this.notebookButton = element(by.id('notebookButton'));
    this.assetButton = element(by.id('assetButton'));
    this.infoButton = element(by.id('infoButton'));
    this.projectListButton = element(by.id('projectListButton'));

    // project view top buttons
    this.createNewActivityButton = element(by.id('createNewActivityButton'));
    this.createNewStepButton = element(by.id('createNewStepButton'));
    this.advancedProjectAuthoringButton = element(by.id('advancedProjectAuthoringButton'));
    this.previewProjectButton = element(by.id('previewProjectButton'));
    this.previewProjectWithoutConstraintsButton = element(by.id('previewProjectWithoutConstraintsButton'));

    // create step elements
    this.createNodeTitle = element(by.id('createNodeTitle'));
    this.createNodeCreateButton = element(by.id('createNodeCreateButton'));

    // create activity elements
    this.createGroupTitle = element(by.id('createGroupTitle'));
    this.createGroupCreateButton = element(by.id('createGroupCreateButton'));

    // step tools
    this.stepSelectMenu = element(by.id('stepSelectMenu'));

    // step view buttons
    this.backToProjectButton = element(by.id('backToProjectButton'));
    this.addComponentButton = element(by.id('addComponentButton'));

    // advanced view buttons
    this.projectBackButton = element(by.id('projectBackButton'));
    this.showProjectJSONButton = element(by.id('showProjectJSONButton'));
    this.projectJSONString = element(by.model('projectController.projectJSONString'));
  }

  /**
   * Enter text into the create step text input.
   * @param title the new step title
   */
  setCreateNodeTitle(title) {
    this.createNodeTitle.sendKeys(title);
  }

  /**
   * Enter text into the create activity text input.
   * @param title the new activity title
   */
  setCreateGroupTitle(title) {
    this.createGroupTitle.sendKeys(title);
  }

  /**
   * Click the create new step button to show the create step text input and
   * the button to actually create the new step.
   */
  clickCreateNewStepButton() {
    this.createNewStepButton.click();
  }

  /**
   * Create a new step.
   */
  clickCreateNodeCreateButton() {
    this.createNodeCreateButton.click();
  }

  /**
   * Click the create new activity button to show the create activity text input
   * and the button to actually create the new activity.
   */
  clickCreateNewActivityButton() {
    this.createNewActivityButton.click();
  }

  /**
   * Create a new activity.
   */
  clickCreateGroupCreateButton() {
    this.createGroupCreateButton.click();
  }

  /**
   * Click the back button in the advanced view so that we go back to the
   * project view.
   */
  clickProjectBackButton() {
    this.projectBackButton.click();
  }

  /**
   * Click the advanced button to enter the advanced view.
   */
  clickAdvancedProjectAuthoringButton() {
    this.advancedProjectAuthoringButton.click();
  }

  /**
   * Click the show JSON button in the advanced view.
   */
  clickShowProjectJSONButton() {
    this.showProjectJSONButton.click();
  }

  /**
   * Set the project JSON string into the textarea.
   * @param jsonString The project JSON string.
   */
  setProjectJSONString(jsonString) {
    this.projectJSONString.clear();
    this.projectJSONString.sendKeys(jsonString);
  }

  /**
   * Click an insert button to make a step the first step in an activity.
   * @param activityNumber The activity to insert into.
   */
  clickToInsertStepInside(activityNumber) {
    element.all(by.css('.groupHeader .insertButton')).get(activityNumber).click();
  }

  /**
   * Click an insert button to insert a step.
   * @param activityNumber The activity to insert into. The range of allowed
   * values are 1 and up.
   * TODO: Make this work because this parameter does not actually work yet.
   * @param stepNumber The step to insert after. The range of allowed values
   * are 1 and up.
   *
   * Example
   * If clickToInsertStep(1, 1) is called, the new step will become the second
   * step in activity 1.
   */
  clickToInsertStepAfter(activityNumber, stepNumber) {
    if (activityNumber != null && stepNumber != null) {
      // we are inserting a step in an activity after a specific step
      element(by.cssContainingText('.stepHeader', activityNumber + '.' + stepNumber + ':')).
      element(by.css('.insertButton')).click();
    }
  }

  /**
   * Click the insert button to insert an activity.
   * @param activityNumber The number of the activity to insert after.
   * If activityNumber == 0, we will insert the new activity at the beginning of
   * the project and it will become activity 1.
   * If activityNumber == 1, we will insert the new activity after the first
   * activity so the new activity will become activity 2.
   */
  clickToInsertActivityAfter(activityNumber) {
    element.all(by.css('.groupHeader .insertButton')).get(activityNumber).click();
  }

  /**
   * Get the title of the step.
   * @param activityNumber the activity number
   * @param stepNumber the step number
   * @return The title of the step.
   */
  getTitleOfStep(activityNumber, stepNumber) {
    return element.all(by.css('.stepHeader')).get(stepNumber).getText();
  }

  /**
   * Get the title of the activity.
   * @param activityNumber the activity number
   * @return The title of the activity.
   */
  getTitleOfActivity(activityNumber) {
    return element.all(by.css('.groupHeader')).get(activityNumber).getText();
  }

  /**
   * Click on a step in the project view.
   * @param activityNumber The activity number. The range of allowed values are
   * 1 and up.
   * @param stepNumber The step number. The range of allowed values are 1 and
   * up.
   */
  clickOnStep(activityNumber, stepNumber) {
    element(by.cssContainingText('p', activityNumber + '.' + stepNumber + ':')).click();
  }

  /**
   * When in the step authoring view, click the back button to go back to the
   * project view.
   */
  clickStepBackButton() {
    this.backToProjectButton.click();
  }

  /**
   * Click the step select menu at the top left of the Authoring Tool.
   */
  clickStepSelectMenu() {
    this.stepSelectMenu.click();
  }

  /**
   * Click on a step in the step select menu.
   * @param activityNumber The activity number. The range of allowed values are
   * 1 and up.
   * @param stepNumber The step number. The range of allowed values are 1 and
   * up.
   */
  clickOnAStepIntheStepSelectMenu(activityNumber, stepNumber) {
    this.clickStepSelectMenu();
    element(by.cssContainingText('md-option', activityNumber + '.' + stepNumber + ':')).click();
  }

  /**
   * Click on the notebook button to go to the notebook settings view
   */
  clickNotebookButton() {
    this.notebookButton.click();
  }

  /**
   * Click on the assets button to go to the assets view
   */
  clickAssetButton() {
    this.assetButton.click();
  }

  /**
   * Click on the info button to go to the info view
   */
  clickInfoButton() {
    this.infoButton.click();
  }

  clickPreviewProjectButton() {
    this.previewProjectButton.click();
  }

  clickPreviewProjectWithoutConstraintsButton() {
    this.previewProjectWithoutConstraintsButton.click();
  }

  clickGoHomeButton() {
    element(by.id('accountMenu')).click();
    element(by.cssContainingText('span', 'Go Home')).click();
  }
}
