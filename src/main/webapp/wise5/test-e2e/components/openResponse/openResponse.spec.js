import {browser, element} from 'protractor';
import * as common from '../../common.js';
import VLEPage from '../../vlePage.js';
import OpenResponsePage from './openResponsePage.js'

describe('WISE5 Open Response Component', () => {
  function shouldDisplayDefaultElements(vle, or) {
    vle.nodeSelectMenuShouldSay('1.2: Open Response Step');
    common.shouldBePresent(or.textarea, or.saveButton, or.submitButton);
    common.shouldBeAbsent(or.saveMessage);
    common.shouldBeDisabled(or.saveButton, or.submitButton);

    const prompt = or.getPrompt();
    common.shouldBePresent(prompt);
    expect(prompt.getText())
        .toEqual('This is a step where students enter text.');
  }

  function save(or) {
    or.save();
    common.shouldBeDisabled(or.saveButton);
    common.shouldBeEnabled(or.submitButton);
    expect(or.saveMessage.getText()).toContain("Saved");
  }

  function submit(or) {
    or.submit();
    common.shouldBeDisabled(or.saveButton, or.saveButton);
    expect(or.submitMessage.getText()).toContain("Submitted");
  }

  function textareaShouldSay(or, expectedTextareaText) {
    expect(or.textarea.getAttribute('value')).toEqual(expectedTextareaText);
  }

  beforeEach(() => {
    const vle = new VLEPage();
    browser.get('http://localhost:8080/wise/project/demo#/vle/node2');
    browser.wait(function() {
      return vle.nodeDropDownMenu.isPresent()
    }, 5000, 'VLE didn\'t load properly').then(() => {
      const or = new OpenResponsePage();
      shouldDisplayDefaultElements(vle, or);
    });
  });

  it('should allow students to type text and edit', () => {
    const or = new OpenResponsePage();
    const firstSentence = 'Here is my first sentence. ';
    or.typeResponse(firstSentence);
    textareaShouldSay(or, firstSentence);
    common.shouldBeEnabled(or.saveButton, or.submitButton);

    save(or);
    common.shouldBeDisabled(or.saveButton);
    common.shouldBeEnabled(or.submitButton);

    // should be able to continue editing response text even after saving
    const secondSentence = 'Here is my second sentence. ';
    or.typeResponse(secondSentence);
    textareaShouldSay(or, firstSentence + secondSentence);

    submit(or);
    common.shouldBeDisabled(or.saveButton, or.submitButton);

    // should be able to continue editing response text even after submitting
    const thirdSentence = 'Here is my third sentence.';
    or.typeResponse(thirdSentence);
    textareaShouldSay(or, firstSentence + secondSentence + thirdSentence);
  });

  it('should auto-save on exit and show previously-entered response on revisit',
      () => {
    const or = new OpenResponsePage();
    const seaShellsSentence = 'She sells seashells by the seashore.';
    or.typeResponse(seaShellsSentence);
    textareaShouldSay(or, seaShellsSentence);
    common.shouldBeEnabled(or.saveButton, or.submitButton);

    const vle = new VLEPage();
    vle.goToPreviousStep();
    common.urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node1');
    vle.nodeSelectMenuShouldSay('1.1: HTML Step');

    vle.goToNextStep();
    common.urlShouldBe('http://localhost:8080/wise/project/demo#/vle/node2');
    vle.nodeSelectMenuShouldSay('1.2: Open Response Step');
    textareaShouldSay(or, seaShellsSentence);

    // auto-save should have occurred, so the save button is disabled.
    common.shouldBeDisabled(or.saveButton);
    common.shouldBeEnabled(or.submitButton);
  });
});
