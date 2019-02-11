'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('authoringTool/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('DiscussionAuthoringController', function () {

  var $controller = void 0;
  var $rootScope = void 0;
  var $scope = void 0;
  var discussionAuthoringController = void 0;
  var component = void 0;

  beforeEach(_angular2.default.mock.module(_main2.default.name));

  beforeEach(inject(function (_$controller_, _$rootScope_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = {
      'id': '1sc05cn75f',
      'type': 'Discussion',
      'prompt': 'What is your favorite ice cream flavor?',
      'showSaveButton': false,
      'showSubmitButton': false,
      'isStudentAttachmentEnabled': true,
      'gateClassmateResponses': true,
      'showAddToNotebookButton': true
    };
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    $scope.authoringComponentContent = JSON.parse(JSON.stringify(component));
    discussionAuthoringController = $controller('DiscussionAuthoringController', { $scope: $scope });
    discussionAuthoringController.nodeId = 'node1';
  }));
});
//# sourceMappingURL=discussionAuthoringController.spec.js.map
