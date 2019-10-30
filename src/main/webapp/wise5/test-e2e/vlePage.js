export default class VLEPage {
  constructor() {
    this.nodeDropDownMenu = element(by.model("stepToolsCtrl.toNodeId"));
    this.nextButton = element(by.id('nextButton'));
    this.prevButton = element(by.id('prevButton'));
    this.closeNodeButton = element(by.id('closeNodeButton'));
    this.accountButton = element(by.id('openAccountMenuButton'));
    this.accountMenu = element(by.cssContainingText('.md-open-menu-container','Preview Team'));
    this.notificationButton = element(by.id('viewNotificationsButton'));
    this.notificationMenu = element(by.cssContainingText('.md-open-menu-container','Alerts'));
    this.toggleConstraintsButton = element(by.id('toggleConstraints'));
    this.exitButton = element(by.id('goHomeButton'));
    this.logOutButton = element(by.id('signOutButton'));
  }
  
  nodeSelectMenuShouldSay(expectedMenuText) {
    expect(this.nodeDropDownMenu.getText()).toBe(expectedMenuText);
  }

  goToNextStep() {
    this.nextButton.click();
  }

  goToPreviousStep() {
    this.prevButton.click();
  }

  openAccountMenu() {
    this.accountButton.click();
  }

  openDropDownMenu() {
    this.nodeDropDownMenu.click();
  }

  openNotificationMenu() {
    this.notificationButton.click();
  }

  closeNode() {
    this.closeNodeButton.click();
  }

  toggleConstraints() {
    this.toggleConstraintsButton.click();
  }
}
