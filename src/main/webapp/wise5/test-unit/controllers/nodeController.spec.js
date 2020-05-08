import vleModule from '../../vle/vle';

let $controller;
let $rootScope;
let $scope;
let ConfigService;
let ProjectService;
let StudentDataService;
let nodeController;

describe('NodeController', () => {
  beforeEach(angular.mock.module(vleModule.name));
  beforeEach(inject((
    _$controller_,
    _$rootScope_,
    _ConfigService_,
    _ProjectService_,
    _StudentDataService_
  ) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    ConfigService = _ConfigService_;
    ProjectService = _ProjectService_;
    StudentDataService = _StudentDataService_;
    spyOn(StudentDataService, 'getCurrentNode').and.returnValue({});
    spyOn(StudentDataService, 'saveVLEEvent').and.callFake(() => {});
    spyOn(ProjectService, 'isApplicationNode').and.returnValue(true);
    spyOn(ProjectService, 'getNodeById').and.returnValue({ components: [] });
    spyOn(ProjectService, 'getNodeTitleByNodeId').and.returnValue('');
    spyOn(ConfigService, 'isRunActive').and.returnValue(true);
    spyOn(ConfigService, 'isEndedAndLocked').and.returnValue(false);
    nodeController = $controller('NodeController', {
      $scope: $scope,
      ConfigService: ConfigService,
      ProjectService: ProjectService,
      StudentDataService: StudentDataService
    });
  }));

  createAndSaveComponentData();
  getDataArraysToSaveFromComponentStates();
  getAnnotationsFromComponentStates();
});

function createAndSaveComponentData() {
  it('should create and save component data and call save to server with non null component states',
      async () => {
    const componentState1 = { id: 1 };
    const componentState2 = { id: 2 };
    const componentStates = [componentState1, componentState2];
    spyOn(nodeController, 'createComponentStates').and.callFake(() => {
      return Promise.resolve(componentStates);
    });
    spyOn(StudentDataService, 'saveToServer').and.callFake(() => {
      return Promise.resolve({});
    });
    await nodeController.createAndSaveComponentData(false);
    expect(StudentDataService.saveToServer).toHaveBeenCalledWith(
      [componentState1, componentState2],
      [],
      []
    );
  });
}

function getDataArraysToSaveFromComponentStates() {
  it('should get data arrays to save from component states', () => {
    const annotation1 = { id: 100 };
    const annotation2 = { id: 200 };
    const annotation3 = { id: 300 };
    const componentState1 = { id: 1, annotations: [annotation1, annotation2] };
    const componentState2 = { id: 2, annotations: [annotation3] };
    const componentStatesFromComponents = [componentState1, componentState2];
    const {
      componentStates,
      componentEvents,
      componentAnnotations
    } = nodeController.getDataArraysToSaveFromComponentStates(componentStatesFromComponents);
    expect(componentStates.length).toEqual(2);
    expect(componentStates[0]).toEqual(componentState1);
    expect(componentStates[1]).toEqual(componentState2);
    expect(componentStates[0].annotations).toBeUndefined();
    expect(componentStates[1].annotations).toBeUndefined();
    expect(componentEvents.length).toEqual(0);
    expect(componentAnnotations.length).toEqual(3);
    expect(componentAnnotations[0]).toEqual(annotation1);
    expect(componentAnnotations[1]).toEqual(annotation2);
    expect(componentAnnotations[2]).toEqual(annotation3);
  });
}

function getAnnotationsFromComponentStates() {
  it('should get annotations from component states', () => {
    const annotation1 = { id: 100 };
    const annotation2 = { id: 200 };
    const annotation3 = { id: 300 };
    const componentState1 = { id: 1, annotations: [annotation1, annotation2] };
    const componentState2 = { id: 2, annotations: [annotation3] };
    const componentStatesFromComponents = [componentState1, componentState2];
    const componentAnnotations = nodeController.getAnnotationsFromComponentStates(
      componentStatesFromComponents
    );
    expect(componentAnnotations.length).toEqual(3);
    expect(componentAnnotations[0]).toEqual(annotation1);
    expect(componentAnnotations[1]).toEqual(annotation2);
    expect(componentAnnotations[2]).toEqual(annotation3);
  });
}
