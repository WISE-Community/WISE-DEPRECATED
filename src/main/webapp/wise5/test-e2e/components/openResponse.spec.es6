import {browser, element} from 'protractor';

let saveButton = element(by.id('saveButton'));
let saveMessage = element(by.binding('openResponseController.saveMessage.text'));
let submitButton = element(by.id('submitButton'));
let textarea = element(by.model('openResponseController.studentResponse'));
let nodeDropDownMenu = element(by.model("stepToolsCtrl.toNodeId"));

function hasClass(element, cls) {
  return element.getAttribute('class').then((classes) => {
  return classes.split(' ').indexOf(cls) !== -1;
  });
}

function shouldBeDisabled(elements) {
  for (let element of elements) {
    expect(hasClass(element, "disabled"));
  }
}

function shouldBeEnabled(elements) {
  for (let element of elements) {
    expect(!hasClass(element, "disabled"));
  }
}

function shouldBePresent(elements) {
  for (let element of elements) {
    expect(element.isPresent()).toBeTruthy();
  }
}

function shouldBeAbsent(elements) {
  for (let element of elements) {
    expect(element.isPresent()).toBeFalsy();
  }
}

describe('WISE5 Open Response Component', () => {

  beforeAll(() => {
    browser.get('http://localhost:8080/wise/project/demo#/vle/node2');
    browser.wait(function() {
      return nodeDropDownMenu.isPresent()
    }, 5000);
  });

  it('should show open response component', () => {
    expect(nodeDropDownMenu.getText()).toBe('1.2: Open Response Step');

    let nodeContent = element(by.cssContainingText(
      '.node-content','This is a step where students enter text.'));
    shouldBePresent([nodeContent, textarea, saveButton, submitButton]);
    shouldBeAbsent([saveMessage]);
    shouldBeEnabled([textarea]);
    shouldBeDisabled([saveButton, submitButton]);
  });

  it('should allow students to type text and edit', () => {
    let firstSentence = 'Here is my first sentence. ';
    let secondSentence = 'Here is my second sentence.';
    textarea.sendKeys(firstSentence);
    shouldBeEnabled([saveButton, submitButton]);

    saveButton.click();
    expect(saveMessage.getText()).toContain("Saved");
    shouldBeDisabled([saveButton]);
    shouldBeEnabled([submitButton]);

    submitButton.click();
    expect(saveMessage.getText()).toContain("Submitted");
    shouldBeEnabled([saveButton, submitButton]);

    // should be able to edit your text even after submitting
    textarea.sendKeys(secondSentence);
    expect(textarea.getAttribute('value'))
        .toEqual(firstSentence + secondSentence);
  });
});
