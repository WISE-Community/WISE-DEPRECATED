'use strict';

var _common = require('../../common.js');

var common = _interopRequireWildcard(_common);

var _projectPage = require('./project.page.js');

var _projectPage2 = _interopRequireDefault(_projectPage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/*
 * E2E tests for the project view in the Authoring Tool
 */
describe('WISE Authoring Tool Project View', function () {

  var projectId = browser.params.authoringProjectId;

  beforeAll(function () {
    var page = new _projectPage2.default();
    var params = browser.params;
    browser.ignoreSynchronization = true; // doesn't use Angular
    browser.get('http://localhost:8080/wise/login');
    $('#username').sendKeys(params.login.user);
    $('#password').sendKeys(params.login.password);
    $('#signInButton').click();
  });

  beforeEach(function () {
    var page = new _projectPage2.default();
    browser.ignoreSynchronization = false; // uses Angular
    browser.get('http://localhost:8080/wise/author#/project/' + projectId);
    browser.refresh(); // needed for this issue https://github.com/angular/protractor/issues/2643
    browser.wait(function () {
      return page.projectTitleSpan.isPresent();
    }, 5000, 'Authoring Tool didn\'t load properly');
  });

  it('should have elements on the page in the project view', function () {
    var page = new _projectPage2.default();
    expect(page.projectTitleSpan.getText()).toEqual('My Science Project');
    common.shouldBeDisplayed(page.projectHomeButton);
    common.shouldBeDisplayed(page.notebookButton);
    common.shouldBeDisplayed(page.assetButton);
    common.shouldBeDisplayed(page.infoButton);
    common.shouldBeDisplayed(page.projectListButton);
    common.shouldBeDisplayed(page.createNewActivityButton);
    common.shouldBeDisplayed(page.createNewStepButton);
    common.shouldBeDisplayed(page.previewProjectButton);
  });

  it('should create a new activity', function () {
    var page = new _projectPage2.default();
    var ms = new Date().getTime();
    var newActivityTitle = 'Activity 1 ' + ms;
    common.shouldBeDisplayed(page.createNewActivityButton);
    page.clickCreateNewActivityButton();
    page.setCreateGroupTitle('Activity 1 ' + ms);
    page.clickCreateGroupCreateButton();
    page.clickToInsertActivityAfter(0);
    expect(page.getTitleOfActivity(1)).toBe('1: ' + newActivityTitle);
  });

  it('should create a new step as the first step in the first activity', function () {
    var page = new _projectPage2.default();
    var ms = new Date().getTime();
    var newStepTitle = 'Step 1 ' + ms;
    common.shouldBeDisplayed(page.createNewStepButton);
    page.clickCreateNewStepButton();
    page.setCreateNodeTitle(newStepTitle);
    page.clickCreateNodeCreateButton();
    page.clickToInsertStepInside(1);
    expect(page.getTitleOfStep(1, 0)).toBe('1.1: ' + newStepTitle);
  });

  it('should create a new step as the second step in the first activity', function () {
    var page = new _projectPage2.default();
    var ms = new Date().getTime();
    var newStepTitle = 'Step 2 ' + ms;
    common.shouldBeDisplayed(page.createNewStepButton);
    page.clickCreateNewStepButton();
    page.setCreateNodeTitle(newStepTitle);
    page.clickCreateNodeCreateButton();
    page.clickToInsertStepAfter(1, 1);
    expect(page.getTitleOfStep(1, 1)).toBe('1.2: ' + newStepTitle);
  });

  it('should open a step', function () {
    var page = new _projectPage2.default();
    page.clickOnStep(1, 1);
    common.shouldBeDisplayed(page.addComponentButton);
    common.shouldBeDisplayed(page.backToProjectButton);
  });

  it('should open a step and then go back to the project view', function () {
    var page = new _projectPage2.default();
    page.clickOnStep(1, 1);
    common.shouldBeDisplayed(page.addComponentButton);
    common.shouldBeDisplayed(page.backToProjectButton);
    page.clickStepBackButton();
  });

  it('should allow author to jump to step authoring using the navigation drop-down menu', function () {
    var page = new _projectPage2.default();
    page.clickOnAStepIntheStepSelectMenu(1, 2);
    common.shouldBeDisplayed(element(by.cssContainingText('h6', 'Step Title 1.2:')));
  });

  it('should display my assets', function () {
    var page = new _projectPage2.default();
    page.clickAssetButton();
    common.shouldBeDisplayed(element(by.cssContainingText('span', 'File Manager')));
  });

  it('should display notebook settings', function () {
    var page = new _projectPage2.default();
    page.clickNotebookButton();
    common.shouldBeDisplayed(element(by.cssContainingText('span', 'Notebook Settings')));
  });

  it('should display info settings', function () {
    var page = new _projectPage2.default();
    page.clickInfoButton();
    common.shouldBeDisplayed(element(by.cssContainingText('span', 'Project Info')));
  });

  it('should allow user to preview the project', function () {
    var page = new _projectPage2.default();
    page.clickPreviewProjectButton();
    // Clicking on the preview project button should open the preview in a new window
    browser.getAllWindowHandles().then(function (handles) {
      browser.switchTo().window(handles[1]).then(function () {
        browser.refresh(); // needed for this issue https://github.com/angular/protractor/issues/2643
        expect(browser.getCurrentUrl()).toContain('http://localhost:8080/wise/project/' + projectId + '#/vle/');
        // close the current window
        browser.driver.close().then(function () {
          // switch to the main authoring window
          browser.switchTo().window(handles[0]);
        });
      });
    });
  });

  it('should allow user to preview the project without constraints', function () {
    var page = new _projectPage2.default();
    page.clickPreviewProjectWithoutConstraintsButton();
    // Clicking on the preview project button should open the preview in a new window
    browser.getAllWindowHandles().then(function (handles) {
      browser.switchTo().window(handles[1]).then(function () {
        browser.refresh(); // needed for this issue https://github.com/angular/protractor/issues/2643
        expect(browser.getCurrentUrl()).toContain('http://localhost:8080/wise/project/' + projectId + '?constraints=false#/vle/');
        // close the current window
        browser.driver.close().then(function () {
          // switch to the main authoring window
          browser.switchTo().window(handles[0]);
        });
      });
    });
  });

  it('should exit the authoring tool from project listing view and go to teacher home', function () {
    var page = new _projectPage2.default();
    page.clickGoHomeButton();
    browser.ignoreSynchronization = true;
    expect(browser.getCurrentUrl()).toMatch(/.*\/wise\//);
  });

  // TODO: add test for copying a step
});
//# sourceMappingURL=project.spec.js.map
