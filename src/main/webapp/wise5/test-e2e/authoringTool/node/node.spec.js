import * as common from '../../common.js';
import StepPage from './node.page.js';

/**
 * E2E tests for the step view in the Authoring Tool
 */
describe('WISE Authoring Tool Step View', () => {

  const projectId = browser.params.authoringProjectId;
  const nodeId = 'node2';

  beforeAll(() => {
    const page = new StepPage();
    const params = browser.params;
    isAngularSite(false);
    browser.get('http://localhost:8080/wise/login');
    $('#username').sendKeys(params.login.user);
    $('#password').sendKeys(params.login.password);
    $('#signInButton').click();
  });

  beforeEach(() => {
    const page = new StepPage();
    isAngularSite(true);
    browser.get('http://localhost:8080/wise/author#!/project/' + projectId + '/node/' + nodeId);
    browser.refresh();  // needed for this issue https://github.com/angular/protractor/issues/2643
    browser.wait(function() {
      return page.projectTitleSpan.isPresent()
    }, 5000, 'Authoring Tool didn\'t load properly');
  });

  it('should have elements on the page in the step view', () => {
    const page = new StepPage();
    expect(page.projectTitleSpan.getText()).toEqual('My Science Project');
    common.shouldBeDisplayed(page.backToProjectButton);
    common.shouldBeDisplayed(page.addComponentButton);
    common.shouldBeDisplayed(page.importComponentButton);
    common.shouldBeDisplayed(page.moveComponentButton);
    common.shouldBeDisplayed(page.copyComponentButton);
    common.shouldBeDisplayed(page.deleteComponentButton);
    common.shouldBeDisplayed(page.editStepRubricButton);
    common.shouldBeDisplayed(page.stepAdvancedButton);
    common.shouldBeDisplayed(page.stepUndoButton);
    common.shouldBeDisplayed(page.stepPreviewButton);
    common.shouldBeDisplayed(page.stepPreviewWithouConstraintsButton);
  });

  it('should allow the author to change the step title', () => {
    const page = new StepPage();
    const ms = new Date().getTime();
    page.setStepTitle('Step ' + ms);
    expect(page.stepSelectMenu.all(by.css('md-select-value span')).first().getText()).toContain(': Step ' + ms);
  });

  it('should add a component', () => {
    const page = new StepPage();
    page.clickAddComponentButton();
    page.clickComponentType('Open Response');
    page.clickInsertButton(0);
    common.shouldBeDisplayed(element(by.cssContainingText('span', '1. Open Response')));
  });

  it('should add two components', () => {
    const page = new StepPage();
    page.clickAddComponentButton();
    page.clickComponentType('Open Response');
    page.clickInsertButton(0);
    page.clickAddComponentButton();
    page.clickComponentType('Multiple Choice');
    page.clickInsertButton(1);
    common.shouldBeDisplayed(element(by.cssContainingText('span', '2. Multiple Choice')));
  });

  it('should allow navigating to the next step with the next arrow', () => {
    const page = new StepPage();
    page.clickNextNodeButton();
    expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#!/project/' + projectId + '/node/node3');
  });

  it('should allow navigating to the previous step with the previous arrow', () => {
    const page = new StepPage();
    page.clickPreviousNodeButton();
    expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#!/project/' + projectId + '/node/node1');
  });

  it('should delete a component', () => {
    const page = new StepPage();
    page.clickAddComponentButton();
    page.clickComponentType('Open Response');
    page.clickInsertButton(0);
    page.clickAddComponentButton();
    page.clickComponentType('Multiple Choice');
    page.clickInsertButton(1);
    common.shouldBeDisplayed(element(by.cssContainingText('span', '1. Open Response')));
    common.shouldBeDisplayed(element(by.cssContainingText('span', '2. Multiple Choice')));
    page.clickTheComponentCheckbox(2);
    page.clickDeleteComponentButton();

    /*
     * A confirmation popup will show up asking if the author is sure they
     * want to delete the component. We will click 'OK'.
     */
    const EC = protractor.ExpectedConditions;
    browser.wait(EC.alertIsPresent(), 3000);
    browser.switchTo().alert().accept();

    common.shouldBeDisplayed(element(by.cssContainingText('span', '1. Open Response')));
  });
});
