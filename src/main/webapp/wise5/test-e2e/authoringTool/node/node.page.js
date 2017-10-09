'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StepPage = function () {
  function StepPage() {
    _classCallCheck(this, StepPage);

    // common Authoring Tool elements
    this.projectTitleSpan = element(by.id('projectTitleSpan'));
    this.stepSelectMenu = element(by.id('stepSelectMenu'));
    this.previousNodeButton = element(by.id('previousNodeButton'));
    this.nextNodeButton = element(by.id('nextNodeButton'));

    // step view top buttons
    this.backToProjectButton = element(by.id('backToProjectButton'));
    this.addComponentButton = element(by.id('addComponentButton'));
    this.importComponentButton = element(by.id('importComponentButton'));
    this.moveComponentButton = element(by.id('moveComponentButton'));
    this.copyComponentButton = element(by.id('copyComponentButton'));
    this.deleteComponentButton = element(by.id('deleteComponentButton'));
    this.editStepRubricButton = element(by.id('editStepRubricButton'));
    this.stepAdvancedButton = element(by.id('stepAdvancedButton'));
    this.stepUndoButton = element(by.id('stepUndoButton'));
    this.stepPreviewButton = element(by.id('stepPreviewButton'));
    this.stepPreviewWithouConstraintsButton = element(by.id('stepPreviewWithouConstraintsButton'));

    // step authoring elements
    this.stepTitleInput = element(by.model('nodeAuthoringController.node.title'));
  }

  /**
   * Enter text into the step title input.
   * @param title the new step title
   */


  _createClass(StepPage, [{
    key: 'setStepTitle',
    value: function setStepTitle(title) {
      this.stepTitleInput.clear();
      this.stepTitleInput.sendKeys(title);
    }

    /**
     * Click the add component button which will display the component types the
     * author can choose to add.
     */

  }, {
    key: 'clickAddComponentButton',
    value: function clickAddComponentButton() {
      this.addComponentButton.click();
    }

    /**
     * Click on a component type for adding a new component.
     * @param componentType The component type. Example 'Open Response'.
     */

  }, {
    key: 'clickComponentType',
    value: function clickComponentType(componentType) {
      element(by.cssContainingText('md-grid-tile', componentType)).click();
    }

    /**
     * Click the insert button.
     * @param position The position the component will be placed in. The range of
     * allowable values are 0 and up.
     */

  }, {
    key: 'clickInsertButton',
    value: function clickInsertButton(position) {
      element.all(by.css('.moveComponentButton')).get(position).click();
    }

    /**
     * Click the previous step button.
     */

  }, {
    key: 'clickPreviousNodeButton',
    value: function clickPreviousNodeButton() {
      this.previousNodeButton.click();
    }

    /**
     * Click the next step button.
     */

  }, {
    key: 'clickNextNodeButton',
    value: function clickNextNodeButton() {
      this.nextNodeButton.click();
    }

    /**
     * Click the checkbox for a component.
     * @param componentNumber The component number. The range of allowed values
     * are 1 and up.
     */

  }, {
    key: 'clickTheComponentCheckbox',
    value: function clickTheComponentCheckbox(componentNumber) {
      element.all(by.css('.component')).get(componentNumber - 1).element(by.css('md-checkbox')).click();
    }

    /**
     * Click the delete component button.
     */

  }, {
    key: 'clickDeleteComponentButton',
    value: function clickDeleteComponentButton() {
      this.deleteComponentButton.click();
    }
  }]);

  return StepPage;
}();

exports.default = StepPage;
//# sourceMappingURL=node.page.js.map
