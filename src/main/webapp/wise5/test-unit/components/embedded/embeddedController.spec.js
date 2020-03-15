import vleModule from '../../../vle/vle';

let $controller;
let $rootScope;
let $scope;
let $httpBackend;
let embeddedController;
let component;

describe('EmbeddedController', () => {
  beforeEach(angular.mock.module(vleModule.name));

  beforeEach(inject((_$controller_, _$rootScope_, _$httpBackend_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    component = createComponent();
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    embeddedController = $controller('EmbeddedController', { $scope: $scope });
    embeddedController.nodeId = 'node1';
  }));

  shouldMergeAComponentState();
  shouldMergeASpecificFieldInAComponentState();
});

function createComponent() {
  return {
    id: '1sc05cn75f',
    type: 'Embedded',
    prompt: 'Use the model and learn stuff.',
    showSaveButton: false,
    showSubmitButton: false,
    isStudentAttachmentEnabled: true,
    gateClassmateResponses: true,
    showAddToNotebookButton: true
  };
}

function shouldMergeAComponentState() {
  it('should merge a component state', () => {
    const toComponentState = {
      componentType: 'Embedded',
      studentData: {
        modelScore: 1
      }
    };
    const fromComponentState = {
      componentType: 'Embedded',
      studentData: {
        modelScore: 2
      }
    };
    const mergedComponentState = embeddedController.mergeComponentState(
      toComponentState,
      fromComponentState
    );
    expect(mergedComponentState.studentData.modelScore).toEqual(2);
  });
}

function shouldMergeASpecificFieldInAComponentState() {
  it('should merge a specific field in a component state', () => {
    const toComponentState = {
      componentType: 'Embedded',
      studentData: {
        modelScore: 1,
        modelText: 'Try Again'
      }
    };
    const fromComponentState = {
      componentType: 'Embedded',
      studentData: {
        modelScore: 2,
        modelText: 'Good Job'
      }
    };
    const mergeFields = [
      {
        name: 'modelText',
        when: 'always',
        action: 'write'
      }
    ];
    const mergedComponentState = embeddedController.mergeComponentState(
      toComponentState,
      fromComponentState,
      mergeFields
    );
    expect(mergedComponentState.studentData.modelScore).toEqual(1);
    expect(mergedComponentState.studentData.modelText).toEqual('Good Job');
  });
}
