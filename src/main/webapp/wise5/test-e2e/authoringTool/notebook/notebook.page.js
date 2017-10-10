'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookPage = function () {
  function NotebookPage() {
    _classCallCheck(this, NotebookPage);

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


  _createClass(NotebookPage, [{
    key: 'clickEnableNotebookCheckbox',
    value: function clickEnableNotebookCheckbox() {
      this.enableNotebookCheckbox.click();
    }

    /**
     * Check if the notebook checkbox is checked
     * @return whether the notebook checkbox is checked
     */

  }, {
    key: 'isNotebookEnabled',
    value: function isNotebookEnabled() {
      return this.enableNotebookCheckbox.isSelected();
    }

    /**
     * Set the label for the notebook
     * @param label The text for the notebook label.
     */

  }, {
    key: 'setNotebookLabel',
    value: function setNotebookLabel(label) {
      this.notebookLabel.clear();
      this.notebookLabel.sendKeys(label);
    }

    /**
     * Click the project home button on the left side bar to go back to the
     * project view.
     */

  }, {
    key: 'clickProjectHomeButton',
    value: function clickProjectHomeButton() {
      this.projectHomeButton.click();
    }

    /**
     * Click the notebook button on the left side bar to go back to the notebook
     * view.
     */

  }, {
    key: 'clickNotebookButton',
    value: function clickNotebookButton() {
      this.notebookButton.click();
    }
  }]);

  return NotebookPage;
}();

exports.default = NotebookPage;
//# sourceMappingURL=notebook.page.js.map
