export default class NotebookPage {
  constructor() {
    this.projectTitleSpan = element(by.id('projectTitleSpan'));

    // side bar buttons
    this.projectHomeButton = element(by.id('projectHomeButton'));
    this.notebookButton = element(by.id('notebookButton'));

    this.enableNotebookCheckbox = element(by.id('enableNotebookCheckbox'));
    this.notebookLabel = element(by.model('authorNotebookController.project.notebook.label'));
  }

  /**
   * Click the 'Enable Notebook' checkbox
   */
  clickEnableNotebookCheckbox() {
    this.enableNotebookCheckbox.click();
  }

  /**
   * Check if the notebook checkbox is checked
   * @return whether the notebook checkbox is checked
   */
  isNotebookEnabled() {
    return this.enableNotebookCheckbox.isSelected();
  }

  /**
   * Set the label for the notebook
   * @param label The text for the notebook label.
   */
  setNotebookLabel(label) {
    this.notebookLabel.clear();
    this.notebookLabel.sendKeys(label);
  }

  /**
   * Click the project home button on the left side bar to go back to the
   * project view.
   */
  clickProjectHomeButton() {
    this.projectHomeButton.click();
  }

  /**
   * Click the notebook button on the left side bar to go back to the notebook
   * view.
   */
  clickNotebookButton() {
    this.notebookButton.click();
  }
}
