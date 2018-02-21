'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProjectPage = function () {
  function ProjectPage() {
    _classCallCheck(this, ProjectPage);

    this.projectTitleSpan = element(by.id('projectTitleSpan'));

    // side bar buttons
    this.projectHomeButton = element(by.id('projectHomeButton'));
    this.notebookButton = element(by.id('notebookButton'));
    this.assetButton = element(by.id('assetButton'));
    this.infoButton = element(by.id('infoButton'));
    this.projectListButton = element(by.id('projectListButton'));

    // project view top buttons
    this.createNewActivityButton = element(by.id('createNewActivityButton'));
    this.createNewStepButton = element(by.id('createNewStepButton'));
    this.advancedProjectAuthoringButton = element(by.id('advancedProjectAuthoringButton'));
    this.previewProjectButton = element(by.id('previewProjectButton'));
    this.previewProjectWithoutConstraintsButton = element(by.id('previewProjectWithoutConstraintsButton'));

    // create step elements
    this.createNodeTitle = element(by.id('createNodeTitle'));
    this.createNodeCreateButton = element(by.id('createNodeCreateButton'));

    // create activity elements
    this.createGroupTitle = element(by.id('createGroupTitle'));
    this.createGroupCreateButton = element(by.id('createGroupCreateButton'));

    // step tools
    this.stepSelectMenu = element(by.id('stepSelectMenu'));

    // step view buttons
    this.backToProjectButton = element(by.id('backToProjectButton'));
    this.addComponentButton = element(by.id('addComponentButton'));

    // advanced view buttons
    this.projectBackButton = element(by.id('projectBackButton'));
    this.showProjectJSONButton = element(by.id('showProjectJSONButton'));
    this.projectJSONString = element(by.model('projectController.projectJSONString'));
  }

  /**
   * Enter text into the create step text input.
   * @param title the new step title
   */


  _createClass(ProjectPage, [{
    key: 'setCreateNodeTitle',
    value: function setCreateNodeTitle(title) {
      this.createNodeTitle.sendKeys(title);
    }

    /**
     * Enter text into the create activity text input.
     * @param title the new activity title
     */

  }, {
    key: 'setCreateGroupTitle',
    value: function setCreateGroupTitle(title) {
      this.createGroupTitle.sendKeys(title);
    }

    /**
     * Click the create new step button to show the create step text input and
     * the button to actually create the new step.
     */

  }, {
    key: 'clickCreateNewStepButton',
    value: function clickCreateNewStepButton() {
      this.createNewStepButton.click();
    }

    /**
     * Create a new step.
     */

  }, {
    key: 'clickCreateNodeCreateButton',
    value: function clickCreateNodeCreateButton() {
      this.createNodeCreateButton.click();
    }

    /**
     * Click the create new activity button to show the create activity text input
     * and the button to actually create the new activity.
     */

  }, {
    key: 'clickCreateNewActivityButton',
    value: function clickCreateNewActivityButton() {
      this.createNewActivityButton.click();
    }

    /**
     * Create a new activity.
     */

  }, {
    key: 'clickCreateGroupCreateButton',
    value: function clickCreateGroupCreateButton() {
      this.createGroupCreateButton.click();
    }

    /**
     * Click the back button in the advanced view so that we go back to the
     * project view.
     */

  }, {
    key: 'clickProjectBackButton',
    value: function clickProjectBackButton() {
      this.projectBackButton.click();
    }

    /**
     * Click the advanced button to enter the advanced view.
     */

  }, {
    key: 'clickAdvancedProjectAuthoringButton',
    value: function clickAdvancedProjectAuthoringButton() {
      this.advancedProjectAuthoringButton.click();
    }

    /**
     * Click the show JSON button in the advanced view.
     */

  }, {
    key: 'clickShowProjectJSONButton',
    value: function clickShowProjectJSONButton() {
      this.showProjectJSONButton.click();
    }

    /**
     * Set the project JSON string into the textarea.
     * @param jsonString The project JSON string.
     */

  }, {
    key: 'setProjectJSONString',
    value: function setProjectJSONString(jsonString) {
      this.projectJSONString.clear();
      this.projectJSONString.sendKeys(jsonString);
    }

    /**
     * Click an insert button to make a step the first step in an activity.
     * @param activityNumber The activity to insert into.
     */

  }, {
    key: 'clickToInsertStepInside',
    value: function clickToInsertStepInside(activityNumber) {
      element.all(by.css('.groupHeader .insertButton')).get(activityNumber).click();
    }

    /**
     * Click an insert button to insert a step.
     * @param activityNumber The activity to insert into. The range of allowed
     * values are 1 and up.
     * TODO: Make this work because this parameter does not actually work yet.
     * @param stepNumber The step to insert after. The range of allowed values
     * are 1 and up.
     *
     * Example
     * If clickToInsertStep(1, 1) is called, the new step will become the second
     * step in activity 1.
     */

  }, {
    key: 'clickToInsertStepAfter',
    value: function clickToInsertStepAfter(activityNumber, stepNumber) {
      if (activityNumber != null && stepNumber != null) {
        // we are inserting a step in an activity after a specific step
        element(by.cssContainingText('.stepHeader', activityNumber + '.' + stepNumber + ':')).element(by.css('.insertButton')).click();
      }
    }

    /**
     * Click the insert button to insert an activity.
     * @param activityNumber The number of the activity to insert after.
     * If activityNumber == 0, we will insert the new activity at the beginning of
     * the project and it will become activity 1.
     * If activityNumber == 1, we will insert the new activity after the first
     * activity so the new activity will become activity 2.
     */

  }, {
    key: 'clickToInsertActivityAfter',
    value: function clickToInsertActivityAfter(activityNumber) {
      element.all(by.css('.groupHeader .insertButton')).get(activityNumber).click();
    }

    /**
     * Get the title of the step.
     * @param activityNumber the activity number
     * @param stepNumber the step number
     * @return The title of the step.
     */

  }, {
    key: 'getTitleOfStep',
    value: function getTitleOfStep(activityNumber, stepNumber) {
      return element.all(by.css('.stepHeader')).get(stepNumber).getText();
    }

    /**
     * Get the title of the activity.
     * @param activityNumber the activity number
     * @return The title of the activity.
     */

  }, {
    key: 'getTitleOfActivity',
    value: function getTitleOfActivity(activityNumber) {
      return element.all(by.css('.groupHeader')).get(activityNumber).getText();
    }

    /**
     * Click on a step in the project view.
     * @param activityNumber The activity number. The range of allowed values are
     * 1 and up.
     * @param stepNumber The step number. The range of allowed values are 1 and
     * up.
     */

  }, {
    key: 'clickOnStep',
    value: function clickOnStep(activityNumber, stepNumber) {
      element(by.cssContainingText('p', activityNumber + '.' + stepNumber + ':')).click();
    }

    /**
     * When in the step authoring view, click the back button to go back to the
     * project view.
     */

  }, {
    key: 'clickStepBackButton',
    value: function clickStepBackButton() {
      this.backToProjectButton.click();
    }

    /**
     * Click the step select menu at the top left of the Authoring Tool.
     */

  }, {
    key: 'clickStepSelectMenu',
    value: function clickStepSelectMenu() {
      this.stepSelectMenu.click();
    }

    /**
     * Click on a step in the step select menu.
     * @param activityNumber The activity number. The range of allowed values are
     * 1 and up.
     * @param stepNumber The step number. The range of allowed values are 1 and
     * up.
     */

  }, {
    key: 'clickOnAStepIntheStepSelectMenu',
    value: function clickOnAStepIntheStepSelectMenu(activityNumber, stepNumber) {
      this.clickStepSelectMenu();
      element(by.cssContainingText('md-option', activityNumber + '.' + stepNumber + ':')).click();
    }

    /**
     * Click on the notebook button to go to the notebook settings view
     */

  }, {
    key: 'clickNotebookButton',
    value: function clickNotebookButton() {
      this.notebookButton.click();
    }

    /**
     * Click on the assets button to go to the assets view
     */

  }, {
    key: 'clickAssetButton',
    value: function clickAssetButton() {
      this.assetButton.click();
    }

    /**
     * Click on the info button to go to the info view
     */

  }, {
    key: 'clickInfoButton',
    value: function clickInfoButton() {
      this.infoButton.click();
    }
  }, {
    key: 'clickPreviewProjectButton',
    value: function clickPreviewProjectButton() {
      this.previewProjectButton.click();
    }
  }, {
    key: 'clickPreviewProjectWithoutConstraintsButton',
    value: function clickPreviewProjectWithoutConstraintsButton() {
      this.previewProjectWithoutConstraintsButton.click();
    }
  }, {
    key: 'clickGoHomeButton',
    value: function clickGoHomeButton() {
      element(by.id('accountMenu')).click();
      element(by.cssContainingText('span', 'Go Home')).click();
    }
  }]);

  return ProjectPage;
}();

exports.default = ProjectPage;
//# sourceMappingURL=project.page.js.map
