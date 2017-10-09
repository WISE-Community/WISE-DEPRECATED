export default class StepPage {
  constructor() {

    // common Authoring Tool elements
    this.projectTitleSpan = element(by.id('projectTitleSpan'));
    this.stepSelectMenu = element(by.id('stepSelectMenu'));
    this.previousNodeButton = element(by.id('previousNodeButton'));
    this.nextNodeButton = element(by.id('nextNodeButton'));

    // step view top buttons
    this.backToProjectButton = element(by.id('backToProjectButton'));
    this.addComponentButton = element(by.id('addComponentButton'));
    this.importComponentButton = element(by.id('importComponentButton'));
    this.moveComponentButton = element(by.id('moveComponentButton'));
    this.copyComponentButton = element(by.id('copyComponentButton'));
    this.deleteComponentButton = element(by.id('deleteComponentButton'));
    this.editStepRubricButton = element(by.id('editStepRubricButton'));
    this.stepAdvancedButton = element(by.id('stepAdvancedButton'));
    this.stepUndoButton = element(by.id('stepUndoButton'));
    this.stepPreviewButton = element(by.id('stepPreviewButton'));
    this.stepPreviewWithouConstraintsButton = element(by.id('stepPreviewWithouConstraintsButton'));

    // step authoring elements
    this.stepTitleInput = element(by.model('nodeAuthoringController.node.title'));
  }

  /**
   * Enter text into the step title input.
   * @param title the new step title
   */
  setStepTitle(title) {
    this.stepTitleInput.clear();
    this.stepTitleInput.sendKeys(title);
  }

  /**
   * Click the add component button which will display the component types the
   * author can choose to add.
   */
  clickAddComponentButton() {
    this.addComponentButton.click();
  }

  /**
   * Click on a component type for adding a new component.
   * @param componentType The component type. Example 'Open Response'.
   */
  clickComponentType(componentType) {
    element(by.cssContainingText('md-grid-tile', componentType)).click();
  }

  /**
   * Click the insert button.
   * @param position The position the component will be placed in. The range of
   * allowable values are 0 and up.
   */
  clickInsertButton(position) {
    element.all(by.css('.moveComponentButton')).get(position).click();
  }

  /**
   * Click the previous step button.
   */
  clickPreviousNodeButton() {
    this.previousNodeButton.click();
  }

  /**
   * Click the next step button.
   */
  clickNextNodeButton() {
    this.nextNodeButton.click();
  }

  /**
   * Click the checkbox for a component.
   * @param componentNumber The component number. The range of allowed values
   * are 1 and up.
   */
  clickTheComponentCheckbox(componentNumber) {
    element.all(by.css('.component')).get(componentNumber - 1).element(by.css('md-checkbox')).click();
  }

  /**
   * Click the delete component button.
   */
  clickDeleteComponentButton() {
    this.deleteComponentButton.click();
  }
}
