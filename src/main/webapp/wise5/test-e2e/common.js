export function hasClass(element, cls) {
  return element.getAttribute('class').then((classes) => {
    return classes.split(' ').indexOf(cls) !== -1;
  });
}

export function shouldBePresent(...elements) {
  for (let element of elements) {
    expect(element.isPresent()).toBeTruthy();
  }
}

export function shouldBeAbsent(...elements) {
  for (let element of elements) {
    expect(element.isPresent()).toBeFalsy();
  }
}

export function shouldBeHidden(...elements) {
  for (let element of elements) {
    expect(element.isDisplayed()).toBeFalsy();
  }
}

export function shouldBeDisplayed(...elements) {
  for (let element of elements) {
    expect(element.isDisplayed()).toBeTruthy();
  }
}

export function shouldBeDisabled(...elements) {
  for (let element of elements) {
    expect(element.getAttribute('disabled')).toBeTruthy();
  }
}

export function shouldBeEnabled(...elements) {
  for (let element of elements) {
    expect(element.getAttribute('disabled')).toBeNull();
  }
}

export function shouldBeSelected(...choices) {
  for (let choice of choices) {
    expect(choice.getAttribute('aria-checked')).toBe("true");
  }
}

export function shouldBeUnselected(...choices) {
  for (let choice of choices) {
    expect(choice.getAttribute('aria-checked')).toBe("false");
  }
}

export function urlShouldBe(expectedURL) {
  expect(browser.getCurrentUrl()).toEqual(expectedURL);
}

export function urlShouldMatch(urlRegex) {
  expect(browser.getCurrentUrl()).toMatch(urlRegex);
}
