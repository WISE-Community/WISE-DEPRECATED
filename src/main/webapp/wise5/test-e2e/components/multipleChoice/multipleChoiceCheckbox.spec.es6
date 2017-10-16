import {browser, element} from 'protractor';
import * as common from '../../common.js';
import VLEPage from '../../vlePage.js';
import MultipleChoicePage from './multipleChoicePage.js'

describe('WISE5 Multiple Choice Component Select Multiple (checkbox)', () => {
  const leonardoChoice = element(by.cssContainingText('md-checkbox','Leonardo'));
  const donatelloChoice = element(by.cssContainingText('md-checkbox','Donatello'));
  const michelangeloChoice = element(by.cssContainingText('md-checkbox','Michelangelo'));
  const raphaelChoice = element(by.cssContainingText('md-checkbox','Raphael'));
  const squirtleChoice = element(by.cssContainingText('md-checkbox','Squirtle'));

  function shouldDisplayDefaultElements(vle, mc) {
    vle.nodeSelectMenuShouldSay('1.6: Multiple Choice Step Multiple Answer');
    common.shouldBePresent(mc.saveButton, mc.submitButton);
    common.shouldBeAbsent(mc.saveMessage);
    common.shouldBeDisabled(mc.saveButton, mc.submitButton);

    const prompt = mc.getPrompt();
    common.shouldBePresent(prompt, leonardoChoice, donatelloChoice,
      michelangeloChoice, raphaelChoice, squirtleChoice);
    expect(prompt.getText()).toEqual('This is a multiple choice step where' +
      ' the student is allowed to choose multiple choices.\n' +
      'Which of these are Ninja Turtles?');
    common.shouldBeEnabled(donatelloChoice, michelangeloChoice,
      raphaelChoice, squirtleChoice);
    common.shouldBeUnselected(donatelloChoice, michelangeloChoice,
      raphaelChoice, squirtleChoice);
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

  beforeEach(() => {
    const vle = new VLEPage();
    browser.get('http://localhost:8080/wise/project/demo#/vle/node6');
    browser.wait(function() {
      return vle.nodeDropDownMenu.isPresent()
    }, 5000, 'VLE didn\'t load properly').then(() => {
      const mc = new MultipleChoicePage();
      shouldDisplayDefaultElements(vle, mc);
    });
  });

  it('should allow students to choose several choices and save', () => {
    const mc = new MultipleChoicePage();
    leonardoChoice.click();
    common.shouldBeSelected(leonardoChoice);
    common.shouldBeUnselected(donatelloChoice, michelangeloChoice,
        raphaelChoice, squirtleChoice);
    common.shouldBeEnabled(mc.saveButton, mc.submitButton);

    save(mc);

    squirtleChoice.click();
    common.shouldBeSelected(leonardoChoice, squirtleChoice);
    common.shouldBeUnselected(donatelloChoice, michelangeloChoice,
        raphaelChoice);
    common.shouldBeEnabled(mc.saveButton, mc.submitButton);

    submit(mc);

    // should still be able to choose after submitting
    michelangeloChoice.click();
    common.shouldBeSelected(leonardoChoice, squirtleChoice,
        michelangeloChoice);
    common.shouldBeUnselected(donatelloChoice, raphaelChoice);
    common.shouldBeEnabled(mc.saveButton, mc.submitButton);

    // unselect a previous choice
    squirtleChoice.click();
    common.shouldBeSelected(leonardoChoice, michelangeloChoice);
    common.shouldBeUnselected(donatelloChoice, raphaelChoice, squirtleChoice);
  });

  it('should show previous chosen multiple-choice items', () => {
    const mc = new MultipleChoicePage();

    leonardoChoice.click();
    michelangeloChoice.click();
    donatelloChoice.click();
    raphaelChoice.click();
    common.shouldBeSelected(leonardoChoice, michelangeloChoice,
        donatelloChoice, raphaelChoice);
    common.shouldBeUnselected(squirtleChoice);
    common.shouldBeEnabled(mc.saveButton, mc.submitButton);

    const vle = new VLEPage();
    vle.goToPreviousStep();
    common.urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node5');
    vle.nodeSelectMenuShouldSay('1.5: Multiple Choice Step Single Answer');

    vle.goToNextStep();
    common.urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node6');
    vle.nodeSelectMenuShouldSay('1.6: Multiple Choice Step Multiple Answer');
    common.shouldBeSelected(leonardoChoice, michelangeloChoice,
      donatelloChoice, raphaelChoice);
    common.shouldBeUnselected(squirtleChoice);

    // auto-save should have occurred, so the save button is disabled.
    common.shouldBeDisabled(mc.saveButton);
    common.shouldBeEnabled(mc.submitButton);
  });
});
