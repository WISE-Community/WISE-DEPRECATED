'use strict';

var _protractor = require('protractor');

var saveButton = (0, _protractor.element)(by.id('saveButton'));
var saveMessage = (0, _protractor.element)(by.binding('multipleChoiceController.saveMessage.text'));
var submitButton = (0, _protractor.element)(by.id('submitButton'));
var submitMessage = (0, _protractor.element)(by.binding('multipleChoiceController.saveMessage.text'));
var nextButton = (0, _protractor.element)(by.id('nextButton'));
var prevButton = (0, _protractor.element)(by.id('prevButton'));
var radioGroup = (0, _protractor.element)(by.model('multipleChoiceController.studentChoices'));
var nodeDropDownMenu = (0, _protractor.element)(by.model("stepToolsCtrl.toNodeId"));

function hasClass(element, cls) {
  return element.getAttribute('class').then(function (classes) {
    return classes.split(' ').indexOf(cls) !== -1;
  });
}

function shouldBeSelected(choices) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = choices[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var choice = _step.value;

      expect(choice.getAttribute('aria-checked')).toBe("true");
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

function shouldBeUnselected(choices) {
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = choices[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var choice = _step2.value;

      expect(choice.getAttribute('aria-checked')).toBe("false");
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

function shouldBeDisabled(elements) {
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = elements[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _element = _step3.value;

      expect(hasClass(_element, "disabled"));
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

function shouldBeEnabled(elements) {
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = elements[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var _element2 = _step4.value;

      expect(!hasClass(_element2, "disabled"));
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

function shouldBePresent(elements) {
  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = elements[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var _element3 = _step5.value;

      expect(_element3.isPresent()).toBeTruthy();
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

function shouldBeAbsent(elements) {
  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = elements[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      var _element4 = _step6.value;

      expect(_element4.isPresent()).toBeFalsy();
    }
  } catch (err) {
    _didIteratorError6 = true;
    _iteratorError6 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion6 && _iterator6.return) {
        _iterator6.return();
      }
    } finally {
      if (_didIteratorError6) {
        throw _iteratorError6;
      }
    }
  }
}

describe('WISE5 Multiple Choice Component Select One', function () {
  var spongeBobChoice = (0, _protractor.element)(by.xpath('//md-radio-button[@aria-label="Spongebob"]'));
  var patrickChoice = (0, _protractor.element)(by.xpath('//md-radio-button[@aria-label="Patrick"]'));
  var squidwardChoice = (0, _protractor.element)(by.xpath('//md-radio-button[@aria-label="Squidward"]'));

  beforeAll(function () {
    _protractor.browser.get('http://localhost:8080/wise/project/demo#/vle/node5');
    _protractor.browser.wait(function () {
      return nodeDropDownMenu.isPresent();
    }, 5000);
  });

  it('should show multiple choice multiple answer component', function () {
    expect(nodeDropDownMenu.getText()).toBe('1.5: Multiple Choice Step Single Answer');
    var nodeContent = (0, _protractor.element)(by.cssContainingText('.node-content', 'Who lives in a pineapple under the sea?'));
    shouldBePresent([nodeContent, radioGroup, spongeBobChoice, patrickChoice, squidwardChoice, saveButton, submitButton]);
    shouldBeAbsent([saveMessage]);
    shouldBeUnselected([spongeBobChoice, patrickChoice, squidwardChoice]);
    shouldBeDisabled([saveButton, submitButton]);
  });

  it('should allow students to choose a choice and save', function () {
    spongeBobChoice.click();
    shouldBeSelected([spongeBobChoice]);
    shouldBeUnselected([patrickChoice, squidwardChoice]);
    shouldBeEnabled([saveButton, submitButton]);

    saveButton.click();
    expect(saveMessage.getText()).toContain("Saved");
    shouldBeDisabled([saveButton]);
    shouldBeEnabled([submitButton]);

    patrickChoice.click();
    shouldBeSelected([patrickChoice]);
    shouldBeUnselected([spongeBobChoice, squidwardChoice]);
    shouldBeEnabled([saveButton, submitButton]);

    submitButton.click();
    shouldBeDisabled([saveButton, saveButton]);
    expect(submitMessage.getText()).toContain("Submitted");

    // should still be able to choose after submitting
    squidwardChoice.click();
    shouldBeSelected([squidwardChoice]);
    shouldBeUnselected([spongeBobChoice, patrickChoice]);
  });

  it('should show previous chosen single-choice items', function () {
    nextButton.click();
    expect(nodeDropDownMenu.getText()).toBe('1.6: Multiple Choice Step Multiple Answer');
    prevButton.click();
    expect(nodeDropDownMenu.getText()).toBe('1.5: Multiple Choice Step Single Answer');

    shouldBeSelected([squidwardChoice]);
    shouldBeUnselected([spongeBobChoice, patrickChoice]);
  });
});

describe('WISE5 Multiple Choice Component Select Multiple', function () {
  var leonardoChoice = (0, _protractor.element)(by.xpath('//md-checkbox[@aria-label="Leonardo"]'));
  var donatelloChoice = (0, _protractor.element)(by.xpath('//md-checkbox[@aria-label="Donatello"]'));
  var michelangeloChoice = (0, _protractor.element)(by.xpath('//md-checkbox[@aria-label="Michelangelo"]'));
  var raphaelChoice = (0, _protractor.element)(by.xpath('//md-checkbox[@aria-label="Raphael"]'));
  var squirtleChoice = (0, _protractor.element)(by.xpath('//md-checkbox[@aria-label="Squirtle"]'));

  beforeAll(function () {
    _protractor.browser.get('http://localhost:8080/wise/project/demo#/vle/node6');
    _protractor.browser.wait(function () {
      return nodeDropDownMenu.isPresent();
    }, 5000);
  });

  it('should show multiple choice multiple answer component', function () {
    expect(nodeDropDownMenu.getText()).toBe('1.6: Multiple Choice Step Multiple Answer');

    var nodeContent = (0, _protractor.element)(by.cssContainingText('.node-content', 'Which of these are Ninja Turtles?'));
    shouldBePresent([nodeContent, leonardoChoice, donatelloChoice, michelangeloChoice, raphaelChoice, squirtleChoice, saveButton, submitButton]);
    shouldBeAbsent([saveMessage]);
    shouldBeUnselected([leonardoChoice, donatelloChoice, michelangeloChoice, raphaelChoice, squirtleChoice]);
    shouldBeDisabled([saveButton, submitButton]);
  });

  it('should allow students to choose several choices and save', function () {
    leonardoChoice.click();
    expect(leonardoChoice.getAttribute('aria-checked')).toBe("true");
    shouldBeSelected([leonardoChoice]);
    shouldBeUnselected([donatelloChoice, michelangeloChoice, raphaelChoice, squirtleChoice]);
    shouldBeEnabled([saveButton, submitButton]);

    saveButton.click();
    expect(saveMessage.getText()).toContain("Saved");
    shouldBeEnabled([submitButton]);
    shouldBeDisabled([saveButton]);

    squirtleChoice.click();
    shouldBeSelected([leonardoChoice, squirtleChoice]);
    shouldBeUnselected([donatelloChoice, michelangeloChoice, raphaelChoice]);
    shouldBeEnabled([saveButton, submitButton]);

    submitButton.click();
    expect(submitMessage.getText()).toContain("Submitted");
    shouldBeDisabled([saveButton, submitButton]);

    // should still be able to choose after submitting
    michelangeloChoice.click();
    shouldBeSelected([leonardoChoice, squirtleChoice, michelangeloChoice]);
    shouldBeUnselected([donatelloChoice, raphaelChoice]);
    shouldBeEnabled([saveButton, submitButton]);

    // unselect a previous choice
    squirtleChoice.click();
    shouldBeSelected([leonardoChoice, michelangeloChoice]);
    shouldBeUnselected([donatelloChoice, raphaelChoice, squirtleChoice]);
  });

  it('should show previous chosen multiple-choice items', function () {
    prevButton.click();
    expect(nodeDropDownMenu.getText()).toBe('1.5: Multiple Choice Step Single Answer');
    nextButton.click();
    expect(nodeDropDownMenu.getText()).toBe('1.6: Multiple Choice Step Multiple Answer');

    shouldBeSelected([leonardoChoice, michelangeloChoice]);
    shouldBeUnselected([donatelloChoice, raphaelChoice, squirtleChoice]);
  });
});
//# sourceMappingURL=multipleChoice.spec.js.map
