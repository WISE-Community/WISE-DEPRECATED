'use strict';

var _common = require('../../common.js');

var common = _interopRequireWildcard(_common);

var _notebookPage = require('./notebook.page.js');

var _notebookPage2 = _interopRequireDefault(_notebookPage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * E2E tests for the notebook view in the Authoring Tool
 */
describe('WISE Authoring Tool Notebook View', function () {

  var projectId = browser.params.authoringProjectId;

  beforeAll(function () {
    var page = new _notebookPage2.default();
    var params = browser.params;
    isAngularSite(false);
    browser.get('http://localhost:8080/wise/login');
    $('#username').sendKeys(params.login.user);
    $('#password').sendKeys(params.login.password);
    $('#signInButton').click();
  });

  beforeEach(function () {
    var page = new _notebookPage2.default();
    isAngularSite(true);
    browser.get('http://localhost:8080/wise/author#/project/' + projectId + '/notebook');
    browser.refresh(); // needed for this issue https://github.com/angular/protractor/issues/2643
    browser.wait(function () {
      return page.projectTitleSpan.isPresent();
    }, 5000, 'Authoring Tool didn\'t load properly');
  });

  it('should allow the user to enable the notebook', function () {
    var page = new _notebookPage2.default();
    page.isNotebookEnabled().then(function (isEnabled) {
      if (isEnabled) {
        page.clickEnableNotebookCheckbox();
      }
      common.shouldBeHidden(page.notebookLabel);
      page.clickEnableNotebookCheckbox();
      common.shouldBeDisplayed(page.notebookLabel);
    });
  });

  it('should allow the user to change the notebook label', function () {
    var page = new _notebookPage2.default();
    var ms = new Date().getTime();
    page.isNotebookEnabled().then(function (isEnabled) {
      if (!isEnabled) {
        page.clickEnableNotebookCheckbox();
      }
      common.shouldBeDisplayed(page.notebookLabel);
      page.setNotebookLabel('Notebook ' + ms);
      page.clickProjectHomeButton();
      page.clickNotebookButton();
      expect(page.notebookLabel.getAttribute('value')).toEqual('Notebook ' + ms);
    });
  });
});
//# sourceMappingURL=notebook.spec.js.map
