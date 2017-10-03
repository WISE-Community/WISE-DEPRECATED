export default class VLEPage {
  constructor() {
    this.nodeDropDownMenu = element(by.model("stepToolsCtrl.toNodeId"));
    this.nextButton = element(by.id('nextButton'));
    this.prevButton = element(by.id('prevButton'));
  }

  nodeSelectMenuShouldSay(expectedMenuText) {
    expect(this.nodeDropDownMenu.getText()).toBe(expectedMenuText);
  }

  goToNextStep() {
    this.nextButton.click();
  }

  goToPreviousStep() {
    this.prevButton.click();
  }
}
