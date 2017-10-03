
let nodeDropDownMenu = element(by.model("stepToolsCtrl.toNodeId"));
let nextButton = element(by.id('nextButton'));
let prevButton = element(by.id('prevButton'));
let closeNodeButton = element(by.id('closeNodeButton'));
let accountButton = element(by.id('openAccountMenuButton'));
let accountMenu = element(by.cssContainingText('.md-open-menu-container','Preview Team'));
let notificationButton = element(by.id('viewNotificationsButton'));
let notificationMenu = element(by.cssContainingText('.md-open-menu-container','Alerts'));

function hasClass(element, cls) {
  return element.getAttribute('class').then((classes) => {
    return classes.split(' ').indexOf(cls) !== -1;
  });
}

function shouldBePresent(elements) {
  for (let element of elements) {
    expect(element.isPresent()).toBeTruthy();
  }
}

function shouldBeHidden(elements) {
  for (let element of elements) {
    expect(element.getAttribute('aria-hidden')).toEqual("true")
  }
}

function shouldBeDisplayed(elements) {
  for (let element of elements) {
    expect(element.getAttribute('aria-hidden')).toEqual("false");
  }
}

function shouldBeDisabled(elements) {
  for (let element of elements) {
    expect(hasClass(element, "disabled"));
  }
}

function shouldBeEnabled(elements) {
  for (let element of elements) {
    expect(!hasClass(element, "disabled"));
  }
}

function urlShouldBe(expectedURL) {
  expect(browser.getCurrentUrl()).toEqual(expectedURL);
}

function nodeDropDownMenuShouldBe(dropDownText) {
  expect(nodeDropDownMenu.getText()).toBe(dropDownText);
}

describe('WISE5 Student VLE Preview', () => {

  beforeAll(() => {
    browser.get('http://localhost:8080/wise/project/demo#/vle/node1');
    browser.wait(function() {
      return nodeDropDownMenu.isPresent()
    }, 5000);
  });

  it('should load node 1 and show UI elements on the page', () => {
    expect(browser.getTitle()).toEqual('WISE');
    nodeDropDownMenuShouldBe('1.1: HTML Step');
    shouldBePresent([prevButton, nextButton, closeNodeButton,
      accountButton, accountMenu, notificationButton, notificationMenu]);
    shouldBeHidden([accountMenu, notificationMenu]);
  });

  it('should show step content on the page', () => {
    let nodeContent = element(by.cssContainingText('.node-content','This is a step where authors can enter their own html.'));
    shouldBePresent([nodeContent]);
    shouldBeEnabled([nextButton]);
    shouldBeDisabled([prevButton]);
  });

  it('should navigate next and previous steps using the buttons', () => {
    nextButton.click();
    urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node2');
    nodeDropDownMenuShouldBe('1.2: Open Response Step');
    shouldBeEnabled([prevButton, nextButton]);
    let nodeContent = element(by.cssContainingText('.node-content','This is a step where students enter text.'));
    shouldBePresent([nodeContent]);

    nextButton.click();
    urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node3');
    nodeDropDownMenuShouldBe('1.3: Open Response Step Auto Graded');
    nodeContent = element(by.cssContainingText('.node-content','Explain how the sun helps animals survive.'));
    shouldBePresent([nodeContent]);

    prevButton.click();
    urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node2');
    nodeDropDownMenuShouldBe('1.2: Open Response Step');
  });

  it('should allow user to jump to a step using the navigation drop-down menu', () => {
    nodeDropDownMenu.click();
    element.all(by.repeater("item in stepToolsCtrl.idToOrder | toArray | orderBy : 'order'")).then((stepSelectOptions) => {
      expect(stepSelectOptions[1].element(by.css('.node-select__text')).getText()).toBe("1.1: HTML Step");
      expect(stepSelectOptions[7].element(by.css('.node-select__text')).getText()).toBe("1.7: Challenge Question Step");
      stepSelectOptions[7].element(by.css('.node-select__text')).click();
      urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node7');
    });
  });

  it('should display the group view and allow user to collapse/expand group navitems', () => {
    closeNodeButton.click();
    urlShouldBe('http://localhost:8080/wise/project/demo#/vle/group1');

    element.all(by.repeater('id in navCtrl.rootNode.ids')).then((groupNavItems) => {
      let activity1 = groupNavItems[0];
      let activity2 = groupNavItems[1];

      expect(activity1.element(by.className('md-title')).getText()).toEqual('1: Example Steps');
      expect(activity2.element(by.className('md-title')).getText()).toEqual('2: Example Features');

      // activity 1 should be expanded, Activity 2 should be collapsed
      expect(hasClass(activity1, 'expanded')).toBe(true);
      expect(hasClass(activity2, 'expanded')).toBe(false);

      // check for completion icons for steps in Activity 1
      activity1.all(by.repeater('childId in navitemCtrl.item.ids')).then((stepNavItems) => {

        // step 1.1 should be completed because it's an HTML step and we visited it
        expect(stepNavItems[0].getText()).toBe('school\n1.1: HTML Step check_circle');
        expect(stepNavItems[0].element(by.cssContainingText('.material-icons', 'check_circle')).isPresent()).toBeTruthy();

        // step 1.2 should not be completed yet
        expect(stepNavItems[1].getText()).toBe('school\n1.2: Open Response Step');
        expect(stepNavItems[1].element(by.cssContainingText('.material-icons', 'check_circle')).isPresent()).toBeFalsy();

        // step 1.7 node7 (the previous step we were on) should be highlighted because we came from it
        expect(stepNavItems[6].getText()).toBe('school\n1.7: Challenge Question Step');
        expect(hasClass(stepNavItems[6], 'prev')).toBe(true);  // should have 'prev' class
        expect(stepNavItems[6].element(by.cssContainingText('.material-icons', 'check_circle')).isPresent()).toBeFalsy();
      });

      // activity 2 should not be expanded yet, so expand it
      activity2.element(by.className('nav-item--card__content')).click();
      expect(hasClass(activity2, 'expanded')).toBe(true);
      expect(hasClass(activity1, 'expanded')).toBe(true);  // activity 1 should also be expanded still

      // check that steps in activity 2 displays the step title and icon
      activity2.all(by.repeater('childId in navitemCtrl.item.ids')).then((stepNavItems) => {
        expect(stepNavItems[0].getText()).toBe('school\n2.1: Show Previous Work 1');
        expect(stepNavItems[1].getText()).toBe('school\n2.2: Show Previous Work 2');
        expect(stepNavItems[2].getText()).toBe('school\n2.3: Import Work 1');
        // go to step 2.3.
        stepNavItems[2].element(by.tagName('button')).click();
        urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node22');
      });
    });
  });

  it('should allow user to jump to a step by changing the URL path', () => {
    // the user changes the URL
    browser.get('http://localhost:8080/wise/project/demo#/vle/node11');
    expect(browser.getTitle()).toEqual('WISE');
    nodeDropDownMenuShouldBe('1.11: Draw Step');
  });

  it('should allow user to move to a different step with next and prev buttons', () => {
    nodeDropDownMenuShouldBe('1.11: Draw Step');

    nextButton.click();
    urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node12');
    nodeDropDownMenuShouldBe('1.12: Draw Step Auto Graded');

    nextButton.click();
    urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node13');
    nodeDropDownMenuShouldBe('1.13: Brainstorm Step');

    prevButton.click();
    urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node12');
    nodeDropDownMenuShouldBe('1.12: Draw Step Auto Graded');
  });

  it('should allow preview user to view the account menu', () => {
    accountButton.click();
    shouldBeDisplayed([accountMenu]);

    // account menu should have the preview user account icon and the exit and sign out buttons
    element.all(by.repeater('userName in themeCtrl.workgroupUserNames')).then((workgroupNames) => {
      expect(workgroupNames[0].getText()).toBe('Preview Team');
    });

    let exitButton = element(by.id('goHomeButton'));
    let logOutButton = element(by.id('signOutButton'));
    shouldBePresent([exitButton, logOutButton]);

    // hitting the escape key should dismiss the account menu
    browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
    shouldBeHidden([accountMenu]);

    accountButton.click();
    shouldBeDisplayed([accountMenu]);

    // clicking outside of the Account Menu should dismiss the Account Menu
    element(by.xpath('//body')).click();
    shouldBeHidden([accountMenu]);
  });

  it('should allow preview user to view the notification menu', () => {
    notificationButton.click();   // Open the Notification Menu by clicking on the notification button
    shouldBeDisplayed([notificationMenu]);

    // notification menu should have the Alerts title and say that there are no alerts.
    let notificationDialogTitle = element(by.xpath('//md-toolbar/span/span[@translate="notificationsTitle"]'));
    expect(notificationDialogTitle.isDisplayed()).toBeTruthy();
    expect(notificationDialogTitle.getText()).toEqual("Alerts");

    let notificationDialogContent = element(by.xpath('//md-content/div/span[@translate="noAlerts"]'));
    expect(notificationDialogContent.isDisplayed()).toBeTruthy();
    expect(notificationDialogContent.getText()).toEqual("Hi there! You currently have no alerts.");

    // hitting the escape key should dismiss the notification menu
    browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
    shouldBeHidden([notificationMenu]);

    notificationButton.click();
    shouldBeDisplayed([notificationMenu]);

    // clicking outside of the Notification Menu should dismiss the Notification Menu
    element(by.xpath('//body')).click();
    shouldBeHidden([notificationMenu]);
  });
});
