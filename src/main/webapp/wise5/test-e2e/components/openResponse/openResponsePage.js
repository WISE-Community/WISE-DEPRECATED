'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OpenResponsePage = function () {
  function OpenResponsePage() {
    _classCallCheck(this, OpenResponsePage);

    this.saveButton = element(by.id('saveButton'));
    this.saveMessage = element(by.binding('openResponseController.saveMessage.text'));
    this.submitButton = element(by.id('submitButton'));
    this.submitMessage = element(by.binding('openResponseController.saveMessage.text'));
    this.textarea = element(by.model('openResponseController.studentResponse'));
  }

  _createClass(OpenResponsePage, [{
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
  }, {
    key: 'typeResponse',
    value: function typeResponse(response) {
      this.textarea.sendKeys(response);
    }
  }]);

  return OpenResponsePage;
}();

exports.default = OpenResponsePage;
//# sourceMappingURL=openResponsePage.js.map
