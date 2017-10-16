'use strict';

var _protractor = require('protractor');

var _common = require('../../common.js');

var common = _interopRequireWildcard(_common);

var _vlePage = require('../../vlePage.js');

var _vlePage2 = _interopRequireDefault(_vlePage);

var _multipleChoicePage = require('./multipleChoicePage.js');

var _multipleChoicePage2 = _interopRequireDefault(_multipleChoicePage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

describe('WISE5 Multiple Choice Component Select One (radio)', function () {
  var spongeBobChoice = (0, _protractor.element)(by.cssContainingText('md-radio-button', 'Spongebob'));
  var patrickChoice = (0, _protractor.element)(by.cssContainingText('md-radio-button', 'Patrick'));
  var squidwardChoice = (0, _protractor.element)(by.cssContainingText('md-radio-button', 'Squidward'));

  function shouldDisplayDefaultElements(vle, mc) {
    vle.nodeSelectMenuShouldSay('1.5: Multiple Choice Step Single Answer');
    common.shouldBePresent(mc.radioGroup, mc.saveButton, mc.submitButton);
    common.shouldBeAbsent(mc.saveMessage);
    common.shouldBeDisabled(mc.saveButton, mc.submitButton);

    var prompt = mc.getPrompt();
    common.shouldBePresent(prompt, spongeBobChoice, patrickChoice, squidwardChoice);
    expect(prompt.getText()).toEqual('This is a multiple choice step where' + ' the student is allowed to choose one choice.\nWho lives in a' + ' pineapple under the sea?');
    common.shouldBeEnabled(spongeBobChoice, patrickChoice, squidwardChoice);
    common.shouldBeUnselected(spongeBobChoice, patrickChoice, squidwardChoice);
  }

  function save(mc) {
    mc.save();
    common.shouldBeDisabled(mc.saveButton);
    common.shouldBeEnabled(mc.submitButton);
    expect(mc.saveMessage.getText()).toContain("Saved");
  }

  function submit(mc) {
    mc.submit();
    common.shouldBeDisabled(mc.saveButton, mc.saveButton);
    expect(mc.submitMessage.getText()).toContain("Submitted");
  }

  beforeEach(function () {
    var vle = new _vlePage2.default();
    _protractor.browser.get('http://localhost:8080/wise/project/demo#/vle/node5');
    _protractor.browser.wait(function () {
      return vle.nodeDropDownMenu.isPresent();
    }, 5000, 'VLE didn\'t load properly').then(function () {
      var mc = new _multipleChoicePage2.default();
      shouldDisplayDefaultElements(vle, mc);
    });
  });

  it('should allow user to choose a choice and save', function () {
    var mc = new _multipleChoicePage2.default();
    spongeBobChoice.click();
    common.shouldBeSelected(spongeBobChoice);
    common.shouldBeUnselected(patrickChoice, squidwardChoice);
    common.shouldBeEnabled(mc.saveButton, mc.submitButton);

    save(mc);

    // same choices should still be selected
    common.shouldBeSelected(spongeBobChoice);
    common.shouldBeUnselected(patrickChoice, squidwardChoice);

    // should still be able to choose after saving
    common.shouldBeEnabled(spongeBobChoice, patrickChoice, squidwardChoice);
    patrickChoice.click();
    common.shouldBeSelected(patrickChoice);
    common.shouldBeUnselected(spongeBobChoice, squidwardChoice);
    common.shouldBeEnabled(mc.saveButton, mc.submitButton);
  });

  it('should allow user to choose a choice and submit', function () {
    var mc = new _multipleChoicePage2.default();
    patrickChoice.click();
    common.shouldBeSelected(patrickChoice);
    common.shouldBeUnselected(spongeBobChoice, squidwardChoice);
    common.shouldBeEnabled(mc.saveButton, mc.submitButton);

    submit(mc);

    // same choices should still be selected
    common.shouldBeSelected(patrickChoice);
    common.shouldBeUnselected(spongeBobChoice, squidwardChoice);

    // should still be able to choose after submitting
    common.shouldBeEnabled(spongeBobChoice, patrickChoice, squidwardChoice);
    squidwardChoice.click();
    common.shouldBeSelected(squidwardChoice);
    common.shouldBeUnselected(spongeBobChoice, patrickChoice);
  });

  it('should preserve selected choices between step visits', function () {
    var mc = new _multipleChoicePage2.default();
    spongeBobChoice.click();
    common.shouldBeSelected(spongeBobChoice);
    common.shouldBeUnselected(squidwardChoice, patrickChoice);

    var vle = new _vlePage2.default();
    vle.goToNextStep();
    common.urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node6');
    vle.nodeSelectMenuShouldSay('1.6: Multiple Choice Step Multiple Answer');

    vle.goToPreviousStep();
    common.urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node5');
    vle.nodeSelectMenuShouldSay('1.5: Multiple Choice Step Single Answer');
    common.shouldBeSelected(spongeBobChoice);
    common.shouldBeUnselected(squidwardChoice, patrickChoice);
  });
});
//# sourceMappingURL=multipleChoiceRadio.spec.js.map
