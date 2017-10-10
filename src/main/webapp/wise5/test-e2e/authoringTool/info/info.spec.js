'use strict';

var _common = require('../../common.js');

var common = _interopRequireWildcard(_common);

var _infoPage = require('./info.page.js');

var _infoPage2 = _interopRequireDefault(_infoPage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * E2E tests for Authoring Tool Info view
 */
describe('WISE Authoring Tool Info View', function () {

  var projectId = browser.params.authoringProjectId;

  beforeAll(function () {
    var page = new _infoPage2.default();
    var params = browser.params;
    browser.ignoreSynchronization = true; // doesn't use Angular
    browser.get('http://localhost:8080/wise/login');
    $('#username').sendKeys(params.login.user);
    $('#password').sendKeys(params.login.password);
    $('#signInButton').click();
  });

  beforeEach(function () {
    var page = new _infoPage2.default();
    browser.ignoreSynchronization = false; // uses Angular
    browser.get('http://localhost:8080/wise/author#/project/' + projectId + '/info');
    browser.refresh(); // needed for this issue https://github.com/angular/protractor/issues/2643
    browser.wait(function () {
      return page.projectTitleSpan.isPresent();
    }, 5000, 'Authoring Tool didn\'t load properly');
  });

  it('should allow user to change the project title', function () {
    var page = new _infoPage2.default();
    expect(page.projectTitleSpan.getText()).toEqual('My Science Project');
    element.all(by.repeater('metadataField in projectInfoController.metadataAuthoring.fields')).then(function (metadataField) {
      var titleInput = metadataField[0].element(by.model('projectInfoController.metadata[metadataField.key]'));
      expect(titleInput.getAttribute('value')).toEqual('My Science Project'); // should show the title of the project
      titleInput.clear(); // clear out what's there.
      titleInput.sendKeys('My Awesome Science Project');
    });
    page.clickProjectHomeButton();
    expect(page.projectTitleSpan.getText()).toEqual('My Awesome Science Project');
  });
});
//# sourceMappingURL=info.spec.js.map
