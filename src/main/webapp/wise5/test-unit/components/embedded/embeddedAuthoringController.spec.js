import authoringToolModule from '../../../authoringTool/authoringTool';

let $controller;
let $rootScope;
let $scope;
let embeddedAuthoringController;
let component;

describe('EmbeddedAuthoringController', () => {
  beforeEach(angular.mock.module(authoringToolModule.name));

  beforeEach(inject((_$controller_, _$rootScope_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = createComponent();
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    $scope.authoringComponentContent = JSON.parse(JSON.stringify(component));
    embeddedAuthoringController = $controller('EmbeddedAuthoringController', {
      $scope: $scope
    });
    embeddedAuthoringController.nodeId = 'node1';
  }));

  shouldSelectTheModelFile();
  shouldHaveADefaultHeight();
  shouldSetTheWidthAndHeight();
});

function createComponent() {
  return {
    id: '86fel4wjm4',
    type: 'Embedded',
    prompt: '',
    showSaveButton: false,
    showSubmitButton: false,
    url: 'glucose.html',
    showAddToNotebookButton: true,
    width: null
  };
}

function shouldSelectTheModelFile() {
  it('should select the model file', () => {
    embeddedAuthoringController.nodeId = 'node1';
    embeddedAuthoringController.componentId = 'component1';
    expect(embeddedAuthoringController.authoringComponentContent.url).toEqual('glucose.html');
    spyOn(embeddedAuthoringController, 'componentChanged').and.callFake(() => {});
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
}

function shouldHaveADefaultHeight() {
  it('should have a default height', () => {
    expect(embeddedAuthoringController.height).toEqual('600px');
  });
}

function shouldSetTheWidthAndHeight() {
  it('should set the width and height', () => {
    expect(embeddedAuthoringController.width).toEqual('100%');
    expect(embeddedAuthoringController.height).toEqual('600px');
    embeddedAuthoringController.setWidthAndHeight(400, 300);
    expect(embeddedAuthoringController.width).toEqual('400px');
    expect(embeddedAuthoringController.height).toEqual('300px');
  });
}
