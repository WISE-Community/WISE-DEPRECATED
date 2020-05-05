import * as common from '../../common.js';
import InfoPage from './info.page.js';

/**
 * E2E tests for Authoring Tool Info view
 */
describe('WISE Authoring Tool Info View', () => {

  const projectId = browser.params.authoringProjectId;

  beforeAll(() => {
    const page = new InfoPage();
    const params = browser.params;
    isAngularSite(false);
    browser.get('http://localhost:8080/wise/login');
    $('#username').sendKeys(params.login.user);
    $('#password').sendKeys(params.login.password);
    $('#signInButton').click();
  });

  beforeEach(() => {
    const page = new InfoPage();
    isAngularSite(true);
    browser.get('http://localhost:8080/wise/author#!/project/' + projectId + '/info');
    browser.refresh(); // needed for this issue https://github.com/angular/protractor/issues/2643
    browser.wait(function() {
      return page.projectTitleSpan.isPresent()
    }, 5000, 'Authoring Tool didn\'t load properly');
  });

  it('should allow user to change the project title', () => {
    const page = new InfoPage();
    expect(page.projectTitleSpan.getText()).toEqual('My Science Project');
    element.all(by.repeater('metadataField in projectInfoController.metadataAuthoring.fields')).then((metadataField) => {
      const titleInput = metadataField[0].element(by.model('projectInfoController.metadata[metadataField.key]'));
      expect(titleInput.getAttribute('value')).toEqual('My Science Project');  // should show the title of the project
      titleInput.clear();  // clear out what's there.
      titleInput.sendKeys('My Awesome Science Project');
    });
    page.clickProjectHomeButton();
    expect(page.projectTitleSpan.getText()).toEqual('My Awesome Science Project');
  });

});
