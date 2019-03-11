import {browser, element} from 'protractor';
import * as common from '../common.js';
import VLEPage from '../vlePage.js';

describe('WISE5 Student VLE Preview', () => {

  function clickOnPageBody() {
    element(by.xpath('//body')).click();
  }

  beforeEach(() => {
    const vle = new VLEPage();
    browser.get('http://localhost:8080/wise/project/demo#/vle/node1');
    browser.wait(function() {
      return vle.nodeDropDownMenu.isPresent()
    }, 5000, 'VLE didn\'t load properly').then(() => {
      expect(browser.getTitle()).toEqual('WISE');
    });
  });

  it('should show first step and default UI elements on the page', () => {
    const vle = new VLEPage();
    vle.nodeSelectMenuShouldSay('1.1: HTML Step');
    common.shouldBePresent(vle.prevButton, vle.nextButton, vle.closeNodeButton,
      vle.accountButton, vle.accountMenu, vle.notificationButton, vle.notificationMenu);
    common.shouldBeHidden(vle.accountMenu, vle.notificationMenu);
    const nodeContent = element(by.cssContainingText('.node-content','This is a step where authors can enter their own html.'));
    common.shouldBePresent(nodeContent);
    common.shouldBeEnabled(vle.nextButton);
    common.shouldBeDisabled(vle.prevButton);
  });

  it('should navigate next and previous steps using the buttons', () => {
    const vle = new VLEPage();
    vle.goToNextStep();
    common.urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node2');
    vle.nodeSelectMenuShouldSay('1.2: Open Response Step');
    common.shouldBeEnabled(vle.prevButton, vle.nextButton);
    let nodeContent = element(by.cssContainingText('.node-content','This is a step where students enter text.'));
    common.shouldBePresent(nodeContent);

    vle.goToNextStep();
    common.urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node3');
    vle.nodeSelectMenuShouldSay('1.3: Open Response Step Auto Graded');
    nodeContent = element(by.cssContainingText('.node-content','Explain how the sun helps animals survive.'));
    common.shouldBePresent(nodeContent);

    vle.goToPreviousStep();
    common.urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node2');
    vle.nodeSelectMenuShouldSay('1.2: Open Response Step');
  });

  it('should allow user to jump to a step using the navigation drop-down menu', () => {
    const vle = new VLEPage();
    vle.openDropDownMenu();
    element.all(by.repeater("item in stepToolsCtrl.idToOrder | toArray | orderBy : 'order'")).then((stepSelectOptions) => {
      expect(stepSelectOptions[1].element(by.css('.node-select__text')).getText()).toBe("1.1: HTML Step");
      expect(stepSelectOptions[7].element(by.css('.node-select__text')).getText()).toBe("1.7: Challenge Question Step");
      stepSelectOptions[7].element(by.css('.node-select__text')).click();
      common.urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node7');
    });
  });

  it('should display the group view and allow user to collapse/expand group navitems', () => {
    const vle = new VLEPage();
    vle.toggleConstraints();
    vle.closeNode();
    common.urlShouldBe('http://localhost:8080/wise/project/demo#/vle/group1');

    element.all(by.repeater('id in navCtrl.rootNode.ids')).then((groupNavItems) => {
      const activity1 = groupNavItems[0];
      const activity2 = groupNavItems[1];

      expect(activity1.element(by.className('md-title')).getText()).toEqual('1: Example Steps');
      expect(activity2.element(by.className('md-title')).getText()).toEqual('2: Example Features');

      // activity 1 should be expanded, Activity 2 should be collapsed
      expect(common.hasClass(activity1, 'expanded')).toBe(true);
      expect(common.hasClass(activity2, 'expanded')).toBe(false);

      // check for completion icons for steps in Activity 1
      activity1.all(by.repeater('childId in navitemCtrl.item.ids')).then((stepNavItems) => {

        // step 1.1 should be completed because it's an HTML step and we visited it
        // (the previous step we were on) should be highlighted because we came from it
        expect(stepNavItems[0].getText()).toBe('school\n1.1: HTML Step check_circle');
        expect(common.hasClass(stepNavItems[0], 'prev')).toBe(true);
        expect(stepNavItems[0].element(by.cssContainingText('.material-icons', 'check_circle')).isPresent()).toBeTruthy();

        // step 1.2 should not be completed yet
        expect(stepNavItems[1].getText()).toBe('school\n1.2: Open Response Step');
        expect(stepNavItems[1].element(by.cssContainingText('.material-icons', 'check_circle')).isPresent()).toBeFalsy();

        // step 1.7 should not be completed yet
        expect(stepNavItems[6].getText()).toBe('school\n1.7: Challenge Question Step');
        expect(stepNavItems[6].element(by.cssContainingText('.material-icons', 'check_circle')).isPresent()).toBeFalsy();
      });

      // activity 2 should not be expanded yet, so expand it
      activity2.element(by.className('nav-item--card__content')).click();
      expect(common.hasClass(activity2, 'expanded')).toBe(true);
      expect(common.hasClass(activity1, 'expanded')).toBe(true);

      // check that steps in activity 2 displays the step title and icon
      activity2.all(by.repeater('childId in navitemCtrl.item.ids')).then((stepNavItems) => {
        expect(stepNavItems[0].getText()).toBe('school\n2.1: Show Previous Work 1');
        expect(stepNavItems[1].getText()).toBe('school\n2.2: Show Previous Work 2');
        expect(stepNavItems[2].getText()).toBe('school\n2.3: Import Work 1');
        // go to step 2.3.
        stepNavItems[2].element(by.tagName('button')).click();
        common.urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node22');
      });
    });
  });

  it('should allow user to jump to a step by changing the URL path', () => {
    const vle = new VLEPage();
    // the user changes the URL
    browser.get('http://localhost:8080/wise/project/demo#/vle/node11');
    browser.wait(function() {
      return vle.nodeDropDownMenu.isPresent()
    }, 5000, 'VLE didn\'t load properly').then(() => {
      vle.nodeSelectMenuShouldSay('1.11: Draw Step');
    });
    browser.get('http://localhost:8080/wise/project/demo#/vle/node14');
    browser.wait(function() {
      return vle.nodeDropDownMenu.isPresent()
    }, 5000, 'VLE didn\'t load properly').then(() => {
      vle.nodeSelectMenuShouldSay('1.15: Table Step');
    });
  });

  it('should allow preview user to view the account menu', () => {
    const vle = new VLEPage();
    vle.openAccountMenu();
    common.shouldBeDisplayed(vle.accountMenu);

    // account menu should have the preview user account icon and the exit and sign out buttons
    element.all(by.repeater('username in themeCtrl.workgroupUsernames')).then((workgroupNames) => {
      expect(workgroupNames[0].getText()).toBe('Preview Team');
    });

    common.shouldBePresent(vle.exitButton, vle.logOutButton);

    browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
    common.shouldBeHidden(vle.accountMenu);

    vle.openAccountMenu();
    common.shouldBeDisplayed(vle.accountMenu);

    clickOnPageBody();
    common.shouldBeHidden(vle.accountMenu);
  });

  it('should allow preview user to view the notification menu', () => {
    const vle = new VLEPage();
    vle.openNotificationMenu();
    common.shouldBeDisplayed(vle.notificationMenu);

    // notification menu should have the Alerts title and say that there are no alerts.
    const notificationDialogTitle = element(by.xpath('//md-toolbar/span/span[@translate="notificationsTitle"]'));
    expect(notificationDialogTitle.isDisplayed()).toBeTruthy();
    expect(notificationDialogTitle.getText()).toEqual("Alerts");

    const notificationDialogContent = element(by.xpath('//md-content/div/span[@translate="noAlerts"]'));
    expect(notificationDialogContent.isDisplayed()).toBeTruthy();
    expect(notificationDialogContent.getText()).toEqual("Hi there! You currently have no alerts.");

    browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
    common.shouldBeHidden(vle.notificationMenu);

    vle.openNotificationMenu();
    common.shouldBeDisplayed(vle.notificationMenu);

    clickOnPageBody();
    common.shouldBeHidden(vle.notificationMenu);
  });
});
