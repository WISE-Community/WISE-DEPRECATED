'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasClass = hasClass;
exports.shouldBePresent = shouldBePresent;
exports.shouldBeAbsent = shouldBeAbsent;
exports.shouldBeHidden = shouldBeHidden;
exports.shouldBeDisplayed = shouldBeDisplayed;
exports.shouldBeDisabled = shouldBeDisabled;
exports.shouldBeEnabled = shouldBeEnabled;
exports.shouldBeSelected = shouldBeSelected;
exports.shouldBeUnselected = shouldBeUnselected;
exports.urlShouldBe = urlShouldBe;
exports.urlShouldMatch = urlShouldMatch;
function hasClass(element, cls) {
  return element.getAttribute('class').then(function (classes) {
    return classes.split(' ').indexOf(cls) !== -1;
  });
}

function shouldBePresent() {
  for (var _len = arguments.length, elements = Array(_len), _key = 0; _key < _len; _key++) {
    elements[_key] = arguments[_key];
  }

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = elements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var element = _step.value;

      expect(element.isPresent()).toBeTruthy();
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

function shouldBeAbsent() {
  for (var _len2 = arguments.length, elements = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    elements[_key2] = arguments[_key2];
  }

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = elements[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var element = _step2.value;

      expect(element.isPresent()).toBeFalsy();
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

function shouldBeHidden() {
  for (var _len3 = arguments.length, elements = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    elements[_key3] = arguments[_key3];
  }

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = elements[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var element = _step3.value;

      expect(element.isDisplayed()).toBeFalsy();
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

function shouldBeDisplayed() {
  for (var _len4 = arguments.length, elements = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    elements[_key4] = arguments[_key4];
  }

  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = elements[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var element = _step4.value;

      expect(element.isDisplayed()).toBeTruthy();
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

function shouldBeDisabled() {
  for (var _len5 = arguments.length, elements = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    elements[_key5] = arguments[_key5];
  }

  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = elements[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var element = _step5.value;

      expect(element.getAttribute('disabled')).toBeTruthy();
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

function shouldBeEnabled() {
  for (var _len6 = arguments.length, elements = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
    elements[_key6] = arguments[_key6];
  }

  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = elements[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      var element = _step6.value;

      expect(element.getAttribute('disabled')).toBeNull();
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

function shouldBeSelected() {
  for (var _len7 = arguments.length, choices = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
    choices[_key7] = arguments[_key7];
  }

  var _iteratorNormalCompletion7 = true;
  var _didIteratorError7 = false;
  var _iteratorError7 = undefined;

  try {
    for (var _iterator7 = choices[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
      var choice = _step7.value;

      expect(choice.getAttribute('aria-checked')).toBe("true");
    }
  } catch (err) {
    _didIteratorError7 = true;
    _iteratorError7 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion7 && _iterator7.return) {
        _iterator7.return();
      }
    } finally {
      if (_didIteratorError7) {
        throw _iteratorError7;
      }
    }
  }
}

function shouldBeUnselected() {
  for (var _len8 = arguments.length, choices = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
    choices[_key8] = arguments[_key8];
  }

  var _iteratorNormalCompletion8 = true;
  var _didIteratorError8 = false;
  var _iteratorError8 = undefined;

  try {
    for (var _iterator8 = choices[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
      var choice = _step8.value;

      expect(choice.getAttribute('aria-checked')).toBe("false");
    }
  } catch (err) {
    _didIteratorError8 = true;
    _iteratorError8 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion8 && _iterator8.return) {
        _iterator8.return();
      }
    } finally {
      if (_didIteratorError8) {
        throw _iteratorError8;
      }
    }
  }
}

function urlShouldBe(expectedURL) {
  expect(browser.getCurrentUrl()).toEqual(expectedURL);
}

function urlShouldMatch(urlRegex) {
  expect(browser.getCurrentUrl()).toMatch(urlRegex);
}
//# sourceMappingURL=common.js.map
