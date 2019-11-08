import classroomMonitorModule from '../../classroomMonitor/classroomMonitor';

describe('TeacherDataService', () => {

  beforeEach(angular.mock.module(classroomMonitorModule.name));

  let ConfigService, ProjectService, TeacherDataService, $rootScope, $httpBackend;
  const initializeIdToNode = () => {
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
  };
  beforeEach(inject(function(_ConfigService_, _ProjectService_, _TeacherDataService_, _$rootScope_,
                             _$httpBackend_) {
    ConfigService = _ConfigService_;
    ProjectService = _ProjectService_;
    TeacherDataService = _TeacherDataService_;
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
  }));

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

  it('should get connected components if necessary', () => {
    initializeIdToNode();
    const node2ConnectedComponents = TeacherDataService.getConnectedComponentsIfNecessary(
        [{ nodeId: 'node2', componentId: '1xph6u3mea' }]);
    expect(node2ConnectedComponents.length).toEqual(1);
    expect(node2ConnectedComponents[0].nodeId).toEqual('node1');
    expect(node2ConnectedComponents[0].componentId).toEqual('vg5uzarhir');
    const node3ConnectedComponents = TeacherDataService.getConnectedComponentsIfNecessary(
        [{ nodeId: 'node3', componentId: 'j2fsu892t3' }]);
    expect(node3ConnectedComponents.length).toEqual(0);
  });

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
    expect(TeacherDataService.isConnectedComponentStudentDataRequired(componentContent1))
        .toEqual(true);
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
    expect(TeacherDataService.isConnectedComponentStudentDataRequired(componentContent2))
        .toEqual(false);
  });

  it('should get component states by component ids', () => {
    TeacherDataService.studentData.componentStatesByComponentId['vg5uzarhir'] = [{
      id: 1,
      nodeId: 'node1',
      componentId: 'vg5uzarhir',
      studentData: {
        response: 'hello'
      }
    }];
    TeacherDataService.studentData.componentStatesByComponentId['1xph6u3mea'] = [{
      id: 1,
      nodeId: 'node2',
      componentId: '1xph6u3mea',
      studentData: {
        response: 'hello2'
      }
    }];
    const componentStates1 =
        TeacherDataService.getComponentStatesByComponentIds(['vg5uzarhir']);
    expect(componentStates1.length).toEqual(1);
    const componentStates2 =
        TeacherDataService.getComponentStatesByComponentIds(['vg5uzarhir', '1xph6u3mea']);
    expect(componentStates2.length).toEqual(2);
  });

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
    TeacherDataService.studentData.componentStatesByWorkgroupId[200] =
        [componentState2, componentState3];
    const componentStates1 = TeacherDataService.getComponentStatesByWorkgroupIdAndComponentIds(
        100, ['vg5uzarhir']);
    expect(componentStates1.length).toEqual(1);
    const componentStates2 = TeacherDataService.getComponentStatesByWorkgroupIdAndComponentIds(
        200, ['vg5uzarhir', '1xph6u3mea']);
    expect(componentStates2.length).toEqual(1);
    const componentStates3 = TeacherDataService.getComponentStatesByWorkgroupIdAndComponentIds(
        200, ['vg5uzarhir', '1xph6u3mea', 'q2fsu892t3']);
    expect(componentStates3.length).toEqual(2);
  });

});
