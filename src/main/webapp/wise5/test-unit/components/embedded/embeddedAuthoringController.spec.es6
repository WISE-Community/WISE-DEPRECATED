import angular from 'angular';
import mainModule from 'authoringTool/main';
import 'angular-mocks';

describe('EmbeddedAuthoringController', () => {

  let $controller;
  let $rootScope;
  let $scope;
  let embeddedAuthoringController;
  let component;

  beforeEach(angular.mock.module(mainModule.name));

  beforeEach(inject((_$controller_, _$rootScope_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = {
      'id': '86fel4wjm4',
      'type': 'Embedded',
      'prompt': '',
      'showSaveButton': false,
      'showSubmitButton': false,
      'url': 'glucose.html',
      'showAddToNotebookButton': true,
      'width': null
    };
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    $scope.authoringComponentContent = JSON.parse(JSON.stringify(component));
    embeddedAuthoringController = $controller('EmbeddedAuthoringController', { $scope: $scope });
    embeddedAuthoringController.nodeId = 'node1';
  }));

  it('should select the model file', () => {
    embeddedAuthoringController.nodeId = 'node1';
    embeddedAuthoringController.componentId = 'component1';
    expect(embeddedAuthoringController.authoringComponentContent.url).toEqual('glucose.html');
    spyOn(embeddedAuthoringController, 'authoringViewComponentChanged').and.callFake(() => {});
    const event = {};
    const args = {
      nodeId: 'node1',
      componentId: 'component1',
      target: 'modelFile',
      assetItem: {
        fileName: 'thermo.html'
      }
    };
    embeddedAuthoringController.assetSelected(event, args);
    expect(embeddedAuthoringController.authoringComponentContent.url).toEqual('thermo.html');
  });

});
