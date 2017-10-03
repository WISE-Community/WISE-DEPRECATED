import {browser, element} from 'protractor';
import * as common from '../common.js';
let VLEPage = require('../vlePage.js');
let MultipleChoicePage = require('./multipleChoicePage.js');

describe('WISE5 Multiple Choice Component Select One (radio)', () => {
  let spongeBobChoice = element(by.xpath('//md-radio-button[@aria-label="Spongebob"]'));
  let patrickChoice = element(by.xpath('//md-radio-button[@aria-label="Patrick"]'));
  let squidwardChoice = element(by.xpath('//md-radio-button[@aria-label="Squidward"]'));

  function shouldDisplayDefaultElements(vle, mc) {
    vle.nodeSelectMenuShouldSay('1.5: Multiple Choice Step Single Answer');
    common.shouldBePresent([mc.radioGroup, mc.saveButton, mc.submitButton]);
    common.shouldBeAbsent([mc.saveMessage]);
    common.shouldBeDisabled([mc.saveButton, mc.submitButton]);

    let prompt = mc.getPrompt();
    common.shouldBePresent([prompt, spongeBobChoice, patrickChoice,
      squidwardChoice]);
    expect(prompt.getText()).toEqual('This is a multiple choice step where' +
      ' the student is allowed to choose one choice.\nWho lives in a' +
      ' pineapple under the sea?');
    common.shouldBeEnabled([spongeBobChoice, patrickChoice, squidwardChoice]);
    common.shouldBeUnselected([spongeBobChoice, patrickChoice,
      squidwardChoice]);
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

  beforeEach(() => {
    let vle = new VLEPage();
    browser.get('http://localhost:8080/wise/project/demo#/vle/node5');
    browser.wait(function() {
      return vle.nodeDropDownMenu.isPresent()
    }, 5000);
  });

  it('should allow user to choose a choice and save', () => {
    let vle = new VLEPage();
    let mc = new MultipleChoicePage();
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

  it('should allow user to choose a choice and submit', () => {
    let vle = new VLEPage();
    let mc = new MultipleChoicePage();
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

  it('should preserve selected choices between step visits', () => {
    let vle = new VLEPage();
    let mc = new MultipleChoicePage();
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
