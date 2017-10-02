import * as common from '../common.js';

let MultipleChoicePage = function() {
  this.saveButton = element(by.id('saveButton'));
  this.saveMessage = element(by.binding('multipleChoiceController.saveMessage.text'));
  this.submitButton = element(by.id('submitButton'));
  this.submitMessage = element(by.binding('multipleChoiceController.saveMessage.text'));
  this.nextButton = element(by.id('nextButton'));
  this.prevButton = element(by.id('prevButton'));
  this.radioGroup = element(by.model('multipleChoiceController.studentChoices'));
  this.nodeDropDownMenu = element(by.model("stepToolsCtrl.toNodeId"));

  this.getPrompt = function() {
    return element(by.id('prompt'));
  };

  this.save = function() {
    this.saveButton.click();
  };

  this.submit = function() {
    this.submitButton.click();
  };
};

module.exports = MultipleChoicePage;
