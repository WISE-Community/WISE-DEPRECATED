'use strict';

var _protractor = require('protractor');

var _common = require('../common.js');

var common = _interopRequireWildcard(_common);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var VLEPage = require('../vlePage.js');
var MultipleChoicePage = require('./multipleChoicePage.js');

describe('WISE5 Multiple Choice Component Select Multiple (checkbox)', function () {
  var leonardoChoice = (0, _protractor.element)(by.xpath('//md-checkbox[@aria-label="Leonardo"]'));
  var donatelloChoice = (0, _protractor.element)(by.xpath('//md-checkbox[@aria-label="Donatello"]'));
  var michelangeloChoice = (0, _protractor.element)(by.xpath('//md-checkbox[@aria-label="Michelangelo"]'));
  var raphaelChoice = (0, _protractor.element)(by.xpath('//md-checkbox[@aria-label="Raphael"]'));
  var squirtleChoice = (0, _protractor.element)(by.xpath('//md-checkbox[@aria-label="Squirtle"]'));

  function shouldDisplayDefaultElements(vle, mc) {
    vle.nodeSelectMenuShouldSay('1.6: Multiple Choice Step Multiple Answer');
    common.shouldBePresent([mc.saveButton, mc.submitButton]);
    common.shouldBeAbsent([mc.saveMessage]);
    common.shouldBeDisabled([mc.saveButton, mc.submitButton]);

    var prompt = mc.getPrompt();
    common.shouldBePresent([prompt, leonardoChoice, donatelloChoice, michelangeloChoice, raphaelChoice, squirtleChoice]);
    expect(prompt.getText()).toEqual('This is a multiple choice step where' + '' + ' the student is allowed to choose multiple choices.\n' + 'Which of these are Ninja Turtles?');
    common.shouldBeEnabled([donatelloChoice, michelangeloChoice, raphaelChoice, squirtleChoice]);
    common.shouldBeUnselected([donatelloChoice, michelangeloChoice, raphaelChoice, squirtleChoice]);
  }

  function save(mc) {
    mc.save();
    common.shouldBeDisabled([mc.saveButton]);
    common.shouldBeEnabled([mc.submitButton]);
    expect(mc.saveMessage.getText()).toContain("Saved");
  }

  function submit(mc) {
    mc.submit();
    common.shouldBeDisabled([mc.saveButton, mc.saveButton]);
    expect(mc.submitMessage.getText()).toContain("Submitted");
  }

  beforeEach(function () {
    var vle = new VLEPage();
    _protractor.browser.get('http://localhost:8080/wise/project/demo#/vle/node6');
    _protractor.browser.wait(function () {
      return vle.nodeDropDownMenu.isPresent();
    }, 5000);
  });

  it('should allow students to choose several choices and save', function () {
    var vle = new VLEPage();
    var mc = new MultipleChoicePage();
    shouldDisplayDefaultElements(vle, mc);
    leonardoChoice.click();
    common.shouldBeSelected([leonardoChoice]);
    common.shouldBeUnselected([donatelloChoice, michelangeloChoice, raphaelChoice, squirtleChoice]);
    common.shouldBeEnabled([mc.saveButton, mc.submitButton]);

    save(mc);

    squirtleChoice.click();
    common.shouldBeSelected([leonardoChoice, squirtleChoice]);
    common.shouldBeUnselected([donatelloChoice, michelangeloChoice, raphaelChoice]);
    common.shouldBeEnabled([mc.saveButton, mc.submitButton]);

    submit(mc);

    // should still be able to choose after submitting
    michelangeloChoice.click();
    common.shouldBeSelected([leonardoChoice, squirtleChoice, michelangeloChoice]);
    common.shouldBeUnselected([donatelloChoice, raphaelChoice]);
    common.shouldBeEnabled([mc.saveButton, mc.submitButton]);

    // unselect a previous choice
    squirtleChoice.click();
    common.shouldBeSelected([leonardoChoice, michelangeloChoice]);
    common.shouldBeUnselected([donatelloChoice, raphaelChoice, squirtleChoice]);
  });

  it('should show previous chosen multiple-choice items', function () {
    var vle = new VLEPage();
    var mc = new MultipleChoicePage();
    shouldDisplayDefaultElements(vle, mc);

    leonardoChoice.click();
    michelangeloChoice.click();
    donatelloChoice.click();
    raphaelChoice.click();
    common.shouldBeSelected([leonardoChoice, michelangeloChoice, donatelloChoice, raphaelChoice]);
    common.shouldBeUnselected([squirtleChoice]);
    common.shouldBeEnabled([mc.saveButton, mc.submitButton]);

    vle.goToPreviousStep();
    common.urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node5');
    vle.nodeSelectMenuShouldSay('1.5: Multiple Choice Step Single Answer');

    vle.goToNextStep();
    common.urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node6');
    vle.nodeSelectMenuShouldSay('1.6: Multiple Choice Step Multiple Answer');
    common.shouldBeSelected([leonardoChoice, michelangeloChoice, donatelloChoice, raphaelChoice]);
    common.shouldBeUnselected([squirtleChoice]);

    // auto-save should have occurred, so the save button is disabled.
    common.shouldBeDisabled([mc.saveButton]);
    common.shouldBeEnabled([mc.submitButton]);
  });
});
//# sourceMappingURL=multipleChoiceCheckbox.spec.js.map
