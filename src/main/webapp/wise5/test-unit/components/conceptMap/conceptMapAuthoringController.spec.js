import authoringToolModule from '../../../authoringTool/authoringTool';

let $controller;
let $rootScope;
let $scope;
let conceptMapAuthoringController;
let component;

describe('ConceptMapAuthoringController', () => {
  beforeEach(angular.mock.module(authoringToolModule.name));

  beforeEach(inject((_$controller_, _$rootScope_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;

    component = createComponent();
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    $scope.authoringComponentContent = JSON.parse(JSON.stringify(component));

    conceptMapAuthoringController = $controller('ConceptMapAuthoringController', {
      $scope: $scope
    });
    conceptMapAuthoringController.nodeId = 'node1';
  }));

  shouldMoveTheObjectUp();
});

function createComponent() {
  return {
    id: 'ut00qpig10',
    type: 'ConceptMap',
    prompt: '',
    showSaveButton: false,
    showSubmitButton: false,
    width: 800,
    height: 600,
    background: null,
    stretchBackground: null,
    nodes: [
      {
        id: 'node1',
        label: 'Sun',
        fileName: 'sun.png',
        width: 100,
        height: 100
      },
      {
        id: 'node2',
        label: 'Space',
        fileName: 'Space.png',
        width: 100,
        height: 100
      },
      {
        id: 'node3',
        label: 'Earths Surface',
        fileName: 'Earth_surface.png',
        width: 100,
        height: 100
      },
      {
        id: 'node4',
        label: 'Beneath Surface',
        fileName: 'Earth_beneath.png',
        width: 100,
        height: 100
      }
    ],
    linksTitle: '',
    links: [
      {
        id: 'link1',
        label: 'Solar Radiation',
        color: '#DDD266'
      },
      {
        id: 'link2',
        label: 'Infrared Radiation',
        color: '#B62467'
      },
      {
        id: 'link3',
        label: 'Heat',
        color: '#DE2D26'
      }
    ],
    rules: [],
    starterConceptMap: null,
    customRuleEvaluator: '',
    showAutoScore: false,
    showAutoFeedback: false,
    showNodeLabels: true,
    showAddToNotebookButton: true
  };
}

function shouldMoveTheObjectUp() {
  it('should move the object up', () => {
    const componentChangedSpy = spyOn(conceptMapAuthoringController, 'componentChanged');
    conceptMapAuthoringController.moveNodeUpButtonClicked(1);
    expect(componentChangedSpy).toHaveBeenCalled();
    expect(conceptMapAuthoringController.authoringComponentContent.nodes[0].id).toEqual('node2');
    expect(conceptMapAuthoringController.authoringComponentContent.nodes[1].id).toEqual('node1');
    expect(conceptMapAuthoringController.authoringComponentContent.nodes[2].id).toEqual('node3');
    expect(conceptMapAuthoringController.authoringComponentContent.nodes[3].id).toEqual('node4');
  });
}

function shouldMoveTheObjectDown() {
  it('should move the object down', () => {
    const componentChangedSpy = spyOn(conceptMapAuthoringController, 'componentChanged');
    conceptMapAuthoringController.moveNodeDownButtonClicked(1);
    expect(componentChangedSpy).toHaveBeenCalled();
    expect(conceptMapAuthoringController.authoringComponentContent.nodes[0].id).toEqual('node1');
    expect(conceptMapAuthoringController.authoringComponentContent.nodes[1].id).toEqual('node3');
    expect(conceptMapAuthoringController.authoringComponentContent.nodes[2].id).toEqual('node2');
    expect(conceptMapAuthoringController.authoringComponentContent.nodes[3].id).toEqual('node4');
  });
}
