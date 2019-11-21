import * as common from '../../common.js';
import NotebookPage from './notebook.page.js';

/**
 * E2E tests for the notebook view in the Authoring Tool
 */
describe('WISE Authoring Tool Notebook View', () => {

  const projectId = browser.params.authoringProjectId;

  beforeAll(() => {
    const page = new NotebookPage();
    const params = browser.params;
    isAngularSite(false);
    browser.get('http://localhost:8080/wise/login');
    $('#username').sendKeys(params.login.user);
    $('#password').sendKeys(params.login.password);
    $('#signInButton').click();
  });

  beforeEach(() => {
    const page = new NotebookPage();
    isAngularSite(true);
    browser.get('http://localhost:8080/wise/author#!/project/' + projectId + '/notebook');
    browser.refresh();  // needed for this issue https://github.com/angular/protractor/issues/2643
    browser.wait(function() {
      return page.projectTitleSpan.isPresent()
    }, 5000, 'Authoring Tool didn\'t load properly');
  });

  it('should allow the user to enable the notebook', () => {
    const page = new NotebookPage();
    page.isNotebookEnabled().then((isEnabled) => {
      if (isEnabled) {
        page.clickEnableNotebookCheckbox();
      }
      common.shouldBeHidden(page.notebookLabel);
      page.clickEnableNotebookCheckbox();
      common.shouldBeDisplayed(page.notebookLabel);
    });
  });

  it('should allow the user to change the notebook label', () => {
    const page = new NotebookPage();
    const ms = new Date().getTime();
    page.isNotebookEnabled().then((isEnabled) => {
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
