'use strict';

var _protractor = require('protractor');

var _common = require('../common.js');

var common = _interopRequireWildcard(_common);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var VLEPage = require('../vlePage.js');
var MultipleChoicePage = require('./multipleChoicePage.js');

describe('WISE5 Multiple Choice Component Select One (radio)', function () {
  var spongeBobChoice = (0, _protractor.element)(by.xpath('//md-radio-button[@aria-label="Spongebob"]'));
  var patrickChoice = (0, _protractor.element)(by.xpath('//md-radio-button[@aria-label="Patrick"]'));
  var squidwardChoice = (0, _protractor.element)(by.xpath('//md-radio-button[@aria-label="Squidward"]'));

  function shouldDisplayDefaultElements(vle, mc) {
    vle.nodeSelectMenuShouldSay('1.5: Multiple Choice Step Single Answer');
    common.shouldBePresent([mc.radioGroup, mc.saveButton, mc.submitButton]);
    common.shouldBeAbsent([mc.saveMessage]);
    common.shouldBeDisabled([mc.saveButton, mc.submitButton]);

    var prompt = mc.getPrompt();
    common.shouldBePresent([prompt, spongeBobChoice, patrickChoice, squidwardChoice]);
    expect(prompt.getText()).toEqual('This is a multiple choice step where' + ' the student is allowed to choose one choice.\nWho lives in a' + ' pineapple under the sea?');
    common.shouldBeEnabled([spongeBobChoice, patrickChoice, squidwardChoice]);
    common.shouldBeUnselected([spongeBobChoice, patrickChoice, squidwardChoice]);
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
    _protractor.browser.get('http://localhost:8080/wise/project/demo#/vle/node5');
    _protractor.browser.wait(function () {
      return vle.nodeDropDownMenu.isPresent();
    }, 5000);
  });

  it('should allow user to choose a choice and save', function () {
    var vle = new VLEPage();
    var mc = new MultipleChoicePage();
    shouldDisplayDefaultElements(vle, mc);

    spongeBobChoice.click();
    common.shouldBeSelected([spongeBobChoice]);
    common.shouldBeUnselected([patrickChoice, squidwardChoice]);
    common.shouldBeEnabled([mc.saveButton, mc.submitButton]);

    save(mc);

    // same choices should still be selected
    common.shouldBeSelected([spongeBobChoice]);
    common.shouldBeUnselected([patrickChoice, squidwardChoice]);

    // should still be able to choose after saving
    common.shouldBeEnabled([spongeBobChoice, patrickChoice, squidwardChoice]);
    patrickChoice.click();
    common.shouldBeSelected([patrickChoice]);
    common.shouldBeUnselected([spongeBobChoice, squidwardChoice]);
    common.shouldBeEnabled([mc.saveButton, mc.submitButton]);
  });

  it('should allow user to choose a choice and submit', function () {
    var vle = new VLEPage();
    var mc = new MultipleChoicePage();
    shouldDisplayDefaultElements(vle, mc);

    patrickChoice.click();
    common.shouldBeSelected([patrickChoice]);
    common.shouldBeUnselected([spongeBobChoice, squidwardChoice]);
    common.shouldBeEnabled([mc.saveButton, mc.submitButton]);

    submit(mc);

    // same choices should still be selected
    common.shouldBeSelected([patrickChoice]);
    common.shouldBeUnselected([spongeBobChoice, squidwardChoice]);

    // should still be able to choose after submitting
    common.shouldBeEnabled([spongeBobChoice, patrickChoice, squidwardChoice]);
    squidwardChoice.click();
    common.shouldBeSelected([squidwardChoice]);
    common.shouldBeUnselected([spongeBobChoice, patrickChoice]);
  });

  it('should preserve selected choices between step visits', function () {
    var vle = new VLEPage();
    var mc = new MultipleChoicePage();
    shouldDisplayDefaultElements(vle, mc);

    spongeBobChoice.click();
    common.shouldBeSelected([spongeBobChoice]);
    common.shouldBeUnselected([squidwardChoice, patrickChoice]);

    vle.goToNextStep();
    common.urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node6');
    vle.nodeSelectMenuShouldSay('1.6: Multiple Choice Step Multiple Answer');

    vle.goToPreviousStep();
    common.urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node5');
    vle.nodeSelectMenuShouldSay('1.5: Multiple Choice Step Single Answer');

    common.shouldBeSelected([spongeBobChoice]);
    common.shouldBeUnselected([squidwardChoice, patrickChoice]);
  });
});
//# sourceMappingURL=multipleChoiceRadio.spec.js.map
