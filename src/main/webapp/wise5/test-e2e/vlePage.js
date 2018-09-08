'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VLEPage = function () {
  function VLEPage() {
    _classCallCheck(this, VLEPage);

    this.nodeDropDownMenu = element(by.model("stepToolsCtrl.toNodeId"));
    this.nextButton = element(by.id('nextButton'));
    this.prevButton = element(by.id('prevButton'));
    this.closeNodeButton = element(by.id('closeNodeButton'));
    this.accountButton = element(by.id('openAccountMenuButton'));
    this.accountMenu = element(by.cssContainingText('.md-open-menu-container', 'Preview Team'));
    this.notificationButton = element(by.id('viewNotificationsButton'));
    this.notificationMenu = element(by.cssContainingText('.md-open-menu-container', 'Alerts'));
    this.toggleConstraintsButton = element(by.id('toggleConstraints'));
    this.exitButton = element(by.id('goHomeButton'));
    this.logOutButton = element(by.id('signOutButton'));
  }

  _createClass(VLEPage, [{
    key: 'nodeSelectMenuShouldSay',
    value: function nodeSelectMenuShouldSay(expectedMenuText) {
      expect(this.nodeDropDownMenu.getText()).toBe(expectedMenuText);
    }
  }, {
    key: 'goToNextStep',
    value: function goToNextStep() {
      this.nextButton.click();
    }
  }, {
    key: 'goToPreviousStep',
    value: function goToPreviousStep() {
      this.prevButton.click();
    }
  }, {
    key: 'openAccountMenu',
    value: function openAccountMenu() {
      this.accountButton.click();
    }
  }, {
    key: 'openDropDownMenu',
    value: function openDropDownMenu() {
      this.nodeDropDownMenu.click();
    }
  }, {
    key: 'openNotificationMenu',
    value: function openNotificationMenu() {
      this.notificationButton.click();
    }
  }, {
    key: 'closeNode',
    value: function closeNode() {
      this.closeNodeButton.click();
    }
  }, {
    key: 'toggleConstraints',
    value: function toggleConstraints() {
      this.toggleConstraintsButton.click();
    }
  }]);

  return VLEPage;
}();

exports.default = VLEPage;
//# sourceMappingURL=vlePage.js.map
