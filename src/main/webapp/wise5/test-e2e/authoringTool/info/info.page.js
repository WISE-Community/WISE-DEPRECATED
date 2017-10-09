'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var InfoPage = function () {
  function InfoPage() {
    _classCallCheck(this, InfoPage);

    this.projectTitleSpan = element(by.id('projectTitleSpan'));
    this.projectHomeButton = element(by.id('projectHomeButton'));
  }

  /**
   * Click the project home button on the left side bar to go back to the
   * project view.
   */


  _createClass(InfoPage, [{
    key: 'clickProjectHomeButton',
    value: function clickProjectHomeButton() {
      this.projectHomeButton.click();
    }
  }]);

  return InfoPage;
}();

exports.default = InfoPage;
//# sourceMappingURL=info.page.js.map
