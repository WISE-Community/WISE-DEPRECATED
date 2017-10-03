'use strict';

var VLEPage = function VLEPage() {
  this.nodeDropDownMenu = element(by.model("stepToolsCtrl.toNodeId"));
  this.nextButton = element(by.id('nextButton'));
  this.prevButton = element(by.id('prevButton'));

  this.nodeSelectMenuShouldSay = function (expectedMenuText) {
    expect(this.nodeDropDownMenu.getText()).toBe(expectedMenuText);
  };

  this.goToNextStep = function () {
    this.nextButton.click();
  };

  this.goToPreviousStep = function () {
    this.prevButton.click();
  };
};

module.exports = VLEPage;
//# sourceMappingURL=vlePage.js.map
