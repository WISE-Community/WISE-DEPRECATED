export default class OpenResponsePage {
  constructor() {
    this.saveButton = element(by.id('saveButton'));
    this.saveMessage = element(
      by.binding('openResponseController.saveMessage.text'));
    this.submitButton = element(by.id('submitButton'));
    this.submitMessage = element(by.binding('openResponseController.saveMessage.text'));
    this.textarea = element(by.model('openResponseController.studentResponse'));
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

  typeResponse(response) {
    this.textarea.sendKeys(response);
  }
}
