import {browser, element} from 'protractor';
import * as common from '../common.js';
let VLEPage = require('../vlePage.js');
let OpenResponsePage = require('./openResponsePage.js');

describe('WISE5 Open Response Component', () => {
  function shouldDisplayDefaultElements(vle, or) {
    vle.nodeSelectMenuShouldSay('1.2: Open Response Step');
    common.shouldBePresent([or.textarea, or.saveButton, or.submitButton]);
    common.shouldBeAbsent([or.saveMessage]);
    common.shouldBeDisabled([or.saveButton, or.submitButton]);

    let prompt = or.getPrompt();
    common.shouldBePresent([prompt]);
    expect(prompt.getText())
        .toEqual('This is a step where students enter text.');
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

  beforeEach(() => {
    let vle = new VLEPage();
    browser.get('http://localhost:8080/wise/project/demo#/vle/node2');
    browser.wait(function() {
      return vle.nodeDropDownMenu.isPresent()
    }, 5000);
  });

  it('should allow students to type text and edit', () => {
    let vle = new VLEPage();
    let or = new OpenResponsePage();
    shouldDisplayDefaultElements(vle, or);

    let firstSentence = 'Here is my first sentence. ';
    or.typeResponse(firstSentence);
    or.textareaShouldSay(firstSentence);
    common.shouldBeEnabled([or.saveButton, or.submitButton]);

    save(or);
    common.shouldBeDisabled([or.saveButton]);
    common.shouldBeEnabled([or.submitButton]);

    // should be able to edit response text even after saving
    let secondSentence = 'Here is my second sentence. ';
    or.typeResponse(secondSentence);
    or.textareaShouldSay(firstSentence + secondSentence);

    submit(or);
    common.shouldBeDisabled([or.saveButton, or.submitButton]);

    // should be able to edit response text even after submitting
    let thirdSentence = 'Here is my third sentence.';
    or.typeResponse(thirdSentence);
    or.textareaShouldSay(firstSentence + secondSentence + thirdSentence);
  });

  it('should auto-save on exit and show previously-entered response on revisit',
      () => {
    let vle = new VLEPage();
    let or = new OpenResponsePage();
    shouldDisplayDefaultElements(vle, or);

    let seaShellsSentence = 'She sells seashells by the seashore.';
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
