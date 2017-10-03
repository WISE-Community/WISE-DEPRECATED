let OpenResponsePage = function() {
  this.saveButton = element(by.id('saveButton'));
  this.saveMessage = element(
    by.binding('openResponseController.saveMessage.text'));
  this.submitButton = element(by.id('submitButton'));
  this.submitMessage = element(by.binding('openResponseController.saveMessage.text'));
  this.textarea = element(by.model('openResponseController.studentResponse'));

  this.getPrompt = function() {
    return element(by.id('prompt'));
  };

  this.save = function() {
    this.saveButton.click();
  };

  this.submit = function() {
    this.submitButton.click();
  };

  this.typeResponse = function(response) {
    this.textarea.sendKeys(response);
  };

  this.textareaShouldSay = function(expectedTextareaText) {
    expect(this.textarea.getAttribute('value')).toEqual(expectedTextareaText);
  };
};

module.exports = OpenResponsePage;
