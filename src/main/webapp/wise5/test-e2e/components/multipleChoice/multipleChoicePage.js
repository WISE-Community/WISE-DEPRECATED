'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MultipleChoicePage = function () {
  function MultipleChoicePage() {
    _classCallCheck(this, MultipleChoicePage);

    this.saveButton = element(by.id('saveButton'));
    this.saveMessage = element(by.binding('multipleChoiceController.saveMessage.text'));
    this.submitButton = element(by.id('submitButton'));
    this.submitMessage = element(by.binding('multipleChoiceController.saveMessage.text'));
    this.nextButton = element(by.id('nextButton'));
    this.prevButton = element(by.id('prevButton'));
    this.radioGroup = element(by.model('multipleChoiceController.studentChoices'));
    this.nodeDropDownMenu = element(by.model("stepToolsCtrl.toNodeId"));
  }

  _createClass(MultipleChoicePage, [{
    key: 'getPrompt',
    value: function getPrompt() {
      return element(by.id('prompt'));
    }
  }, {
    key: 'save',
    value: function save() {
      this.saveButton.click();
    }
  }, {
    key: 'submit',
    value: function submit() {
      this.submitButton.click();
    }
  }]);

  return MultipleChoicePage;
}();

exports.default = MultipleChoicePage;
//# sourceMappingURL=multipleChoicePage.js.map
