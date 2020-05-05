import * as common from '../../common.js';
import ProjectPage from './project.page.js';

/*
 * E2E tests for the project view in the Authoring Tool
 */
describe('WISE Authoring Tool Project View', () => {

  const projectId = browser.params.authoringProjectId;

  beforeAll(() => {
    const page = new ProjectPage();
    const params = browser.params;
    isAngularSite(false);
    browser.get('http://localhost:8080/wise/login');
    $('#username').sendKeys(params.login.user);
    $('#password').sendKeys(params.login.password);
    $('#signInButton').click();
  });

  beforeEach(() => {
    const page = new ProjectPage();
    isAngularSite(true);
    browser.get('http://localhost:8080/wise/author#!/project/' + projectId);
    browser.refresh();  // needed for this issue https://github.com/angular/protractor/issues/2643
    browser.wait(() => {
      return page.projectTitleSpan.isPresent()
    }, 5000, 'Authoring Tool didn\'t load properly');
  });

  it('should have elements on the page in the project view', () => {
    const page = new ProjectPage();
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

  it('should create a new activity', () => {
    const page = new ProjectPage();
    const ms = new Date().getTime();
    const newActivityTitle = 'Activity 1 ' + ms;
    common.shouldBeDisplayed(page.createNewActivityButton);
    page.clickCreateNewActivityButton();
    page.setCreateGroupTitle('Activity 1 ' + ms);
    page.clickCreateGroupCreateButton();
    page.clickToInsertActivityAfter(0);
    expect(page.getTitleOfActivity(1)).toBe('1: ' + newActivityTitle);
  });

  it('should create a new step as the first step in the first activity', () => {
    const page = new ProjectPage();
    const ms = new Date().getTime();
    const newStepTitle = 'Step 1 ' + ms;
    common.shouldBeDisplayed(page.createNewStepButton);
    page.clickCreateNewStepButton();
    page.setCreateNodeTitle(newStepTitle);
    page.clickCreateNodeCreateButton();
    page.clickToInsertStepInside(0);
    expect(page.getTitleOfStep(1, 0)).toBe('1.1: ' + newStepTitle);
  });

  it('should create a new step as the second step in the first activity', () => {
    const page = new ProjectPage();
    const ms = new Date().getTime();
    const newStepTitle = 'Step 2 ' + ms;
    common.shouldBeDisplayed(page.createNewStepButton);
    page.clickCreateNewStepButton();
    page.setCreateNodeTitle(newStepTitle);
    page.clickCreateNodeCreateButton();
    page.clickToInsertStepAfter(1, 1);
    expect(page.getTitleOfStep(1, 1)).toBe('1.2: ' + newStepTitle);
  });

  it('should open a step', () => {
    const page = new ProjectPage();
    page.clickOnStep(1, 1);
    common.shouldBeDisplayed(page.addComponentButton);
    common.shouldBeDisplayed(page.backToProjectButton);
  });

  it('should open a step and then go back to the project view', () => {
    const page = new ProjectPage();
    page.clickOnStep(1, 1);
    common.shouldBeDisplayed(page.addComponentButton);
    common.shouldBeDisplayed(page.backToProjectButton);
    page.clickStepBackButton();
  });

  it('should allow author to jump to step authoring using the navigation drop-down menu', () => {
    const page = new ProjectPage();
    page.clickOnAStepIntheStepSelectMenu(1, 2);
    common.shouldBeDisplayed(element(by.cssContainingText('h6', 'Step Title 1.2:')));
  });

  it('should display my assets', () => {
    const page = new ProjectPage();
    page.clickAssetButton();
    common.shouldBeDisplayed(element(by.cssContainingText('span', 'File Manager')));
  });

  it('should display notebook settings', () => {
    const page = new ProjectPage();
    page.clickNotebookButton();
    common.shouldBeDisplayed(element(by.cssContainingText('span', 'Notebook Settings')));
  });

  it('should display info settings', () => {
    const page = new ProjectPage();
    page.clickInfoButton();
    common.shouldBeDisplayed(element(by.cssContainingText('span', 'Project Info')));
  });

  it('should allow user to preview the project', () => {
    const page = new ProjectPage();
    page.clickPreviewProjectButton();
    // Clicking on the preview project button should open the preview in a new window
    browser.getAllWindowHandles().then((handles) => {
      browser.switchTo().window(handles[1]).then(() => {
        browser.refresh();  // needed for this issue https://github.com/angular/protractor/issues/2643
        expect(browser.getCurrentUrl()).toContain('http://localhost:8080/wise/project/' + projectId + '#!/vle/');
        // close the current window
        browser.driver.close().then(() => {
          // switch to the main authoring window
          browser.switchTo().window(handles[0]);
        });
      });
    });
  });

  it('should allow user to preview the project without constraints', () => {
    const page = new ProjectPage();
    page.clickPreviewProjectWithoutConstraintsButton();
    // Clicking on the preview project button should open the preview in a new window
    browser.getAllWindowHandles().then((handles) => {
      browser.switchTo().window(handles[1]).then(() => {
        browser.refresh();  // needed for this issue https://github.com/angular/protractor/issues/2643
        expect(browser.getCurrentUrl()).toContain('http://localhost:8080/wise/project/' + projectId + '?constraints=false#/vle/');
        // close the current window
        browser.driver.close().then(() => {
          // switch to the main authoring window
          browser.switchTo().window(handles[0]);
        });
      });
    });
  });

  it('should exit the authoring tool from project listing view and go to teacher home', () => {
    const page = new ProjectPage();
    page.clickGoHomeButton();
    isAngularSite(false);
    expect(browser.getCurrentUrl()).toMatch(/.*\/wise\//);
   });

  // TODO: add test for copying a step

});
