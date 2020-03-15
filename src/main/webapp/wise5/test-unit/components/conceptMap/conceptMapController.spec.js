import vleModule from '../../../vle/vle';

let $controller;
let $rootScope;
let $scope;
let conceptMapController;
let component;

class MockConceptMapNode {
  constructor(draw, instanceId) {
    this.instanceId = instanceId;
  }
  getId() {
    return this.instanceId;
  }
  remove() {}
}

class MockConceptMapLink {
  constructor(draw, instanceId) {
    this.instanceId = instanceId;
  }
  getId() {
    return this.instanceId;
  }
  remove() {}
}

const mockConceptMapService = {
  newConceptMapNode: function(draw, instanceId) {
    return new MockConceptMapNode(draw, instanceId);
  },
  newConceptMapLink: function(draw, instanceId) {
    return new MockConceptMapLink(draw, instanceId);
  }
};

describe('ConceptMapController', () => {
  beforeEach(angular.mock.module(vleModule.name));

  beforeEach(inject((_$controller_, _$rootScope_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;

    component = createComponent();
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));

    conceptMapController = $controller('ConceptMapController', {
      $scope: $scope,
      ConceptMapService: mockConceptMapService
    });
    conceptMapController.nodeId = 'node1';
  }));

  shouldPopulateTheStudentWork();
  shouldClearTheConceptMap();
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

function shouldPopulateTheStudentWork() {
  it('should populate the student work', () => {
    const componentState = {
      clientSaveTime: 1542412588000,
      isSubmit: false,
      studentData: {
        conceptMapData: {
          nodes: [
            {
              originalId: 'node1',
              instanceId: 'studentNode1',
              fileName: 'sun.png',
              filePath: '/wise/curriculum/546/assets/sun.png',
              label: 'Sun',
              x: 162,
              y: 68,
              width: 100,
              height: 100,
              outgoingLinks: [
                {
                  originalId: 'link1',
                  instanceId: 'studentLink1',
                  label: 'Solar Radiation'
                }
              ],
              incomingLinks: []
            },
            {
              originalId: 'node2',
              instanceId: 'studentNode2',
              fileName: 'Space.png',
              filePath: '/wise/curriculum/546/assets/Space.png',
              label: 'Space',
              x: 416,
              y: 185,
              width: 100,
              height: 100,
              outgoingLinks: [],
              incomingLinks: [
                {
                  originalId: 'link1',
                  instanceId: 'studentLink1',
                  label: 'Solar Radiation'
                }
              ]
            }
          ],
          links: [
            {
              originalId: 'link1',
              instanceId: 'studentLink1',
              color: '#DDD266',
              label: 'Solar Radiation',
              curvature: 0,
              startCurveUp: false,
              endCurveUp: false,
              sourceNodeOriginalId: 'node1',
              sourceNodeInstanceId: 'studentNode1',
              sourceNodeLabel: 'Sun',
              destinationNodeOriginalId: 'node2',
              destinationNodeInstanceId: 'studentNode2',
              destinationNodeLabel: 'Space'
            }
          ]
        },
        submitCounter: 0
      },
      componentType: 'ConceptMap',
      nodeId: 'node1',
      componentId: 'ut00qpig10'
    };
    const setNodeMouseEventsSpy = spyOn(conceptMapController, 'setNodeMouseEvents');
    const setLinkMouseEventsSpy = spyOn(conceptMapController, 'setLinkMouseEvents');
    const moveLinkTextToFrontSpy = spyOn(conceptMapController, 'moveLinkTextToFront');
    const moveNodesToFrontSpy = spyOn(conceptMapController, 'moveNodesToFront');
    conceptMapController.setStudentWork(componentState);
    expect(setNodeMouseEventsSpy).toHaveBeenCalled();
    expect(setLinkMouseEventsSpy).toHaveBeenCalled();
    expect(moveLinkTextToFrontSpy).toHaveBeenCalled();
    expect(moveNodesToFrontSpy).toHaveBeenCalled();
    expect(conceptMapController.nodes.length).toEqual(2);
    expect(conceptMapController.links.length).toEqual(1);
  });
}

function shouldClearTheConceptMap() {
  it('should clear the concept map', () => {
    conceptMapController.addNode(new MockConceptMapNode(null, 'node1'));
    conceptMapController.addNode(new MockConceptMapNode(null, 'node2'));
    conceptMapController.addLink(new MockConceptMapLink(null, 'link1'));
    conceptMapController.addLink(new MockConceptMapLink(null, 'link2'));
    expect(conceptMapController.nodes.length).toEqual(2);
    expect(conceptMapController.links.length).toEqual(2);
    conceptMapController.clearConceptMap();
    expect(conceptMapController.nodes.length).toEqual(0);
    expect(conceptMapController.links.length).toEqual(0);
  });
}
