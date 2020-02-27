import classroomMonitorModule from '../../classroomMonitor/classroomMonitor';

let ConfigService, ProjectService, TeacherDataService, $rootScope;

describe('TeacherDataService', () => {
  beforeEach(angular.mock.module(classroomMonitorModule.name));

  beforeEach(inject(function(
    _ConfigService_,
    _ProjectService_,
    _TeacherDataService_,
    _$rootScope_
  ) {
    ConfigService = _ConfigService_;
    ProjectService = _ProjectService_;
    TeacherDataService = _TeacherDataService_;
    $rootScope = _$rootScope_;
  }));

  shouldGetAllRelatedComponents();
  shouldGetConnectedComponentsIfNecessary();
  shouldCheckIfConnectedComponentStudentDataIsRequired();
  shouldGetComponentStatesByComponentIds();
  shouldGetComponentStatesByWorkgroupIdAndComponentIds();
  shouldAddAComponentStatWhenThereAreNoComponentStates();
  shoudProcessEvents();
  shouldAddEventToEventsByWorkgroupId();
  shouldAddEventToEventsByNodeId();
  shouldProcessAnnotations();
  shouldAddAnnotationToAnnotationsToWorkgroupId();
  shouldAddAnnotationToAnnotationsByNodeId();
  shouldAddAComponentStateWhenThereAreAlreadyComponentStates();
  shouldUpdateAComponentState();
  shouldGetTheLatestComponentStatesByWorkgroupIdWhenFromDifferentComponents();
  shouldGetTheLatestComponentStatesByWorkgroupIdWhenFromSameComponent();
  shouldGetTheLatestComponentStatesByWorkgroupIdWhenSomeFromDifferentComponents();
  shouldGetTheLatestComponentStatesByWorkgroupIdWhenSomeFromDifferentWorkgroups();
  shouldGetTheLatestComponentStatesByWorkgroupIdWhenSomeFromDifferentNodes();
  shouldInjectRevisionCounterWhenFromSameComponent();
  shouldInjectRevisionCounterWhenFromDifferentComponents();
  shouldInjectRevisionCounterWhenSomeFromDifferentComponents();
  shouldCalculateIfThereIsAnyPeriodPausedWhenAllNotPaused();
  shouldCalculateIfThereIsAnyPeriodPausedWhenAllPaused();
  shouldCalculateIfTHereIsAnyPeriodPausedWhenSomePaused();
  shouldCalculateIfAPeriodIsPausedWhenNoneArePaused();
  shouldCalculateIfAPeriodIsPausedWhenOneIsPaused();
  shouldCalculateIfAllPeriodsArePausedWhenNotAllPaused();
  shouldCalculateIfAllPeriodsArePausedWhenAllPaused();
  shouldUpdatePausedRunStatusForSinglePeriod();
  shouldUpdatePausedRunStatusForAllPeriods();
  shouldInitializePeriods();
  shouldSetTheCurrentPeriodWhenThereIsNoCurrentWorkgroup();
  shouldSetTheCurrentPeriodWhenCurrentWorkgroupIsInCurrentPeriod();
  shouldSetTheCurrentPeriodWhenCurrentWorkgroupIsNotInCurrentPeriod();
});

function initializeIdToNode() {
  ProjectService.idToNode['node1'] = {
    id: 'node1',
    components: [
      {
        id: 'vg5uzarhir',
        type: 'Discussion'
      },
      {
        id: '4h834b2zbd',
        type: 'OpenResponse'
      }
    ]
  };
  ProjectService.idToNode['node2'] = {
    id: 'node2',
    components: [
      {
        id: '1xph6u3mea',
        type: 'Discussion',
        connectedComponents: [
          {
            componentId: 'vg5uzarhir',
            type: 'importWork',
            nodeId: 'node1'
          }
        ]
      }
    ]
  };

  ProjectService.idToNode['node3'] = {
    id: 'node3',
    components: [
      {
        id: 'j2fsu892t3',
        type: 'Graph',
        connectedComponents: [
          {
            componentId: '4h834b2zbd',
            type: 'importWork',
            nodeId: 'node1'
          }
        ]
      }
    ]
  };
}

function shouldGetAllRelatedComponents() {
  it('should get all related components', () => {
    initializeIdToNode();
    const node1Components = TeacherDataService.getAllRelatedComponents('node1');
    expect(node1Components.length).toEqual(2);
    expect(node1Components[0].nodeId).toEqual('node1');
    expect(node1Components[0].componentId).toEqual('vg5uzarhir');
    expect(node1Components[1].nodeId).toEqual('node1');
    expect(node1Components[1].componentId).toEqual('4h834b2zbd');
    const node2Components = TeacherDataService.getAllRelatedComponents('node2');
    expect(node2Components.length).toEqual(2);
    expect(node2Components[0].nodeId).toEqual('node2');
    expect(node2Components[0].componentId).toEqual('1xph6u3mea');
    expect(node2Components[1].nodeId).toEqual('node1');
    expect(node2Components[1].componentId).toEqual('vg5uzarhir');
    const node3Components = TeacherDataService.getAllRelatedComponents('node3');
    expect(node3Components.length).toEqual(1);
    expect(node3Components[0].nodeId).toEqual('node3');
    expect(node3Components[0].componentId).toEqual('j2fsu892t3');
  });
}

function shouldGetConnectedComponentsIfNecessary() {
  it('should get connected components if necessary', () => {
    initializeIdToNode();
    const node2ConnectedComponents = TeacherDataService.getConnectedComponentsIfNecessary([
      { nodeId: 'node2', componentId: '1xph6u3mea' }
    ]);
    expect(node2ConnectedComponents.length).toEqual(1);
    expect(node2ConnectedComponents[0].nodeId).toEqual('node1');
    expect(node2ConnectedComponents[0].componentId).toEqual('vg5uzarhir');
    const node3ConnectedComponents = TeacherDataService.getConnectedComponentsIfNecessary([
      { nodeId: 'node3', componentId: 'j2fsu892t3' }
    ]);
    expect(node3ConnectedComponents.length).toEqual(0);
  });
}

function shouldCheckIfConnectedComponentStudentDataIsRequired() {
  it('should check if connected component student data is required', () => {
    const componentContent1 = {
      id: '1xph6u3mea',
      type: 'Discussion',
      connectedComponents: [
        {
          componentId: 'vg5uzarhir',
          type: 'importWork',
          nodeId: 'node1'
        }
      ]
    };
    expect(TeacherDataService.isConnectedComponentStudentDataRequired(componentContent1)).toEqual(
      true
    );
    const componentContent2 = {
      id: 'j2fsu892t3',
      type: 'Graph',
      connectedComponents: [
        {
          componentId: '4h834b2zbd',
          type: 'importWork',
          nodeId: 'node1'
        }
      ]
    };
    expect(TeacherDataService.isConnectedComponentStudentDataRequired(componentContent2)).toEqual(
      false
    );
  });
}

function shouldGetComponentStatesByComponentIds() {
  it('should get component states by component ids', () => {
    TeacherDataService.studentData.componentStatesByComponentId['vg5uzarhir'] = [
      {
        id: 1,
        nodeId: 'node1',
        componentId: 'vg5uzarhir',
        studentData: {
          response: 'hello'
        }
      }
    ];
    TeacherDataService.studentData.componentStatesByComponentId['1xph6u3mea'] = [
      {
        id: 1,
        nodeId: 'node2',
        componentId: '1xph6u3mea',
        studentData: {
          response: 'hello2'
        }
      }
    ];
    const componentStates1 = TeacherDataService.getComponentStatesByComponentIds(['vg5uzarhir']);
    expect(componentStates1.length).toEqual(1);
    const componentStates2 = TeacherDataService.getComponentStatesByComponentIds([
      'vg5uzarhir',
      '1xph6u3mea'
    ]);
    expect(componentStates2.length).toEqual(2);
  });
}

function shouldGetComponentStatesByWorkgroupIdAndComponentIds() {
  it('should get component states by workgroup id and component ids', () => {
    const componentState1 = {
      id: 1,
      nodeId: 'node1',
      componentId: 'vg5uzarhir',
      workgroupId: 100,
      studentData: {
        response: 'hello'
      }
    };
    const componentState2 = {
      id: 2,
      nodeId: 'node2',
      componentId: '1xph6u3mea',
      workgroupId: 200,
      studentData: {
        response: 'hello2'
      }
    };
    const componentState3 = {
      id: 3,
      nodeId: 'node3',
      componentId: 'q2fsu892t3',
      workgroupId: 200,
      studentData: {
        response: 'hello3'
      }
    };
    TeacherDataService.studentData.componentStatesByComponentId['vg5uzarhir'] = [componentState1];
    TeacherDataService.studentData.componentStatesByComponentId['1xph6u3mea'] = [componentState2];
    TeacherDataService.studentData.componentStatesByComponentId['q2fsu892t3'] = [componentState3];
    TeacherDataService.studentData.componentStatesByWorkgroupId[100] = [componentState1];
    TeacherDataService.studentData.componentStatesByWorkgroupId[200] = [
      componentState2,
      componentState3
    ];
    const componentStates1 = TeacherDataService.getComponentStatesByWorkgroupIdAndComponentIds(
      100,
      ['vg5uzarhir']
    );
    expect(componentStates1.length).toEqual(1);
    const componentStates2 = TeacherDataService.getComponentStatesByWorkgroupIdAndComponentIds(
      200,
      ['vg5uzarhir', '1xph6u3mea']
    );
    expect(componentStates2.length).toEqual(1);
    const componentStates3 = TeacherDataService.getComponentStatesByWorkgroupIdAndComponentIds(
      200,
      ['vg5uzarhir', '1xph6u3mea', 'q2fsu892t3']
    );
    expect(componentStates3.length).toEqual(2);
  });
}

function shouldAddAComponentStatWhenThereAreNoComponentStates() {
  it('should add a component state when there are no component states', () => {
    const workgroupId1 = 1;
    const nodeId1 = 'node1';
    const componentId1 = 'component1';
    const componentState1 = {
      workgroupId: workgroupId1,
      nodeId: nodeId1,
      componentId: componentId1
    };
    const studentData = TeacherDataService.studentData;
    expect(studentData.componentStatesByWorkgroupId[workgroupId1]).toBeUndefined();
    expect(studentData.componentStatesByNodeId[nodeId1]).toBeUndefined();
    expect(studentData.componentStatesByComponentId[componentId1]).toBeUndefined();
    TeacherDataService.addOrUpdateComponentState(componentState1);
    expect(studentData.componentStatesByWorkgroupId[workgroupId1].length).toEqual(1);
    expect(studentData.componentStatesByWorkgroupId[workgroupId1][0]).toEqual(componentState1);
    expect(studentData.componentStatesByNodeId[nodeId1].length).toEqual(1);
    expect(studentData.componentStatesByNodeId[nodeId1][0]).toEqual(componentState1);
    expect(studentData.componentStatesByComponentId[componentId1].length).toEqual(1);
    expect(studentData.componentStatesByComponentId[componentId1][0]).toEqual(componentState1);
  });
}

function shoudProcessEvents() {
  it('should process events', () => {
    const nodeId1 = 'node1';
    const workgroupId1 = 100;
    const event1 = {
      id: 1,
      workgroupId: workgroupId1,
      nodeId: nodeId1,
      serverSaveTime: 1000
    };
    const workgroupId2 = 200;
    const event2 = {
      id: 2,
      workgroupId: workgroupId2,
      nodeId: nodeId1,
      serverSaveTime: 2000
    };
    const events = [event1, event2];
    TeacherDataService.processEvents(events);
    const workgroup1Events = TeacherDataService.studentData.eventsByWorkgroupId[workgroupId1];
    expect(workgroup1Events.length).toEqual(1);
    expect(workgroup1Events[0]).toEqual(event1);
    const workgroup2Events = TeacherDataService.studentData.eventsByWorkgroupId[workgroupId2];
    expect(workgroup2Events.length).toEqual(1);
    expect(workgroup2Events[0]).toEqual(event2);
    const node1Events = TeacherDataService.studentData.eventsByNodeId[nodeId1];
    expect(node1Events.length).toEqual(2);
    expect(node1Events[0]).toEqual(event1);
    expect(node1Events[1]).toEqual(event2);
  });
}

function shouldAddEventToEventsByWorkgroupId() {
  it('should add event to events by workgroup id', () => {
    const nodeId1 = 'node1';
    const workgroupId1 = 100;
    const event1 = {
      id: 1,
      workgroupId: workgroupId1,
      nodeId: nodeId1,
      serverSaveTime: 1000
    };
    TeacherDataService.initializeEventsDataStructures();
    TeacherDataService.addEventToEventsByWorkgroupId(event1);
    const events = TeacherDataService.studentData.eventsByWorkgroupId[workgroupId1];
    expect(events.length).toEqual(1);
    expect(events[0]).toEqual(event1);
  });
}

function shouldAddEventToEventsByNodeId() {
  it('should add event to events by node id', () => {
    const nodeId1 = 'node1';
    const workgroupId1 = 100;
    const event1 = {
      id: 1,
      workgroupId: workgroupId1,
      nodeId: nodeId1,
      serverSaveTime: 1000
    };
    TeacherDataService.initializeEventsDataStructures();
    TeacherDataService.addEventToEventsByNodeId(event1);
    const events = TeacherDataService.studentData.eventsByNodeId[nodeId1];
    expect(events.length).toEqual(1);
    expect(events[0]).toEqual(event1);
  });
}

function shouldProcessAnnotations() {
  it('should process annotations', () => {
    const nodeId1 = 'node1';
    const workgroupId1 = 100;
    const annotation1 = {
      id: 1,
      toWorkgroupId: workgroupId1,
      nodeId: nodeId1
    };
    const workgroupId2 = 200;
    const annotation2 = {
      id: 2,
      toWorkgroupId: workgroupId2,
      nodeId: nodeId1
    };
    const annotations = [annotation1, annotation2];
    TeacherDataService.processAnnotations(annotations);
    const workgroup1Annotations =
      TeacherDataService.studentData.annotationsToWorkgroupId[workgroupId1];
    expect(workgroup1Annotations.length).toEqual(1);
    expect(workgroup1Annotations[0]).toEqual(annotation1);
    const workgroup2Annotations =
      TeacherDataService.studentData.annotationsToWorkgroupId[workgroupId2];
    expect(workgroup2Annotations.length).toEqual(1);
    expect(workgroup2Annotations[0]).toEqual(annotation2);
    const node1Annotations = TeacherDataService.studentData.annotationsByNodeId[nodeId1];
    expect(node1Annotations.length).toEqual(2);
    expect(node1Annotations[0]).toEqual(annotation1);
    expect(node1Annotations[1]).toEqual(annotation2);
  });
}

function shouldAddAnnotationToAnnotationsToWorkgroupId() {
  it('should add annotation to annotations to workgroup id', () => {
    const nodeId1 = 'node1';
    const workgroupId1 = 100;
    const annotation1 = {
      id: 1,
      toWorkgroupId: workgroupId1,
      nodeId: nodeId1
    };
    TeacherDataService.initializeAnnotationsDataStructures();
    TeacherDataService.addAnnotationToAnnotationsToWorkgroupId(annotation1);
    const annotations = TeacherDataService.studentData.annotationsToWorkgroupId[workgroupId1];
    expect(annotations.length).toEqual(1);
    expect(annotations[0]).toEqual(annotation1);
  });
}

function shouldAddAnnotationToAnnotationsByNodeId() {
  it('should add annotation to annotations by node id', () => {
    const nodeId1 = 'node1';
    const workgroupId1 = 100;
    const annotation1 = {
      id: 1,
      toWorkgroupId: workgroupId1,
      nodeId: nodeId1
    };
    TeacherDataService.initializeAnnotationsDataStructures();
    TeacherDataService.addAnnotationToAnnotationsByNodeId(annotation1);
    const annotations = TeacherDataService.studentData.annotationsByNodeId[nodeId1];
    expect(annotations.length).toEqual(1);
    expect(annotations[0]).toEqual(annotation1);
  });
}

function shouldAddAComponentStateWhenThereAreAlreadyComponentStates() {
  it('should add a component state when there are already component states', () => {
    const workgroupId1 = 1;
    const nodeId1 = 'node1';
    const componentId1 = 'component1';
    const componentState1 = {
      id: 1,
      workgroupId: workgroupId1,
      nodeId: nodeId1,
      componentId: componentId1,
      studentData: {
        response: 'answer1'
      }
    };
    TeacherDataService.addOrUpdateComponentState(componentState1);
    const studentData = TeacherDataService.studentData;
    expect(studentData.componentStatesByWorkgroupId[workgroupId1].length).toEqual(1);
    expect(studentData.componentStatesByNodeId[nodeId1].length).toEqual(1);
    expect(studentData.componentStatesByComponentId[componentId1].length).toEqual(1);
    const componentState2 = {
      id: 2,
      workgroupId: workgroupId1,
      nodeId: nodeId1,
      componentId: componentId1,
      studentData: {
        response: 'answer2'
      }
    };
    TeacherDataService.addOrUpdateComponentState(componentState2);
    expect(studentData.componentStatesByWorkgroupId[workgroupId1].length).toEqual(2);
    expect(studentData.componentStatesByNodeId[nodeId1].length).toEqual(2);
    expect(studentData.componentStatesByComponentId[componentId1].length).toEqual(2);
  });
}

function shouldUpdateAComponentState() {
  it('should update a component state', () => {
    const componentStateId1 = 1;
    const workgroupId1 = 1;
    const nodeId1 = 'node1';
    const componentId1 = 'component1';
    const componentState1 = {
      id: componentStateId1,
      workgroupId: workgroupId1,
      nodeId: nodeId1,
      componentId: componentId1,
      studentData: {
        response: 'answer1'
      }
    };
    TeacherDataService.addOrUpdateComponentState(componentState1);
    const studentData = TeacherDataService.studentData;
    expect(studentData.componentStatesByWorkgroupId[workgroupId1].length).toEqual(1);
    expect(studentData.componentStatesByNodeId[nodeId1].length).toEqual(1);
    expect(studentData.componentStatesByComponentId[componentId1].length).toEqual(1);
    expect(studentData.componentStatesByWorkgroupId[workgroupId1][0].studentData.response).toEqual(
      'answer1'
    );
    expect(studentData.componentStatesByNodeId[nodeId1][0].studentData.response).toEqual('answer1');
    expect(studentData.componentStatesByComponentId[componentId1][0].studentData.response).toEqual(
      'answer1'
    );
    const componentState2 = {
      id: componentStateId1,
      workgroupId: workgroupId1,
      nodeId: nodeId1,
      componentId: componentId1,
      studentData: {
        response: 'answer2'
      }
    };
    TeacherDataService.addOrUpdateComponentState(componentState2);
    expect(studentData.componentStatesByWorkgroupId[workgroupId1].length).toEqual(1);
    expect(studentData.componentStatesByNodeId[nodeId1].length).toEqual(1);
    expect(studentData.componentStatesByComponentId[componentId1].length).toEqual(1);
    expect(studentData.componentStatesByWorkgroupId[workgroupId1][0].studentData.response).toEqual(
      'answer2'
    );
    expect(studentData.componentStatesByNodeId[nodeId1][0].studentData.response).toEqual('answer2');
    expect(studentData.componentStatesByComponentId[componentId1][0].studentData.response).toEqual(
      'answer2'
    );
  });
}

function shouldGetTheLatestComponentStatesByWorkgroupIdWhenFromDifferentComponents() {
  it(`should get the latest component states by workgroup id when all component states are from
  different components`, () => {
    const workgroupId = 1;
    const componentState1 = {
      id: 1,
      workgroupId: workgroupId,
      nodeId: 'node1',
      componentId: 'node1Component1'
    };
    const componentState2 = {
      id: 2,
      workgroupId: workgroupId,
      nodeId: 'node1',
      componentId: 'node1Component2'
    };
    const componentState3 = {
      id: 3,
      workgroupId: workgroupId,
      nodeId: 'node1',
      componentId: 'node1Component3'
    };
    TeacherDataService.addComponentStateByWorkgroupId(componentState1);
    TeacherDataService.addComponentStateByWorkgroupId(componentState2);
    TeacherDataService.addComponentStateByWorkgroupId(componentState3);
    const componentStates = TeacherDataService.getLatestComponentStatesByWorkgroupId(workgroupId);
    expect(componentStates.length).toEqual(3);
  });
}

function shouldGetTheLatestComponentStatesByWorkgroupIdWhenFromSameComponent() {
  it(`should get the latest component states by workgroup id when all component states are from
  the same component`, () => {
    const workgroupId = 1;
    const componentState1 = {
      id: 1,
      workgroupId: workgroupId,
      nodeId: 'node1',
      componentId: 'node1Component1'
    };
    const componentState2 = {
      id: 2,
      workgroupId: workgroupId,
      nodeId: 'node1',
      componentId: 'node1Component1'
    };
    const componentState3 = {
      id: 3,
      workgroupId: workgroupId,
      nodeId: 'node1',
      componentId: 'node1Component1'
    };
    TeacherDataService.addComponentStateByWorkgroupId(componentState1);
    TeacherDataService.addComponentStateByWorkgroupId(componentState2);
    TeacherDataService.addComponentStateByWorkgroupId(componentState3);
    const componentStates = TeacherDataService.getLatestComponentStatesByWorkgroupId(workgroupId);
    expect(componentStates.length).toEqual(1);
  });
}

function shouldGetTheLatestComponentStatesByWorkgroupIdWhenSomeFromDifferentComponents() {
  it(`should get the latest component states by workgroup id when some component states are from
  different components`, () => {
    const workgroupId = 1;
    const componentState1 = {
      id: 1,
      workgroupId: workgroupId,
      nodeId: 'node1',
      componentId: 'node1Component1'
    };
    const componentState2 = {
      id: 2,
      workgroupId: workgroupId,
      nodeId: 'node1',
      componentId: 'node1Component2'
    };
    const componentState3 = {
      id: 3,
      workgroupId: workgroupId,
      nodeId: 'node1',
      componentId: 'node1Component1'
    };
    TeacherDataService.addComponentStateByWorkgroupId(componentState1);
    TeacherDataService.addComponentStateByWorkgroupId(componentState2);
    TeacherDataService.addComponentStateByWorkgroupId(componentState3);
    const componentStates = TeacherDataService.getLatestComponentStatesByWorkgroupId(workgroupId);
    expect(componentStates.length).toEqual(2);
  });
}

function shouldGetTheLatestComponentStatesByWorkgroupIdWhenSomeFromDifferentWorkgroups() {
  it(`should get the latest component states by workgroup id when some component states are from
  different workgroups`, () => {
    const workgroupId1 = 1;
    const workgroupId2 = 2;
    const componentState1 = {
      id: 1,
      workgroupId: workgroupId1,
      nodeId: 'node1',
      componentId: 'node1Component1'
    };
    const componentState2 = {
      id: 2,
      workgroupId: workgroupId1,
      nodeId: 'node1',
      componentId: 'node1Component2'
    };
    const componentState3 = {
      id: 3,
      workgroupId: workgroupId2,
      nodeId: 'node1',
      componentId: 'node1Component1'
    };
    TeacherDataService.addComponentStateByWorkgroupId(componentState1);
    TeacherDataService.addComponentStateByWorkgroupId(componentState2);
    TeacherDataService.addComponentStateByWorkgroupId(componentState3);
    const componentStates1 = TeacherDataService.getLatestComponentStatesByWorkgroupId(workgroupId1);
    expect(componentStates1.length).toEqual(2);
    const componentStates2 = TeacherDataService.getLatestComponentStatesByWorkgroupId(workgroupId2);
    expect(componentStates2.length).toEqual(1);
  });
}

function shouldGetTheLatestComponentStatesByWorkgroupIdWhenSomeFromDifferentNodes() {
  it(`should get the latest component states by workgroup id when some component states are from
  different nodes`, () => {
    const workgroupId = 1;
    const node1 = 'node1';
    const node2 = 'node2';
    const componentState1 = {
      id: 1,
      workgroupId: workgroupId,
      nodeId: node1,
      componentId: 'node1Component1'
    };
    const componentState2 = {
      id: 2,
      workgroupId: workgroupId,
      nodeId: node1,
      componentId: 'node1Component2'
    };
    const componentState3 = {
      id: 3,
      workgroupId: workgroupId,
      nodeId: node2,
      componentId: 'node2Component1'
    };
    TeacherDataService.addComponentStateByWorkgroupId(componentState1);
    TeacherDataService.addComponentStateByWorkgroupId(componentState2);
    TeacherDataService.addComponentStateByWorkgroupId(componentState3);
    const componentStates = TeacherDataService.getLatestComponentStatesByWorkgroupId(workgroupId);
    expect(componentStates.length).toEqual(3);
  });
}

function shouldInjectRevisionCounterWhenFromSameComponent() {
  it(`should inject revision counter into component states when the component states are all from
  the same component`, () => {
    const workgroupId = 1;
    const componentState1 = {
      id: 1,
      workgroupId: workgroupId,
      nodeId: 'node1',
      componentId: 'node1Component1'
    };
    const componentState2 = {
      id: 2,
      workgroupId: workgroupId,
      nodeId: 'node1',
      componentId: 'node1Component1'
    };
    const componentState3 = {
      id: 3,
      workgroupId: workgroupId,
      nodeId: 'node1',
      componentId: 'node1Component1'
    };
    const componentStates = [componentState1, componentState2, componentState3];
    TeacherDataService.injectRevisionCounterIntoComponentStates(componentStates);
    expect(componentStates[0].revisionCounter).toEqual(1);
    expect(componentStates[1].revisionCounter).toEqual(2);
    expect(componentStates[2].revisionCounter).toEqual(3);
  });
}

function shouldInjectRevisionCounterWhenFromDifferentComponents() {
  it(`should inject revision counter into component states when the component states are all from
  different components`, () => {
    const workgroupId = 1;
    const componentState1 = {
      id: 1,
      workgroupId: workgroupId,
      nodeId: 'node1',
      componentId: 'node1Component1'
    };
    const componentState2 = {
      id: 2,
      workgroupId: workgroupId,
      nodeId: 'node1',
      componentId: 'node1Component2'
    };
    const componentState3 = {
      id: 3,
      workgroupId: workgroupId,
      nodeId: 'node1',
      componentId: 'node1Component3'
    };
    const componentStates = [componentState1, componentState2, componentState3];
    TeacherDataService.injectRevisionCounterIntoComponentStates(componentStates);
    expect(componentStates[0].revisionCounter).toEqual(1);
    expect(componentStates[1].revisionCounter).toEqual(1);
    expect(componentStates[2].revisionCounter).toEqual(1);
  });
}

function shouldInjectRevisionCounterWhenSomeFromDifferentComponents() {
  it(`should inject revision counter into component states when some of the component states are 
  different components`, () => {
    const workgroupId = 1;
    const componentState1 = {
      id: 1,
      workgroupId: workgroupId,
      nodeId: 'node1',
      componentId: 'node1Component1'
    };
    const componentState2 = {
      id: 2,
      workgroupId: workgroupId,
      nodeId: 'node1',
      componentId: 'node1Component1'
    };
    const componentState3 = {
      id: 3,
      workgroupId: workgroupId,
      nodeId: 'node1',
      componentId: 'node1Component2'
    };
    const componentStates = [componentState1, componentState2, componentState3];
    TeacherDataService.injectRevisionCounterIntoComponentStates(componentStates);
    expect(componentStates[0].revisionCounter).toEqual(1);
    expect(componentStates[1].revisionCounter).toEqual(2);
    expect(componentStates[2].revisionCounter).toEqual(1);
  });
}

function shouldCalculateIfThereIsAnyPeriodPausedWhenAllNotPaused() {
  it(`should calculate if there is any period paused when they are all not paused`, () => {
    TeacherDataService.runStatus = {
      periods: [
        { periodId: 1, paused: false },
        { periodId: 2, paused: false },
        { periodId: 3, paused: false }
      ]
    };
    expect(TeacherDataService.isAnyPeriodPaused()).toEqual(false);
  });
}

function shouldCalculateIfThereIsAnyPeriodPausedWhenAllPaused() {
  it(`should calculate if there is any period paused when they are all paused`, () => {
    TeacherDataService.runStatus = {
      periods: [
        { periodId: 1, paused: true },
        { periodId: 2, paused: true },
        { periodId: 3, paused: true }
      ]
    };
    expect(TeacherDataService.isAnyPeriodPaused()).toEqual(true);
  });
}

function shouldCalculateIfTHereIsAnyPeriodPausedWhenSomePaused() {
  it(`should calculate if there is any period paused when some are paused`, () => {
    TeacherDataService.runStatus = {
      periods: [
        { periodId: 1, paused: false },
        { periodId: 2, paused: true },
        { periodId: 3, paused: false }
      ]
    };
    expect(TeacherDataService.isAnyPeriodPaused()).toEqual(true);
  });
}

function shouldCalculateIfAPeriodIsPausedWhenNoneArePaused() {
  it(`should calculate if a period is paused`, () => {
    TeacherDataService.runStatus = {
      periods: [
        { periodId: 1, paused: false },
        { periodId: 2, paused: false },
        { periodId: 3, paused: false }
      ]
    };
    expect(TeacherDataService.isPeriodPaused(1)).toEqual(false);
  });
}

function shouldCalculateIfAPeriodIsPausedWhenOneIsPaused() {
  it(`should calculate if a period is paused`, () => {
    TeacherDataService.runStatus = {
      periods: [
        { periodId: 1, paused: true },
        { periodId: 2, paused: false },
        { periodId: 3, paused: false }
      ]
    };
    expect(TeacherDataService.isPeriodPaused(1)).toEqual(true);
  });
}

function shouldCalculateIfAllPeriodsArePausedWhenNotAllPaused() {
  it(`should calculate if all period are paused when they are not all paused`, () => {
    TeacherDataService.runStatus = {
      periods: [
        { periodId: 1, paused: true },
        { periodId: 2, paused: false },
        { periodId: 3, paused: false }
      ]
    };
    expect(TeacherDataService.isPeriodPaused(-1)).toEqual(false);
  });
}

function shouldCalculateIfAllPeriodsArePausedWhenAllPaused() {
  it(`should calculate if all period are paused when they are all paused`, () => {
    TeacherDataService.runStatus = {
      periods: [
        { periodId: 1, paused: true },
        { periodId: 2, paused: true },
        { periodId: 3, paused: true }
      ]
    };
    expect(TeacherDataService.isPeriodPaused(-1)).toEqual(true);
  });
}

function shouldUpdatePausedRunStatusForSinglePeriod() {
  it(`should update paused run status value for a single period`, () => {
    TeacherDataService.runStatus = {
      periods: [
        { periodId: 1, paused: false },
        { periodId: 2, paused: false },
        { periodId: 3, paused: false }
      ]
    };
    TeacherDataService.updatePausedRunStatusValue(1, true);
    expect(TeacherDataService.runStatus.periods[0].paused).toBe(true);
    expect(TeacherDataService.runStatus.periods[1].paused).toBe(false);
    expect(TeacherDataService.runStatus.periods[2].paused).toBe(false);
    TeacherDataService.updatePausedRunStatusValue(2, true);
    expect(TeacherDataService.runStatus.periods[0].paused).toBe(true);
    expect(TeacherDataService.runStatus.periods[1].paused).toBe(true);
    expect(TeacherDataService.runStatus.periods[2].paused).toBe(false);
    TeacherDataService.updatePausedRunStatusValue(3, true);
    expect(TeacherDataService.runStatus.periods[0].paused).toBe(true);
    expect(TeacherDataService.runStatus.periods[1].paused).toBe(true);
    expect(TeacherDataService.runStatus.periods[2].paused).toBe(true);
  });
}

function shouldUpdatePausedRunStatusForAllPeriods() {
  it(`update paused run status value for all periods`, () => {
    TeacherDataService.runStatus = {
      periods: [
        { periodId: 1, paused: false },
        { periodId: 2, paused: false },
        { periodId: 3, paused: false }
      ]
    };
    TeacherDataService.updatePausedRunStatusValue(-1, true);
    expect(TeacherDataService.runStatus.periods[0].paused).toBe(true);
    expect(TeacherDataService.runStatus.periods[1].paused).toBe(true);
    expect(TeacherDataService.runStatus.periods[2].paused).toBe(true);
  });
}

function shouldInitializePeriods() {
  it(`should initialize periods`, () => {
    const period1 = { periodId: 100, periodName: '1' };
    const period2 = { periodId: 200, periodName: '2' };
    const period3 = { periodId: 300, periodName: '3' };
    const periods = [period1, period2, period3];
    spyOn(ConfigService, 'getPeriods').and.returnValue(periods);
    TeacherDataService.runStatus = {
      periods: periods
    };
    expect(TeacherDataService.periods).toEqual([]);
    expect(TeacherDataService.currentPeriod).toEqual(null);
    TeacherDataService.initializePeriods();
    expect(TeacherDataService.periods.length).toEqual(4);
    expect(TeacherDataService.periods[0].periodId).toEqual(-1);
    expect(TeacherDataService.periods[1].periodId).toEqual(100);
    expect(TeacherDataService.periods[2].periodId).toEqual(200);
    expect(TeacherDataService.periods[3].periodId).toEqual(300);
    expect(TeacherDataService.currentPeriod).toEqual(period1);
  });
}

function shouldSetTheCurrentPeriodWhenThereIsNoCurrentWorkgroup() {
  it(`should set the current period when there is no current workgroup`, () => {
    const period1 = {
      periodId: 100,
      periodName: '1'
    };
    TeacherDataService.currentPeriod = period1;
    spyOn($rootScope, '$broadcast');
    const period2 = {
      periodId: 200,
      periodName: '2'
    };
    TeacherDataService.setCurrentPeriod(period2);
    expect($rootScope.$broadcast).toHaveBeenCalledWith('currentPeriodChanged', {
      previousPeriod: period1,
      currentPeriod: period2
    });
  });
}

function shouldSetTheCurrentPeriodWhenCurrentWorkgroupIsInCurrentPeriod() {
  it(`should set the current period when the current workgroup is in the current period`, () => {
    const period1 = {
      periodId: 100,
      periodName: '1'
    };
    TeacherDataService.currentPeriod = period1;
    const workgroup = {
      periodId: 100
    };
    TeacherDataService.currentWorkgroup = workgroup;
    spyOn($rootScope, '$broadcast');
    TeacherDataService.setCurrentPeriod(period1);
    expect(TeacherDataService.currentWorkgroup).toEqual(workgroup);
    expect($rootScope.$broadcast).not.toHaveBeenCalledWith('currentPeriodChanged');
  });
}

function shouldSetTheCurrentPeriodWhenCurrentWorkgroupIsNotInCurrentPeriod() {
  it(`should set the current period when the current workgroup is not in the current
  period`, () => {
    const period1 = {
      periodId: 100,
      periodName: '1'
    };
    TeacherDataService.currentPeriod = period1;
    const workgroup = {
      periodId: 100
    };
    TeacherDataService.currentWorkgroup = workgroup;
    spyOn($rootScope, '$broadcast');
    const period2 = {
      periodId: 200,
      periodName: '2'
    };
    TeacherDataService.setCurrentPeriod(period2);
    expect(TeacherDataService.currentWorkgroup).toEqual(null);
    expect($rootScope.$broadcast).toHaveBeenCalledWith('currentPeriodChanged', {
      previousPeriod: period1,
      currentPeriod: period2
    });
  });
}
