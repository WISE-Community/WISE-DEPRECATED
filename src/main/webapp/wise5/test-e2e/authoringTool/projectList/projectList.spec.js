import * as common from '../../common.js';
import ProjectListPage from './projectList.page.js';

/*
 * E2E tests for the project list view in the Authoring Tool
 */
describe('WISE Authoring Tool Project List View', () => {
  let projectId = null; // this will be set when we create a new project.

  beforeAll(() => {
    const params = browser.params;
    isAngularSite(false);
    browser.get('http://localhost:8080/wise/login');
    $('#username').sendKeys(params.login.user);
    $('#password').sendKeys(params.login.password);
    $('#signInButton').click();
  });

  beforeEach(() => {
    const page = new ProjectListPage();
    isAngularSite(true);
    browser.get('http://localhost:8080/wise/author');
    browser.refresh(); // needed for this issue https://github.com/angular/protractor/issues/2643
    browser.wait(function() {
      return page.createNewProjectButton.isPresent()
    }, 5000, 'Authoring Tool didn\'t load properly');
  });

  it('should cancel creating a new project', () => {
    const page = new ProjectListPage();
    page.createNewProject();
    common.shouldBeDisplayed(page.newProjectTitleInput);
    page.cancelCreateProject();
    common.shouldBeAbsent(page.newProjectTitleInput);
    common.urlShouldBe('http://localhost:8080/wise/author#/');
  });

  it('should create a new project and open it', () => {
    const page = new ProjectListPage();
    page.createNewProject();
    common.shouldBeDisplayed(page.newProjectTitleInput);
    page.setNewProjectTitle('My Science Project');
    page.createProject();
    common.urlShouldMatch('http://localhost:8080/wise/author#!/project/[0-9]+');

    // get the new project id and set it in the global variable
    browser.getCurrentUrl().then((url) => {
        browser.params.projectId = url.substring(url.lastIndexOf("/") + 1);
    });
  });

  it('should open an existing project', () => {
    const page = new ProjectListPage();
    const projects = page.projects;
    projects.get(0).click();
    common.urlShouldMatch('http://localhost:8080/wise/author#!/project/[0-9]+');
  });

  // TODO: add test for copying a project
});
