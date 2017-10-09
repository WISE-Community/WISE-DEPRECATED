export default class MultipleChoicePage {
  constructor() {
    this.saveButton = element(by.id('saveButton'));
    this.saveMessage = element(by.binding('multipleChoiceController.saveMessage.text'));
    this.submitButton = element(by.id('submitButton'));
    this.submitMessage = element(by.binding('multipleChoiceController.saveMessage.text'));
    this.nextButton = element(by.id('nextButton'));
    this.prevButton = element(by.id('prevButton'));
    this.radioGroup = element(by.model('multipleChoiceController.studentChoices'));
    this.nodeDropDownMenu = element(by.model("stepToolsCtrl.toNodeId"));
  }

  getPrompt() {
    return element(by.id('prompt'));
  }

  save() {
    this.saveButton.click();
  }

  submit() {
    this.submitButton.click();
  }
}
