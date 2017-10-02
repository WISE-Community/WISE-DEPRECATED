'use strict';

var _protractor = require('protractor');

var _common = require('../common.js');

var common = _interopRequireWildcard(_common);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var VLEPage = require('../vlePage.js');
var OpenResponsePage = require('./openResponsePage.js');

describe('WISE5 Open Response Component', function () {
  function shouldDisplayDefaultElements(vle, or) {
    vle.nodeSelectMenuShouldSay('1.2: Open Response Step');
    common.shouldBePresent([or.textarea, or.saveButton, or.submitButton]);
    common.shouldBeAbsent([or.saveMessage]);
    common.shouldBeDisabled([or.saveButton, or.submitButton]);

    var prompt = or.getPrompt();
    common.shouldBePresent([prompt]);
    expect(prompt.getText()).toEqual('This is a step where students enter text.');
  }

  function save(or) {
    or.save();
    common.shouldBeDisabled([or.saveButton]);
    common.shouldBeEnabled([or.submitButton]);
    expect(or.saveMessage.getText()).toContain("Saved");
  }

  function submit(or) {
    or.submit();
    common.shouldBeDisabled([or.saveButton, or.saveButton]);
    expect(or.submitMessage.getText()).toContain("Submitted");
  }

  beforeEach(function () {
    var vle = new VLEPage();
    _protractor.browser.get('http://localhost:8080/wise/project/demo#/vle/node2');
    _protractor.browser.wait(function () {
      return vle.nodeDropDownMenu.isPresent();
    }, 5000);
  });

  it('should allow students to type text and edit', function () {
    var vle = new VLEPage();
    var or = new OpenResponsePage();
    shouldDisplayDefaultElements(vle, or);

    var firstSentence = 'Here is my first sentence. ';
    or.typeResponse(firstSentence);
    or.textareaShouldSay(firstSentence);
    common.shouldBeEnabled([or.saveButton, or.submitButton]);

    save(or);
    common.shouldBeDisabled([or.saveButton]);
    common.shouldBeEnabled([or.submitButton]);

    // should be able to edit response text even after saving
    var secondSentence = 'Here is my second sentence. ';
    or.typeResponse(secondSentence);
    or.textareaShouldSay(firstSentence + secondSentence);

    submit(or);
    common.shouldBeDisabled([or.saveButton, or.submitButton]);

    // should be able to edit response text even after submitting
    var thirdSentence = 'Here is my third sentence.';
    or.typeResponse(thirdSentence);
    or.textareaShouldSay(firstSentence + secondSentence + thirdSentence);
  });

  it('should auto-save on exit and show previously-entered response on revisit', function () {
    var vle = new VLEPage();
    var or = new OpenResponsePage();
    shouldDisplayDefaultElements(vle, or);

    var seaShellsSentence = 'She sells seashells by the seashore.';
    or.typeResponse(seaShellsSentence);
    or.textareaShouldSay(seaShellsSentence);
    common.shouldBeEnabled([or.saveButton, or.submitButton]);

    vle.goToPreviousStep();
    common.urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node1');
    vle.nodeSelectMenuShouldSay('1.1: HTML Step');

    vle.goToNextStep();
    common.urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node2');
    vle.nodeSelectMenuShouldSay('1.2: Open Response Step');
    or.textareaShouldSay(seaShellsSentence);

    // auto-save should have occurred, so the save button is disabled.
    common.shouldBeDisabled([or.saveButton]);
    common.shouldBeEnabled([or.submitButton]);
  });
});
//# sourceMappingURL=openResponse.spec.js.map
