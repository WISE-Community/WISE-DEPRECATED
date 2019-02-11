import angular from 'angular';
import mainModule from 'authoringTool/main';
import 'angular-mocks';

describe('DiscussionAuthoringController', () => {

  let $controller;
  let $rootScope;
  let $scope;
  let discussionAuthoringController;
  let component;

  beforeEach(angular.mock.module(mainModule.name));

  beforeEach(inject((_$controller_, _$rootScope_) => {
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
