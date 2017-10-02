'use strict';

var nodeDropDownMenu = element(by.model("stepToolsCtrl.toNodeId"));
var nextButton = element(by.id('nextButton'));
var prevButton = element(by.id('prevButton'));
var closeNodeButton = element(by.id('closeNodeButton'));
var accountButton = element(by.id('openAccountMenuButton'));
var accountMenu = element(by.cssContainingText('.md-open-menu-container', 'Preview Team'));
var notificationButton = element(by.id('viewNotificationsButton'));
var notificationMenu = element(by.cssContainingText('.md-open-menu-container', 'Alerts'));

function hasClass(element, cls) {
  return element.getAttribute('class').then(function (classes) {
    return classes.split(' ').indexOf(cls) !== -1;
  });
}

function shouldBePresent(elements) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = elements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _element = _step.value;

      expect(_element.isPresent()).toBeTruthy();
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

function shouldBeHidden(elements) {
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = elements[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _element2 = _step2.value;

      expect(_element2.getAttribute('aria-hidden')).toEqual("true");
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
}

function shouldBeDisplayed(elements) {
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = elements[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _element3 = _step3.value;

      expect(_element3.getAttribute('aria-hidden')).toEqual("false");
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }
}

function shouldBeDisabled(elements) {
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = elements[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var _element4 = _step4.value;

      expect(hasClass(_element4, "disabled"));
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }
}

function shouldBeEnabled(elements) {
  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = elements[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var _element5 = _step5.value;

      expect(!hasClass(_element5, "disabled"));
    }
  } catch (err) {
    _didIteratorError5 = true;
    _iteratorError5 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion5 && _iterator5.return) {
        _iterator5.return();
      }
    } finally {
      if (_didIteratorError5) {
        throw _iteratorError5;
      }
    }
  }
}

function urlShouldBe(expectedURL) {
  expect(browser.getCurrentUrl()).toEqual(expectedURL);
}

function nodeDropDownMenuShouldBe(dropDownText) {
  expect(nodeDropDownMenu.getText()).toBe(dropDownText);
}

describe('WISE5 Student VLE Preview', function () {

  beforeAll(function () {
    browser.get('http://localhost:8080/wise/project/demo#/vle/node1');
    browser.wait(function () {
      return nodeDropDownMenu.isPresent();
    }, 5000);
  });

  it('should load node 1 and show UI elements on the page', function () {
    expect(browser.getTitle()).toEqual('WISE');
    nodeDropDownMenuShouldBe('1.1: HTML Step');
    shouldBePresent([prevButton, nextButton, closeNodeButton, accountButton, accountMenu, notificationButton, notificationMenu]);
    shouldBeHidden([accountMenu, notificationMenu]);
  });

  it('should show step content on the page', function () {
    var nodeContent = element(by.cssContainingText('.node-content', 'This is a step where authors can enter their own html.'));
    shouldBePresent([nodeContent]);
    shouldBeEnabled([nextButton]);
    shouldBeDisabled([prevButton]);
  });

  it('should navigate next and previous steps using the buttons', function () {
    nextButton.click();
    urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node2');
    nodeDropDownMenuShouldBe('1.2: Open Response Step');
    shouldBeEnabled([prevButton, nextButton]);
    var nodeContent = element(by.cssContainingText('.node-content', 'This is a step where students enter text.'));
    shouldBePresent([nodeContent]);

    nextButton.click();
    urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node3');
    nodeDropDownMenuShouldBe('1.3: Open Response Step Auto Graded');
    nodeContent = element(by.cssContainingText('.node-content', 'Explain how the sun helps animals survive.'));
    shouldBePresent([nodeContent]);

    prevButton.click();
    urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node2');
    nodeDropDownMenuShouldBe('1.2: Open Response Step');
  });

  it('should allow user to jump to a step using the navigation drop-down menu', function () {
    nodeDropDownMenu.click();
    element.all(by.repeater("item in stepToolsCtrl.idToOrder | toArray | orderBy : 'order'")).then(function (stepSelectOptions) {
      expect(stepSelectOptions[1].element(by.css('.node-select__text')).getText()).toBe("1.1: HTML Step");
      expect(stepSelectOptions[7].element(by.css('.node-select__text')).getText()).toBe("1.7: Challenge Question Step");
      stepSelectOptions[7].element(by.css('.node-select__text')).click();
      urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node7');
    });
  });

  it('should display the group view and allow user to collapse/expand group navitems', function () {
    closeNodeButton.click();
    urlShouldBe('http://localhost:8080/wise/project/demo#/vle/group1');

    element.all(by.repeater('id in navCtrl.rootNode.ids')).then(function (groupNavItems) {
      var activity1 = groupNavItems[0];
      var activity2 = groupNavItems[1];

      expect(activity1.element(by.className('md-title')).getText()).toEqual('1: Example Steps');
      expect(activity2.element(by.className('md-title')).getText()).toEqual('2: Example Features');

      // activity 1 should be expanded, Activity 2 should be collapsed
      expect(hasClass(activity1, 'expanded')).toBe(true);
      expect(hasClass(activity2, 'expanded')).toBe(false);

      // check for completion icons for steps in Activity 1
      activity1.all(by.repeater('childId in navitemCtrl.item.ids')).then(function (stepNavItems) {

        // step 1.1 should be completed because it's an HTML step and we visited it
        expect(stepNavItems[0].getText()).toBe('school\n1.1: HTML Step check_circle');
        expect(stepNavItems[0].element(by.cssContainingText('.material-icons', 'check_circle')).isPresent()).toBeTruthy();

        // step 1.2 should not be completed yet
        expect(stepNavItems[1].getText()).toBe('school\n1.2: Open Response Step');
        expect(stepNavItems[1].element(by.cssContainingText('.material-icons', 'check_circle')).isPresent()).toBeFalsy();

        // step 1.7 node7 (the previous step we were on) should be highlighted because we came from it
        expect(stepNavItems[6].getText()).toBe('school\n1.7: Challenge Question Step');
        expect(hasClass(stepNavItems[6], 'prev')).toBe(true); // should have 'prev' class
        expect(stepNavItems[6].element(by.cssContainingText('.material-icons', 'check_circle')).isPresent()).toBeFalsy();
      });

      // activity 2 should not be expanded yet, so expand it
      activity2.element(by.className('nav-item--card__content')).click();
      expect(hasClass(activity2, 'expanded')).toBe(true);
      expect(hasClass(activity1, 'expanded')).toBe(true); // activity 1 should also be expanded still

      // check that steps in activity 2 displays the step title and icon
      activity2.all(by.repeater('childId in navitemCtrl.item.ids')).then(function (stepNavItems) {
        expect(stepNavItems[0].getText()).toBe('school\n2.1: Show Previous Work 1');
        expect(stepNavItems[1].getText()).toBe('school\n2.2: Show Previous Work 2');
        expect(stepNavItems[2].getText()).toBe('school\n2.3: Import Work 1');
        // go to step 2.3.
        stepNavItems[2].element(by.tagName('button')).click();
        urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node22');
      });
    });
  });

  it('should allow user to jump to a step by changing the URL path', function () {
    // the user changes the URL
    browser.get('http://localhost:8080/wise/project/demo#/vle/node11');
    expect(browser.getTitle()).toEqual('WISE');
    nodeDropDownMenuShouldBe('1.11: Draw Step');
  });

  it('should allow user to move to a different step with next and prev buttons', function () {
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

  it('should allow preview user to view the account menu', function () {
    accountButton.click();
    shouldBeDisplayed([accountMenu]);

    // account menu should have the preview user account icon and the exit and sign out buttons
    element.all(by.repeater('userName in themeCtrl.workgroupUserNames')).then(function (workgroupNames) {
      expect(workgroupNames[0].getText()).toBe('Preview Team');
    });

    var exitButton = element(by.id('goHomeButton'));
    var logOutButton = element(by.id('signOutButton'));
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

  it('should allow preview user to view the notification menu', function () {
    notificationButton.click(); // Open the Notification Menu by clicking on the notification button
    shouldBeDisplayed([notificationMenu]);

    // notification menu should have the Alerts title and say that there are no alerts.
    var notificationDialogTitle = element(by.xpath('//md-toolbar/span/span[@translate="notificationsTitle"]'));
    expect(notificationDialogTitle.isDisplayed()).toBeTruthy();
    expect(notificationDialogTitle.getText()).toEqual("Alerts");

    var notificationDialogContent = element(by.xpath('//md-content/div/span[@translate="noAlerts"]'));
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
//# sourceMappingURL=previewVLE.spec.js.map
