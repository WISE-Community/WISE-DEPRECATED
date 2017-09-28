'use strict';

var _protractor = require('protractor');

var saveButton = (0, _protractor.element)(by.id('saveButton'));
var saveMessage = (0, _protractor.element)(by.binding('openResponseController.saveMessage.text'));
var submitButton = (0, _protractor.element)(by.id('submitButton'));
var textarea = (0, _protractor.element)(by.model('openResponseController.studentResponse'));
var nodeDropDownMenu = (0, _protractor.element)(by.model("stepToolsCtrl.toNodeId"));

function hasClass(element, cls) {
  return element.getAttribute('class').then(function (classes) {
    return classes.split(' ').indexOf(cls) !== -1;
  });
}

function shouldBeDisabled(elements) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = elements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _element = _step.value;

      expect(hasClass(_element, "disabled"));
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

function shouldBeEnabled(elements) {
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = elements[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _element2 = _step2.value;

      expect(!hasClass(_element2, "disabled"));
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

function shouldBePresent(elements) {
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = elements[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _element3 = _step3.value;

      expect(_element3.isPresent()).toBeTruthy();
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

function shouldBeAbsent(elements) {
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = elements[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var _element4 = _step4.value;

      expect(_element4.isPresent()).toBeFalsy();
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

describe('WISE5 Open Response Component', function () {

  beforeAll(function () {
    _protractor.browser.get('http://localhost:8080/wise/project/demo#/vle/node2');
    _protractor.browser.wait(function () {
      return nodeDropDownMenu.isPresent();
    }, 5000);
  });

  it('should show open response component', function () {
    expect(nodeDropDownMenu.getText()).toBe('1.2: Open Response Step');

    var nodeContent = (0, _protractor.element)(by.cssContainingText('.node-content', 'This is a step where students enter text.'));
    shouldBePresent([nodeContent, textarea, saveButton, submitButton]);
    shouldBeAbsent([saveMessage]);
    shouldBeEnabled([textarea]);
    shouldBeDisabled([saveButton, submitButton]);
  });

  it('should allow students to type text and edit', function () {
    var firstSentence = 'Here is my first sentence. ';
    var secondSentence = 'Here is my second sentence.';
    textarea.sendKeys(firstSentence);
    shouldBeEnabled([saveButton, submitButton]);

    saveButton.click();
    expect(saveMessage.getText()).toContain("Saved");
    shouldBeDisabled([saveButton]);
    shouldBeEnabled([submitButton]);

    submitButton.click();
    expect(saveMessage.getText()).toContain("Submitted");
    shouldBeEnabled([saveButton, submitButton]);

    // should be able to edit your text even after submitting
    textarea.sendKeys(secondSentence);
    expect(textarea.getAttribute('value')).toEqual(firstSentence + secondSentence);
  });
});
//# sourceMappingURL=openResponse.spec.js.map
