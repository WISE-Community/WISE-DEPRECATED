'use strict';

var _common = require('../common.js');

var common = _interopRequireWildcard(_common);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var MultipleChoicePage = function MultipleChoicePage() {
  this.saveButton = element(by.id('saveButton'));
  this.saveMessage = element(by.binding('multipleChoiceController.saveMessage.text'));
  this.submitButton = element(by.id('submitButton'));
  this.submitMessage = element(by.binding('multipleChoiceController.saveMessage.text'));
  this.nextButton = element(by.id('nextButton'));
  this.prevButton = element(by.id('prevButton'));
  this.radioGroup = element(by.model('multipleChoiceController.studentChoices'));
  this.nodeDropDownMenu = element(by.model("stepToolsCtrl.toNodeId"));

  this.getPrompt = function () {
    return element(by.id('prompt'));
  };

  this.save = function () {
    this.saveButton.click();
  };

  this.submit = function () {
    this.submitButton.click();
  };
};

module.exports = MultipleChoicePage;
//# sourceMappingURL=multipleChoicePage.js.map
