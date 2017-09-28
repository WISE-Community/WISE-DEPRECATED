import {browser, element} from 'protractor';

let saveButton = element(by.id('saveButton'));
let saveMessage = element(by.binding('multipleChoiceController.saveMessage.text'));
let submitButton = element(by.id('submitButton'));
let submitMessage = element(by.binding('multipleChoiceController.saveMessage.text'));
let nextButton = element(by.id('nextButton'));
let prevButton = element(by.id('prevButton'));
let radioGroup = element(by.model('multipleChoiceController.studentChoices'));
let nodeDropDownMenu = element(by.model("stepToolsCtrl.toNodeId"));

function hasClass(element, cls) {
  return element.getAttribute('class').then((classes) => {
    return classes.split(' ').indexOf(cls) !== -1;
  });
}

function shouldBeSelected(choices) {
  for (let choice of choices) {
    expect(choice.getAttribute('aria-checked')).toBe("true");
  }
}

function shouldBeUnselected(choices) {
  for (let choice of choices) {
    expect(choice.getAttribute('aria-checked')).toBe("false");
  }
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

describe('WISE5 Multiple Choice Component Select One', () => {
  let spongeBobChoice = element(by.xpath('//md-radio-button[@aria-label="Spongebob"]'));
  let patrickChoice = element(by.xpath('//md-radio-button[@aria-label="Patrick"]'));
  let squidwardChoice = element(by.xpath('//md-radio-button[@aria-label="Squidward"]'));

  beforeAll(() => {
    browser.get('http://localhost:8080/wise/project/demo#/vle/node5');
    browser.wait(function() {
      return nodeDropDownMenu.isPresent()
    }, 5000);
  });

  it('should show multiple choice multiple answer component', () => {
    expect(nodeDropDownMenu.getText()).toBe(
        '1.5: Multiple Choice Step Single Answer');
    let nodeContent = element(by.cssContainingText(
        '.node-content','Who lives in a pineapple under the sea?'));
    shouldBePresent([nodeContent, radioGroup,
      spongeBobChoice, patrickChoice, squidwardChoice,
      saveButton,  submitButton]);
    shouldBeAbsent([saveMessage]);
    shouldBeUnselected([spongeBobChoice, patrickChoice, squidwardChoice]);
    shouldBeDisabled([saveButton, submitButton]);
  });

  it('should allow students to choose a choice and save', () => {
    spongeBobChoice.click();
    shouldBeSelected([spongeBobChoice]);
    shouldBeUnselected([patrickChoice, squidwardChoice]);
    shouldBeEnabled([saveButton, submitButton]);

    saveButton.click();
    expect(saveMessage.getText()).toContain("Saved");
    shouldBeDisabled([saveButton]);
    shouldBeEnabled([submitButton]);

    patrickChoice.click();
    shouldBeSelected([patrickChoice]);
    shouldBeUnselected([spongeBobChoice, squidwardChoice]);
    shouldBeEnabled([saveButton, submitButton]);

    submitButton.click();
    shouldBeDisabled([saveButton, saveButton]);
    expect(submitMessage.getText()).toContain("Submitted");

    // should still be able to choose after submitting
    squidwardChoice.click();
    shouldBeSelected([squidwardChoice]);
    shouldBeUnselected([spongeBobChoice, patrickChoice]);
  });

  it('should show previous chosen single-choice items', () => {
    nextButton.click();
    expect(nodeDropDownMenu.getText()).toBe('1.6: Multiple Choice Step Multiple Answer');
    prevButton.click();
    expect(nodeDropDownMenu.getText()).toBe('1.5: Multiple Choice Step Single Answer');

    shouldBeSelected([squidwardChoice]);
    shouldBeUnselected([spongeBobChoice, patrickChoice]);
  });

});

describe('WISE5 Multiple Choice Component Select Multiple', () => {
  let leonardoChoice = element(by.xpath('//md-checkbox[@aria-label="Leonardo"]'));
  let donatelloChoice = element(by.xpath('//md-checkbox[@aria-label="Donatello"]'));
  let michelangeloChoice = element(by.xpath('//md-checkbox[@aria-label="Michelangelo"]'));
  let raphaelChoice = element(by.xpath('//md-checkbox[@aria-label="Raphael"]'));
  let squirtleChoice = element(by.xpath('//md-checkbox[@aria-label="Squirtle"]'));

  beforeAll(() => {
    browser.get('http://localhost:8080/wise/project/demo#/vle/node6');
    browser.wait(function() {
      return nodeDropDownMenu.isPresent()
    }, 5000);
  });

  it('should show multiple choice multiple answer component', () => {
    expect(nodeDropDownMenu.getText()).toBe(
      '1.6: Multiple Choice Step Multiple Answer');

    let nodeContent = element(by.cssContainingText(
      '.node-content','Which of these are Ninja Turtles?'));
    shouldBePresent([nodeContent, leonardoChoice, donatelloChoice,
      michelangeloChoice, raphaelChoice, squirtleChoice,
      saveButton, submitButton]);
    shouldBeAbsent([saveMessage]);
    shouldBeUnselected([leonardoChoice, donatelloChoice, michelangeloChoice,
      raphaelChoice, squirtleChoice]);
    shouldBeDisabled([saveButton, submitButton]);
  });

  it('should allow students to choose several choices and save', () => {
    leonardoChoice.click();
    expect(leonardoChoice.getAttribute('aria-checked')).toBe("true");
    shouldBeSelected([leonardoChoice]);
    shouldBeUnselected([donatelloChoice, michelangeloChoice,
      raphaelChoice, squirtleChoice]);
    shouldBeEnabled([saveButton, submitButton]);

    saveButton.click();
    expect(saveMessage.getText()).toContain("Saved");
    shouldBeEnabled([submitButton]);
    shouldBeDisabled([saveButton]);

    squirtleChoice.click();
    shouldBeSelected([leonardoChoice, squirtleChoice]);
    shouldBeUnselected([donatelloChoice, michelangeloChoice, raphaelChoice]);
    shouldBeEnabled([saveButton, submitButton]);

    submitButton.click();
    expect(submitMessage.getText()).toContain("Submitted");
    shouldBeDisabled([saveButton, submitButton]);

    // should still be able to choose after submitting
    michelangeloChoice.click();
    shouldBeSelected([leonardoChoice, squirtleChoice, michelangeloChoice]);
    shouldBeUnselected([donatelloChoice, raphaelChoice]);
    shouldBeEnabled([saveButton, submitButton]);

    // unselect a previous choice
    squirtleChoice.click();
    shouldBeSelected([leonardoChoice, michelangeloChoice]);
    shouldBeUnselected([donatelloChoice, raphaelChoice, squirtleChoice]);
  });

  it('should show previous chosen multiple-choice items', () => {
    prevButton.click();
    expect(nodeDropDownMenu.getText()).toBe('1.5: Multiple Choice Step Single Answer');
    nextButton.click();
    expect(nodeDropDownMenu.getText()).toBe('1.6: Multiple Choice Step Multiple Answer');

    shouldBeSelected([leonardoChoice, michelangeloChoice]);
    shouldBeUnselected([donatelloChoice, raphaelChoice, squirtleChoice]);
  });
});
