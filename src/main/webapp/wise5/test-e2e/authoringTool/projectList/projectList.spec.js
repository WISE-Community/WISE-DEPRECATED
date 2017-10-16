'use strict';

var _common = require('../../common.js');

var common = _interopRequireWildcard(_common);

var _projectListPage = require('./projectList.page.js');

var _projectListPage2 = _interopRequireDefault(_projectListPage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/*
 * E2E tests for the project list view in the Authoring Tool
 */
describe('WISE Authoring Tool Project List View', function () {
  var projectId = null; // this will be set when we create a new project.

  beforeAll(function () {
    var params = browser.params;
    isAngularSite(false);
    browser.get('http://localhost:8080/wise/login');
    $('#username').sendKeys(params.login.user);
    $('#password').sendKeys(params.login.password);
    $('#signInButton').click();
  });

  beforeEach(function () {
    var page = new _projectListPage2.default();
    isAngularSite(true);
    browser.get('http://localhost:8080/wise/author');
    browser.refresh(); // needed for this issue https://github.com/angular/protractor/issues/2643
    browser.wait(function () {
      return page.createNewProjectButton.isPresent();
    }, 5000, 'Authoring Tool didn\'t load properly');
  });

  it('should cancel creating a new project', function () {
    var page = new _projectListPage2.default();
    page.createNewProject();
    common.shouldBeDisplayed(page.newProjectTitleInput);
    page.cancelCreateProject();
    common.shouldBeAbsent(page.newProjectTitleInput);
    common.urlShouldBe('http://localhost:8080/wise/author#/');
  });

  it('should create a new project and open it', function () {
    var page = new _projectListPage2.default();
    page.createNewProject();
    common.shouldBeDisplayed(page.newProjectTitleInput);
    page.setNewProjectTitle('My Science Project');
    page.createProject();
    common.urlShouldMatch('http://localhost:8080/wise/author#/project/[0-9]+');

    // get the new project id and set it in the global variable
    browser.getCurrentUrl().then(function (url) {
      browser.params.projectId = url.substring(url.lastIndexOf("/") + 1);
    });
  });

  it('should open an existing project', function () {
    var page = new _projectListPage2.default();
    var projects = page.projects;
    projects.get(0).click();
    common.urlShouldMatch('http://localhost:8080/wise/author#/project/[0-9]+');
  });

  // TODO: add test for copying a project
});
//# sourceMappingURL=projectList.spec.js.map
