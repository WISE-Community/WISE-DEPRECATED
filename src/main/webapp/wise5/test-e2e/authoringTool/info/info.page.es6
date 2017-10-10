export default class InfoPage {
  constructor() {
    this.projectTitleSpan = element(by.id('projectTitleSpan'));
    this.projectHomeButton = element(by.id('projectHomeButton'));
  }

  /**
   * Click the project home button on the left side bar to go back to the
   * project view.
   */
  clickProjectHomeButton() {
    this.projectHomeButton.click();
  }
}
