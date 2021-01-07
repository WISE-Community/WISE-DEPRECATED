import authoringToolModule from '../../../authoringTool/authoringTool';

let $controller;
let $rootScope;
let $scope;
let drawAuthoringController;
let component;

describe('DrawAuthoringController', () => {
  beforeEach(angular.mock.module(authoringToolModule.name));

  beforeEach(inject((_$controller_, _$rootScope_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = createComponent();
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    $scope.authoringComponentContent = JSON.parse(JSON.stringify(component));
    drawAuthoringController = $controller('DrawAuthoringController', { $scope: $scope });
    drawAuthoringController.nodeId = 'node1';
  }));

  shouldSelectTheBackgroundImage();
  shouldMoveAStampUp();
  shouldMoveAStampDown();
});

function createComponent() {
  return {
    id: '6ib04ymmi8',
    type: 'Draw',
    prompt: 'Draw your favorite thing.',
    showSaveButton: false,
    showSubmitButton: false,
    stamps: {
      Stamps: ['carbon.png', 'oxygen.png']
    },
    tools: {
      select: true,
      line: true,
      shape: true,
      freeHand: true,
      text: true,
      stamp: true,
      strokeColor: true,
      fillColor: true,
      clone: true,
      strokeWidth: true,
      sendBack: true,
      sendForward: true,
      undo: true,
      redo: true,
      delete: true
    },
    showAddToNotebookButton: true,
    background: 'background.png'
  };
}

function shouldSelectTheBackgroundImage() {
  it('should select the background image', () => {
    drawAuthoringController.nodeId = 'node1';
    drawAuthoringController.componentId = 'component1';
    expect(drawAuthoringController.authoringComponentContent.background).toEqual('background.png');
    spyOn(drawAuthoringController, 'componentChanged').and.callFake(() => {});
    const event = {};
    const args = {
      nodeId: 'node1',
      componentId: 'component1',
      target: 'background',
      assetItem: {
        fileName: 'new_background.png'
      }
    };
    drawAuthoringController.assetSelected(event, args);
    expect(drawAuthoringController.authoringComponentContent.background).toEqual(
      'new_background.png'
    );
  });
}

function shouldMoveAStampUp() {
  it('should move a stamp up', () => {
    expect(drawAuthoringController.authoringComponentContent.stamps.Stamps[0]).toEqual(
      'carbon.png'
    );
    expect(drawAuthoringController.authoringComponentContent.stamps.Stamps[1]).toEqual(
      'oxygen.png'
    );
    spyOn(drawAuthoringController, 'componentChanged').and.callFake(() => {});
    drawAuthoringController.moveStampUp(1);
    expect(drawAuthoringController.authoringComponentContent.stamps.Stamps[0]).toEqual(
      'oxygen.png'
    );
    expect(drawAuthoringController.authoringComponentContent.stamps.Stamps[1]).toEqual(
      'carbon.png'
    );
  });
}

function shouldMoveAStampDown() {
  it('should move a stamp down', () => {
    expect(drawAuthoringController.authoringComponentContent.stamps.Stamps[0]).toEqual(
      'carbon.png'
    );
    expect(drawAuthoringController.authoringComponentContent.stamps.Stamps[1]).toEqual(
      'oxygen.png'
    );
    spyOn(drawAuthoringController, 'componentChanged').and.callFake(() => {});
    drawAuthoringController.moveStampDown(0);
    expect(drawAuthoringController.authoringComponentContent.stamps.Stamps[0]).toEqual(
      'oxygen.png'
    );
    expect(drawAuthoringController.authoringComponentContent.stamps.Stamps[1]).toEqual(
      'carbon.png'
    );
  });
}
